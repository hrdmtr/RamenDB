# スクレイピングシステム - 使用ガイド

神奈川県全域のラーメン店を駅単位で網羅的に収集するためのシステムです。

## 概要

このシステムは以下の機能を提供します：

1. **駅マスター管理** - 神奈川県の駅を登録・管理
2. **スクレイピングジョブ管理** - 駅×キーワードごとにジョブを作成・実行
3. **収集進捗の可視化** - 各駅の収集状況をリアルタイムで確認
4. **自動重複排除** - 同一店舗の重複登録を自動で防止

## セットアップ手順

### 1. データベースマイグレーション

Supabase Dashboard > SQL Editor で以下のSQLファイルを実行してください：

URL: https://supabase.com/dashboard/project/rvrmhcvjhoifmjlaypvn/sql/new

実行順序：
1. `supabase/migrations/20251202000001_scraping_management.sql`
2. `supabase/migrations/20251202000002_scraping_stats_function.sql`

### 2. テーブル確認

```bash
npm run tsx scripts/setup-scraping-tables.ts
```

以下のテーブルが作成されます：

- `stations` - 駅マスター（神奈川県の主要駅10駅が初期投入済み）
- `scraping_jobs` - スクレイピングジョブ管理
- `scraping_results` - 店舗ごとの収集履歴

## 使用方法

### ジョブの作成

全ての有効な駅に対して、デフォルトキーワードでジョブを作成：

```bash
npm run scrape-stations -- --create-jobs
```

デフォルトキーワード：
- ラーメン
- ラーメンショップ
- 中華そば
- つけ麺
- 家系ラーメン
- 二郎系

### ジョブの実行

全てのpendingジョブを実行：

```bash
npm run scrape-stations
```

特定の駅のみ実行：

```bash
npm run scrape-stations -- --station="成瀬駅"
```

ドライラン（データベースに保存しない）：

```bash
npm run scrape-stations -- --dry-run
```

### 進捗確認

#### コマンドライン

```bash
npm run tsx scripts/setup-scraping-tables.ts
```

#### API経由

**ジョブ一覧取得**

```bash
# 全ジョブ
curl http://localhost:3001/api/admin/scraping/jobs

# ステータス別
curl "http://localhost:3001/api/admin/scraping/jobs?status=pending"
curl "http://localhost:3001/api/admin/scraping/jobs?status=completed"

# 駅別
curl "http://localhost:3001/api/admin/scraping/jobs?station_id=<uuid>"
```

**統計情報取得**

```bash
curl http://localhost:3001/api/admin/scraping/stats
```

返却データ：
- `jobs` - ジョブのステータス別集計（pending, running, completed, failed）
- `totals` - 合計収集数（新規、更新）
- `stations` - 駅別の収集統計
- `recentJobs` - 最近のジョブ10件

## データベーススキーマ

### stations テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| name | TEXT | 駅名（例: 成瀬駅） |
| prefecture | TEXT | 都道府県（デフォルト: 神奈川県） |
| city | TEXT | 市区町村 |
| railway | TEXT | 路線名 |
| latitude | DECIMAL | 緯度 |
| longitude | DECIMAL | 経度 |
| is_active | BOOLEAN | スクレイピング対象フラグ |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

UNIQUE制約: (name, railway)

### scraping_jobs テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| station_id | UUID | 駅ID（FK: stations） |
| query | TEXT | 検索キーワード |
| radius | INTEGER | 検索半径（メートル、デフォルト: 3000） |
| status | TEXT | pending, running, completed, failed |
| started_at | TIMESTAMP | 開始日時 |
| completed_at | TIMESTAMP | 完了日時 |
| restaurants_found | INTEGER | 検索でヒットした店舗数 |
| restaurants_new | INTEGER | 新規登録数 |
| restaurants_updated | INTEGER | 更新数 |
| restaurants_failed | INTEGER | 失敗数 |
| error_message | TEXT | エラーメッセージ |
| log_file_path | TEXT | ログファイルパス |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### scraping_results テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| job_id | UUID | ジョブID（FK: scraping_jobs） |
| restaurant_id | UUID | 店舗ID（FK: restaurants） |
| action | TEXT | 'created' or 'updated' |
| created_at | TIMESTAMP | 作成日時 |

## 運用フロー

### 初回セットアップ

```bash
# 1. データベースマイグレーション実行（Supabase Dashboard）

# 2. テーブル確認
npm run tsx scripts/setup-scraping-tables.ts

# 3. ジョブ作成（10駅 × 6キーワード = 60ジョブ）
npm run scrape-stations -- --create-jobs
```

### 定期実行

```bash
# 全てのpendingジョブを実行
npm run scrape-stations
```

### エラー再実行

失敗したジョブは `status = 'failed'` でマークされます。
Supabase Dashboardでステータスを `pending` に戻せば再実行できます：

```sql
UPDATE scraping_jobs
SET status = 'pending'
WHERE status = 'failed';
```

### 駅の追加

```sql
INSERT INTO stations (name, prefecture, city, railway, latitude, longitude)
VALUES ('新横浜駅', '神奈川県', '横浜市', '東海道新幹線', 35.5074, 139.6177);
```

追加後、ジョブを作成：

```bash
npm run scrape-stations -- --create-jobs
```

既存駅のジョブは重複作成されません（スキップされます）。

## 管理画面の実装（今後）

将来的には以下の画面を実装予定：

1. **ダッシュボード**
   - 収集進捗の可視化（総数、駅別）
   - ジョブステータスの円グラフ
   - 最近の収集アクティビティ

2. **駅管理画面**
   - 駅の一覧・追加・編集
   - 駅ごとの収集統計表示

3. **ジョブ管理画面**
   - ジョブの一覧・フィルタ
   - 個別ジョブの詳細表示
   - 手動ジョブ作成
   - 失敗ジョブの再実行

## トラブルシューティング

### ジョブが pending のまま動かない

```bash
# ジョブを手動実行
npm run scrape-stations
```

### 特定の駅だけ実行したい

```bash
npm run scrape-stations -- --station="成瀬駅"
```

### API呼び出しでエラー

Google Places APIの制限に注意：
- 1クエリあたり最大60件（3ページ）
- ページング時は2秒待機が必須
- レート制限に引っかかる場合は待機時間を調整

### 重複データが登録される

重複チェックは `name` + `address` の完全一致で行われます。
GoogleマップのAPI応答でこれらが微妙に異なる場合、重複が発生する可能性があります。

## ログファイル

全ての実行ログは `logs/` ディレクトリに保存されます：

```
logs/scrape-2025-12-02T10-30-00.log
```

各ジョブの詳細（検索結果、登録・更新の詳細、エラー）が記録されます。
