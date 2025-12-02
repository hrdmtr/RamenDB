import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/admin/scraping/jobs
 * スクレイピングジョブの一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status'); // pending, running, completed, failed
    const stationId = searchParams.get('station_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('scraping_jobs')
      .select(
        `
        *,
        station:stations (
          id,
          name,
          prefecture,
          city,
          railway
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (stationId) {
      query = query.eq('station_id', stationId);
    }

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('ジョブ取得エラー:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'ジョブの取得に失敗しました',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('予期しないエラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました',
      },
      { status: 500 }
    );
  }
}
