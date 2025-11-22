import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const station = searchParams.get('station') || '';
    const railway = searchParams.get('railway') || '';
    const minScore = searchParams.get('minScore') || '';

    // ベースクエリ
    let query = supabase
      .from('restaurants')
      .select(`
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
      `);

    // キーワード検索（店名、住所、説明文）
    if (keyword) {
      query = query.or(
        `name.ilike.%${keyword}%,address.ilike.%${keyword}%,profile_description.ilike.%${keyword}%`
      );
    }

    // 最寄駅フィルター
    if (station) {
      query = query.ilike('nearest_station', `%${station}%`);
    }

    // 路線フィルター
    if (railway) {
      query = query.ilike('railway', `%${railway}%`);
    }

    // 最低スコアフィルター
    if (minScore) {
      const minScoreNum = parseFloat(minScore);
      if (!isNaN(minScoreNum)) {
        query = query.gte('average_score', minScoreNum);
      }
    }

    // データを取得
    const { data: restaurants, error } = await query.order('average_score', {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    // クライアント側でカテゴリ・タグフィルタリング
    let filteredRestaurants = restaurants || [];

    // カテゴリフィルター
    if (category) {
      filteredRestaurants = filteredRestaurants.filter((restaurant: any) =>
        restaurant.restaurant_categories?.some(
          (rc: any) => rc.category?.slug === category
        )
      );
    }

    // タグフィルター
    if (tag) {
      filteredRestaurants = filteredRestaurants.filter((restaurant: any) =>
        restaurant.restaurant_tags?.some((rt: any) => rt.tag?.slug === tag)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredRestaurants,
      count: filteredRestaurants.length,
    });
  } catch (error: any) {
    console.error('店舗検索エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
