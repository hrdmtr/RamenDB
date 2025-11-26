-- 評価スコアを10点満点から5点満点に変更

-- 5軸評価のCHECK制約を変更（0-5に）
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_score_taste_check,
DROP CONSTRAINT IF EXISTS reviews_score_portion_check,
DROP CONSTRAINT IF EXISTS reviews_score_price_check,
DROP CONSTRAINT IF EXISTS reviews_score_service_check,
DROP CONSTRAINT IF EXISTS reviews_score_cleanliness_check;

ALTER TABLE reviews
ADD CONSTRAINT reviews_score_taste_check CHECK (score_taste >= 0 AND score_taste <= 5),
ADD CONSTRAINT reviews_score_portion_check CHECK (score_portion >= 0 AND score_portion <= 5),
ADD CONSTRAINT reviews_score_price_check CHECK (score_price >= 0 AND score_price <= 5),
ADD CONSTRAINT reviews_score_service_check CHECK (score_service >= 0 AND score_service <= 5),
ADD CONSTRAINT reviews_score_cleanliness_check CHECK (score_cleanliness >= 0 AND score_cleanliness <= 5);

-- コメントを更新
COMMENT ON COLUMN reviews.score_taste IS '味の評価（1.0〜5.0）';
COMMENT ON COLUMN reviews.score_portion IS '量の評価（1.0〜5.0）';
COMMENT ON COLUMN reviews.score_price IS '価格/コスパの評価（1.0〜5.0）';
COMMENT ON COLUMN reviews.score_service IS '接客の評価（1.0〜5.0）';
COMMENT ON COLUMN reviews.score_cleanliness IS '衛生の評価（1.0〜5.0）';

-- 既存データを10点満点から5点満点に変換（既存データがある場合）
UPDATE reviews
SET
  score_taste = CASE WHEN score_taste IS NOT NULL THEN score_taste / 2.0 ELSE NULL END,
  score_portion = CASE WHEN score_portion IS NOT NULL THEN score_portion / 2.0 ELSE NULL END,
  score_price = CASE WHEN score_price IS NOT NULL THEN score_price / 2.0 ELSE NULL END,
  score_service = CASE WHEN score_service IS NOT NULL THEN score_service / 2.0 ELSE NULL END,
  score_cleanliness = CASE WHEN score_cleanliness IS NOT NULL THEN score_cleanliness / 2.0 ELSE NULL END
WHERE score_taste IS NOT NULL;

-- スコア計算トリガーは自動的に5点満点の平均を計算する
