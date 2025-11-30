'use client';

export default function Footer() {
  // Vercelの環境変数から自動取得
  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev';
  const buildTime = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_DATE
    ? new Date(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_DATE).toLocaleString('ja-JP')
    : new Date().toLocaleString('ja-JP');

  return (
    <footer className="bg-gray-100 border-t mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p>© 2025 RamenDB - ラーメンレビューデータベース</p>
          </div>
          <div className="text-right">
            <p className="text-xs">
              Version: <span className="font-mono font-semibold">{commitSha}</span>
            </p>
            <p className="text-xs">
              Build: {buildTime}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
