# Supabase Migrations

このディレクトリには、RamenDBのデータベーススキーマのマイグレーションファイルが含まれています。

## マイグレーションファイル

### 20251122000001_initial_schema.sql

**作成日**: 2025-11-22

**内容**: 初期データベーススキーマ

**含まれるテーブル**:
1. `users` - ユーザー情報
2. `restaurants` - ラーメン店の基本情報
3. `categories` - カテゴリ（家系、二郎系等）
4. `tags` - 特性タグ（朝ラー、健康志向等）
5. `restaurant_categories` - 店舗-カテゴリ中間テーブル
6. `restaurant_tags` - 店舗-タグ中間テーブル
7. `business_hours` - 営業時間
8. `reviews` - ユーザーレビュー
9. `review_images` - レビュー画像

**トリガー**:
- `updated_at` 自動更新トリガー
- レストラン平均スコア・レビュー数自動計算トリガー

**初期データ**:
- カテゴリ8件（家系、二郎系、味噌等）
- タグ7件（朝ラー、健康志向、駐車場あり等）

## Supabaseでのマイグレーション実行方法

### 方法1: Supabase CLI（推奨）

```bash
# Supabase CLIのインストール
npm install -g supabase

# Supabaseプロジェクトとリンク
supabase link --project-ref your-project-ref

# マイグレーションの実行
supabase db push
```

### 方法2: Supabase Dashboard（手動）

1. https://supabase.com でプロジェクトを開く
2. 左メニューから「SQL Editor」を選択
3. 「New query」をクリック
4. マイグレーションファイル（`20251122000001_initial_schema.sql`）の内容をコピー&ペースト
5. 「Run」をクリックして実行

### 方法3: ローカル開発環境

```bash
# Supabaseローカル環境の起動
supabase start

# マイグレーションの実行
supabase db reset
```

## マイグレーション実行後の確認

以下のSQLでテーブルが正しく作成されたか確認できます：

```sql
-- テーブル一覧の確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 各テーブルのレコード数確認
SELECT
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'tags', COUNT(*) FROM tags
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;
```

## ロールバック

マイグレーションに問題がある場合、以下のSQLで削除できます：

```sql
-- すべてのテーブルを削除（注意: データも消えます）
DROP TABLE IF EXISTS review_images CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS business_hours CASCADE;
DROP TABLE IF EXISTS restaurant_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS restaurant_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- トリガー関数の削除
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_restaurant_stats() CASCADE;
```

## 注意事項

- マイグレーションは本番環境で実行する前に、必ずテスト環境で確認してください
- データのバックアップを取ってから実行することを推奨します
- UUID extension (`uuid-ossp`) が必要です
