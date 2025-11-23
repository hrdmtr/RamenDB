import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// 店舗詳細取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: restaurant, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error || !restaurant) {
      return NextResponse.json(
        {
          success: false,
          error: '店舗が見つかりませんでした',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error: any) {
    console.error('店舗取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 店舗情報更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 店舗情報を更新
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .update({
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
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error: any) {
    console.error('店舗更新エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 店舗削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '店舗を削除しました',
    });
  } catch (error: any) {
    console.error('店舗削除エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
