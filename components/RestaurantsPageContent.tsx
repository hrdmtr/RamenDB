'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import SearchFilterPanel, { SearchFilters } from '@/components/SearchFilterPanel';

// 地図コンポーネントを動的インポート（SSR無効化）
const RestaurantMap = dynamicImport(() => import('@/components/RestaurantMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-500">地図を読み込み中...</p>
    </div>
  ),
});

export default function RestaurantsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<any[]>([]); // データベースはスネークケースを使用
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
    <div className="min-h-screen bg-orange-50">
      {/* ヘッダー */}
      <div className="bg-orange-500 border-b sticky top-0 z-30 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">ラーメン店検索</h1>
          <p className="text-sm font-medium text-white/90 mt-1">
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
      <div className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">並び替え:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange('score')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filters.sortBy === 'score'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              評価順
            </button>
            <button
              onClick={() => handleSortChange('cost_performance')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filters.sortBy === 'cost_performance'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              コスパ順
            </button>
            <button
              onClick={() => handleSortChange('morning_ramen')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filters.sortBy === 'morning_ramen'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-300 border-t-pink-500 shadow-lg"></div>
            <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
          </div>
        )}

        {/* 結果なし */}
        {!isLoading && restaurants.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-orange-200 shadow-md">
            <p className="text-gray-700 text-xl font-semibold">
              条件に一致する店舗が見つかりませんでした
            </p>
            <p className="text-base text-gray-500 mt-2">
              条件を変更して再度検索してください
            </p>
          </div>
        )}

        {/* 店舗一覧と地図 */}
        {!isLoading && restaurants.length > 0 && (
          <div className="flex gap-4">
            {/* 左側: 店舗リスト */}
            <div className="flex-1 space-y-4">
              {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white border rounded-lg hover:shadow-lg transition-shadow"
              >
                <a href={`/restaurants/${restaurant.id}`} className="block">
                  <div className="flex gap-4 p-4">
                    {/* 画像エリア（4枚表示） */}
                    <div className="flex-shrink-0">
                      <div className="flex gap-1.5">
                        {(() => {
                          // レビュー画像を収集
                          const allImages: string[] = [];
                          restaurant.reviews?.forEach((review: any) => {
                            review.review_images?.forEach((img: any) => {
                              allImages.push(img.image_url);
                            });
                          });

                          // サムネイルも含める
                          if (restaurant.thumbnail_url) {
                            allImages.unshift(restaurant.thumbnail_url);
                          }

                          // 最大4枚
                          const displayImages = allImages.slice(0, 4);

                          // 画像がない場合はプレースホルダー
                          if (displayImages.length === 0) {
                            return (
                              <div className="w-44 h-32 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                                <span className="text-gray-400 text-sm">No Image</span>
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* メイン画像（大） */}
                              <div className="w-44 h-32 bg-gray-200 rounded overflow-hidden">
                                <img
                                  src={displayImages[0]}
                                  alt={restaurant.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* サブ画像3枚（小・縦並び） */}
                              {displayImages.length > 1 && (
                                <div className="flex flex-col gap-1.5">
                                  {displayImages.slice(1, 4).map((img, i) => (
                                    <div key={i} className="w-16 h-[calc((128px-12px)/3)] bg-gray-100 rounded overflow-hidden">
                                      <img
                                        src={img}
                                        alt={`${restaurant.name} ${i + 2}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                  {/* 画像が足りない場合は空枠 */}
                                  {[...Array(Math.max(0, 3 - displayImages.slice(1).length))].map((_, i) => (
                                    <div key={`empty-${i}`} className="w-16 h-[calc((128px-12px)/3)] bg-gray-100 rounded"></div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 情報エリア */}
                    <div className="flex-1 min-w-0">
                      {/* 店名 */}
                      <h2 className="text-lg font-bold text-gray-900 mb-1">
                        {restaurant.name}
                      </h2>

                      {/* 一言説明 */}
                      {restaurant.profile_description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {restaurant.profile_description}
                        </p>
                      )}

                      {/* 評価 */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-orange-500">
                            {restaurant.average_score.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({restaurant.review_count})
                        </span>
                      </div>

                      {/* カテゴリ・タグ */}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {restaurant.restaurant_categories?.map((rc: any) => (
                          <span key={rc.category.id}>
                            {rc.category.name}
                          </span>
                        ))}
                        {restaurant.restaurant_tags?.slice(0, 2).map((rt: any, idx: number) => (
                          <span key={rt.tag.id}>
                            {idx > 0 && '・'}
                            {rt.tag.name}
                          </span>
                        ))}
                      </div>

                      {/* その他情報 */}
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        {restaurant.price_range && (
                          <span>¥{restaurant.price_range}</span>
                        )}
                        {restaurant.nearest_station && (
                          <span>
                            {restaurant.nearest_station}駅
                          </span>
                        )}
                        {restaurant.is_morning_ramen && (
                          <span className="text-orange-600 font-semibold">朝ラー対応</span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              </div>
              ))}
            </div>

            {/* 右側: 地図 */}
            <div className="w-96 sticky top-24 h-[calc(100vh-7rem)]">
              <RestaurantMap restaurants={restaurants} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
