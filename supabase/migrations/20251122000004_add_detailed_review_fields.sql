-- レビューテーブルに詳細項目を追加

-- 既存のcommentカラムをrenameして保持（互換性のため）
ALTER TABLE reviews RENAME COLUMN comment TO general_comment;

-- 新しい詳細項目カラムを追加
ALTER TABLE reviews
  ADD COLUMN taste_comment TEXT,           -- 味についての評価（必須）
  ADD COLUMN atmosphere_comment TEXT,      -- 店の雰囲気について（必須）
  ADD COLUMN service_comment TEXT,         -- 接客態度について（必須）
  ADD COLUMN cost_performance_comment TEXT,-- コストパフォーマンスについて（必須）
  ADD COLUMN accessibility_comment TEXT,   -- 店の見つけやすさ（必須）
  ADD COLUMN self_service_type VARCHAR(50),-- セルフサービスの種類（必須）
  ADD COLUMN self_service_note TEXT,       -- セルフサービス補足（任意）
  ADD COLUMN serving_time VARCHAR(20),     -- 提供時間（必須）
  ADD COLUMN serving_time_note TEXT;       -- 提供時間補足（任意）

-- general_commentを任意項目に変更（既存データがあるため、NOT NULLは外す）
ALTER TABLE reviews ALTER COLUMN general_comment DROP NOT NULL;

-- コメント追加
COMMENT ON COLUMN reviews.taste_comment IS '味についての評価・コメント（50文字以上推奨）';
COMMENT ON COLUMN reviews.atmosphere_comment IS '店の雰囲気についてのコメント';
COMMENT ON COLUMN reviews.service_comment IS '接客態度についてのコメント';
COMMENT ON COLUMN reviews.cost_performance_comment IS 'コストパフォーマンスについてのコメント';
COMMENT ON COLUMN reviews.accessibility_comment IS '店の見つけやすさについてのコメント';
COMMENT ON COLUMN reviews.self_service_type IS 'セルフサービスの種類（完全セルフ/一部セルフ/フルサービス）';
COMMENT ON COLUMN reviews.self_service_note IS 'セルフサービスに関する補足説明';
COMMENT ON COLUMN reviews.serving_time IS '提供時間（3分未満/3-7分/7-15分/15分以上）';
COMMENT ON COLUMN reviews.serving_time_note IS '提供時間に関する補足説明（混雑状況など）';
COMMENT ON COLUMN reviews.general_comment IS '総合コメント（任意）';
