import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * ユーザー行動記録API
 *
 * POST /api/user-activities
 *
 * リクエスト:
 * {
 *   "anonymous_user_id": "550e8400-...",
 *   "activity_type": "view",
 *   "restaurant_id": "abc123-...",
 *   "category_slug": "iekei",
 *   "station": "渋谷",
 *   "railway": "山手線",
 *   "prefecture": "東京",
 *   "search_query": "家系ラーメン",
 *   "metadata": { "duration_seconds": 45 }
 * }
 *
 * レスポンス:
 * {
 *   "success": true
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      anonymous_user_id,
      activity_type,
      restaurant_id,
      category_slug,
      station,
      railway,
      prefecture,
      search_query,
      metadata,
    } = body;

    // バリデーション
    if (!anonymous_user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'anonymous_user_id is required',
        },
        { status: 400 }
      );
    }

    if (!activity_type || !['view', 'search', 'click'].includes(activity_type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid activity_type. Must be one of: view, search, click',
        },
        { status: 400 }
      );
    }

    // anonymous_idからuser_idを取得
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('anonymous_id', anonymous_user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found. Please create anonymous user first.',
        },
        { status: 404 }
      );
    }

    // 行動データを記録
    const { error: insertError } = await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type,
      restaurant_id: restaurant_id || null,
      category_slug: category_slug || null,
      station: station || null,
      railway: railway || null,
      prefecture: prefecture || null,
      search_query: search_query || null,
      metadata: metadata || {},
    });

    if (insertError) {
      console.error('行動記録エラー:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('ユーザー行動記録エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
