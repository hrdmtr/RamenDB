import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ramen-db-three.vercel.app';

  // 全店舗を取得
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, updated_at')
    .order('updated_at', { ascending: false });

  const restaurantUrls =
    restaurants?.map((restaurant) => ({
      url: `${baseUrl}/restaurants/${restaurant.id}`,
      lastModified: new Date(restaurant.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...restaurantUrls,
  ];
}
