# RamenDB ユーザー認証機能 要件定義

**作成日**: 2025-11-27
**ステータス**: 要件定義中
**関連文書**: [ユーザー認証コンセプト.md](./ユーザー認証コンセプト.md)

---

## 1. 要件定義の前提

### 1.1 設計思想（再掲）

本要件定義は、以下の3つの設計思想に基づく：

#### 1. ユーザー体験重視
- 初回訪問時に登録を求めない
- 閲覧・検索は完全にオープン
- パーソナライズ機能も登録不要で提供
- 必要な時だけワンクリックでログイン

#### 2. データ品質の担保
- レビュー投稿は認証必須（スパム・自作自演防止）
- 匿名でも行動履歴を蓄積（パーソナライズ精度向上）
- レビュアー信頼度の算出が可能な設計

#### 3. 段階的なエンゲージメント
- Phase 0: 完全匿名（閲覧のみ）
- Phase 1: 匿名ID自動付与（パーソナライズ開始）
- Phase 2: OAuth認証（レビュー投稿可能）
- Phase 3: 継続利用（マイページ等）※Phase 1, 2 完了後に検討

### 1.2 開発スコープ

本要件定義では、以下のスコープを対象とする：

**MVP（Phase 1 + Phase 2）**:
- ✅ Phase 1: 匿名ユーザー管理とパーソナライズ
- ✅ Phase 2: OAuth認証とレビュー投稿連携

**Phase 3 は別途要件定義**:
- マイページ
- お気に入り機能
- 通知機能
- その他の拡張機能

---

## 2. 機能要件

### 2.1 Phase 0: 完全匿名（閲覧のみ）

#### 2.1.1 目的
新規訪問者に一切の障壁を設けず、自由に閲覧・検索させる。

#### 2.1.2 対象ユーザー
- 初回訪問者
- ログインしていない全ユーザー

#### 2.1.3 利用可能な機能

| 機能 | 詳細 | 制限 |
|------|------|------|
| 店舗検索 | キーワード、カテゴリ、エリア、駅、路線、都道府県 | なし |
| 店舗詳細閲覧 | 基本情報、営業時間、レビュー一覧、写真 | なし |
| レビュー閲覧 | 全レビューの閲覧 | なし |
| ランキング | スコア順、カテゴリ別 | なし |
| 地図表示 | 店舗位置の地図表示 | なし |

#### 2.1.4 利用不可な機能

| 機能 | 理由 |
|------|------|
| レビュー投稿 | 認証必須（Phase 2） |
| レビュー編集・削除 | 認証必須（Phase 2） |
| マイページ | 認証必須（Phase 3） |
| お気に入り | 認証必須（Phase 3） |

#### 2.1.5 システム動作
- ユーザー識別なし
- データ記録なし
- Cookie/LocalStorage 使用なし

#### 2.1.6 UI要件
- ログインボタンをヘッダー右上に配置（目立たせない）
- レビュー投稿ボタンは表示（クリック時にログイン促進）
- 登録を促すポップアップ・バナーは**一切表示しない**

---

### 2.2 Phase 1: 匿名ID自動付与（パーソナライズ開始）

#### 2.2.1 目的
- ユーザーに気づかれずに行動履歴を記録
- パーソナライズ推薦を提供
- 将来のOAuth認証時にデータを引き継ぎ

#### 2.2.2 匿名ID生成タイミング

**トリガー**: **初回訪問時（1ページ目読み込み時）**

**理由**:
- 完全なユーザージャーニーを記録できる（閲覧開始から）
- 実装がシンプル（条件分岐不要）
- パーソナライズアルゴリズムの精度向上
- 現代のWeb解析ツールの標準的なアプローチ

**生成条件**:
| 条件 | 動作 |
|------|------|
| LocalStorage に `anonymous_user_id` がない | 新規UUID生成 |
| LocalStorage に `anonymous_user_id` がある | 既存IDを使用 |
| Cookie に `anonymous_user_id` がある | LocalStorageに復元して使用 |

