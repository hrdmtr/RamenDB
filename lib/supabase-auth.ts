/**
 * Supabase Auth クライアント
 *
 * 認証専用のクライアントを作成します。
 * ブラウザ専用（サーバーサイドでは使用しない）
 *
 * Note: Supabaseのセッションデータは4KB以上になることがあり、
 * ブラウザのCookieサイズ制限を超えるため、LocalStorageを使用します。
 * サーバーサイドでの認証チェックは、API Routeで直接Supabase Auth APIを使用します。
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // LocalStorageを使用（デフォルト）
    // Cookieサイズ制限の問題を回避
  },
});
