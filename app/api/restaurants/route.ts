import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // レストランデータを取得（カテゴリとタグも含む）
    const { data: restaurants, error } = await supabase
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
      .order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'レストランデータ取得成功！',
      data: {
        restaurants,
        count: restaurants?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('レストランデータ取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
