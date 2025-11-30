'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Modal from './Modal';
import ReviewForm from './ReviewForm';
import QuickRatingForm from './QuickRatingForm';
import LoginModal from './LoginModal';

interface ReviewSectionProps {
  restaurantId: string;
  reviews: any[];
}

type ReviewMode = 'select' | 'quick' | 'detailed';

export default function ReviewSection({ restaurantId, reviews }: ReviewSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('select');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  // URLパラメータ ?openReview=true でレビューモーダルを開く
  useEffect(() => {
    const shouldOpenReview = searchParams.get('openReview') === 'true';

    if (shouldOpenReview && !loading && user) {
      console.log('URLパラメータからレビューモーダルを開く');
      setReviewMode('select');
      setIsModalOpen(true);

      // URLパラメータをクリーンアップ
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('openReview');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, user, loading, router]);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setReviewMode('select');
    router.refresh(); // ページをリフレッシュしてレビューを再取得
  };

  const handleOpenModal = () => {
    // ログインチェック
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setReviewMode('select');
    setIsModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  const handleCancel = () => {
    setReviewMode('select');
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">レビュー</h2>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">レビューはまだありません</p>
          <button
            onClick={handleOpenModal}
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

              {/* レビュー詳細項目 */}
              <div className="space-y-4">
                {/* 味 */}
                {review.taste_comment && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">🍜 味</h4>
                    <p className="text-gray-700 leading-relaxed pl-5">
                      {review.taste_comment}
                    </p>
                  </div>
                )}

                {/* 雰囲気 */}
                {review.atmosphere_type && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">🏪 雰囲気</h4>
                    <p className="text-gray-700 leading-relaxed pl-5">
                      {review.atmosphere_type === 'quiet' && '静か'}
                      {review.atmosphere_type === 'lively' && '賑やか'}
                      {review.atmosphere_type === 'normal' && '普通'}
                      {review.atmosphere_type === 'other' && 'その他'}
                      {review.atmosphere_comment && (
                        <span className="text-gray-600"> - {review.atmosphere_comment}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* 接客 */}
                {review.service_comment && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">👥 接客</h4>
                    <p className="text-gray-700 leading-relaxed pl-5">
                      {review.service_comment}
                    </p>
                  </div>
                )}

                {/* コスパ */}
                {review.cost_performance_comment && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">💰 コスパ</h4>
                    <p className="text-gray-700 leading-relaxed pl-5">
                      {review.cost_performance_comment}
                    </p>
                  </div>
                )}

                {/* アクセス */}
                {review.accessibility_comment && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">📍 アクセス</h4>
                    <p className="text-gray-700 leading-relaxed pl-5">
                      {review.accessibility_comment}
                    </p>
                  </div>
                )}

                {/* セルフサービス */}
                {review.self_service_type && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">🍽️ セルフサービス</h4>
                    <p className="text-gray-700 leading-relaxed pl-5">
                      {review.self_service_type === 'full_self' && '完全セルフ'}
                      {review.self_service_type === 'partial_self' && '一部セルフ'}
                      {review.self_service_type === 'full_service' && 'フルサービス'}
                      {review.self_service_note && (
                        <span className="text-gray-600"> - {review.self_service_note}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* 提供時間 */}
                {review.serving_time && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">⏱️ 提供時間</h4>
                    <p className="text-gray-700 leading-relaxed pl-5">
                      {review.serving_time === 'under_3' && '3分未満'}
                      {review.serving_time === '3_to_7' && '3〜7分'}
                      {review.serving_time === '7_to_15' && '7〜15分'}
                      {review.serving_time === 'over_15' && '15分以上'}
                      {review.serving_time_note && (
                        <span className="text-gray-600"> - {review.serving_time_note}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* 総合コメント */}
                {review.general_comment && (
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">💭 総合コメント</h4>
                    <p className="text-gray-700 leading-relaxed pl-5">
                      {review.general_comment}
                    </p>
                  </div>
                )}

                {/* 画像 */}
                {review.image_urls && review.image_urls.length > 0 && (
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">📷 画像</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-5">
                      {review.image_urls.map((url: string, index: number) => (
                        <img
                          key={index}
                          src={url}
                          alt={`レビュー画像 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 旧形式のcommentフィールド対応（互換性のため） */}
                {review.comment && !review.taste_comment && (
                  <div className="pt-3 border-t">
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* レビュー投稿ボタン */}
          <div className="pt-6 border-t">
            <button
              onClick={handleOpenModal}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              レビューを投稿する
            </button>
          </div>
        </div>
      )}

      {/* ログインモーダル */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        trigger="review"
      />

      {/* レビュー投稿モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title={
          reviewMode === 'select'
            ? 'レビューを投稿'
            : reviewMode === 'quick'
            ? '簡易評価'
            : '本気レビュー'
        }
      >
        {reviewMode === 'select' ? (
          // レビュータイプ選択
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">
              投稿するレビューのタイプを選択してください
            </p>

            <button
              onClick={() => setReviewMode('quick')}
              className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">⭐</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    簡易評価する
                  </h3>
                  <p className="text-sm text-gray-600">
                    5項目を評価（1分で完了）
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setReviewMode('detailed')}
              className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">📝</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    本気レビューを書く
                  </h3>
                  <p className="text-sm text-gray-600">
                    詳細なコメント + 画像
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleCancel}
              className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        ) : reviewMode === 'quick' ? (
          // 簡易評価フォーム
          <QuickRatingForm
            restaurantId={restaurantId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          // 本気レビューフォーム
          <ReviewForm
            restaurantId={restaurantId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </Modal>
    </div>
  );
}
