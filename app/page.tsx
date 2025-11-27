'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedRailway, setSelectedRailway] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [showPrefecturePanel, setShowPrefecturePanel] = useState(false);

  // 主要路線
  const majorRailways = [
    'JR山手線',
    '東京メトロ銀座線',
    '東京メトロ丸ノ内線',
    '東京メトロ日比谷線',
    '東京メトロ東西線',
    '東京メトロ千代田線',
    '東京メトロ半蔵門線',
    '東京メトロ南北線',
    '東京メトロ副都心線',
    '東急田園都市線',
    '東急東横線',
    '京王線',
    '小田急線',
    '西武池袋線',
  ];

  // 主要駅（山手線）
  const majorStations = [
    '東京',
    '新橋',
    '品川',
    '渋谷',
    '原宿',
    '新宿',
    '池袋',
    '上野',
    '秋葉原',
    '有楽町',
    '浜松町',
    '田町',
    '目黒',
    '恵比寿',
    '代々木',
    '新大久保',
    '高田馬場',
    '目白',
    '駒込',
    '田端',
    '西日暮里',
    '日暮里',
    '鶯谷',
    '御徒町',
    '神田',
  ];

  // エリアごとの都道府県
  const prefecturesByRegion = {
    北海道: ['北海道'],
    東北: ['青森', '岩手', '宮城', '秋田', '山形', '福島'],
    関東: ['東京', '神奈川', '埼玉', '千葉', '茨城', '栃木', '群馬'],
    中部: ['新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知'],
    関西: ['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'],
    中国: ['鳥取', '島根', '岡山', '広島', '山口'],
    四国: ['徳島', '香川', '愛媛', '高知'],
    九州: ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'],
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (selectedStation) params.append('station', selectedStation);
    if (selectedRailway) params.append('railway', selectedRailway);
    if (selectedPrefecture) params.append('prefecture', selectedPrefecture);

    router.push(`/restaurants?${params.toString()}`);
  };

  const handlePrefectureSelect = (prefecture: string) => {
    setSelectedPrefecture(prefecture);
    setShowPrefecturePanel(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-extrabold mb-4 text-center drop-shadow-lg">
            RamenDB
          </h1>
          <p className="text-2xl text-center font-medium mb-2">
            信頼できるレビューで見つける、あなたの一杯
          </p>
          <p className="text-center text-orange-100">
            5軸評価で本当に美味しいラーメン店を見つけよう
          </p>
        </div>
      </div>

      {/* 検索セクション */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            お店を探す
          </h2>

          {/* 都道府県で探す */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              📍 都道府県から探す
            </label>
            {selectedPrefecture ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 bg-blue-50 border-2 border-blue-400 rounded-lg text-gray-900 font-semibold">
                  {selectedPrefecture}都/道/府/県
                </div>
                <button
                  onClick={() => setSelectedPrefecture('')}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  クリア
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPrefecturePanel(!showPrefecturePanel)}
                className="w-full px-4 py-4 border-2 border-orange-300 rounded-lg hover:border-orange-400 transition-colors text-left text-gray-500 shadow-sm bg-white"
              >
                都道府県を選択してください
              </button>
            )}

            {/* 都道府県選択パネル */}
            {showPrefecturePanel && (
              <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-lg">
                <div className="space-y-6">
                  {Object.entries(prefecturesByRegion).map(([region, prefectures]) => (
                    <div key={region}>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="inline-block w-1 h-6 bg-gradient-to-b from-orange-500 to-pink-500 rounded"></span>
                        {region}
                      </h3>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {prefectures.map((prefecture) => (
                          <button
                            key={prefecture}
                            onClick={() => handlePrefectureSelect(prefecture)}
                            className="px-4 py-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-semibold text-gray-900 shadow-sm hover:shadow-md"
                          >
                            {prefecture}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowPrefecturePanel(false)}
                  className="mt-6 w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  閉じる
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 font-medium">または</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* キーワード検索 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              キーワードで探す
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="店名、メニュー、特徴などを入力"
              className="w-full px-4 py-4 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 text-lg shadow-sm"
            />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 font-medium">または</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* 路線・駅で探す */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                路線から探す
              </label>
              <select
                value={selectedRailway}
                onChange={(e) => setSelectedRailway(e.target.value)}
                className="w-full px-4 py-4 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 text-lg shadow-sm bg-white"
              >
                <option value="">路線を選択</option>
                {majorRailways.map((railway) => (
                  <option key={railway} value={railway}>
                    {railway}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                駅から探す
              </label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full px-4 py-4 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 text-lg shadow-sm bg-white"
              >
                <option value="">駅を選択</option>
                {majorStations.map((station) => (
                  <option key={station} value={station}>
                    {station}駅
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 検索ボタン */}
          <button
            onClick={handleSearch}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-5 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔍 この条件で検索
          </button>
        </div>

        {/* 人気カテゴリ */}
        <div className="mt-12 mb-16 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            人気のカテゴリから探す
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/search?category=iekei')}
              className="bg-white border-2 border-orange-200 px-6 py-4 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all font-bold text-gray-900 shadow-sm"
            >
              🍜 家系
            </button>
            <button
              onClick={() => router.push('/search?category=jiro')}
              className="bg-white border-2 border-orange-200 px-6 py-4 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all font-bold text-gray-900 shadow-sm"
            >
              🍜 二郎系
            </button>
            <button
              onClick={() => router.push('/search?category=tsukemen')}
              className="bg-white border-2 border-orange-200 px-6 py-4 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all font-bold text-gray-900 shadow-sm"
            >
              🍜 つけ麺
            </button>
            <button
              onClick={() => router.push('/search?category=miso')}
              className="bg-white border-2 border-orange-200 px-6 py-4 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all font-bold text-gray-900 shadow-sm"
            >
              🍜 味噌
            </button>
            <button
              onClick={() => router.push('/search?tag=morning')}
              className="bg-white border-2 border-pink-200 px-6 py-4 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all font-bold text-gray-900 shadow-sm"
            >
              ☀️ 朝ラー
            </button>
            <button
              onClick={() => router.push('/search?tag=late-night')}
              className="bg-white border-2 border-pink-200 px-6 py-4 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all font-bold text-gray-900 shadow-sm"
            >
              🌙 深夜営業
            </button>
            <button
              onClick={() => router.push('/search?tag=female-friendly')}
              className="bg-white border-2 border-pink-200 px-6 py-4 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all font-bold text-gray-900 shadow-sm"
            >
              👩 女性向け
            </button>
            <button
              onClick={() => router.push('/search?tag=healthy')}
              className="bg-white border-2 border-pink-200 px-6 py-4 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all font-bold text-gray-900 shadow-sm"
            >
              🥗 健康志向
            </button>
          </div>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="bg-orange-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            RamenDBの特徴
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                5軸評価システム
              </h4>
              <p className="text-gray-600 text-sm">
                味・量・価格・接客・衛生の5つの視点で評価。客観的な判断基準で信頼性の高いレビュー。
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                詳細な絞り込み検索
              </h4>
              <p className="text-gray-600 text-sm">
                カテゴリ、価格帯、時間帯、こってり度など、あなたの好みにピッタリのお店が見つかる。
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">💬</div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                リアルな口コミ
              </h4>
              <p className="text-gray-600 text-sm">
                実際に訪問した人の詳細レビュー。写真付きで雰囲気やメニューも分かる。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
