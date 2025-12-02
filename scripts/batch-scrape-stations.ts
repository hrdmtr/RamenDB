#!/usr/bin/env tsx
/**
 * Batch scraping script for station-based restaurant collection
 *
 * Usage:
 *   npm run scrape-stations              # すべての pending ジョブを実行
 *   npm run scrape-stations -- --station="成瀬駅"  # 特定の駅のみ
 *   npm run scrape-stations -- --create-jobs      # 全駅のジョブを作成
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Logger } from './lib/logger';
import { GooglePlacesClient, RestaurantData } from './lib/google-places-client';
import { DatabaseUploader } from './lib/db-uploader';

dotenv.config({ path: '.env.local' });

const program = new Command();

program
  .name('batch-scrape-stations')
  .description('Batch scraping for restaurants based on stations')
  .option('--station <name>', '特定の駅のみ実行')
  .option('--create-jobs', '全駅のジョブを作成（実行はしない）')
  .option('--dry-run', 'データベースに保存せずに実行');

program.parse();
const options = program.opts();

// デフォルトの検索キーワード
const DEFAULT_QUERIES = [
  'ラーメン',
  'ラーメンショップ',
  '中華そば',
  'つけ麺',
  '家系ラーメン',
  '二郎系',
];

const DEFAULT_RADIUS = 3000; // 3km

interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  railway: string;
}

interface ScrapingJob {
  id: string;
  station_id: string;
  query: string;
  radius: number;
  station: Station;
}

async function main() {
  const logger = new Logger();

  logger.info('=== Batch Station-based Scraping ===');
  logger.info('');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logger.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create jobs mode
  if (options.createJobs) {
    await createJobsForAllStations(supabase, logger);
    return;
  }

  // Google API key is only required for actual scraping
  if (!googleApiKey) {
    logger.error('Missing required environment variable: GOOGLE_MAPS_API_KEY');
    process.exit(1);
  }

  // Get pending jobs
  const jobs = await getPendingJobs(supabase, logger, options.station);

  if (jobs.length === 0) {
    logger.info('No pending jobs found');
    return;
  }

  logger.info(`Found ${jobs.length} pending job(s)`);
  logger.info('');

  // Initialize clients
  const placesClient = new GooglePlacesClient(googleApiKey, logger);
  const uploader = new DatabaseUploader(supabaseUrl, supabaseKey, logger);

  // Track overall statistics
  let totalRestaurantsFound = 0;
  let totalNew = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let jobsCompleted = 0;
  let jobsFailed = 0;

  // Process each job
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    logger.info(`\n[${i + 1}/${jobs.length}] Processing job: ${job.station.name} - "${job.query}"`);
    logger.info(`Station: ${job.station.name} (${job.station.railway})`);
    logger.info(`Location: (${job.station.latitude}, ${job.station.longitude})`);
    logger.info(`Radius: ${job.radius}m`);
    logger.info('');

    // Update job status to 'running'
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    try {
      // Step 1: Search for restaurants
      logger.info('--- Searching for restaurants ---');
      const places = await placesClient.searchNearby(
        job.station.latitude,
        job.station.longitude,
        job.query,
        job.radius
      );

      if (places.length === 0) {
        logger.warning('No restaurants found');
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            restaurants_found: 0,
          })
          .eq('id', job.id);
        continue;
      }

      logger.info('');

      // Step 2: Fetch details and upload
      logger.info('--- Fetching details and uploading ---');
      let newCount = 0;
      let updatedCount = 0;
      let failedCount = 0;

      for (const place of places) {
        const placeId = place.place_id;
        if (!placeId) continue;

        const details = await placesClient.getPlaceDetails(placeId);
        if (!details) {
          failedCount++;
          continue;
        }

        if (!options.dryRun) {
          const result = await uploader.uploadRestaurant(details);

          if (result.success) {
            if (result.isNew) {
              newCount++;
              // Record scraping result
              await supabase.from('scraping_results').insert({
                job_id: job.id,
                restaurant_id: result.restaurantId,
                action: 'created',
              });
            } else {
              updatedCount++;
              // Record scraping result
              await supabase.from('scraping_results').insert({
                job_id: job.id,
                restaurant_id: result.restaurantId,
                action: 'updated',
              });
            }
          } else {
            failedCount++;
          }
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      logger.info('');
      logger.info('--- Job Results ---');
      logger.success(`Found: ${places.length}`);
      logger.success(`New: ${newCount}`);
      logger.warning(`Updated: ${updatedCount}`);
      logger.error(`Failed: ${failedCount}`);

      // Update totals
      totalRestaurantsFound += places.length;
      totalNew += newCount;
      totalUpdated += updatedCount;
      totalFailed += failedCount;
      jobsCompleted++;

      // Update job status to 'completed'
      if (!options.dryRun) {
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            restaurants_found: places.length,
            restaurants_new: newCount,
            restaurants_updated: updatedCount,
            restaurants_failed: failedCount,
          })
          .eq('id', job.id);
      }
    } catch (error: any) {
      logger.error(`Job failed: ${error.message}`);
      jobsFailed++;

      // Update job status to 'failed'
      await supabase
        .from('scraping_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message,
        })
        .eq('id', job.id);
    }
  }

  // Display overall summary
  logger.info('');
  logger.info('==============================================');
  logger.info('=== BATCH SCRAPING SUMMARY ===');
  logger.info('==============================================');
  logger.info('');
  logger.info(`📊 Jobs Processed: ${jobs.length}`);
  logger.success(`  ✅ Completed: ${jobsCompleted}`);
  logger.error(`  ❌ Failed: ${jobsFailed}`);
  logger.info('');
  logger.info(`🏪 Restaurants:`);
  logger.success(`  🆕 New: ${totalNew}`);
  logger.warning(`  🔄 Updated: ${totalUpdated}`);
  logger.error(`  ❌ Failed: ${totalFailed}`);
  logger.info(`  📍 Total Found: ${totalRestaurantsFound}`);
  logger.info('');

  if (options.station) {
    logger.info(`🎯 Station: ${options.station}`);
  } else {
    logger.info(`🌐 Mode: All stations`);
  }

  logger.info('');
  logger.info('==============================================');

  // Save log
  await logger.save();
  logger.info('');
  logger.info(`📝 Log saved: ${logger.getLogFilePath()}`);
}

/**
 * Create jobs for all active stations
 */
