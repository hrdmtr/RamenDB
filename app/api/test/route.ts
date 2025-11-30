import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // カテゴリデータを取得
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase接続成功！',
      data: {
        categories,
        count: categories?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Supabase接続エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
