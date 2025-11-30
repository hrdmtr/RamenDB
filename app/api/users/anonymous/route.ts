import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * 匿名ユーザー作成API
 *
 * POST /api/users/anonymous
 *
 * リクエスト:
 * {
 *   "anonymous_id": "550e8400-e29b-41d4-a716-446655440000"
 * }
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "123e4567-...",
 *     "anonymous_id": "550e8400-...",
 *     "created_at": "2025-11-28T12:00:00Z"
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const { anonymous_id } = await request.json();

    if (!anonymous_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'anonymous_id is required',
        },
        { status: 400 }
      );
    }

    // UUID形式のバリデーション
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(anonymous_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid UUID format',
        },
        { status: 400 }
      );
    }

    // 既存のユーザーをチェック
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, anonymous_id, created_at')
      .eq('anonymous_id', anonymous_id)
      .single();

    if (existingUser) {
      // 既存ユーザーの場合は、そのまま返す
      return NextResponse.json({
        success: true,
        data: existingUser,
        message: 'User already exists',
      });
    }

    // 新規ユーザーを作成
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        anonymous_id,
        // email, username は NULL（匿名ユーザー）
        // reviewer_score のデフォルト値は 0.5
      })
      .select('id, anonymous_id, created_at')
      .single();

    if (createError) {
      console.error('ユーザー作成エラー:', createError);
      throw createError;
    }

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('匿名ユーザー作成エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
