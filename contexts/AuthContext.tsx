'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseAuth } from '@/lib/supabase-auth';
import { getAnonymousUserId } from '@/lib/anonymous-user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithTwitter: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のセッションを取得
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // ログイン成功時に匿名データを統合
      if (session?.user) {
        migrateAnonymousData(session.user.id);
      }
    });

    // セッション変更を監視
    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // ログイン成功時に匿名データを統合
      if (event === 'SIGNED_IN' && session?.user) {
        await migrateAnonymousData(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * 匿名データを認証済みユーザーに統合
   */
  const migrateAnonymousData = async (authUserId: string) => {
    const anonymousId = getAnonymousUserId();
    if (!anonymousId) return;

    try {
      const response = await fetch('/api/users/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anonymous_user_id: anonymousId,
          auth_user_id: authUserId,
        }),
      });

      if (!response.ok) {
        console.error('匿名データ統合エラー:', await response.json());
      } else {
        console.log('匿名データ統合成功');
      }
    } catch (error) {
      console.error('匿名データ統合API呼び出しエラー:', error);
    }
  };

  /**
   * Googleでログイン
   */
  const signInWithGoogle = async () => {
    const { error } = await supabaseAuth.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google ログインエラー:', error);
      throw error;
    }
  };

  /**
   * X (Twitter)でログイン
   */
  const signInWithTwitter = async () => {
    const { error } = await supabaseAuth.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Twitter ログインエラー:', error);
      throw error;
    }
  };

  /**
   * ログアウト
   */
  const signOut = async () => {
    const { error } = await supabaseAuth.auth.signOut();

    if (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signInWithTwitter,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
