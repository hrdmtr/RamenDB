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

    // SUUMOライク検索用パラメータ
    const priceRange = searchParams.get('priceRange') || '';
    const isMorningRamen = searchParams.get('isMorningRamen') || '';
    const features = searchParams.get('features') || ''; // カンマ区切りのfeature ID
    const minFlavorRichness = searchParams.get('minFlavorRichness') || '';
    const maxFlavorRichness = searchParams.get('maxFlavorRichness') || '';
    const sortBy = searchParams.get('sortBy') || 'score'; // score, cost_performance, morning_ramen

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
        ),
        restaurant_features (
          feature:features (
            id,
            name,
            category
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

    // 価格帯フィルター
    if (priceRange) {
      query = query.eq('price_range', priceRange);
    }

    // 朝ラー対応フィルター
    if (isMorningRamen === 'true') {
      query = query.eq('is_morning_ramen', true);
    }

    // 味の濃さフィルター
    if (minFlavorRichness) {
      const minFlavorNum = parseFloat(minFlavorRichness);
      if (!isNaN(minFlavorNum)) {
        query = query.gte('avg_flavor_richness', minFlavorNum);
      }
    }
    if (maxFlavorRichness) {
      const maxFlavorNum = parseFloat(maxFlavorRichness);
      if (!isNaN(maxFlavorNum)) {
        query = query.lte('avg_flavor_richness', maxFlavorNum);
      }
    }

    // 並び替え
    if (sortBy === 'cost_performance') {
      // コスパ順（価格帯とスコアの組み合わせ、将来的に計算ロジックを追加）
      query = query.order('average_score', { ascending: false });
    } else if (sortBy === 'morning_ramen') {
      // 朝ラー適性順
      query = query.order('is_morning_ramen', { ascending: false });
    } else {
      // デフォルト: スコア順
      query = query.order('average_score', { ascending: false });
    }

    // データを取得
    const { data: restaurants, error } = await query;

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

    // 店舗特徴フィルター（複数選択対応）
    if (features) {
      const featureIds = features.split(',').map((id) => id.trim());
      filteredRestaurants = filteredRestaurants.filter((restaurant: any) => {
        const restaurantFeatureIds = restaurant.restaurant_features?.map(
          (rf: any) => rf.feature?.id
        ) || [];
        // すべての指定された特徴を持つ店舗のみ（AND条件）
        return featureIds.every((featureId) =>
          restaurantFeatureIds.includes(featureId)
        );
      });
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
