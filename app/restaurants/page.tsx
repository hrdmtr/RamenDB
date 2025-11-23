'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Restaurant } from '@/types';
import SearchFilterPanel, { SearchFilters } from '@/components/SearchFilterPanel';

export default function RestaurantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // URLパラメータから初期フィルター値を取得
  const initialFilters: SearchFilters = {
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    priceRange: searchParams.get('priceRange') || '',
    isMorningRamen: searchParams.get('isMorningRamen') === 'true',
    features: searchParams.get('features')?.split(',').filter(Boolean) || [],
    minFlavorRichness: Number(searchParams.get('minFlavorRichness') || 0),
    maxFlavorRichness: Number(searchParams.get('maxFlavorRichness') || 10),
    sortBy: searchParams.get('sortBy') || 'score',
  };

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // レストランデータを取得
  const fetchRestaurants = async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchFilters.keyword) params.append('keyword', searchFilters.keyword);
      if (searchFilters.category) params.append('category', searchFilters.category);
      if (searchFilters.tag) params.append('tag', searchFilters.tag);
      if (searchFilters.priceRange) params.append('priceRange', searchFilters.priceRange);
      if (searchFilters.isMorningRamen) params.append('isMorningRamen', 'true');
      if (searchFilters.features.length > 0)
        params.append('features', searchFilters.features.join(','));
      if (searchFilters.minFlavorRichness > 0)
        params.append('minFlavorRichness', searchFilters.minFlavorRichness.toString());
      if (searchFilters.maxFlavorRichness < 10)
        params.append('maxFlavorRichness', searchFilters.maxFlavorRichness.toString());
      if (searchFilters.sortBy) params.append('sortBy', searchFilters.sortBy);

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
    fetchRestaurants(filters);
  }, []);

  // フィルター変更時の処理
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  // 検索実行時の処理
  const handleSearch = () => {
    // URLパラメータを更新
    const params = new URLSearchParams();

    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.category) params.append('category', filters.category);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.priceRange) params.append('priceRange', filters.priceRange);
    if (filters.isMorningRamen) params.append('isMorningRamen', 'true');
    if (filters.features.length > 0)
      params.append('features', filters.features.join(','));
    if (filters.minFlavorRichness > 0)
      params.append('minFlavorRichness', filters.minFlavorRichness.toString());
    if (filters.maxFlavorRichness < 10)
      params.append('maxFlavorRichness', filters.maxFlavorRichness.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    router.push(`/restaurants${queryString ? `?${queryString}` : ''}`);

    // レストランデータを再取得
    fetchRestaurants(filters);
  };

  // 並び替え変更
  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    fetchRestaurants(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">ラーメン店検索</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isLoading ? '読み込み中...' : `${restaurants.length}件の店舗`}
          </p>
        </div>
      </div>

      {/* 検索フィルターパネル */}
      <SearchFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* 並び替え */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-gray-600 whitespace-nowrap">並び替え:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange('score')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filters.sortBy === 'score'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              評価順
            </button>
            <button
              onClick={() => handleSortChange('cost_performance')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filters.sortBy === 'cost_performance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              コスパ順
            </button>
            <button
              onClick={() => handleSortChange('morning_ramen')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filters.sortBy === 'morning_ramen'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              朝ラー適性
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="container mx-auto px-4 py-6">
        {/* ローディング */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        )}

        {/* 結果なし */}
        {!isLoading && restaurants.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600 text-lg">
              条件に一致する店舗が見つかりませんでした
            </p>
            <p className="text-sm text-gray-500 mt-2">
              条件を変更して再度検索してください
            </p>
          </div>
        )}

        {/* 店舗一覧 */}
        {!isLoading && restaurants.length > 0 && (
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* サムネイル */}
                  {restaurant.thumbnail_url && (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={restaurant.thumbnail_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      {restaurant.name}
                    </h2>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-blue-600">
                          {restaurant.average_score.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">/ 10.0</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {restaurant.review_count}件のレビュー
                      </span>
                    </div>

                    {/* 価格帯・朝ラー・こってり度 */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {restaurant.price_range && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {restaurant.price_range}円
                        </span>
                      )}
                      {restaurant.is_morning_ramen && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                          朝ラー対応
                        </span>
                      )}
                      {restaurant.avg_flavor_richness !== null &&
                        restaurant.avg_flavor_richness !== undefined && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            こってり度: {restaurant.avg_flavor_richness.toFixed(1)}
                          </span>
                        )}
                    </div>

                    {/* カテゴリ・タグ */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {restaurant.restaurant_categories?.map((rc: any) => (
                        <span
                          key={rc.category.id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {rc.category.name}
                        </span>
                      ))}
                      {restaurant.restaurant_tags?.slice(0, 2).map((rt: any) => (
                        <span
                          key={rt.tag.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {rt.tag.name}
                        </span>
                      ))}
                    </div>

                    {/* 駅情報 */}
                    {restaurant.nearest_station && (
                      <p className="text-sm text-gray-600">
                        📍 {restaurant.nearest_station}駅
                        {restaurant.railway && ` (${restaurant.railway})`}
                      </p>
                    )}
                  </div>

                  {/* 詳細ボタン */}
                  <div className="flex-shrink-0">
                    <a
                      href={`/restaurants/${restaurant.id}`}
                      className="block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      詳細
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
