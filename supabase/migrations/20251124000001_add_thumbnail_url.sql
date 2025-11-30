-- 店舗テーブルにサムネイル画像URLカラムを追加

ALTER TABLE restaurants
ADD COLUMN thumbnail_url TEXT;

COMMENT ON COLUMN restaurants.thumbnail_url IS '店舗代表画像URL（Supabase Storage）';
