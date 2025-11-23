import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// 店舗新規作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      name_kana,
      address,
      nearest_station,
      railway,
      phone_number,
      website,
      twitter,
      instagram,
      profile_description,
    } = body;

    // バリデーション
    if (!name || !name_kana || !address || !nearest_station || !railway) {
      return NextResponse.json(
        {
          success: false,
          error: '必須項目が入力されていません',
        },
        { status: 400 }
      );
    }

    // 店舗を新規作成
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .insert({
        name,
        name_kana,
        address,
        nearest_station,
        railway,
        phone_number: phone_number || null,
        website: website || null,
        twitter: twitter || null,
        instagram: instagram || null,
        profile_description: profile_description || null,
        average_score: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('店舗作成エラー:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '店舗を追加しました',
      data: restaurant,
    });
  } catch (error: any) {
    console.error('店舗作成エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '店舗の追加に失敗しました',
      },
      { status: 500 }
    );
  }
}
