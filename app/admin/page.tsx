import { supabase } from '@/lib/supabase';
import Link from 'next/link';

async function getStats() {
  const [restaurantsResult, reviewsResult, usersResult] = await Promise.all([
    supabase.from('restaurants').select('id', { count: 'exact' }),
    supabase.from('reviews').select('id', { count: 'exact' }),
    supabase.from('users').select('id', { count: 'exact' }),
  ]);

  return {
    restaurantCount: restaurantsResult.count || 0,
    reviewCount: reviewsResult.count || 0,
    userCount: usersResult.count || 0,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">登録店舗数</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.restaurantCount}
              </p>
            </div>
            <div className="text-4xl">🍜</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">レビュー総数</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.reviewCount}
              </p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">ユーザー数</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.userCount}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          クイックアクション
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/restaurants"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-semibold text-gray-900">店舗を管理</p>
              <p className="text-sm text-gray-600">
                店舗情報の編集・削除
              </p>
            </div>
          </Link>

          <Link
            href="/admin/reviews"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-semibold text-gray-900">レビューを管理</p>
              <p className="text-sm text-gray-600">
                不適切なレビューの削除
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
