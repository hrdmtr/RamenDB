import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// サーバー側でストレージ操作を行うため、service_role_keyを使用
// ビルド時はダミー値を使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: '画像ファイル（JPEG, PNG, WebP）のみアップロード可能です',
        },
        { status: 400 }
      );
    }

    // ファイル名生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop();
    const fileName = `review_${timestamp}_${randomStr}.${ext}`;

    // ArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Supabase Storageにアップロード
    const { data, error } = await supabaseAdmin.storage
      .from('review-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      console.error('画像アップロードエラー:', error);
      throw error;
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('review-images').getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '画像のアップロードに失敗しました',
      },
      { status: 500 }
    );
  }
}