**生成方法**:
```javascript
const anonymousId = crypto.randomUUID(); // UUID v4
localStorage.setItem('anonymous_user_id', anonymousId);
document.cookie = `anonymous_user_id=${anonymousId}; max-age=7776000`; // 90日
```

**要件**:
- UUID v4 形式を使用
- LocalStorage に保存（優先）
- Cookie にもバックアップ保存（90日間有効）
- ユーザーには**完全に透明**（何も表示しない、通知しない）

#### 2.2.3 記録する行動データ

| データ項目 | 記録タイミング | 記録内容 |
|-----------|--------------|---------|
| 店舗閲覧 | 店舗詳細ページを開いた時 | restaurant_id, 滞在時間 |
| 検索 | 検索を実行した時 | キーワード, カテゴリ, 駅, 路線, 都道府県 |
| カテゴリクリック | カテゴリボタンをクリック | category_slug |
| 駅/路線クリック | 駅/路線ボタンをクリック | station, railway |

**記録しないデータ**:
- ❌ IPアドレス（個人情報保護のため）
- ❌ ブラウザフィンガープリント
- ❌ 位置情報（GPS）
- ❌ マウス移動、スクロール深度（過剰な追跡を避ける）

#### 2.2.4 データ保持期間

| ユーザータイプ | 保持期間 | 削除タイミング |
|--------------|---------|--------------|
| 匿名ユーザー | 90日間 | 最終アクティビティから90日後に自動削除 |
| 認証ユーザー | 無期限 | ユーザーが明示的に削除するまで |

#### 2.2.5 パーソナライズ推薦機能

**表示場所**: トップページ「あなたへのおすすめ」セクション

**推薦ロジック**:
1. よく見るカテゴリの店舗
2. よく検索する駅/路線の周辺店舗
3. 閲覧した店舗と似た特徴の店舗

**表示条件**:
- 最低3回以上の行動データがある場合に表示
- それ未満の場合は「人気店舗」を表示

**表示件数**:
- 10件まで
- モバイル: 横スクロール
- デスクトップ: グリッドレイアウト

#### 2.2.6 UI要件

**「あなたへのおすすめ」セクション**:
```
━━━━━━━━━━━━━━━━━━━━━━
💡 あなたへのおすすめ
━━━━━━━━━━━━━━━━━━━━━━
[店舗カード] [店舗カード] [店舗カード]

※ あなたの閲覧履歴をもとにおすすめしています
━━━━━━━━━━━━━━━━━━━━━━
```

**注意事項**:
- 「ログインすると精度が上がります」などの誘導は**しない**
- 匿名でも十分な推薦精度を提供する前提

#### 2.2.7 プライバシー配慮

**Cookie/LocalStorage の説明**:
- フッターに「プライバシーポリシー」リンクを配置
- プライバシーポリシーページで説明:
  - Cookie/LocalStorage を使用していること
  - 個人を特定する情報は保存していないこと
  - いつでも削除可能なこと

**データ削除方法**:
- ブラウザの設定から Cookie/LocalStorage を削除
- プライバシーポリシーページに削除手順を記載

---

### 2.3 Phase 2: OAuth認証（レビュー投稿可能）

#### 2.3.1 目的
- レビュー投稿の質を担保（スパム・自作自演防止）
- 匿名データを正式アカウントに統合
- マイページ等の将来機能への布石

#### 2.3.2 認証が必要な機能

| 機能 | 認証必須 | 理由 |
|------|---------|------|
| レビュー投稿 | ✅ | スパム・自作自演防止 |
| レビュー編集 | ✅ | 本人確認 |
| レビュー削除 | ✅ | 本人確認 |
| マイページ（Phase 3） | ✅ | 個人情報保護 |
| お気に入り（Phase 3） | ✅ | データ同期 |

#### 2.3.3 OAuth プロバイダー

**MVP で対応するプロバイダー**:
- ✅ Google OAuth 2.0
- ✅ X (Twitter) OAuth 2.0

