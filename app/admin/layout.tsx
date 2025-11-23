import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">RamenDB 管理画面</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              サイトに戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* サイドバー */}
          <aside className="w-64 bg-white rounded-lg shadow-md p-6">
            <nav className="space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 font-medium"
              >
                ダッシュボード
              </Link>
              <Link
                href="/admin/restaurants"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 font-medium"
              >
                店舗管理
              </Link>
              <Link
                href="/admin/reviews"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 font-medium"
              >
                レビュー管理
              </Link>
            </nav>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
