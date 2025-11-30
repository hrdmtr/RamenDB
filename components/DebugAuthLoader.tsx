'use client';

import { useEffect } from 'react';

/**
 * 開発環境用: 認証デバッグ関数をグローバルに登録
 */
export default function DebugAuthLoader() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    // グローバルに getAuthStatus 関数を登録
    (window as any).getAuthStatus = () => {
      console.log('=== 認証状態チェック ===');

      // Supabase URL からプロジェクト識別子を取得
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || '';
      const authTokenKey = `sb-${projectId}-auth-token`;

      console.log(`認証トークンキー: ${authTokenKey}`);

      // LocalStorage チェック
      const localStorageValue = localStorage.getItem(authTokenKey);
      console.log(`LocalStorage: ${authTokenKey}`, localStorageValue ? '[存在]' : '[なし]');
      if (localStorageValue) {
        console.log('  値の長さ:', localStorageValue.length, '文字');
      }

      // Cookie チェック
      const cookies = document.cookie.split(';');
      const supabaseCookies = cookies.filter(cookie => cookie.trim().startsWith('sb-'));

      console.log(`Cookies: Supabase関連Cookie:`, supabaseCookies.length > 0 ? `${supabaseCookies.length}個` : 'なし');
      supabaseCookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        console.log(`  ${name}:`, value ? `[存在] (${value.length}文字)` : '[なし]');
      });

      // 詳細情報
      console.log('\n=== Cookieの詳細 ===');
      console.log('全Cookie:', document.cookie || '(空)');

      console.log('\n=== LocalStorageの詳細 ===');
      if (localStorageValue) {
        try {
          const parsed = JSON.parse(localStorageValue);
          console.log('セッション情報:', {
            access_token: parsed.access_token ? `存在 (${parsed.access_token.substring(0, 20)}...)` : 'なし',
            refresh_token: parsed.refresh_token ? '存在' : 'なし',
            expires_at: parsed.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString('ja-JP') : 'なし',
            user: parsed.user ? parsed.user.email : 'なし',
          });
        } catch (e) {
          console.log('セッション情報のパースに失敗:', e);
        }
      }

      console.log('\n=========================');
    };

    console.log('[Debug] グローバル関数 getAuthStatus() を登録しました');
  }, []);

  return null;
}
