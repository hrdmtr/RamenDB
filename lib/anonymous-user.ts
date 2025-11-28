/**
 * 匿名ユーザー管理ライブラリ
 *
 * 機能:
 * - 匿名ユーザーIDの生成・保存・取得
 * - LocalStorage/Cookie による永続化
 * - ユーザー行動の記録
 *
 * 使い方:
 * ```typescript
 * // 初期化（アプリ起動時に1回実行）
 * initAnonymousUser();
 *
 * // 匿名IDを取得
 * const anonymousId = getAnonymousUserId();
 *
 * // 行動を記録
 * await trackActivity('view', { restaurant_id: '...' });
 * ```
 */

const ANONYMOUS_USER_KEY = 'anonymous_user_id';
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90日間（秒）

/**
 * 匿名ユーザーIDを生成
 */
function generateAnonymousId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック: シンプルなUUID v4生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * LocalStorageから匿名IDを取得
 */
function getFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ANONYMOUS_USER_KEY);
  } catch (e) {
    console.error('LocalStorage読み込みエラー:', e);
    return null;
  }
}

/**
 * LocalStorageに匿名IDを保存
 */
function saveToLocalStorage(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANONYMOUS_USER_KEY, id);
  } catch (e) {
    console.error('LocalStorage保存エラー:', e);
  }
}

/**
 * Cookieから匿名IDを取得
 */
function getFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === ANONYMOUS_USER_KEY) {
        return decodeURIComponent(value);
      }
    }
  } catch (e) {
    console.error('Cookie読み込みエラー:', e);
  }
  return null;
}

/**
 * Cookieに匿名IDを保存
 */
function saveToCookie(id: string): void {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000).toUTCString();
    document.cookie = `${ANONYMOUS_USER_KEY}=${encodeURIComponent(
      id
    )}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.error('Cookie保存エラー:', e);
  }
}

/**
 * 匿名ユーザーIDを取得（存在しない場合は生成）
 */
export function getAnonymousUserId(): string {
  // LocalStorageから取得を試みる
  let id = getFromLocalStorage();
  if (id) return id;

  // Cookieから取得を試みる
  id = getFromCookie();
  if (id) {
    // LocalStorageに復元
    saveToLocalStorage(id);
    return id;
  }

  // 新規生成
  id = generateAnonymousId();
  saveToLocalStorage(id);
  saveToCookie(id);

  return id;
}

/**
 * 匿名ユーザーを初期化（アプリ起動時に呼び出す）
 *
 * この関数は初回訪問時（1ページ目）に自動的に匿名IDを生成します。
 */
export function initAnonymousUser(): string {
  if (typeof window === 'undefined') {
    return ''; // サーバーサイドでは何もしない
  }

  const id = getAnonymousUserId();

  // バックエンドに匿名ユーザーを登録
  registerAnonymousUser(id).catch((error) => {
    console.error('匿名ユーザー登録エラー:', error);
  });

  return id;
}

/**
 * バックエンドに匿名ユーザーを登録
 */
async function registerAnonymousUser(anonymousId: string): Promise<void> {
  try {
    const response = await fetch('/api/users/anonymous', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ anonymous_id: anonymousId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'ユーザー登録失敗');
    }
  } catch (error) {
    // 登録失敗しても続行（ネットワークエラー等）
    console.error('匿名ユーザー登録API呼び出しエラー:', error);
  }
}

/**
 * ユーザー行動を記録
 *
 * @param activityType - 行動の種類 ('view' | 'search' | 'click')
 * @param data - 追加データ
 */
export async function trackActivity(
  activityType: 'view' | 'search' | 'click',
  data: {
    restaurant_id?: string;
    category_slug?: string;
    station?: string;
    railway?: string;
    prefecture?: string;
    search_query?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  if (typeof window === 'undefined') return;

  const anonymousId = getAnonymousUserId();

  try {
    const response = await fetch('/api/user-activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anonymous_user_id: anonymousId,
        activity_type: activityType,
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('行動記録エラー:', error);
    }
  } catch (error) {
    // 記録失敗しても続行（ユーザー体験を妨げない）
    console.error('行動記録API呼び出しエラー:', error);
  }
}

/**
 * 店舗閲覧を記録
 */
export async function trackRestaurantView(
  restaurantId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackActivity('view', {
    restaurant_id: restaurantId,
    metadata,
  });
}

/**
 * 検索を記録
 */
export async function trackSearch(params: {
  keyword?: string;
  category?: string;
  station?: string;
  railway?: string;
  prefecture?: string;
}): Promise<void> {
  await trackActivity('search', {
    search_query: params.keyword,
    category_slug: params.category,
    station: params.station,
    railway: params.railway,
    prefecture: params.prefecture,
  });
}

/**
 * カテゴリクリックを記録
 */
export async function trackCategoryClick(categorySlug: string): Promise<void> {
  await trackActivity('click', {
    category_slug: categorySlug,
  });
}

/**
 * 駅/路線クリックを記録
 */
export async function trackStationClick(params: {
  station?: string;
  railway?: string;
}): Promise<void> {
  await trackActivity('click', {
    station: params.station,
    railway: params.railway,
  });
}

/**
 * 匿名IDをクリア（テスト用）
 */
export function clearAnonymousUserId(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ANONYMOUS_USER_KEY);
    document.cookie = `${ANONYMOUS_USER_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (e) {
    console.error('匿名IDクリアエラー:', e);
  }
}