**将来的に検討するプロバイダー**:
- ⏳ Apple Sign In
- ⏳ LINE ログイン
- ⏳ メールアドレス認証

#### 2.3.4 認証フロー

##### ケース1: レビュー投稿ボタンをクリック（未ログイン）

```
1. ユーザーが「レビューを書く」ボタンをクリック
   ↓
2. システムがセッションをチェック
   ↓
3. 未ログイン → ログインモーダルを表示
   ↓
4. ユーザーがプロバイダー（Google/X）を選択
   ↓
5. OAuth認証画面へリダイレクト
   ↓
6. 認証成功 → コールバックURL へリダイレクト
   ↓
7. 匿名データの統合処理
   ↓
8. レビュー投稿フォームを表示
```

##### ケース2: ヘッダーの「ログイン」ボタンをクリック

```
1. ユーザーがヘッダーの「ログイン」ボタンをクリック
   ↓
2. ログインモーダルを表示
   ↓
3. ユーザーがプロバイダーを選択
   ↓
4. OAuth認証
   ↓
5. 認証成功 → 元のページへ戻る
```

#### 2.3.5 ログインモーダル仕様

**デザイン**:
```
━━━━━━━━━━━━━━━━━━━━━━
    📝 レビューを投稿

レビューを投稿するには
ログインが必要です

[🔵 Google でログイン]
[🔷 X でログイン]

※ ログインすると、今までの閲覧履歴も
  引き継がれ、より精度の高いおすすめが
  表示されます

[× 閉じる]
━━━━━━━━━━━━━━━━━━━━━━
```

**UI要件**:
- モーダルは画面中央に表示
- 背景は半透明のオーバーレイ
- モーダル外をクリック or ESCキーで閉じる
- ボタンは大きく、タップしやすいサイズ
- Google/X のブランドカラーを使用

**表示テキストのバリエーション**:

| トリガー | タイトル | 説明文 |
|---------|---------|-------|
| レビュー投稿 | 📝 レビューを投稿 | レビューを投稿するにはログインが必要です |
| レビュー編集 | ✏️ レビューを編集 | レビューを編集するにはログインが必要です |
| マイページ | 👤 マイページ | マイページを表示するにはログインが必要です |
| 手動ログイン | 🔐 ログイン | Google または X でログインしてください |

#### 2.3.6 OAuth設定

**Google OAuth**:
- クライアントID: Supabase で発行
- スコープ: `email`, `profile`
- コールバックURL: `https://<project>.supabase.co/auth/v1/callback`

**X (Twitter) OAuth**:
- API Key: X Developer Portal で発行
- スコープ: `users.read`, `tweet.read`
- コールバックURL: 同上

#### 2.3.7 匿名データ統合

**タイミング**: OAuth認証成功直後（自動実行）

**処理フロー**:
```javascript
1. LocalStorage から anonymous_id を取得
2. Supabase Auth から auth_user_id を取得
3. バックエンドAPI を呼び出し
   POST /api/users/migrate
   {
     anonymous_user_id: "uuid-from-localstorage",
     auth_user_id: "uuid-from-supabase-auth"
   }
4. バックエンドで users テーブル更新
   UPDATE users
   SET auth_user_id = :auth_user_id,
       email = :email,
       username = :username,
       display_name = :display_name,
       avatar_url = :avatar_url
   WHERE anonymous_id = :anonymous_user_id
5. LocalStorage の anonymous_id を削除
6. Cookie の anonymous_user_id を削除
```

**エラーハンドリング**:
- 統合失敗時は、エラーログを記録するが**ユーザーには通知しない**
- 新規ユーザーとして扱う（匿名データは残る）

#### 2.3.8 複数プロバイダーの統合

**Supabase Auth の自動統合**:
- 同じメールアドレスの場合、自動的に1つの `auth.users` に統合
- `auth.identities` テーブルで複数プロバイダーを管理

**例**:
```
1. Google でログイン
   → auth.users 作成
   → auth.identities に Google 情報

2. 後日、X でログイン（同じメールアドレス）
   → 既存の auth.users を使用
   → auth.identities に X 情報を追加
```

