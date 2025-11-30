import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * パーソナライズ推薦API
 *
 * GET /api/recommendations?anonymous_user_id=550e8400-...
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "restaurant-1",
 *       "name": "横浜家系ラーメン",
 *       "average_score": 4.5,
 *       "recommendation_score": 15.3,
 *       "reason": "よく見る「家系」カテゴリの店舗です"
 *     }
 *   ]
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const anonymousUserId = searchParams.get('anonymous_user_id');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!anonymousUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'anonymous_user_id is required',
        },
        { status: 400 }
      );
    }

    // anonymous_idからuser_idを取得
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('anonymous_id', anonymousUserId)
      .single();

    if (userError || !user) {
      // ユーザーが見つからない場合は人気店舗を返す
      return await getPopularRestaurants(limit);
    }

    // ユーザーの行動履歴を取得
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (activitiesError) {
      console.error('行動履歴取得エラー:', activitiesError);
      return await getPopularRestaurants(limit);
    }

    // 行動データが3件未満の場合は人気店舗を返す
    if (!activities || activities.length < 3) {
      return await getPopularRestaurants(limit);
    }

    // パーソナライズ推薦を計算
    const recommendations = await calculateRecommendations(
      user.id,
      activities,
      limit
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error('推薦API エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * 人気店舗を取得（フォールバック）
 */
async function getPopularRestaurants(limit: number) {
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select(
      `
      *,
      restaurant_categories (
        category:categories (
          id,
          name,
          slug
        )
      ),
      restaurant_tags (
        tag:tags (
          id,
          name,
          slug
        )
      )
    `
    )
    .order('average_score', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    data:
      restaurants?.map((r) => ({
        ...r,
        recommendation_score: r.average_score,
        reason: '人気店舗です',
      })) || [],
    is_personalized: false,
  });
}

/**
 * パーソナライズ推薦を計算
 */
async function calculateRecommendations(
  userId: string,
  activities: any[],
  limit: number
) {
  // 閲覧した店舗IDを収集
  const viewedRestaurantIds = activities
    .filter((a) => a.activity_type === 'view' && a.restaurant_id)
    .map((a) => a.restaurant_id);

  // よく見るカテゴリを集計
  const categoryCounts: Record<string, number> = {};
  activities
    .filter((a) => a.category_slug)
    .forEach((a) => {
      categoryCounts[a.category_slug] = (categoryCounts[a.category_slug] || 0) + 1;
    });

  // よく検索する駅を集計
  const stationCounts: Record<string, number> = {};
  activities
    .filter((a) => a.station)
    .forEach((a) => {
      stationCounts[a.station] = (stationCounts[a.station] || 0) + 1;
    });

  // 推薦候補を取得
  let query = supabase
    .from('restaurants')
    .select(
      `
      *,
      restaurant_categories (
        category:categories (
          id,
          name,
          slug
        )
      ),
      restaurant_tags (
        tag:tags (
          id,
          name,
          slug
        )
      )
    `
    )
    .order('average_score', { ascending: false })
    .limit(100);

  // 既に閲覧した店舗を除外
  if (viewedRestaurantIds.length > 0) {
    query = query.not('id', 'in', `(${viewedRestaurantIds.join(',')})`);
  }

  const { data: restaurants, error } = await query;

  if (error) {
    throw error;
  }

  if (!restaurants || restaurants.length === 0) {
    return [];
  }

  // スコアリング
  const scoredRestaurants = restaurants.map((restaurant: any) => {
    let score = restaurant.average_score * 2; // ベーススコア（最大10点）
    let reason = '';

    // カテゴリマッチ（最大+10点）
    const restaurantCategories =
      restaurant.restaurant_categories?.map(
        (rc: any) => rc.category?.slug
      ) || [];
    for (const categorySlug of restaurantCategories) {
      if (categoryCounts[categorySlug]) {
        score += categoryCounts[categorySlug] * 2;
        reason = `よく見る「${
          restaurant.restaurant_categories.find(
            (rc: any) => rc.category?.slug === categorySlug
          )?.category?.name || categorySlug
        }」カテゴリの店舗です`;
        break;
      }
    }

    // 駅マッチ（最大+5点）
    if (restaurant.nearest_station && stationCounts[restaurant.nearest_station]) {
      score += stationCounts[restaurant.nearest_station] * 1.5;
      if (!reason) {
        reason = `よく検索する「${restaurant.nearest_station}駅」周辺の店舗です`;
      }
    }

    // レビュー数による補正（人気度）
    score += Math.log(restaurant.review_count + 1) * 0.5;

    if (!reason) {
      reason = 'あなたの好みに合いそうな店舗です';
    }

    return {
      ...restaurant,
      recommendation_score: Math.round(score * 10) / 10,
      reason,
    };
  });

  // スコア順にソート
  scoredRestaurants.sort(
    (a, b) => b.recommendation_score - a.recommendation_score
  );

  // 上位N件を返す
  return scoredRestaurants.slice(0, limit);
}
