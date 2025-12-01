#!/usr/bin/env node
/**
 * Google Places API CLI tool
 *
 * Search for restaurants in a specified area and upload to database
 *
 * Usage:
 *   npm run scrape-places -- --area="渋谷区" --query="ラーメン"
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import { Logger } from './lib/logger';
import { GeocodingClient } from './lib/geocoding-client';
import { GooglePlacesClient } from './lib/google-places-client';
import { DatabaseUploader } from './lib/db-uploader';

// Load environment variables
dotenv.config({ path: '.env.local' });

const program = new Command();

program
  .name('scrape-places')
  .description('Search for restaurants using Google Places API and upload to database')
  .requiredOption('--area <area>', 'Area name (e.g., 渋谷区, 新宿区)')
  .requiredOption('--query <query>', 'Search query (e.g., ラーメン, ラーメン 家系)')
  .option('--radius <radius>', 'Search radius in meters', '5000')
  .option('--dry-run', 'Dry run mode (no database upload)')
  .parse(process.argv);

const options = program.opts();

async function main() {
  const logger = new Logger();

  try {
    logger.info('=== Google Places API CLI Tool ===');
    logger.info(`Area: ${options.area}`);
    logger.info(`Query: ${options.query}`);
    logger.info(`Radius: ${options.radius}m`);
    if (options.dryRun) {
      logger.warning('DRY RUN MODE - No data will be uploaded to database');
    }

    // Check environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!apiKey) {
      logger.error('GOOGLE_PLACES_API_KEY not found in environment variables');
      logger.info('Please add GOOGLE_PLACES_API_KEY to .env.local');
      process.exit(1);
    }

    if (!supabaseUrl || !supabaseKey) {
      logger.error('Supabase credentials not found in environment variables');
      logger.info('Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
      process.exit(1);
    }

    // Initialize clients
    const geocodingClient = new GeocodingClient(apiKey, logger);
    const placesClient = new GooglePlacesClient(apiKey, logger);
    const dbUploader = new DatabaseUploader(supabaseUrl, supabaseKey, logger);

    // Step 1: Geocode area name to coordinates
    logger.info('\n--- Step 1: Geocoding area ---');
    const coordinates = await geocodingClient.getCoordinates(options.area);

    if (!coordinates) {
      logger.error(`Failed to geocode area: ${options.area}`);
      process.exit(1);
    }

    // Step 2: Search for restaurants
    logger.info('\n--- Step 2: Searching for restaurants ---');
    const places = await placesClient.searchNearby(
      coordinates.lat,
      coordinates.lng,
      options.query,
      parseInt(options.radius)
    );

    if (places.length === 0) {
      logger.warning('No restaurants found');
      await logger.save();
      process.exit(0);
    }

    // Step 3: Get details for each place
    logger.info('\n--- Step 3: Fetching restaurant details ---');
    const restaurants = [];

    for (const place of places) {
      if (!place.place_id) {
        logger.warning(`Skipping place without place_id: ${place.name}`);
        continue;
      }

      const details = await placesClient.getPlaceDetails(place.place_id);

      if (details) {
        restaurants.push(details);
        logger.success(`Fetched details: ${details.name}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    logger.info(`\nSuccessfully fetched ${restaurants.length} restaurant details`);

    // Step 4: Upload to database
    if (!options.dryRun) {
      logger.info('\n--- Step 4: Uploading to database ---');
      const result = await dbUploader.uploadBatch(restaurants);

      logger.info('\n--- Upload Results ---');
      logger.success(`New restaurants: ${result.newCount}`);
      logger.warning(`Updated restaurants: ${result.updateCount}`);
      logger.error(`Failed: ${result.errorCount}`);
    } else {
      logger.info('\n--- Dry Run: Skipping database upload ---');
      logger.info(`Would upload ${restaurants.length} restaurants`);
    }

    // Step 5: Save logs and print summary
    logger.printSummary();
    await logger.save();

  } catch (error: any) {
    logger.error(`Unexpected error: ${error.message}`);
    logger.printSummary();
    await logger.save();
    process.exit(1);
  }
}

main();
