import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// レビュー削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'レビューを削除しました',
    });
  } catch (error: any) {
    console.error('レビュー削除エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
