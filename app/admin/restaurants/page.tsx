'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  name_kana: string;
  address: string;
  nearest_station: string;
  railway: string;
  average_score: number;
  review_count: number;
}

export default function AdminRestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.data);
      }
    } catch (error) {
      console.error('店舗取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('店舗を削除しました');
        fetchRestaurants();
      } else {
        alert('削除に失敗しました: ' + data.error);
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">店舗管理</h1>
        <Link
          href="/admin/restaurants/new"
          className="inline-flex items-center bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
        >
          <span className="mr-2">🏪</span>
          新しい店舗を追加
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      )}

      {!isLoading && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  店舗名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  住所
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最寄駅
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スコア
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  レビュー数
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {restaurant.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {restaurant.name_kana}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {restaurant.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {restaurant.nearest_station}駅
                    </div>
                    <div className="text-sm text-gray-500">
                      {restaurant.railway}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-blue-600">
                      {restaurant.average_score.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {restaurant.review_count}件
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/restaurants/${restaurant.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        target="_blank"
                      >
                        表示
                      </Link>
                      <Link
                        href={`/admin/restaurants/${restaurant.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className={`${
                          deleteConfirm === restaurant.id
                            ? 'text-red-900 font-bold'
                            : 'text-red-600'
                        } hover:text-red-900`}
                      >
                        {deleteConfirm === restaurant.id
                          ? '本当に削除？'
                          : '削除'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {restaurants.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-700 text-lg font-semibold mb-4">
                店舗が登録されていません
              </p>
              <p className="text-gray-500 mb-6">
                右上の「新しい店舗を追加」ボタンから最初の店舗を追加しましょう
              </p>
              <Link
                href="/admin/restaurants/new"
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">🏪</span>
                最初の店舗を追加する
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
