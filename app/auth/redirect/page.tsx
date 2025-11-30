'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * OAuth認証後のリダイレクト処理
 *
 * URLパラメータから元のページURLを取得してリダイレクトする
 */
function AuthRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URLパラメータからリダイレクト先を取得
    const redirectPath = searchParams.get('redirect');

    console.log('リダイレクト先:', redirectPath || 'ホーム（パラメータなし）');

    // 保存されたパスにリダイレクト、なければホームへ
    let targetPath = redirectPath || '/';

    // 店舗ページの場合、?openReview=true を追加してレビューモーダルを開く指示
    if (targetPath.startsWith('/restaurants/') && !targetPath.includes('openReview')) {
      targetPath += targetPath.includes('?') ? '&openReview=true' : '?openReview=true';
      console.log('レビューモーダルを開くため、openReview=true を追加:', targetPath);
    }

    router.replace(targetPath);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-300 border-t-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">ログイン処理中...</p>
      </div>
    </div>
  );
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-300 border-t-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">ログイン処理中...</p>
        </div>
      </div>
    }>
      <AuthRedirectContent />
    </Suspense>
  );
}
