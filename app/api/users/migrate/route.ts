import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * 匿名データ統合API
 *
 * POST /api/users/migrate
 *
 * 匿名ユーザーのデータを認証済みユーザーに統合します。
 *
 * リクエスト:
 * {
 *   "anonymous_user_id": "550e8400-...",
 *   "auth_user_id": "123e4567-..."
 * }
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "data": {
 *     "user_id": "123e4567-...",
 *     "migrated_activities": 42,
 *     "merged": true
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const { anonymous_user_id, auth_user_id } = await request.json();

    if (!anonymous_user_id || !auth_user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'anonymous_user_id and auth_user_id are required',
        },
        { status: 400 }
      );
    }

    // Service Role Keyを使用して、RLSをバイパス
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 匿名ユーザーを取得
    const { data: anonymousUser, error: anonymousError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('anonymous_id', anonymous_user_id)
      .single();

    if (anonymousError || !anonymousUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Anonymous user not found',
        },
        { status: 404 }
      );
    }

    // 既に auth_user_id が設定されている場合はスキップ
    if (anonymousUser.auth_user_id) {
      return NextResponse.json({
        success: true,
        data: {
          user_id: anonymousUser.id,
          migrated_activities: 0,
          merged: false,
          message: 'User already has auth_user_id',
        },
      });
    }

    // Supabase Authからユーザー情報を取得
    const supabaseAuthAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: authUser, error: authError } =
      await supabaseAuthAdmin.auth.admin.getUserById(auth_user_id);

    if (authError || !authUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Auth user not found',
        },
        { status: 404 }
      );
    }

    // ユーザー情報を更新（auth_user_idを設定、OAuth情報を追加）
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        auth_user_id: auth_user_id,
        email: authUser.user.email || null,
        username:
          authUser.user.user_metadata?.user_name ||
          authUser.user.user_metadata?.name ||
          authUser.user.email?.split('@')[0] ||
          null,
        display_name:
          authUser.user.user_metadata?.full_name ||
          authUser.user.user_metadata?.name ||
          null,
        avatar_url: authUser.user.user_metadata?.avatar_url || null,
      })
      .eq('id', anonymousUser.id);

    if (updateError) {
      console.error('ユーザー更新エラー:', updateError);
      throw updateError;
    }

    // 行動履歴の件数を取得
    const { count } = await supabaseAdmin
      .from('user_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', anonymousUser.id);

    return NextResponse.json({
      success: true,
      data: {
        user_id: anonymousUser.id,
        migrated_activities: count || 0,
        merged: true,
      },
    });
  } catch (error: any) {
    console.error('匿名データ統合エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
