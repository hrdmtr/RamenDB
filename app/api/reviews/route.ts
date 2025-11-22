import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, user_id, score, comment, visit_date } = body;

    // バリデーション
    if (!restaurant_id || !user_id || !score) {
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    if (score < 0 || score > 10) {
      return NextResponse.json(
        { success: false, error: 'スコアは0〜10の範囲で入力してください' },
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
        comment,
        visit_date,
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