**メールアドレスが取得できない場合**:
- X はメールアドレスを返さない場合がある
- その場合は別ユーザーとして扱う
- 将来的に「アカウント連携」機能で手動統合を可能にする（Phase 3）

#### 2.3.9 レビュー投稿の制約

**認証チェック**:
```typescript
// レビュー投稿API
POST /api/reviews
{
  restaurant_id: "uuid",
  user_id: "uuid",  // ← auth_user_id が必須
  ...
}

// バックエンドでチェック
if (!user.auth_user_id) {
  return { error: "認証が必要です", status: 401 };
}
```

**投稿制限**:
| 制限項目 | 値 | 理由 |
|---------|---|------|
| 1店舗あたりのレビュー数 | 1件 | 重複投稿防止 |
| 連続投稿間隔 | 60秒 | スパム防止 |
| 1日の投稿上限 | 10件 | スパム防止 |

**編集・削除**:
- 投稿後24時間以内なら編集可能
- 削除はいつでも可能
- 削除後の再投稿は可能

---

### 2.4 ユーザープロファイル

#### 2.4.1 ユーザー情報

**OAuth から取得する情報**:

| フィールド | Google | X | 必須 |
|-----------|--------|---|------|
| email | ✅ | △ | ✅ |
| username | ✅ | ✅ | ✅ |
| display_name | ✅ | ✅ | ✅ |
| avatar_url | ✅ | ✅ | - |

**システムで管理する情報**:

| フィールド | 説明 | 初期値 |
|-----------|------|-------|
| review_count | 投稿レビュー数 | 0 |
| reviewer_score | レビュアー信頼度 | 0.5 |
| favorite_categories | 好きなカテゴリ | [] |
| favorite_stations | よく行く駅 | [] |

#### 2.4.2 プロフィール自動更新

**トリガー**: 行動データから自動で推定

```sql
-- レビュー投稿時
UPDATE users SET review_count = review_count + 1 WHERE id = :user_id;

-- 閲覧履歴から好みのカテゴリを推定
UPDATE users
SET favorite_categories = (
  SELECT jsonb_agg(DISTINCT category_slug)
  FROM user_activities
  WHERE user_id = :user_id
    AND activity_type IN ('view', 'search')
    AND category_slug IS NOT NULL
  ORDER BY COUNT(*) DESC
  LIMIT 5
)
WHERE id = :user_id;
```

**更新頻度**:
- レビュー投稿時: 即時更新
- 好みの推定: 毎日1回（バッチ処理）

---

## 3. 非機能要件

### 3.1 パフォーマンス

| 項目 | 目標値 | 測定方法 |
|-----|--------|---------|
| 匿名ID生成 | 50ms以内 | Performance API |
| 行動記録API | 100ms以内 | サーバーログ |
| パーソナライズ推薦 | 500ms以内 | サーバーログ |
| OAuth認証 | 3秒以内 | ユーザー体感 |

### 3.2 セキュリティ

#### 3.2.1 OAuth認証
- PKCE (Proof Key for Code Exchange) を使用
- State パラメータで CSRF 対策
- アクセストークンの安全な保管（Supabase Auth が管理）

#### 3.2.2 API認証
- レビュー投稿API: Supabase Auth の JWT トークン必須
- 匿名行動記録API: 認証不要（匿名IDのみ）

#### 3.2.3 データ保護
- LocalStorage/Cookie の暗号化は不要（匿名IDのみ）
- DBの個人情報は暗号化不要（OAuth情報はSupabaseが管理）

### 3.3 可用性

| 項目 | 目標値 |
|-----|--------|
| システム稼働率 | 99.9%（Vercel/Supabaseに依存） |
| OAuth認証失敗時 | エラーメッセージ表示、再試行可能 |
| API障害時 | 閲覧は継続可能、投稿のみ不可 |

### 3.4 スケーラビリティ

