'use client';

import { useState } from 'react';

interface ReviewFormProps {
  restaurantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({
  restaurantId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 既存ユーザーを取得（本来は認証システムから取得）
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();

      if (!usersData.success || !usersData.data || usersData.data.length === 0) {
        throw new Error('ユーザー情報の取得に失敗しました');
      }

      // 最初のユーザーを使用（本来は認証済みユーザーのID）
      const userId = usersData.data[0].id;

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          user_id: userId,
          score: Number(score),
          comment,
          visit_date: visitDate || null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'レビューの投稿に失敗しました');
      }

      onSuccess();
    } catch (err: any) {
      console.error('レビュー投稿エラー:', err);
      setError(err.message || 'レビューの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* スコア */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          スコア *
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="flex-1"
            required
          />
          <span className="text-3xl font-bold text-blue-600 w-20 text-right">
            {score.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">0.0 〜 10.0</p>
      </div>

      {/* 来店日 */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          来店日
        </label>
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* コメント */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          コメント *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={6}
          placeholder="お店の感想を詳しく教えてください..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {comment.length} / 1000文字
        </p>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? '投稿中...' : 'レビューを投稿'}
        </button>
      </div>
    </form>
  );
}
