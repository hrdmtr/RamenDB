'use client';

import { useEffect } from 'react';

interface SlideUpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideUpPanel({
  isOpen,
  onClose,
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
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