| 項目 | 想定規模 | 対策 |
|-----|---------|------|
| 匿名ユーザー数 | 〜100万 | LocalStorage/Cookie（サーバー負荷なし） |
| 行動データ | 〜1億レコード/年 | パーティショニング、古いデータの削除 |
| OAuth認証 | 〜10万ユーザー | Supabase Auth（スケーラブル） |

### 3.5 プライバシー・法規制

#### 3.5.1 GDPR対応

| 要件 | 対応内容 |
|-----|---------|
| データ削除権 | ユーザーが自分のデータを削除可能 |
| データポータビリティ | データエクスポート機能（Phase 3） |
| 同意の取得 | Cookie/LocalStorage の使用をプライバシーポリシーで明記 |

#### 3.5.2 Cookie/LocalStorage の扱い

- Cookie バナーは**表示しない**（匿名IDのみで個人情報なし）
- プライバシーポリシーで説明
- ユーザーが自由に削除可能

---

## 4. データベース設計

### 4.1 users テーブル

```sql
CREATE TABLE users (
  -- 主キー
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- OAuth認証情報（レビュー投稿者のみ）
  auth_user_id UUID UNIQUE REFERENCES auth.users(id),
  email TEXT,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,

  -- 匿名ユーザー情報（全員）
  anonymous_id TEXT UNIQUE NOT NULL,

  -- プロフィール（自動推定）
  favorite_categories JSONB DEFAULT '[]',
  favorite_stations TEXT[] DEFAULT ARRAY[]::TEXT[],
  preference_weights JSONB DEFAULT '{}',

  -- 統計
  review_count INTEGER DEFAULT 0,
  reviewer_score NUMERIC(3,2) DEFAULT 0.5,

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_auth ON users(auth_user_id);
CREATE INDEX idx_users_anonymous ON users(anonymous_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_last_activity ON users(last_activity_at);

-- トリガー: updated_at 自動更新
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 user_activities テーブル

```sql
CREATE TABLE user_activities (
  -- 主キー
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ユーザー紐付け
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- アクティビティ情報
  activity_type TEXT NOT NULL,  -- 'view' | 'search' | 'click'

  -- 対象情報
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  category_slug TEXT,
  station TEXT,
  railway TEXT,
  prefecture TEXT,
  search_query TEXT,

  -- メタデータ
  metadata JSONB DEFAULT '{}',

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_activities_user ON user_activities(user_id);
CREATE INDEX idx_activities_type ON user_activities(activity_type);
CREATE INDEX idx_activities_restaurant ON user_activities(restaurant_id);
CREATE INDEX idx_activities_created ON user_activities(created_at DESC);

-- パーティショニング（月次）
-- ※ データ量が増えたら実装
```

### 4.3 reviews テーブル（既存の拡張）

```sql
-- 制約追加
ALTER TABLE reviews
  ADD CONSTRAINT reviews_auth_user_required
  CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id IS NOT NULL
    )
  );

-- 1店舗1レビュー制約
CREATE UNIQUE INDEX idx_reviews_user_restaurant
  ON reviews(user_id, restaurant_id);
```

---

## 5. API仕様

### 5.1 匿名ユーザー作成

```
POST /api/users/anonymous
```

**リクエスト**:
```json
{
  "anonymous_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-...",
    "anonymous_id": "550e8400-...",
    "created_at": "2025-11-27T12:00:00Z"
  }
}
```

### 5.2 行動記録

```
POST /api/user-activities
```

**リクエスト**:
```json
{
  "anonymous_user_id": "550e8400-...",
  "activity_type": "view",
  "restaurant_id": "abc123-...",
  "metadata": {
    "duration_seconds": 45
  }
}
```

**レスポンス**:
```json
{
  "success": true
}
```

### 5.3 パーソナライズ推薦

```
GET /api/recommendations?anonymous_user_id=550e8400-...
```

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "restaurant-1",
      "name": "横浜家系ラーメン",
      "average_score": 8.5,
      "recommendation_score": 15.3,
      "reason": "よく見る「家系」カテゴリの店舗です"
    }
  ]
}
```

### 5.4 匿名データ統合

