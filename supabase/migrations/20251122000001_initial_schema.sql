-- Initial schema for RamenDB
-- Created: 2025-11-22

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: users
-- Description: User information
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    reviewer_score DECIMAL(3,2) CHECK (reviewer_score >= 0 AND reviewer_score <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'ユーザー情報';
COMMENT ON COLUMN users.reviewer_score IS 'レビュアー信頼スコア (0.00-1.00)';

-- ============================================================================
-- Table: restaurants
-- Description: Restaurant basic information
-- ============================================================================
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_kana VARCHAR(255),
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    nearest_station VARCHAR(100),
    railway VARCHAR(100),
    phone_number VARCHAR(20),
    website TEXT,
    twitter VARCHAR(100),
    instagram VARCHAR(100),
    notes TEXT,
    profile_description TEXT,
    average_score DECIMAL(3,1) DEFAULT 0.0 CHECK (average_score >= 0 AND average_score <= 10),
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_nearest_station ON restaurants(nearest_station);
CREATE INDEX idx_restaurants_average_score ON restaurants(average_score DESC);
CREATE INDEX idx_restaurants_review_count ON restaurants(review_count DESC);

COMMENT ON TABLE restaurants IS 'ラーメン店の基本情報';
COMMENT ON COLUMN restaurants.profile_description IS '店の世界観説明';
COMMENT ON COLUMN restaurants.average_score IS '平均スコア (0.0-10.0)';

-- ============================================================================
-- Table: categories
-- Description: Ramen categories (家系、二郎系、味噌、ラーショ等)
-- ============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

COMMENT ON TABLE categories IS 'ラーメンのカテゴリ';

-- ============================================================================
-- Table: restaurant_categories
-- Description: Many-to-many relationship between restaurants and categories
-- ============================================================================
CREATE TABLE restaurant_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(restaurant_id, category_id)
);

CREATE INDEX idx_restaurant_categories_restaurant ON restaurant_categories(restaurant_id);
CREATE INDEX idx_restaurant_categories_category ON restaurant_categories(category_id);

COMMENT ON TABLE restaurant_categories IS '店舗-カテゴリ中間テーブル';

-- ============================================================================
-- Table: tags
-- Description: Special tags (朝ラー、健康志向、中高年向け等)
-- ============================================================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);

COMMENT ON TABLE tags IS '特性タグ';

-- ============================================================================
-- Table: restaurant_tags
-- Description: Many-to-many relationship between restaurants and tags
-- ============================================================================
CREATE TABLE restaurant_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(restaurant_id, tag_id)
);

CREATE INDEX idx_restaurant_tags_restaurant ON restaurant_tags(restaurant_id);
CREATE INDEX idx_restaurant_tags_tag ON restaurant_tags(tag_id);

COMMENT ON TABLE restaurant_tags IS '店舗-タグ中間テーブル';

-- ============================================================================
-- Table: business_hours
-- Description: Restaurant business hours (supports multiple time slots)
-- ============================================================================
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_business_hours_restaurant ON business_hours(restaurant_id, day_of_week);

COMMENT ON TABLE business_hours IS '営業時間';
COMMENT ON COLUMN business_hours.day_of_week IS '曜日 (0=日曜, 6=土曜)';
COMMENT ON COLUMN business_hours.is_closed IS '定休日フラグ';

-- ============================================================================
-- Table: reviews
-- Description: User reviews
-- ============================================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
    comment TEXT,
    visit_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_score ON reviews(score DESC);

COMMENT ON TABLE reviews IS 'ユーザーレビュー';
COMMENT ON COLUMN reviews.score IS 'スコア (0.0-10.0)';
COMMENT ON COLUMN reviews.visit_date IS '来店日';

-- ============================================================================
-- Table: review_images
-- Description: Review images
-- ============================================================================
CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_images_review ON review_images(review_id, display_order);

COMMENT ON TABLE review_images IS 'レビュー画像';
COMMENT ON COLUMN review_images.image_url IS '画像URL (Supabase Storage)';
COMMENT ON COLUMN review_images.display_order IS '表示順序';

-- ============================================================================
-- Triggers: Auto-update updated_at
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Triggers: Auto-calculate restaurant average score
-- ============================================================================

-- Function to recalculate restaurant average score and review count
CREATE OR REPLACE FUNCTION update_restaurant_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update average_score and review_count
    UPDATE restaurants
    SET
        average_score = COALESCE((
            SELECT ROUND(AVG(score)::numeric, 1)
            FROM reviews
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
        ), 0),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
        )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reviews table
CREATE TRIGGER update_restaurant_stats_on_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_stats();

CREATE TRIGGER update_restaurant_stats_on_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_stats();

CREATE TRIGGER update_restaurant_stats_on_delete
    AFTER DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_stats();

-- ============================================================================
-- Initial seed data (optional - categories and tags)
-- ============================================================================

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
    ('家系', 'iekei', '豚骨醤油ベースの濃厚スープが特徴'),
    ('二郎系', 'jiro', 'ボリューム満点、野菜マシマシ'),
    ('味噌', 'miso', '味噌ベースのスープ'),
    ('塩', 'shio', 'あっさり塩ベースのスープ'),
    ('醤油', 'shoyu', '醤油ベースの王道スープ'),
    ('豚骨', 'tonkotsu', '豚骨ベースの濃厚スープ'),
    ('つけ麺', 'tsukemen', 'つけ麺スタイル'),
    ('ラーショ系', 'rasho', 'ラーメン荘風の濃厚系');

-- Insert default tags
INSERT INTO tags (name, slug, description) VALUES
    ('朝ラー', 'morning', '朝営業しているお店'),
    ('健康志向', 'healthy', '健康に配慮したメニューあり'),
    ('中高年向け', 'senior-friendly', '落ち着いた雰囲気、優しい味'),
    ('女性向け', 'female-friendly', '女性が入りやすい雰囲気'),
    ('駐車場あり', 'parking', '駐車場完備'),
    ('深夜営業', 'late-night', '深夜営業あり'),
    ('子連れOK', 'family-friendly', '子連れで入りやすい');
