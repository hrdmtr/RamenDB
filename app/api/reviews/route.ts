import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// レビュー一覧取得
export async function GET() {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users (
          id,
          username,
          display_name
        ),
        restaurant:restaurants (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error('レビュー取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 認証チェック
    const cookieStore = await cookies();
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user: authUser },
    } = await supabaseAuth.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'レビューを投稿するにはログインが必要です',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      restaurant_id,
      review_type, // 'quick' or 'detailed'
      // 5軸評価（必須）
      score_taste,
      score_portion,
      score_price,
      score_service,
      score_cleanliness,
      // 簡易評価用
      general_comment,
      // 本気レビュー用
      taste_comment,
      atmosphere_type,
      atmosphere_comment,
      service_comment,
      cost_performance_comment,
      accessibility_comment,
      self_service_type,
      self_service_note,
      serving_time,
      serving_time_note,
      visit_date,
      image_urls,
    } = body;

    // 基本バリデーション
    if (!restaurant_id) {
      return NextResponse.json(
        { success: false, error: '店舗IDが指定されていません' },
        { status: 400 }
      );
    }

    // auth_user_idからusers.idを取得
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'ユーザー情報が見つかりません。ログインし直してください。',
        },
        { status: 404 }
      );
    }

    const actualUserId = user.id;

    // レビュータイプのバリデーション
    const validReviewTypes = ['quick', 'detailed'];
    if (!review_type || !validReviewTypes.includes(review_type)) {
      return NextResponse.json(
        { success: false, error: '無効なレビュータイプです' },
        { status: 400 }
      );
    }

    // 5軸評価のバリデーション
    if (
      score_taste === undefined ||
      score_portion === undefined ||
      score_price === undefined ||
      score_service === undefined ||
      score_cleanliness === undefined
    ) {
      return NextResponse.json(
        { success: false, error: '5軸評価がすべて入力されていません' },
        { status: 400 }
      );
    }

    // スコア範囲チェック（1〜5点）
    const scores = [score_taste, score_portion, score_price, score_service, score_cleanliness];
    if (scores.some((s) => s < 1 || s > 5)) {
      return NextResponse.json(
        { success: false, error: 'スコアは1〜5の範囲で入力してください' },
        { status: 400 }
      );
    }

    // 本気レビューの場合は詳細項目もチェック
    if (review_type === 'detailed') {
      if (
        !taste_comment ||
        !atmosphere_type ||
        !service_comment ||
        !cost_performance_comment ||
        !accessibility_comment ||
        !self_service_type ||
        !serving_time
      ) {
        return NextResponse.json(
          { success: false, error: '本気レビューの必須項目が入力されていません' },
          { status: 400 }
        );
      }

      // 雰囲気タイプのバリデーション
      const validAtmosphereTypes = ['quiet', 'lively', 'normal', 'other'];
      if (!validAtmosphereTypes.includes(atmosphere_type)) {
        return NextResponse.json(
          { success: false, error: '無効な雰囲気タイプです' },
          { status: 400 }
        );
      }

      // セルフサービスタイプのバリデーション
      const validSelfServiceTypes = ['full_self', 'partial_self', 'full_service'];
      if (!validSelfServiceTypes.includes(self_service_type)) {
        return NextResponse.json(
          { success: false, error: '無効なセルフサービスタイプです' },
          { status: 400 }
        );
      }

      // 提供時間のバリデーション
      const validServingTimes = ['under_3', '3_to_7', '7_to_15', 'over_15'];
      if (!validServingTimes.includes(serving_time)) {
        return NextResponse.json(
          { success: false, error: '無効な提供時間です' },
          { status: 400 }
        );
      }

      // 画像URLのバリデーション（最大5枚）
      if (image_urls && image_urls.length > 5) {
        return NextResponse.json(
          { success: false, error: '画像は最大5枚までアップロード可能です' },
          { status: 400 }
        );
      }
    }

    // レビューを投稿
    const insertData: any = {
      restaurant_id,
      user_id: actualUserId,
      review_type,
      score_taste,
      score_portion,
      score_price,
      score_service,
      score_cleanliness,
      // scoreは自動計算されるが、念のため平均値を設定
      score: (score_taste + score_portion + score_price + score_service + score_cleanliness) / 5.0,
    };

    // 簡易評価の場合
    if (review_type === 'quick') {
      insertData.general_comment = general_comment || null;
    }

    // 本気レビューの場合
    if (review_type === 'detailed') {
      insertData.taste_comment = taste_comment;
      insertData.atmosphere_type = atmosphere_type;
      insertData.atmosphere_comment = atmosphere_comment || null;
      insertData.service_comment = service_comment;
      insertData.cost_performance_comment = cost_performance_comment;
      insertData.accessibility_comment = accessibility_comment;
      insertData.self_service_type = self_service_type;
      insertData.self_service_note = self_service_note || null;
      insertData.serving_time = serving_time;
      insertData.serving_time_note = serving_time_note || null;
      insertData.general_comment = general_comment || null;
      insertData.visit_date = visit_date || null;
      insertData.image_urls = image_urls || null;
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('レビュー投稿エラー:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: review_type === 'quick' ? '簡易評価を投稿しました' : 'レビューを投稿しました',
      data: review,
    });
  } catch (error: any) {
    console.error('レビュー投稿エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'レビューの投稿に失敗しました',
      },
      { status: 500 }
    );
  }
}
