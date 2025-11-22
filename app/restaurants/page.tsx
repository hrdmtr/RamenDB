import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';

async function getRestaurants() {
  const { data: restaurants, error } = await supabase
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
      )
    `)
    .order('average_score', { ascending: false });

  if (error) {
    console.error('レストランデータ取得エラー:', error);
    return [];
  }

  return restaurants as Restaurant[];
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ラーメン店一覧</h1>
        <p className="text-gray-600">
          {restaurants.length}件の店舗が登録されています
        </p>
      </div>

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
    </div>
  );
}
