-- レビューテーブルに5軸評価とレビュータイプを追加

-- レビュータイプ（簡易評価 or 本気レビュー）
ALTER TABLE reviews
ADD COLUMN review_type VARCHAR(20) DEFAULT 'quick' CHECK (review_type IN ('quick', 'detailed'));

-- 5軸評価
ALTER TABLE reviews
ADD COLUMN score_taste DECIMAL(3,1) CHECK (score_taste >= 0 AND score_taste <= 10),
ADD COLUMN score_portion DECIMAL(3,1) CHECK (score_portion >= 0 AND score_portion <= 10),
ADD COLUMN score_price DECIMAL(3,1) CHECK (score_price >= 0 AND score_price <= 10),
ADD COLUMN score_service DECIMAL(3,1) CHECK (score_service >= 0 AND score_service <= 10),
ADD COLUMN score_cleanliness DECIMAL(3,1) CHECK (score_cleanliness >= 0 AND score_cleanliness <= 10);

-- コメント
COMMENT ON COLUMN reviews.review_type IS 'レビュータイプ: quick=簡易評価, detailed=本気レビュー';
COMMENT ON COLUMN reviews.score_taste IS '味の評価（0.0〜10.0）';
COMMENT ON COLUMN reviews.score_portion IS '量の評価（0.0〜10.0）';
COMMENT ON COLUMN reviews.score_price IS '価格/コスパの評価（0.0〜10.0）';
COMMENT ON COLUMN reviews.score_service IS '接客の評価（0.0〜10.0）';
COMMENT ON COLUMN reviews.score_cleanliness IS '衛生の評価（0.0〜10.0）';

-- 既存のscoreカラムは5軸の平均として計算
-- トリガーを更新して、5軸評価から総合スコアを自動計算
CREATE OR REPLACE FUNCTION calculate_review_score()
RETURNS TRIGGER AS $$
BEGIN
  -- 5軸評価がすべてある場合は平均を計算
  IF NEW.score_taste IS NOT NULL AND
     NEW.score_portion IS NOT NULL AND
     NEW.score_price IS NOT NULL AND
     NEW.score_service IS NOT NULL AND
     NEW.score_cleanliness IS NOT NULL THEN
    NEW.score := (NEW.score_taste + NEW.score_portion + NEW.score_price +
                  NEW.score_service + NEW.score_cleanliness) / 5.0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS calculate_review_score_trigger ON reviews;
CREATE TRIGGER calculate_review_score_trigger
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION calculate_review_score();

-- general_commentは既にNULLABLE（変更不要）
-- 既存の詳細コメントカラムも簡易評価では不要なのでNULLABLEのまま
