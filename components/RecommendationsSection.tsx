'use client';

import { useState, useEffect } from 'react';
import { getAnonymousUserId } from '@/lib/anonymous-user';

interface Restaurant {
  id: string;
  name: string;
  average_score: number;
  review_count: number;
  nearest_station?: string;
  thumbnail_url?: string;
  short_description?: string;
  recommendation_score?: number;
  reason?: string;
  restaurant_categories?: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface RecommendationsSectionProps {
  limit?: number;
}

export default function RecommendationsSection({
  limit = 10,
}: RecommendationsSectionProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const anonymousId = getAnonymousUserId();
      const response = await fetch(
        `/api/recommendations?anonymous_user_id=${anonymousId}&limit=${limit}`
      );
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data);
        setIsPersonalized(data.is_personalized !== false);
      }
    } catch (error) {
      console.error('推薦データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="my-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-300 border-t-pink-500"></div>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <div className="my-12">
      {/* 見出し */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isPersonalized ? '💡 あなたへのおすすめ' : '🔥 人気の店舗'}
        </h2>
        {isPersonalized && (
          <p className="text-sm text-gray-600">
            あなたの閲覧履歴をもとにおすすめしています
          </p>
        )}
      </div>

      {/* 店舗カード（横スクロール） */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {restaurants.map((restaurant) => (
            <a
              key={restaurant.id}
              href={`/restaurants/${restaurant.id}`}
              className="flex-shrink-0 w-72 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all"
            >
              {/* 画像 */}
              <div className="relative h-40 bg-gray-200 rounded-t-xl overflow-hidden">
                {restaurant.thumbnail_url ? (
                  <img
                    src={restaurant.thumbnail_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-5xl">🍜</span>
                  </div>
                )}
                {/* スコアバッジ */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                  <span className="text-lg font-bold text-orange-500">
                    {restaurant.average_score.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 情報 */}
              <div className="p-4">
                {/* 店名 */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {restaurant.name}
                </h3>

                {/* キャッチコピー */}
                {restaurant.short_description && (
                  <p className="text-sm text-gray-700 font-semibold mb-2 line-clamp-1">
                    {restaurant.short_description}
                  </p>
                )}

                {/* 推薦理由 */}
                {restaurant.reason && isPersonalized && (
                  <p className="text-xs text-pink-600 font-semibold mb-2">
                    ✨ {restaurant.reason}
                  </p>
                )}

                {/* カテゴリ・駅 */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  {restaurant.restaurant_categories?.[0]?.category && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {restaurant.restaurant_categories[0].category.name}
                    </span>
                  )}
                  {restaurant.nearest_station && (
                    <span>🚉 {restaurant.nearest_station}駅</span>
                  )}
                </div>

                {/* レビュー数 */}
                <p className="text-xs text-gray-500">
                  {restaurant.review_count}件のレビュー
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* スクロールヒント（モバイル） */}
      <div className="mt-2 text-center md:hidden">
        <p className="text-xs text-gray-500">← スワイプして他の店舗を見る →</p>
      </div>
    </div>
  );
}
