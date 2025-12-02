import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * GET /api/admin/scraping/stats
 * スクレイピング統計情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    // Get all jobs
    const { data: allJobs, error: jobsError } = await supabase
      .from('scraping_jobs')
      .select('status, restaurants_new, restaurants_updated');

    if (jobsError) {
      console.error('ジョブ取得エラー:', jobsError);
      throw jobsError;
    }

    // Calculate job stats
    const jobStats = {
      total: allJobs?.length || 0,
      pending: allJobs?.filter((j) => j.status === 'pending').length || 0,
      running: allJobs?.filter((j) => j.status === 'running').length || 0,
      completed: allJobs?.filter((j) => j.status === 'completed').length || 0,
      failed: allJobs?.filter((j) => j.status === 'failed').length || 0,
    };

    // Calculate total stats
    const completedJobs = allJobs?.filter((j) => j.status === 'completed') || [];
    const totalStats = {
      totalNew: completedJobs.reduce((sum, j) => sum + (j.restaurants_new || 0), 0),
      totalUpdated: completedJobs.reduce((sum, j) => sum + (j.restaurants_updated || 0), 0),
    };

    // Get recent jobs
    const { data: recentJobs, error: recentError } = await supabase
      .from('scraping_jobs')
      .select(
        `
        id,
        status,
        query,
        restaurants_found,
        restaurants_new,
        restaurants_updated,
        created_at,
        completed_at,
        stations (
          name,
          railway
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('最近のジョブ取得エラー:', recentError);
    }

    // Format recent jobs
    const formattedRecentJobs = (recentJobs || []).map((job: any) => ({
      ...job,
      station: job.stations,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        jobs: jobStats,
        totals: totalStats,
        stations: [],
        recentJobs: formattedRecentJobs,
      },
    });
  } catch (error: any) {
    console.error('統計取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '統計の取得に失敗しました',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
