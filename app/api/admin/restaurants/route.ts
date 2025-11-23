import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// 店舗新規作成
export async function POST(request: Request) {
  try {
    // 環境変数チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('環境変数チェック:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlPrefix: supabaseUrl?.substring(0, 20),
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase環境変数が設定されていません');
      return NextResponse.json(
        {
          success: false,
          error: 'サーバー設定エラー: Supabase環境変数が見つかりません',
        },
        { status: 500 }
      );
    }

    // Supabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabaseクライアント作成成功');

    const body = await request.json();
    console.log('リクエストボディ受信:', { hasName: !!body.name, hasKana: !!body.name_kana });

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
      short_description,
      profile_description,
      thumbnail_url,
    } = body;

    // バリデーション
    if (!name || !name_kana || !address || !nearest_station || !railway) {
      console.error('バリデーションエラー:', { name, name_kana, address, nearest_station, railway });
      return NextResponse.json(
        {
          success: false,
          error: '必須項目が入力されていません',
        },
        { status: 400 }
      );
    }

    console.log('バリデーション成功、データベースへ挿入開始');

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
        short_description: short_description || null,
        profile_description: profile_description || null,
        thumbnail_url: thumbnail_url || null,
        average_score: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabaseエラー詳細:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        {
          success: false,
          error: `データベースエラー: ${error.message}`,
        },
        { status: 500 }
      );
    }

    console.log('店舗作成成功:', restaurant?.id);

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
