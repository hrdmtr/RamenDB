'use client';

import { useState } from 'react';
import { supabaseAuth } from '@/lib/supabase-auth';

interface QuickRatingFormProps {
  restaurantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// 評価基準の定義
const RATING_CRITERIA = {
  taste: {
    5: 'すごくうまい',
    4: 'うまい',
    3: '普通においしい',
    2: '微妙',
    1: 'おいしくない',
  },
  portion: {
    5: '大満足',
    4: '満足',
    3: 'ふつう',
    2: 'ちょっと物足りない',
    1: 'まったく物足りない',
  },
  price: {
    5: 'コスパすごく良い',
    4: 'コスパ高め',
    3: 'まあ妥当',
    2: 'うーん',
    1: 'コスパ悪い',
  },
  service: {
    5: '気持ちよく食事できた',
    4: '問題ない接客だった',
    3: '可もなく不可もない接客',
    2: '少し不満',
    1: '不満な接客',
  },
  cleanliness: {
    5: '清潔で気持ち良い',
    4: '清潔で問題ない',
    3: '気にはならなかった',
    2: '少し不衛生を感じた',
    1: '汚かった',
  },
};

export default function QuickRatingForm({
  restaurantId,
  onSuccess,
  onCancel,
}: QuickRatingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    taste: 3,
    portion: 3,
    price: 3,
    service: 3,
    cleanliness: 3,
  });
  const [comment, setComment] = useState('');

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // LocalStorageからアクセストークンを取得
      const { data: { session } } = await supabaseAuth.auth.getSession();

      if (!session?.access_token) {
        alert('ログインセッションが見つかりません。再度ログインしてください。');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
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
    const criteria = RATING_CRITERIA[category];

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <label className="text-base font-bold text-gray-900">{label}</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-orange-500">{value}</span>
            <span className="text-sm text-gray-500">/ 5</span>
          </div>
        </div>

        {/* 星評価（5つ星） */}
        <div className="flex items-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <button
              key={starValue}
              type="button"
              onClick={() => handleRatingChange(category, starValue)}
              className={`text-4xl transition-all ${
                starValue <= value
                  ? 'text-orange-500'
                  : 'text-gray-300 hover:text-orange-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* 評価基準の表示 */}
        <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
          <p className="font-semibold text-orange-600 mb-1">{criteria[value as keyof typeof criteria]}</p>
          <div className="text-xs text-gray-500 space-y-1 mt-2">
            {Object.entries(criteria).reverse().map(([score, desc]) => (
              <div key={score} className={value === parseInt(score) ? 'font-bold text-gray-700' : ''}>
                <span className="inline-block w-4">{score}:</span> {desc}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">⭐ 簡易評価</h2>
      <p className="text-sm text-gray-600 mb-6">
        5つの項目を5点満点で評価してください（1分で完了）
      </p>

      <form onSubmit={handleSubmit}>
        {renderStarRating('taste', '🍜 味')}
        {renderStarRating('portion', '📏 量')}
        {renderStarRating('price', '💰 価格/コスパ')}
        {renderStarRating('service', '👥 接客')}
        {renderStarRating('cleanliness', '✨ 衛生')}

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
