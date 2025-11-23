'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Restaurant } from '@/types';

// Leafletのデフォルトアイコン修正（Next.jsで必要）
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RestaurantMapProps {
  restaurants: any[]; // データベースはスネークケースを使用
  center?: [number, number];
  zoom?: number;
}

// 地図の中心を自動調整するコンポーネント
function MapBounds({ restaurants }: { restaurants: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (restaurants.length === 0) return;

    const validRestaurants = restaurants.filter(
      (r) => r.latitude != null && r.longitude != null
    );

    if (validRestaurants.length === 0) return;

    if (validRestaurants.length === 1) {
      // 1店舗の場合は中心に表示
      const restaurant = validRestaurants[0];
      map.setView([restaurant.latitude!, restaurant.longitude!], 15);
    } else {
      // 複数店舗の場合は全体が見えるように調整
      const bounds = L.latLngBounds(
        validRestaurants.map((r) => [r.latitude!, r.longitude!])
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [restaurants, map]);

  return null;
}

export default function RestaurantMap({
  restaurants,
  center = [35.6812, 139.7671], // デフォルト: 東京駅
  zoom = 12,
}: RestaurantMapProps) {
  // 座標を持つ店舗のみフィルタリング
  const validRestaurants = restaurants.filter(
    (r) => r.latitude != null && r.longitude != null
  );

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds restaurants={validRestaurants} />
        {validRestaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude!, restaurant.longitude!]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">{restaurant.name}</h3>
                <div className="text-xs text-gray-600 mb-1">
                  ⭐ {restaurant.average_score.toFixed(2)} ({restaurant.review_count})
                </div>
                {restaurant.nearest_station && (
                  <div className="text-xs text-gray-600 mb-2">
                    📍 {restaurant.nearest_station}駅
                  </div>
                )}
                <a
                  href={`/restaurants/${restaurant.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  詳細を見る →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
