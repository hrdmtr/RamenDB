-- 店舗テーブルに短い紹介文（キャッチコピー）カラムを追加

ALTER TABLE restaurants
ADD COLUMN short_description VARCHAR(100);

COMMENT ON COLUMN restaurants.short_description IS '短い紹介文・キャッチコピー（最大100文字）';
