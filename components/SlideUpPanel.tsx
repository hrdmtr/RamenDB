'use client';

import { useEffect } from 'react';

interface SlideUpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void; // 「この条件で絞り込む」ボタンのコールバック
  title: string;
  children: React.ReactNode;
}

export default function SlideUpPanel({
  isOpen,
  onClose,
  onApply,
  title,
  children,
}: SlideUpPanelProps) {
  // スクロール防止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* スライドアップパネル */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* ハンドルバー */}
        <div className="flex justify-center py-3 border-b">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {children}
        </div>

        {/* 下部ボタン */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              if (onApply) onApply();
              onClose();
            }}
            className="flex-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg"
          >
            この条件で絞り込む
          </button>
        </div>
      </div>
    </>
  );
}
