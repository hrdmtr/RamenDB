import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReviewSection from '@/components/ReviewSection';
import RadarChart from '@/components/RadarChart';
import type { Metadata } from 'next';

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

// メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurant(id);

  if (!restaurant) {
    return {
      title: '店舗が見つかりません',
    };
  }

  const restaurantData = restaurant as any;
  const categories = restaurantData.restaurant_categories
    ?.map((rc: any) => rc.category.name)
    .join('・') || '';

  return {
    title: `${restaurantData.name} - ${categories}`,
    description: `${restaurantData.name}（${restaurantData.name_kana}）のレビュー・評価。${restaurantData.nearest_station}駅から徒歩圏内。平均評価${restaurantData.average_score.toFixed(1)}点（${restaurantData.review_count}件のレビュー）。${categories}のラーメン店。`,
    keywords: [
      restaurantData.name,
      restaurantData.nearest_station,
      restaurantData.railway,
      categories,
      'ラーメン',
      'レビュー',
      '評価',
    ],
    openGraph: {
      title: `${restaurantData.name} - ${categories} | RamenDB`,
      description: `${restaurantData.name}の詳細情報・レビュー。平均評価${restaurantData.average_score.toFixed(1)}点（${restaurantData.review_count}件）`,
      url: `https://ramen-db-three.vercel.app/restaurants/${id}`,
      type: 'website',
      images: restaurantData.thumbnail_url
        ? [
            {
              url: restaurantData.thumbnail_url,
              width: 800,
              height: 600,
              alt: restaurantData.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${restaurantData.name} - ${categories}`,
      description: `平均評価${restaurantData.average_score.toFixed(1)}点（${restaurantData.review_count}件のレビュー）`,
      images: restaurantData.thumbnail_url ? [restaurantData.thumbnail_url] : undefined,
    },
  };
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurantData = await getRestaurant(id);

  if (!restaurantData) {
    notFound();
  }

  const reviews = await getReviews(id);
  const restaurant = restaurantData as any; // データベースはスネークケースを使用

  // レビューの5軸評価平均を計算（5軸データがあるレビューのみ）
  const calculateAverageScores = () => {
    if (!reviews || reviews.length === 0) {
      return {
        scoreTaste: 0,
        scorePortion: 0,
        scorePrice: 0,
        scoreService: 0,
        scoreCleanliness: 0,
        count: 0,
      };
    }

    // 5軸評価データがあるレビューのみをフィルタ
    const reviewsWithScores = reviews.filter(
      (review: any) =>
        review.score_taste != null &&
        review.score_portion != null &&
        review.score_price != null &&
        review.score_service != null &&
        review.score_cleanliness != null
    );

    if (reviewsWithScores.length === 0) {
      return {
        scoreTaste: 0,
        scorePortion: 0,
        scorePrice: 0,
        scoreService: 0,
        scoreCleanliness: 0,
        count: 0,
      };
    }

    const total = reviewsWithScores.reduce(
      (acc: any, review: any) => ({
        scoreTaste: acc.scoreTaste + review.score_taste,
        scorePortion: acc.scorePortion + review.score_portion,
        scorePrice: acc.scorePrice + review.score_price,
        scoreService: acc.scoreService + review.score_service,
        scoreCleanliness: acc.scoreCleanliness + review.score_cleanliness,
      }),
      {
        scoreTaste: 0,
        scorePortion: 0,
        scorePrice: 0,
        scoreService: 0,
        scoreCleanliness: 0,
      }
    );

    return {
      scoreTaste: total.scoreTaste / reviewsWithScores.length,
      scorePortion: total.scorePortion / reviewsWithScores.length,
      scorePrice: total.scorePrice / reviewsWithScores.length,
      scoreService: total.scoreService / reviewsWithScores.length,
      scoreCleanliness: total.scoreCleanliness / reviewsWithScores.length,
      count: reviewsWithScores.length,
    };
  };

  const averageScores = calculateAverageScores();

  // 構造化データ（JSON-LD）
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    image: restaurant.thumbnail_url || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressCountry: 'JP',
    },
    geo: restaurant.latitude && restaurant.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    } : undefined,
    url: `https://ramen-db-three.vercel.app/restaurants/${id}`,
    telephone: restaurant.phone_number || undefined,
    servesCuisine: 'Japanese',
    priceRange: '¥¥',
    aggregateRating: reviews && reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: restaurant.average_score.toFixed(1),
      reviewCount: restaurant.review_count,
      bestRating: '10',
      worstRating: '0',
    } : undefined,
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

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

        {/* 5軸評価レーダーチャート */}
        {reviews && reviews.length > 0 && averageScores.count > 0 && (
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">5軸評価</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* レーダーチャート */}
              <div className="w-full md:w-1/2">
                <RadarChart data={averageScores} />
              </div>
              {/* 数値表示 */}
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">味</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${(averageScores.scoreTaste / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-bold w-12 text-right">
                      {averageScores.scoreTaste.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">量</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${(averageScores.scorePortion / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-bold w-12 text-right">
                      {averageScores.scorePortion.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">価格/コスパ</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${(averageScores.scorePrice / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-bold w-12 text-right">
                      {averageScores.scorePrice.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">接客</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${(averageScores.scoreService / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-bold w-12 text-right">
                      {averageScores.scoreService.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">衛生</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${(averageScores.scoreCleanliness / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-bold w-12 text-right">
                      {averageScores.scoreCleanliness.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              ※5軸評価データがある{averageScores.count}件のレビューの平均値
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
        <ReviewSection restaurantId={id} reviews={reviews} />
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
    </>
  );
}
