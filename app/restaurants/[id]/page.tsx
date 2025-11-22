import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getRestaurant(id: string) {
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      restaurant_categories (
        category:categories (
          id,
          name,
          slug
        )
      ),
      restaurant_tags (
        tag:tags (
          id,
          name,
          slug
        )
      ),
      business_hours (
        day_of_week,
        open_time,
        close_time,
        is_closed
      )
    `)
    .eq('id', id)
    .single();

  if (error || !restaurant) {
    return null;
  }

  return restaurant as Restaurant;
}

async function getReviews(restaurantId: string) {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users (
        id,
        username,
        display_name,
        reviewer_score
      )
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('レビュー取得エラー:', error);
    return [];
  }

  return reviews;
}

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

export default async function RestaurantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const restaurant = await getRestaurant(params.id);

  if (!restaurant) {
    notFound();
  }

  const reviews = await getReviews(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">
          ホーム
        </Link>
        {' > '}
        <Link href="/restaurants" className="hover:text-blue-600">
          店舗一覧
        </Link>
        {' > '}
        <span className="text-gray-900">{restaurant.name}</span>
      </div>

      {/* 店舗情報 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-blue-100 mb-4">{restaurant.name_kana}</p>

          {/* スコア */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold">
                {restaurant.average_score.toFixed(1)}
              </span>
              <span className="text-2xl text-blue-100">/ 10.0</span>
            </div>
            <div className="text-blue-100">
              <p className="text-lg">{restaurant.review_count}件のレビュー</p>
            </div>
          </div>
        </div>

        {/* カテゴリ・タグ */}
        <div className="p-6 border-b">
          <div className="flex flex-wrap gap-3">
            {restaurant.restaurant_categories &&
              restaurant.restaurant_categories.map((rc: any) => (
                <span
                  key={rc.category.id}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {rc.category.name}
                </span>
              ))}
            {restaurant.restaurant_tags &&
              restaurant.restaurant_tags.map((rt: any) => (
                <span
                  key={rt.tag.id}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {rt.tag.name}
                </span>
              ))}
          </div>
        </div>

        {/* 店舗説明 */}
        {restaurant.profile_description && (
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-2xl font-bold mb-3 text-gray-900">店舗について</h2>
            <p className="text-gray-700 leading-relaxed">
              {restaurant.profile_description}
            </p>
          </div>
        )}

        {/* 基本情報 */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">基本情報</h2>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-32 text-gray-800 font-semibold">住所</span>
              <span className="flex-1 text-gray-900">{restaurant.address}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-800 font-semibold">最寄駅</span>
              <span className="flex-1 text-gray-900">
                {restaurant.nearest_station}駅（{restaurant.railway}）
              </span>
            </div>
            {restaurant.phone_number && (
              <div className="flex">
                <span className="w-32 text-gray-800 font-semibold">電話番号</span>
                <span className="flex-1 text-gray-900">
                  {restaurant.phone_number}
                </span>
              </div>
            )}
            {restaurant.website && (
              <div className="flex">
                <span className="w-32 text-gray-800 font-semibold">
                  ウェブサイト
                </span>
                <span className="flex-1">
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {restaurant.website}
                  </a>
                </span>
              </div>
            )}
            {restaurant.twitter && (
              <div className="flex">
                <span className="w-32 text-gray-800 font-semibold">Twitter</span>
                <span className="flex-1">
                  <a
                    href={`https://twitter.com/${restaurant.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {restaurant.twitter}
                  </a>
                </span>
              </div>
            )}
            {restaurant.instagram && (
              <div className="flex">
                <span className="w-32 text-gray-800 font-semibold">
                  Instagram
                </span>
                <span className="flex-1">
                  <a
                    href={`https://instagram.com/${restaurant.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    @{restaurant.instagram}
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 営業時間 */}
        {restaurant.business_hours && restaurant.business_hours.length > 0 && (
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">営業時間</h2>
            <div className="space-y-2">
              {DAY_NAMES.map((dayName, dayIndex) => {
                const hours = (restaurant.business_hours || []).filter(
                  (bh: any) => bh.day_of_week === dayIndex
                );

                return (
                  <div key={dayIndex} className="flex">
                    <span className="w-16 text-gray-800 font-semibold">
                      {dayName}曜日
                    </span>
                    <span className="flex-1">
                      {hours.length === 0 ? (
                        <span className="text-gray-400">-</span>
                      ) : hours.some((h: any) => h.is_closed) ? (
                        <span className="text-red-600 font-medium">定休日</span>
                      ) : (
                        <span className="text-gray-900">
                          {hours
                            .map(
                              (h: any) =>
                                `${h.open_time.slice(0, 5)} - ${h.close_time.slice(0, 5)}`
                            )
                            .join(', ')}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* レビューセクション */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">レビュー</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">レビューはまだありません</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                レビューを投稿する
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
                >
                  {/* レビューヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {review.user.display_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          @{review.user.username}
                        </span>
                        {review.user.reviewer_score && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            信頼度: {(review.user.reviewer_score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {review.visit_date && (
                          <span>来店日: {review.visit_date}</span>
                        )}
                        <span>
                          投稿日: {new Date(review.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-blue-600">
                        {review.score.toFixed(1)}
                      </span>
                      <span className="text-gray-500">/ 10.0</span>
                    </div>
                  </div>

                  {/* レビューコメント */}
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}

              {/* レビュー投稿ボタン */}
              <div className="pt-6 border-t">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  レビューを投稿する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="mt-8">
        <Link
          href="/restaurants"
          className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← 店舗一覧に戻る
        </Link>
      </div>
    </div>
  );
}
