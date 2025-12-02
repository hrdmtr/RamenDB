# マイグレーション実行ガイド

## スクレイピングシステムのセットアップ

以下の手順でデータベーステーブルを作成してください。

### 手順

1. **Supabase Dashboard にアクセス**

   https://supabase.com/dashboard/project/rvrmhcvjhoifmjlaypvn/sql/new

2. **SQL Editor で以下のSQLを実行**

   #### ファイル1: `supabase/migrations/20251202000001_scraping_management.sql`

   このファイルの全内容をコピーして、SQL Editorに貼り付けて実行してください。

   ```bash
   cat supabase/migrations/20251202000001_scraping_management.sql
   ```

   #### ファイル2: `supabase/migrations/20251202000002_scraping_stats_function.sql`

   続いて、このファイルの内容もコピーして実行してください。

   ```bash
   cat supabase/migrations/20251202000002_scraping_stats_function.sql
   ```

3. **テーブル作成の確認**

   ```bash
   npm run tsx scripts/setup-scraping-tables.ts
   ```

   以下のような出力が表示されれば成功です：

   ```
   ✅ stations テーブル: 存在します
   ✅ scraping_jobs テーブル: 存在します
   ✅ scraping_results テーブル: 存在します

   📊 登録駅数: 10 駅
   📊 ジョブ数: 0 件
   ```

### 作成されるテーブル

- **stations** - 駅マスター（神奈川県の主要駅10駅が初期投入済み）
- **scraping_jobs** - スクレイピングジョブ管理
- **scraping_results** - 店舗ごとの収集履歴

### 次のステップ

テーブル作成後は、`docs/scraping-system.md` を参照してスクレイピングシステムを使用してください。
