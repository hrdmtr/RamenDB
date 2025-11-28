-- ユーザー認証機能 Phase 1: 匿名ユーザー管理
-- 作成日: 2025-11-28
-- 関連ドキュメント: /docs/RDユーザー認証.md

-- ================================================================================
-- 1. users テーブルの拡張
-- ================================================================================

-- OAuth認証情報のカラムを追加（emailとusernameは既存のため、auth_user_idのみ追加）
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id);

-- 匿名ユーザー情報のカラムを追加
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS anonymous_id TEXT UNIQUE;

-- 既存の email と username を NULL 許可に変更（匿名ユーザー対応）
ALTER TABLE users
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN username DROP NOT NULL;

-- 既存レコードに anonymous_id を付与
UPDATE users SET anonymous_id = gen_random_uuid()::TEXT WHERE anonymous_id IS NULL;

-- anonymous_id を NOT NULL に変更
ALTER TABLE users
  ALTER COLUMN anonymous_id SET NOT NULL;

-- プロフィール（自動推定）のカラムを追加
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS favorite_categories JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS favorite_stations TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS preference_weights JSONB DEFAULT '{}';

-- 統計情報のカラムを追加（reviewer_scoreは既存のため、review_countのみ追加）
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- タイムスタンプのカラムを追加（もしまだなければ）
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_anonymous ON users(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity_at);

-- ================================================================================
-- 2. user_activities テーブルの作成
-- ================================================================================

CREATE TABLE IF NOT EXISTS user_activities (
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

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_restaurant ON user_activities(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON user_activities(created_at DESC);

-- ================================================================================
-- 3. reviews テーブルの制約追加
-- ================================================================================

-- 既存の重複データを削除（古いレビューを残し、新しい重複を削除）
DELETE FROM reviews
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id, restaurant_id ORDER BY created_at ASC) as rn
    FROM reviews
  ) t
  WHERE rn > 1
);

-- 1店舗1レビュー制約（すでに存在する場合はスキップ）
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_restaurant
  ON reviews(user_id, restaurant_id);

-- ================================================================================
-- 4. トリガー: users.last_activity_at の自動更新
-- ================================================================================

-- トリガー関数: user_activities 作成時に users.last_activity_at を更新
CREATE OR REPLACE FUNCTION update_user_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_activity_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS trigger_update_user_last_activity ON user_activities;
CREATE TRIGGER trigger_update_user_last_activity
  AFTER INSERT ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_activity();

-- ================================================================================
-- 5. トリガー: users.review_count の自動更新
-- ================================================================================

-- トリガー関数: review 作成時に users.review_count をインクリメント
CREATE OR REPLACE FUNCTION increment_user_review_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET review_count = review_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー関数: review 削除時に users.review_count をデクリメント
CREATE OR REPLACE FUNCTION decrement_user_review_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET review_count = review_count - 1
  WHERE id = OLD.user_id AND review_count > 0;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS trigger_increment_review_count ON reviews;
CREATE TRIGGER trigger_increment_review_count
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_review_count();

DROP TRIGGER IF EXISTS trigger_decrement_review_count ON reviews;
CREATE TRIGGER trigger_decrement_review_count
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION decrement_user_review_count();

-- ================================================================================
-- 6. 匿名ユーザーデータの自動削除（90日間非アクティブ）
-- ================================================================================

-- 定期実行用の関数（Supabase の pg_cron 拡張を使用）
CREATE OR REPLACE FUNCTION cleanup_inactive_anonymous_users()
RETURNS void AS $$
BEGIN
  DELETE FROM users
  WHERE auth_user_id IS NULL
    AND last_activity_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ================================================================================
-- 7. Row Level Security (RLS) ポリシー
-- ================================================================================

-- user_activities テーブルの RLS を有効化
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- ポリシー: 全員が自分の行動データを作成できる
CREATE POLICY "Anyone can create their own activities"
  ON user_activities
  FOR INSERT
  WITH CHECK (true);

-- ポリシー: ユーザーは自分の行動データのみ閲覧可能
CREATE POLICY "Users can view their own activities"
  ON user_activities
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- ================================================================================
-- コメント
-- ================================================================================

COMMENT ON TABLE user_activities IS 'ユーザーの行動履歴（匿名ユーザー含む）';
COMMENT ON COLUMN user_activities.activity_type IS 'アクティビティの種類: view（閲覧）, search（検索）, click（クリック）';
COMMENT ON COLUMN user_activities.metadata IS '追加情報（滞在時間など）';

COMMENT ON COLUMN users.anonymous_id IS '匿名ユーザーID（全ユーザー必須、LocalStorage/Cookieに保存）';
COMMENT ON COLUMN users.auth_user_id IS 'OAuth認証ユーザーID（認証済みユーザーのみ）';
COMMENT ON COLUMN users.favorite_categories IS '好みのカテゴリ（行動履歴から自動推定）';
COMMENT ON COLUMN users.favorite_stations IS 'よく行く駅（行動履歴から自動推定）';
COMMENT ON COLUMN users.preference_weights IS 'パーソナライズ用の重み付け';
COMMENT ON COLUMN users.reviewer_score IS 'レビュアー信頼度（0.0-1.0）';
