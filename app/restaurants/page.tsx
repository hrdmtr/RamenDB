'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Restaurant } from '@/types';
import RestaurantFilter from '@/components/RestaurantFilter';

interface FilterValues {
  keyword: string;
  category: string;
  tag: string;
  station: string;
  railway: string;
  minScore: string;
}

export default function RestaurantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // URLパラメータから初期フィルター値を取得
  const initialFilters: FilterValues = {
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    station: searchParams.get('station') || '',
    railway: searchParams.get('railway') || '',
    minScore: searchParams.get('minScore') || '',
  };

  // レストランデータを取得
  const fetchRestaurants = async (filters: FilterValues) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/restaurants?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data);
      }
    } catch (error) {
      console.error('レストランデータ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchRestaurants(initialFilters);
  }, []);

  // フィルター変更時の処理
  const handleFilterChange = (filters: FilterValues) => {
    // URLパラメータを更新
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    router.push(`/restaurants${queryString ? `?${queryString}` : ''}`);

    // レストランデータを再取得
    fetchRestaurants(filters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ラーメン店一覧</h1>
        <p className="text-gray-600">
          {isLoading ? '読み込み中...' : `${restaurants.length}件の店舗が見つかりました`}
        </p>
      </div>

      {/* フィルター */}
      <RestaurantFilter
        onFilterChange={handleFilterChange}
        initialFilters={initialFilters}
      />

      {/* ローディング */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      )}

      {/* 結果なし */}
      {!isLoading && restaurants.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            条件に一致する店舗が見つかりませんでした
          </p>
        </div>
      )}

      {/* 店舗一覧 */}
      {!isLoading && restaurants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>
              <p className="text-sm text-gray-500 mb-2">
                {restaurant.name_kana}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-blue-600">
                  {restaurant.average_score.toFixed(1)}
                </span>
                <span className="text-gray-500">/ 10.0</span>
              </div>
              <p className="text-sm text-gray-600">
                {restaurant.review_count}件のレビュー
              </p>
            </div>

            {restaurant.profile_description && (
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {restaurant.profile_description}
              </p>
            )}

            <div className="mb-4">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-500">📍</span>
                <div>
                  <p className="font-medium">
                    {restaurant.nearest_station}駅
                  </p>
                  <p className="text-gray-600">{restaurant.railway}</p>
                </div>
              </div>
            </div>

            {restaurant.restaurant_categories &&
              restaurant.restaurant_categories.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {restaurant.restaurant_categories.map((rc: any) => (
                      <span
                        key={rc.category.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                      >
                        {rc.category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {restaurant.restaurant_tags &&
              restaurant.restaurant_tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {restaurant.restaurant_tags.map((rt: any) => (
                      <span
                        key={rt.tag.id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {rt.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <a
              href={`/restaurants/${restaurant.id}`}
              className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              詳細を見る
            </a>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
