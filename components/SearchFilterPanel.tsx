'use client';

import { useState, useEffect } from 'react';
import SlideUpPanel from './SlideUpPanel';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Feature {
  id: string;
  name: string;
  category: string;
}

export interface SearchFilters {
  keyword: string;
  category: string;
  tag: string;
  priceRange: string;
  isMorningRamen: boolean;
  features: string[];
  minFlavorRichness: number;
  maxFlavorRichness: number;
  sortBy: string;
}

interface SearchFilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export default function SearchFilterPanel({
  filters,
  onFiltersChange,
  onSearch,
}: SearchFilterPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // カテゴリ・タグ・特徴データの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes, featuresRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
          fetch('/api/features'),
        ]);

        const categoriesData = await categoriesRes.json();
        const tagsData = await tagsRes.json();
        const featuresData = await featuresRes.json();

        if (categoriesData.success) setCategories(categoriesData.data);
        if (tagsData.success) setTags(tagsData.data);
        if (featuresData.success) setFeatures(featuresData.data);
      } catch (error) {
        console.error('データ取得エラー:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleFeatureToggle = (featureId: string) => {
    const newFeatures = filters.features.includes(featureId)
      ? filters.features.filter((id) => id !== featureId)
      : [...filters.features, featureId];
    handleFilterChange('features', newFeatures);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      keyword: '',
      category: '',
      tag: '',
      priceRange: '',
      isMorningRamen: false,
      features: [],
      minFlavorRichness: 0,
      maxFlavorRichness: 10,
      sortBy: 'score',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.category) count++;
    if (filters.tag) count++;
    if (filters.priceRange) count++;
    if (filters.isMorningRamen) count++;
    if (filters.features.length > 0) count += filters.features.length;
    if (filters.minFlavorRichness > 0 || filters.maxFlavorRichness < 10) count++;
    return count;
  };

  return (
    <div className="bg-white shadow-md">
      {/* キーワード検索 */}
      <div className="p-4 border-b">
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          placeholder="🔍 店名・駅名で検索"
          className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 font-medium shadow-sm"
        />
      </div>

      {/* 条件カテゴリボタン（横スクロール） */}
      <div className="overflow-x-auto border-b">
        <div className="flex gap-2 p-4 whitespace-nowrap">
          <button
            onClick={() => setActivePanel('taste')}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors ${
              (filters.category || filters.tag)
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            味・ジャンル
          </button>
          <button
            onClick={() => setActivePanel('price')}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors ${
              filters.priceRange
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            価格帯
          </button>
          <button
            onClick={() => setActivePanel('time')}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors ${
              filters.isMorningRamen
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            時間帯
          </button>
          <button
            onClick={() => setActivePanel('features')}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors ${
              filters.features.length > 0
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            店舗特徴
          </button>
          <button
            onClick={() => setActivePanel('richness')}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors ${
              (filters.minFlavorRichness > 0 || filters.maxFlavorRichness < 10)
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            こってり度
          </button>
        </div>
      </div>

      {/* 選択中の条件タグ */}
      {getActiveFilterCount() > 0 && (
        <div className="p-4 border-b bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">
              選択中の条件（{getActiveFilterCount()}件）
            </span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              すべてクリア
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.keyword && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-gray-900 text-sm rounded-full border">
                キーワード: {filters.keyword}
                <button
                  onClick={() => handleFilterChange('keyword', '')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-gray-900 text-sm rounded-full border">
                {categories.find((c) => c.slug === filters.category)?.name}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {filters.priceRange && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-gray-900 text-sm rounded-full border">
                {filters.priceRange}円
                <button
                  onClick={() => handleFilterChange('priceRange', '')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {filters.isMorningRamen && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-gray-900 text-sm rounded-full border">
                朝ラー対応
                <button
                  onClick={() => handleFilterChange('isMorningRamen', false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 検索ボタン */}
      <div className="p-4">
        <button
          onClick={onSearch}
          className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-bold shadow-md"
        >
          この条件で検索
        </button>
      </div>

      {/* 味・ジャンルパネル */}
      <SlideUpPanel
        isOpen={activePanel === 'taste'}
        onClose={() => setActivePanel(null)}
        title="味・ジャンル"
      >
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">カテゴリ</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    handleFilterChange(
                      'category',
                      filters.category === category.slug ? '' : category.slug
                    )
                  }
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filters.category === category.slug
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">タグ</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() =>
                    handleFilterChange('tag', filters.tag === tag.slug ? '' : tag.slug)
                  }
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    filters.tag === tag.slug
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SlideUpPanel>

      {/* 価格帯パネル */}
      <SlideUpPanel
        isOpen={activePanel === 'price'}
        onClose={() => setActivePanel(null)}
        title="価格帯"
      >
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {['~700', '700-900', '900-1200', '1200~'].map((range) => (
              <button
                key={range}
                onClick={() =>
                  handleFilterChange('priceRange', filters.priceRange === range ? '' : range)
                }
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  filters.priceRange === range
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
                }`}
              >
                {range}円
              </button>
            ))}
          </div>
        </div>
      </SlideUpPanel>

      {/* 時間帯パネル */}
      <SlideUpPanel
        isOpen={activePanel === 'time'}
        onClose={() => setActivePanel(null)}
        title="時間帯"
      >
        <div className="p-4">
          <button
            onClick={() => handleFilterChange('isMorningRamen', !filters.isMorningRamen)}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              filters.isMorningRamen
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
            }`}
          >
            朝ラー対応（5〜11時営業）
          </button>
        </div>
      </SlideUpPanel>

      {/* 店舗特徴パネル */}
      <SlideUpPanel
        isOpen={activePanel === 'features'}
        onClose={() => setActivePanel(null)}
        title="店舗特徴"
      >
        <div className="p-4 space-y-6">
          {['service', 'facility', 'atmosphere'].map((category) => {
            const categoryFeatures = features.filter((f) => f.category === category);
            if (categoryFeatures.length === 0) return null;

            const categoryNames = {
              service: 'サービス',
              facility: '設備',
              atmosphere: '雰囲気',
            };

            return (
              <div key={category}>
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categoryFeatures.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => handleFeatureToggle(feature.id)}
                      className={`px-4 py-2 rounded-full border transition-colors ${
                        filters.features.includes(feature.id)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600'
                      }`}
                    >
                      {feature.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SlideUpPanel>

      {/* こってり度パネル */}
      <SlideUpPanel
        isOpen={activePanel === 'richness'}
        onClose={() => setActivePanel(null)}
        title="こってり度"
      >
        <div className="p-4 space-y-6">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>あっさり</span>
              <span>こってり</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  最小: {filters.minFlavorRichness}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.minFlavorRichness}
                  onChange={(e) =>
                    handleFilterChange('minFlavorRichness', Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  最大: {filters.maxFlavorRichness}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.maxFlavorRichness}
                  onChange={(e) =>
                    handleFilterChange('maxFlavorRichness', Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </SlideUpPanel>
    </div>
  );
}
