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
  const [visitDate, setVisitDate] = useState<string>('');

  // 詳細項目（必須）
  const [tasteComment, setTasteComment] = useState<string>('');
  const [atmosphereType, setAtmosphereType] = useState<string>('');
  const [atmosphereComment, setAtmosphereComment] = useState<string>('');
  const [serviceComment, setServiceComment] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [costPerformanceComment, setCostPerformanceComment] = useState<string>('');
  const [accessibilityComment, setAccessibilityComment] = useState<string>('');
  const [selfServiceType, setSelfServiceType] = useState<string>('');
  const [selfServiceNote, setSelfServiceNote] = useState<string>('');
  const [servingTime, setServingTime] = useState<string>('');
  const [servingTimeNote, setServingTimeNote] = useState<string>('');

  // 任意項目
  const [generalComment, setGeneralComment] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 最大5枚までチェック
    if (imageUrls.length + files.length > 5) {
      setError('画像は最大5枚までアップロード可能です');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setImageUrls([...imageUrls, ...urls]);
    } catch (err: any) {
      console.error('画像アップロードエラー:', err);
      setError(err.message || '画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

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
          taste_comment: tasteComment,
          atmosphere_type: atmosphereType,
          atmosphere_comment: atmosphereComment || null,
          service_comment: serviceComment,
          cost_performance_comment: costPerformanceComment,
          accessibility_comment: accessibilityComment,
          self_service_type: selfServiceType,
          self_service_note: selfServiceNote || null,
          serving_time: servingTime,
          serving_time_note: servingTimeNote || null,
          general_comment: generalComment || null,
          visit_date: visitDate || null,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
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

  const isFormValid =
    tasteComment.trim().length >= 50 &&
    atmosphereType &&
    serviceComment.trim() &&
    costPerformanceComment.trim() &&
    accessibilityComment.trim() &&
    selfServiceType &&
    servingTime;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 説明文 */}
      <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
        <p className="text-sm text-blue-800">
          各項目について詳しく入力することで、他のユーザーにとって有益な情報となります。
          <br />
          必須項目は<span className="text-red-600 font-bold">*</span>マークで表示されています。
        </p>
      </div>

      {/* 1. 味についての評価 */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          1. 味についての評価 <span className="text-red-600">*</span>
        </label>
        <p className="text-xs text-gray-600 mb-2">
          スープ・麺・具材について、できるだけ詳しく教えてください（50文字以上）
        </p>
        <textarea
          value={tasteComment}
          onChange={(e) => setTasteComment(e.target.value)}
          rows={5}
          placeholder="例：スープは鶏ガラベースで濃厚。麺は中太ストレートで、スープとよく絡む。チャーシューは柔らかく味が染み込んでいて美味しい。"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
          required
        />
        <p className={`text-sm mt-1 ${tasteComment.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
          {tasteComment.length} / 50文字以上
        </p>
      </div>

      {/* 2. 店の雰囲気 */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          2. 店の雰囲気について <span className="text-red-600">*</span>
        </label>
        <p className="text-xs text-gray-600 mb-2">
          店内の雰囲気を選択してください
        </p>
        <select
          value={atmosphereType}
          onChange={(e) => setAtmosphereType(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 mb-2"
          required
        >
          <option value="">選択してください</option>
          <option value="quiet">静か</option>
          <option value="lively">賑やか</option>
          <option value="normal">普通</option>
          <option value="other">その他</option>
        </select>
        <p className="text-xs text-gray-600 mb-2">
          補足（客層・清潔感・内装など）
        </p>
        <textarea
          value={atmosphereComment}
          onChange={(e) => setAtmosphereComment(e.target.value)}
          rows={2}
          placeholder="例：カウンター席のみで10席程度。清潔感があり、一人客が多い。"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* 3. 接客態度 */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          3. 接客態度について <span className="text-red-600">*</span>
        </label>
        <p className="text-xs text-gray-600 mb-2">
          スタッフの対応について教えてください（特に気にならなかった場合もその旨を記入）
        </p>
        <textarea
          value={serviceComment}
          onChange={(e) => setServiceComment(e.target.value)}
          rows={2}
          placeholder="例：スタッフは親切で丁寧。注文もスムーズで気持ちよく食事ができた。"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
          required
        />
      </div>

      {/* 4. コストパフォーマンス */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          4. コストパフォーマンスについて <span className="text-red-600">*</span>
        </label>
        <p className="text-xs text-gray-600 mb-2">
          価格帯と満足度について教えてください
        </p>
        <textarea
          value={costPerformanceComment}
          onChange={(e) => setCostPerformanceComment(e.target.value)}
          rows={2}
          placeholder="例：900円でこのクオリティなら十分満足。ボリュームもちょうど良い。"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
          required
        />
      </div>

      {/* 5. 店の見つけやすさ */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          5. 店の見つけやすさ <span className="text-red-600">*</span>
        </label>
        <p className="text-xs text-gray-600 mb-2">
          立地・看板の見やすさ・駅からの距離・駐車場について教えてください
        </p>
        <textarea
          value={accessibilityComment}
          onChange={(e) => setAccessibilityComment(e.target.value)}
          rows={2}
          placeholder="例：駅から徒歩3分。大通り沿いで看板も目立つので迷わず見つけられた。"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
          required
        />
      </div>

      {/* 6. セルフサービス */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          6. セルフサービスについて <span className="text-red-600">*</span>
        </label>
        <select
          value={selfServiceType}
          onChange={(e) => setSelfServiceType(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 mb-2"
          required
        >
          <option value="">選択してください</option>
          <option value="full_self">完全セルフ（食券・水・片付けなどほぼセルフ）</option>
          <option value="partial_self">一部セルフ（例：水だけセルフ）</option>
          <option value="full_service">ほぼフルサービス（一般的な飲食店レベル）</option>
        </select>
        <textarea
          value={selfServiceNote}
          onChange={(e) => setSelfServiceNote(e.target.value)}
          rows={2}
          placeholder="補足があれば記入してください（任意）"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* 7. 提供時間 */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          7. 提供までの時間 <span className="text-red-600">*</span>
        </label>
        <select
          value={servingTime}
          onChange={(e) => setServingTime(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 mb-2"
          required
        >
          <option value="">選択してください</option>
          <option value="under_3">3分未満</option>
          <option value="3_to_7">3〜7分</option>
          <option value="7_to_15">7〜15分</option>
          <option value="over_15">15分以上</option>
        </select>
        <textarea
          value={servingTimeNote}
          onChange={(e) => setServingTimeNote(e.target.value)}
          rows={2}
          placeholder="混雑状況など補足があれば記入してください（任意）"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* 8. 総合コメント（任意） */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          8. 総合コメント（任意）
        </label>
        <p className="text-xs text-gray-600 mb-2">
          全体としての感想・初訪問かどうか・再訪の意思など
        </p>
        <textarea
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
          rows={3}
          placeholder="例：初めて訪問したが、想像以上に美味しかった。また来たいと思う。"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* 画像アップロード */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          画像（任意・最大5枚）
        </label>
        <p className="text-xs text-gray-600 mb-2">
          料理や店内の写真をアップロードできます（JPEG, PNG, WebP、各5MB以下）
        </p>

        {imageUrls.length < 5 && (
          <div className="mb-4">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {isUploading && (
              <p className="text-sm text-blue-600 mt-2">アップロード中...</p>
            )}
          </div>
        )}

        {/* 画像プレビュー */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`レビュー画像 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {imageUrls.length} / 5枚
        </p>
      </div>

      {/* 9. 総合スコア */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          9. 総合スコア <span className="text-red-600">*</span>
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
        <label className="block text-sm font-bold text-gray-900 mb-2">
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
          disabled={isSubmitting || !isFormValid}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? '投稿中...' : 'レビューを投稿'}
        </button>
      </div>
    </form>
  );
}