async function createJobsForAllStations(supabase: any, logger: Logger) {
  logger.info('Creating jobs for all active stations...');

  // Get all active stations
  const { data: stations, error } = await supabase
    .from('stations')
    .select('*')
    .eq('is_active', true);

  if (error) {
    logger.error(`Failed to fetch stations: ${error.message}`);
    process.exit(1);
  }

  if (!stations || stations.length === 0) {
    logger.warning('No active stations found');
    return;
  }

  logger.info(`Found ${stations.length} active station(s)`);

  let createdCount = 0;

  for (const station of stations) {
    for (const query of DEFAULT_QUERIES) {
      // Check if job already exists
      const { data: existing } = await supabase
        .from('scraping_jobs')
        .select('id')
        .eq('station_id', station.id)
        .eq('query', query)
        .eq('radius', DEFAULT_RADIUS)
        .maybeSingle();

      if (existing) {
        logger.warning(`Job already exists: ${station.name} - "${query}"`);
        continue;
      }

      // Create new job
      const { error: insertError } = await supabase.from('scraping_jobs').insert({
        station_id: station.id,
        query: query,
        radius: DEFAULT_RADIUS,
        status: 'pending',
      });

      if (insertError) {
        logger.error(`Failed to create job: ${station.name} - "${query}": ${insertError.message}`);
      } else {
        logger.success(`Created job: ${station.name} - "${query}"`);
        createdCount++;
      }
    }
  }

  logger.info('');
  logger.success(`Created ${createdCount} new job(s)`);
}

/**
 * Get pending jobs
 */
async function getPendingJobs(
  supabase: any,
  logger: Logger,
  stationName?: string
): Promise<ScrapingJob[]> {
  let query = supabase
    .from('scraping_jobs')
    .select(
      `
      *,
      station:stations (
        id,
        name,
        latitude,
        longitude,
        railway
      )
    `
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  // Filter by station name if specified
  if (stationName) {
    const { data: station } = await supabase
      .from('stations')
      .select('id')
      .eq('name', stationName)
      .maybeSingle();

    if (!station) {
      logger.error(`Station not found: ${stationName}`);
      process.exit(1);
    }

    query = query.eq('station_id', station.id);
  }

  const { data: jobs, error } = await query;

  if (error) {
    logger.error(`Failed to fetch jobs: ${error.message}`);
    process.exit(1);
  }

  return jobs || [];
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
