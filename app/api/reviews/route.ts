import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    const body = await request.json();
    const {
      restaurant_id,
      user_id,
      score,
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
      general_comment,
      visit_date,
      image_urls,
    } = body;

    // 必須項目のバリデーション
    if (!restaurant_id || !user_id || !score) {
      return NextResponse.json(
        { success: false, error: '基本情報が不足しています' },
        { status: 400 }
      );
    }

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
        { success: false, error: '必須項目が入力されていません' },
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

    // 文字数バリデーション（味コメントは50文字以上推奨）
    if (taste_comment.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: '味についての評価は50文字以上入力してください',
        },
        { status: 400 }
      );
    }

    if (score < 0 || score > 10) {
      return NextResponse.json(
        { success: false, error: 'スコアは0〜10の範囲で入力してください' },
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

    // レビューを投稿
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        restaurant_id,
        user_id,
        score,
        taste_comment,
        atmosphere_type,
        atmosphere_comment: atmosphere_comment || null,
        service_comment,
        cost_performance_comment,
        accessibility_comment,
        self_service_type,
        self_service_note: self_service_note || null,
        serving_time,
        serving_time_note: serving_time_note || null,
        general_comment: general_comment || null,
        visit_date: visit_date || null,
        image_urls: image_urls || null,
      })
      .select()
      .single();

    if (error) {
      console.error('レビュー投稿エラー:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'レビューを投稿しました',
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
