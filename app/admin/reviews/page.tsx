'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Review {
  id: string;
  score: number;
  comment: string;
  visit_date: string | null;
  created_at: string;
  user: {
    id: string;
    username: string;
    display_name: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('レビュー取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('レビューを削除しました');
        fetchReviews();
      } else {
        alert('削除に失敗しました: ' + data.error);
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">レビュー管理</h1>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/restaurants/${review.restaurant.id}`}
                      className="text-lg font-bold text-blue-600 hover:text-blue-800"
                      target="_blank"
                    >
                      {review.restaurant.name}
                    </Link>
                    <span className="text-2xl font-bold text-blue-600">
                      {review.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="font-medium text-gray-900">
                      {review.user.display_name}
                    </span>
                    <span>@{review.user.username}</span>
                    {review.visit_date && (
                      <span>来店日: {review.visit_date}</span>
                    )}
                    <span>
                      投稿日:{' '}
                      {new Date(review.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className={`ml-4 px-4 py-2 rounded-lg transition-colors ${
                    deleteConfirm === review.id
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {deleteConfirm === review.id ? '本当に削除？' : '削除'}
                </button>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              レビューが投稿されていません
            </div>
          )}
        </div>
      )}
    </div>
  );
}
