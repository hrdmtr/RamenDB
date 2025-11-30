'use client';

import { Suspense } from 'react';
import RestaurantsPageContent from '@/components/RestaurantsPageContent';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function RestaurantsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-300 border-t-pink-500 shadow-lg"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
        </div>
      </div>
    }>
      <RestaurantsPageContent />
    </Suspense>
  );
}