```
POST /api/users/migrate
```

**リクエスト**:
```json
{
  "anonymous_user_id": "550e8400-...",
  "auth_user_id": "123e4567-..."
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "user_id": "123e4567-...",
    "migrated_activities": 42,
    "merged": true
  }
}
```

---

## 6. UI/UX仕様

### 6.1 ログインモーダル

**コンポーネント**: `components/LoginModal.tsx`

**Props**:
```typescript
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trigger: 'review' | 'mypage' | 'manual';
}
```

**デザイン仕様**:
- 幅: 400px（モバイルは90vw）
- 背景: 半透明（rgba(0,0,0,0.5)）
- ボタン高さ: 56px
- フォントサイズ: 16px（本文）、20px（タイトル）

### 6.2 「あなたへのおすすめ」セクション

**コンポーネント**: `components/RecommendationsSection.tsx`

**表示条件**:
```typescript
if (行動データ >= 3件) {
  show パーソナライズ推薦
} else {
  show 人気店舗
}
```

**デザイン仕様**:
- 見出し: 「あなたへのおすすめ」
- カード: 最大10件
- レイアウト: 横スクロール（モバイル）、グリッド（デスクトップ）

---

## 7. テスト要件

### 7.1 Phase 1 のテスト

| テストケース | 期待結果 |
|-------------|---------|
| 初回訪問（1ページ目） | 匿名ID生成、LocalStorage/Cookie保存 |
| 再訪問（IDあり） | 既存匿名ID使用 |
| 行動記録 | user_activities に記録 |
| パーソナライズ推薦 | おすすめセクション表示（3件以上のデータがある場合） |
| LocalStorage削除（Cookieあり） | CookieからLocalStorageに復元 |
| Cookie/LocalStorage両方削除 | 再訪問時に新規匿名ID生成 |

### 7.2 Phase 2 のテスト

| テストケース | 期待結果 |
|-------------|---------|
| レビューボタン（未ログイン） | ログインモーダル表示 |
| Google OAuth | ログイン成功、プロフィール作成 |
| X OAuth | ログイン成功、プロフィール作成 |
| 匿名データ統合 | user_activities が統合 |
| 重複ログイン | 同じメールアドレスで自動統合 |
| レビュー投稿（未認証） | 401エラー |
| レビュー投稿（認証済み） | 投稿成功 |

---

## 8. 実装スケジュール

### Phase 1: 匿名ユーザー管理（2週間）

| タスク | 工数 | 担当 |
|-------|-----|------|
| DB設計・マイグレーション | 2日 | - |
| 匿名ID管理（フロント） | 2日 | - |
| 行動記録API | 2日 | - |
| パーソナライズAPI | 3日 | - |
| おすすめセクションUI | 2日 | - |
| テスト | 3日 | - |

### Phase 2: OAuth認証（2週間）

| タスク | 工数 | 担当 |
|-------|-----|------|
| Supabase Auth設定 | 1日 | - |
| ログインモーダル | 2日 | - |
| OAuth統合 | 3日 | - |
| 匿名データ統合API | 2日 | - |
| レビュー認証チェック | 2日 | - |
| テスト | 4日 | - |

**合計**: 4週間

---

## 9. リスクと対策

| リスク | 影響 | 対策 |
|-------|-----|------|
| OAuth障害 | ログイン不可 | エラーメッセージ、再試行ボタン |
| LocalStorage削除 | 匿名データ喪失 | Cookie バックアップ |
| 匿名データ統合失敗 | データ二重管理 | 手動統合機能（Phase 3） |
| パーソナライズ精度低 | ユーザー体験低下 | 人気店舗を混ぜて表示 |

---

## 10. 承認・レビュー

| 項目 | 担当者 | 日付 | ステータス |
|-----|--------|------|-----------|
| 要件定義レビュー | - | - | 未実施 |
| 設計レビュー | - | - | 未実施 |
| 実装開始承認 | - | - | 未実施 |

---

**ステータス**: 要件定義完了待ち
**次のアクション**: レビュー・承認
