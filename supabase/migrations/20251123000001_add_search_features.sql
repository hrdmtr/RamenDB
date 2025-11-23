-- SUUMOライク検索機能のためのスキーマ追加
-- 作成日: 2025-11-23
-- 目的: 価格帯、朝ラー対応、店舗特徴、味の濃さなどの検索条件を追加

-- ========================================
-- 1. restaurants テーブルに新フィールド追加
-- ========================================

-- 価格帯（ENUM型）
ALTER TABLE restaurants
  ADD COLUMN price_range VARCHAR(20) CHECK (price_range IN ('~700', '700-900', '900-1200', '1200~'));

-- 朝ラー対応フラグ
ALTER TABLE restaurants
  ADD COLUMN is_morning_ramen BOOLEAN DEFAULT FALSE;

-- サムネイル画像URL（必須）
ALTER TABLE restaurants
  ADD COLUMN thumbnail_url TEXT;

-- 味の濃さ平均値（レビューから自動計算）
ALTER TABLE restaurants
  ADD COLUMN avg_flavor_richness DECIMAL(3,1);

-- GPS用座標（既に存在する場合はスキップ）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='latitude') THEN
    ALTER TABLE restaurants ADD COLUMN latitude DECIMAL(10, 8);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='longitude') THEN
    ALTER TABLE restaurants ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
END $$;

-- コメント追加
COMMENT ON COLUMN restaurants.price_range IS '価格帯（~700円、700-900円、900-1200円、1200円~）';
COMMENT ON COLUMN restaurants.is_morning_ramen IS '朝ラー対応フラグ（朝営業かつ朝ラー文化に対応）';
COMMENT ON COLUMN restaurants.thumbnail_url IS '店舗サムネイル画像URL';
COMMENT ON COLUMN restaurants.avg_flavor_richness IS '味の濃さ平均（0:あっさり 〜 10:こってり、レビューから自動計算）';
COMMENT ON COLUMN restaurants.latitude IS '緯度（GPS検索用、将来実装）';
COMMENT ON COLUMN restaurants.longitude IS '経度（GPS検索用、将来実装）';

-- ========================================
-- 2. reviews テーブルに味の濃さフィールド追加
-- ========================================

ALTER TABLE reviews
  ADD COLUMN flavor_richness INTEGER CHECK (flavor_richness >= 0 AND flavor_richness <= 10);

COMMENT ON COLUMN reviews.flavor_richness IS '味の濃さ（0:あっさり 〜 10:こってり）';

-- ========================================
-- 3. 店舗特徴マスタテーブル作成
-- ========================================

CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE features IS '店舗特徴マスタ（券売機、駐車場、Wi-Fiなど）';
COMMENT ON COLUMN features.name IS '特徴名（例: 券売機あり、駐車場あり）';
COMMENT ON COLUMN features.category IS 'カテゴリ（service, facility, atmosphere など）';

-- ========================================
-- 4. 店舗-特徴 中間テーブル作成
-- ========================================

CREATE TABLE restaurant_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id, feature_id)
);

COMMENT ON TABLE restaurant_features IS '店舗と特徴の中間テーブル';

-- インデックス作成（検索高速化）
CREATE INDEX idx_restaurant_features_restaurant_id ON restaurant_features(restaurant_id);
CREATE INDEX idx_restaurant_features_feature_id ON restaurant_features(feature_id);
CREATE INDEX idx_restaurants_price_range ON restaurants(price_range);
CREATE INDEX idx_restaurants_is_morning_ramen ON restaurants(is_morning_ramen);
CREATE INDEX idx_restaurants_avg_flavor_richness ON restaurants(avg_flavor_richness);

-- ========================================
-- 5. トリガー: レビュー投稿時に味の濃さ平均を自動計算
-- ========================================

CREATE OR REPLACE FUNCTION update_restaurant_flavor_richness()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE restaurants
  SET avg_flavor_richness = (
    SELECT AVG(flavor_richness)
    FROM reviews
    WHERE restaurant_id = NEW.restaurant_id
      AND flavor_richness IS NOT NULL
  )
  WHERE id = NEW.restaurant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_flavor_richness_on_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
WHEN (NEW.flavor_richness IS NOT NULL)
EXECUTE FUNCTION update_restaurant_flavor_richness();

CREATE TRIGGER trigger_update_flavor_richness_on_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.flavor_richness IS NOT NULL)
EXECUTE FUNCTION update_restaurant_flavor_richness();

CREATE TRIGGER trigger_update_flavor_richness_on_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
WHEN (OLD.flavor_richness IS NOT NULL)
EXECUTE FUNCTION update_restaurant_flavor_richness();

-- ========================================
-- 6. 初期データ投入: 店舗特徴マスタ
-- ========================================

INSERT INTO features (name, category, description) VALUES
  -- サービス系
  ('券売機あり', 'service', '食券制で券売機が設置されている'),
  ('QR注文', 'service', 'QRコードでの注文システム'),
  ('セルフサービス', 'service', '水やティッシュなどセルフサービス'),
  ('回転率高い', 'service', '提供が早く回転率が高い'),

  -- 設備系
  ('駐車場あり', 'facility', '駐車場が利用可能'),
  ('カウンターのみ', 'facility', 'カウンター席のみ'),
  ('テーブル席あり', 'facility', 'テーブル席が利用可能'),
  ('Wi-Fiあり', 'facility', 'Wi-Fi環境が整備されている'),
  ('電源あり', 'facility', '電源コンセントが利用可能'),

  -- 雰囲気系
  ('子連れOK', 'atmosphere', '子連れでも入りやすい'),
  ('静か', 'atmosphere', '静かな雰囲気'),
  ('清潔感', 'atmosphere', '清潔感がある店内'),
  ('職人系', 'atmosphere', '職人気質の雰囲気'),
  ('昭和感', 'atmosphere', '昭和レトロな雰囲気');

-- ========================================
-- 7. 既存店舗データに初期値を設定
-- ========================================

-- サンプルとして価格帯を設定（後で管理画面から変更可能）
UPDATE restaurants SET price_range = '700-900' WHERE name LIKE '%本牧家%';
UPDATE restaurants SET price_range = '900-1200' WHERE name LIKE '%二郎%';
UPDATE restaurants SET price_range = '700-900' WHERE name LIKE '%味噌の匠%';
UPDATE restaurants SET price_range = '~700' WHERE name LIKE '%清水%';
UPDATE restaurants SET price_range = '900-1200' WHERE name LIKE '%鶏白湯%';
UPDATE restaurants SET price_range = '700-900' WHERE name LIKE '%大勝軒%';
UPDATE restaurants SET price_range = '900-1200' WHERE name LIKE '%夢を語れ%';
UPDATE restaurants SET price_range = '~700' WHERE name LIKE '%早起き亭%';
UPDATE restaurants SET price_range = '700-900' WHERE name LIKE '%健康一番%';
UPDATE restaurants SET price_range = '~700' WHERE name LIKE '%昭和軒%';

-- 朝ラー対応フラグを設定
UPDATE restaurants SET is_morning_ramen = TRUE WHERE name LIKE '%早起き亭%';

-- サムネイル画像のダミーURL設定（後で実際の画像に差し替え）
UPDATE restaurants SET thumbnail_url = 'https://placehold.co/400x300/png?text=Ramen+Shop';
