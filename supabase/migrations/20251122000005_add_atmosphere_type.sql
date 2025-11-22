-- 雰囲気の選択式項目と画像アップロード機能を追加

ALTER TABLE reviews
  ADD COLUMN atmosphere_type VARCHAR(50), -- 雰囲気タイプ（選択式）
  ADD COLUMN image_urls TEXT[]; -- 画像URL配列

-- atmosphere_commentを任意に変更（選択式があるため）
ALTER TABLE reviews ALTER COLUMN atmosphere_comment DROP NOT NULL;

-- コメント追加
COMMENT ON COLUMN reviews.atmosphere_type IS '雰囲気タイプ（静か/賑やか/普通/その他）';
COMMENT ON COLUMN reviews.atmosphere_comment IS '雰囲気についての補足コメント';
COMMENT ON COLUMN reviews.image_urls IS 'レビュー画像のURL配列（最大5枚）';
