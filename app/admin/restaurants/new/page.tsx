'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewRestaurantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameKana: '',
    address: '',
    nearestStation: '',
    railway: '',
    phoneNumber: '',
    website: '',
    twitter: '',
    instagram: '',
    profileDescription: '',
    thumbnailUrl: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // プレビュー表示
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile) return null;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', thumbnailFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        return data.url;
      } else {
        alert('画像アップロードエラー: ' + data.error);
        return null;
      }
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 画像がある場合は先にアップロード
      let thumbnailUrl = formData.thumbnailUrl;
      if (thumbnailFile) {
        console.log('画像ファイルをアップロード中...');
        const uploadedUrl = await uploadThumbnail();
        console.log('アップロード完了:', uploadedUrl);
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
        }
      }

      console.log('店舗作成リクエスト送信:', { thumbnailUrl });

      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          name_kana: formData.nameKana,
          address: formData.address,
          nearest_station: formData.nearestStation,
          railway: formData.railway,
          phone_number: formData.phoneNumber || null,
          website: formData.website || null,
          twitter: formData.twitter || null,
          instagram: formData.instagram || null,
          profile_description: formData.profileDescription || null,
          thumbnail_url: thumbnailUrl || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('店舗を追加しました！');
        router.push(`/restaurants/${data.data.id}`);
      } else {
        alert('エラー: ' + data.error);
      }
    } catch (error) {
      console.error('店舗追加エラー:', error);
      alert('店舗の追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link
            href="/restaurants"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            ← 店舗一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新しい店舗を追加</h1>
          <p className="text-gray-600 mt-2">
            ラーメン店の基本情報を入力してください
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* 必須項目セクション */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-500">
              必須項目
            </h2>

            {/* 店名 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                店名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                placeholder="例: ラーメン二郎 三田本店"
              />
            </div>

            {/* 店名（かな） */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                店名（かな） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nameKana"
                value={formData.nameKana}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                placeholder="例: らーめんじろう みたほんてん"
              />
            </div>

            {/* 住所 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                placeholder="例: 東京都港区三田2-16-4"
              />
            </div>

            {/* 最寄駅 */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  最寄駅 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nearestStation"
                  value={formData.nearestStation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                  placeholder="例: 三田"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  路線 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="railway"
                  value={formData.railway}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                  placeholder="例: 都営三田線"
                />
              </div>
            </div>
          </div>

          {/* 任意項目セクション */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
              任意項目
            </h2>

            {/* 店舗代表画像 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                店舗代表画像
              </label>
              <p className="text-xs text-gray-600 mb-2">
                一覧ページで表示される代表画像です（JPEG, PNG, WebP / 5MB以下）
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">プレビュー:</p>
                  <img
                    src={thumbnailPreview}
                    alt="サムネイルプレビュー"
                    className="w-64 h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* 電話番号 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                電話番号
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                placeholder="例: 03-1234-5678"
              />
            </div>

            {/* ウェブサイト */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                ウェブサイト
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                placeholder="例: https://example.com"
              />
            </div>

            {/* SNS */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                  placeholder="例: @username"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                  placeholder="例: username"
                />
              </div>
            </div>

            {/* 店舗説明 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                店舗説明
              </label>
              <textarea
                name="profileDescription"
                value={formData.profileDescription}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                placeholder="店舗の特徴や雰囲気を簡単に説明してください"
              />
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading
                ? '画像アップロード中...'
                : isSubmitting
                ? '追加中...'
                : '🏪 店舗を追加する'}
            </button>
            <Link
              href="/restaurants"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
