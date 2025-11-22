'use client';

import { useState, useEffect } from 'react';

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

interface FilterValues {
  keyword: string;
  category: string;
  tag: string;
  station: string;
  railway: string;
  minScore: string;
}

interface RestaurantFilterProps {
  onFilterChange: (filters: FilterValues) => void;
  initialFilters: FilterValues;
}

export default function RestaurantFilter({
  onFilterChange,
  initialFilters,
}: RestaurantFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // カテゴリとタグを取得
    Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/tags').then((res) => res.json()),
    ]).then(([categoriesData, tagsData]) => {
      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }
      if (tagsData.success) {
        setTags(tagsData.data);
      }
    });
  }, []);

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters: FilterValues = {
      keyword: '',
      category: '',
      tag: '',
      station: '',
      railway: '',
      minScore: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* キーワード検索 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="店名・住所・説明文で検索..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* 詳細フィルター トグル */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        詳細フィルター
        {hasActiveFilters && !isExpanded && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            適用中
          </span>
        )}
      </button>

      {/* 詳細フィルター */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t">
          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              カテゴリ
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">すべて</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              タグ
            </label>
            <select
              value={filters.tag}
              onChange={(e) => handleFilterChange('tag', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">すべて</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          {/* エリア検索 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                最寄駅
              </label>
              <input
                type="text"
                placeholder="例: 新宿"
                value={filters.station}
                onChange={(e) => handleFilterChange('station', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                路線
              </label>
              <input
                type="text"
                placeholder="例: JR山手線"
                value={filters.railway}
                onChange={(e) => handleFilterChange('railway', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* 最低スコア */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              最低スコア
            </label>
            <select
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">指定なし</option>
              <option value="8.0">8.0以上</option>
              <option value="7.0">7.0以上</option>
              <option value="6.0">6.0以上</option>
              <option value="5.0">5.0以上</option>
            </select>
          </div>

          {/* リセットボタン */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              フィルターをリセット
            </button>
          )}
        </div>
      )}
    </div>
  );
}
