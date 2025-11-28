import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * OAuth認証コールバックハンドラー
 *
 * OAuth認証後、SupabaseからリダイレクトされるURL
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 認証コードをセッションに交換
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 元のページまたはホームページにリダイレクト
  return NextResponse.redirect(`${origin}/`);
}
