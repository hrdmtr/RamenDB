'use client';

import { useState } from 'react';

interface QuickRatingFormProps {
  restaurantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QuickRatingForm({
  restaurantId,
  onSuccess,
  onCancel,
}: QuickRatingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    taste: 5.0,
    portion: 5.0,
    price: 5.0,
    service: 5.0,
    cleanliness: 5.0,
  });
  const [comment, setComment] = useState('');

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          review_type: 'quick',
          score_taste: ratings.taste,
          score_portion: ratings.portion,
          score_price: ratings.price,
          score_service: ratings.service,
          score_cleanliness: ratings.cleanliness,
          general_comment: comment || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('簡易評価を投稿しました！');
        onSuccess();
      } else {
        alert('エラー: ' + data.error);
      }
    } catch (error) {
      console.error('簡易評価投稿エラー:', error);
      alert('投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    category: keyof typeof ratings,
    label: string
  ) => {
    const value = ratings[category];

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-900">{label}</label>
          <span className="text-lg font-bold text-orange-500">{value.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2">
          {[...Array(10)].map((_, i) => {
            const starValue = i + 1;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleRatingChange(category, starValue)}
                className={`text-2xl transition-all ${
                  starValue <= value
                    ? 'text-orange-500'
                    : 'text-gray-300 hover:text-orange-300'
                }`}
              >
                ★
              </button>
            );
          })}
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={value}
          onChange={(e) => handleRatingChange(category, parseFloat(e.target.value))}
          className="w-full mt-2"
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ 簡易評価</h2>
      <p className="text-sm text-gray-600 mb-6">
        5つの項目を10点満点で評価してください（1分で完了）
      </p>

      <form onSubmit={handleSubmit}>
        {renderStarRating('taste', '味')}
        {renderStarRating('portion', '量')}
        {renderStarRating('price', '価格/コスパ')}
        {renderStarRating('service', '接客')}
        {renderStarRating('cleanliness', '衛生')}

        {/* 任意コメント */}
        <div className="mt-6 mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            コメント（任意）
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={200}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            placeholder="簡単なコメントを入力..."
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/200文字</p>
        </div>

        {/* ボタン */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
