'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  trigger?: 'review' | 'mypage' | 'manual';
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  trigger = 'manual',
}: LoginModalProps) {
  const { signInWithGoogle, signInWithTwitter } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getTitleAndMessage = () => {
    switch (trigger) {
      case 'review':
        return {
          title: '📝 レビューを投稿',
          message: 'レビューを投稿するにはログインが必要です',
        };
      case 'mypage':
        return {
          title: '👤 マイページ',
          message: 'マイページを表示するにはログインが必要です',
        };
      default:
        return {
          title: '🔐 ログイン',
          message: 'Google または X でログインしてください',
        };
    }
  };

  const { title, message } = getTitleAndMessage();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithTwitter();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          disabled={isLoading}
        >
          ×
        </button>

        {/* タイトル */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {title}
        </h2>

        {/* メッセージ */}
        <p className="text-gray-600 text-center mb-6">{message}</p>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ログインボタン */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google でログイン</span>
          </button>

          <button
            onClick={handleTwitterLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-black text-white font-semibold py-4 px-6 rounded-xl hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X でログイン</span>
          </button>
        </div>

        {/* 注記 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            ログインすると、今までの閲覧履歴も引き継がれ、
            <br />
            より精度の高いおすすめが表示されます
          </p>
        </div>

        {/* ローディング */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-300 border-t-pink-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
