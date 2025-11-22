'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import ReviewForm from './ReviewForm';

interface ReviewSectionProps {
  restaurantId: string;
  reviews: any[];
}

export default function ReviewSection({ restaurantId, reviews }: ReviewSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setIsModalOpen(false);
    router.refresh(); // ページをリフレッシュしてレビューを再取得
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">レビュー</h2>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">レビューはまだありません</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              レビューを投稿する
            </button>
          </div>
        </div>
      )}

      {/* レビュー投稿モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="レビューを投稿"
      >
        <ReviewForm
          restaurantId={restaurantId}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
