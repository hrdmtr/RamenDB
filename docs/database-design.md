# データベース設計

**最終更新**: 2025-11-22

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│   users         │
├─────────────────┤
│ id (PK)         │──┐
│ username        │  │
│ email           │  │
│ display_name    │  │
│ avatar_url      │  │
│ reviewer_score  │  │
│ created_at      │  │
│ updated_at      │  │
└─────────────────┘  │
                     │
                     │ 1:N
                     │
┌─────────────────┐  │
│  restaurants    │  │
├─────────────────┤  │
│ id (PK)         │──┼──┐
│ name            │  │  │
│ name_kana       │  │  │
│ address         │  │  │
│ latitude        │  │  │
│ longitude       │  │  │
│ nearest_station │  │  │
│ railway         │  │  │
│ phone_number    │  │  │
│ website         │  │  │
│ twitter         │  │  │
│ instagram       │  │  │
│ notes           │  │  │
│ profile_desc    │  │  │
│ average_score   │  │  │
│ review_count    │  │  │
│ created_at      │  │  │
│ updated_at      │  │  │
└─────────────────┘  │  │
         │           │  │
         │ N:M       │  │
         │           │  │
         ├───────────┘  │
         │              │
┌────────▼────────┐     │
│restaurant_categ.│     │
├─────────────────┤     │
│ id (PK)         │     │
│ restaurant_id(FK)│    │
│ category_id (FK)│     │
│ created_at      │     │
└─────────────────┘     │
         │              │
         │ N:1          │
         │              │
┌────────▼────────┐     │
│   categories    │     │
├─────────────────┤     │
│ id (PK)         │     │
│ name            │     │
│ slug            │     │
│ description     │     │
│ created_at      │     │
└─────────────────┘     │
                        │
         ┌──────────────┘
         │ 1:N
         │
┌────────▼────────┐
│restaurant_tags  │
├─────────────────┤
│ id (PK)         │
│ restaurant_id(FK)│
│ tag_id (FK)     │
│ created_at      │
└─────────────────┘
         │
         │ N:1
         │
┌────────▼────────┐
│     tags        │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug            │
│ description     │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│business_hours   │
├─────────────────┤
│ id (PK)         │
│ restaurant_id(FK)│──→ restaurants
│ day_of_week     │
│ open_time       │
│ close_time      │
│ is_closed       │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│    reviews      │
├─────────────────┤
│ id (PK)         │
│ restaurant_id(FK)│──→ restaurants
│ user_id (FK)    │──→ users
│ score           │
│ comment         │
│ visit_date      │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ review_images   │
├─────────────────┤
│ id (PK)         │
│ review_id (FK)  │
│ image_url       │
│ display_order   │
│ created_at      │
└─────────────────┘
```

## テーブル一覧

### 1. users（ユーザー）
ユーザー情報を管理

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | ユーザーID (PK) |
| username | varchar(50) | NOT NULL | - | ユーザー名（一意） |
| email | varchar(255) | NOT NULL | - | メールアドレス（一意） |
| display_name | varchar(100) | NULL | - | 表示名 |
| avatar_url | text | NULL | - | アバター画像URL |
| reviewer_score | decimal(3,2) | NULL | - | レビュアー信頼スコア（0.00〜1.00） |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |
| updated_at | timestamptz | NOT NULL | now() | 更新日時 |

**インデックス:**
- PRIMARY KEY: id
- UNIQUE: username, email

---

### 2. restaurants（レストラン・店舗）
ラーメン店の基本情報

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | 店舗ID (PK) |
| name | varchar(255) | NOT NULL | - | 店舗名 |
| name_kana | varchar(255) | NULL | - | 店舗名（フリガナ） |
| address | text | NOT NULL | - | 住所 |
| latitude | decimal(10,8) | NULL | - | 緯度 |
| longitude | decimal(11,8) | NULL | - | 経度 |
| nearest_station | varchar(100) | NULL | - | 最寄駅 |
| railway | varchar(100) | NULL | - | 路線名 |
| phone_number | varchar(20) | NULL | - | 電話番号 |
| website | text | NULL | - | 公式サイトURL |
| twitter | varchar(100) | NULL | - | Twitter ID |
| instagram | varchar(100) | NULL | - | Instagram ID |
| notes | text | NULL | - | 備考・こだわり |
| profile_description | text | NULL | - | 店の世界観説明 |
| average_score | decimal(3,1) | NULL | 0.0 | 平均スコア（0.0〜10.0） |
| review_count | integer | NOT NULL | 0 | レビュー数 |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |
| updated_at | timestamptz | NOT NULL | now() | 更新日時 |

**インデックス:**
- PRIMARY KEY: id
- INDEX: name (検索用)
- INDEX: nearest_station (検索用)
- INDEX: average_score DESC (ランキング用)

---

### 3. categories（カテゴリ）
ラーメンのカテゴリ（家系、二郎系、味噌、ラーショ等）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | カテゴリID (PK) |
| name | varchar(100) | NOT NULL | - | カテゴリ名 |
| slug | varchar(100) | NOT NULL | - | URLスラッグ（一意） |
| description | text | NULL | - | 説明 |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |

**インデックス:**
- PRIMARY KEY: id
- UNIQUE: slug

---

### 4. restaurant_categories（店舗-カテゴリ中間テーブル）
店舗とカテゴリの多対多関係

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | ID (PK) |
| restaurant_id | uuid | NOT NULL | - | 店舗ID (FK) |
| category_id | uuid | NOT NULL | - | カテゴリID (FK) |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |

**インデックス:**
- PRIMARY KEY: id
- UNIQUE: (restaurant_id, category_id)
- FOREIGN KEY: restaurant_id → restaurants(id) ON DELETE CASCADE
- FOREIGN KEY: category_id → categories(id) ON DELETE CASCADE

---

### 5. tags（タグ）
特性タグ（朝ラー、健康志向、中高年向け等）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | タグID (PK) |
| name | varchar(100) | NOT NULL | - | タグ名 |
| slug | varchar(100) | NOT NULL | - | URLスラッグ（一意） |
| description | text | NULL | - | 説明 |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |

**インデックス:**
- PRIMARY KEY: id
- UNIQUE: slug

---

### 6. restaurant_tags（店舗-タグ中間テーブル）
店舗とタグの多対多関係

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | ID (PK) |
| restaurant_id | uuid | NOT NULL | - | 店舗ID (FK) |
| tag_id | uuid | NOT NULL | - | タグID (FK) |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |

**インデックス:**
- PRIMARY KEY: id
- UNIQUE: (restaurant_id, tag_id)
- FOREIGN KEY: restaurant_id → restaurants(id) ON DELETE CASCADE
- FOREIGN KEY: tag_id → tags(id) ON DELETE CASCADE

---

### 7. business_hours（営業時間）
店舗の営業時間（複数スロット対応）

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | ID (PK) |
| restaurant_id | uuid | NOT NULL | - | 店舗ID (FK) |
| day_of_week | integer | NOT NULL | - | 曜日（0=日曜、6=土曜） |
| open_time | time | NULL | - | 開店時刻 |
| close_time | time | NULL | - | 閉店時刻 |
| is_closed | boolean | NOT NULL | false | 定休日フラグ |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |

**インデックス:**
- PRIMARY KEY: id
- FOREIGN KEY: restaurant_id → restaurants(id) ON DELETE CASCADE
- INDEX: (restaurant_id, day_of_week)

---

### 8. reviews（レビュー）
ユーザーのレビュー情報

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | レビューID (PK) |
| restaurant_id | uuid | NOT NULL | - | 店舗ID (FK) |
| user_id | uuid | NOT NULL | - | ユーザーID (FK) |
| score | decimal(3,1) | NOT NULL | - | スコア（0.0〜10.0） |
| comment | text | NULL | - | コメント |
| visit_date | date | NULL | - | 来店日 |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |
| updated_at | timestamptz | NOT NULL | now() | 更新日時 |

**インデックス:**
- PRIMARY KEY: id
- FOREIGN KEY: restaurant_id → restaurants(id) ON DELETE CASCADE
- FOREIGN KEY: user_id → users(id) ON DELETE CASCADE
- INDEX: restaurant_id (店舗別レビュー取得用)
- INDEX: user_id (ユーザー別レビュー取得用)
- INDEX: created_at DESC (新着順)

---

### 9. review_images（レビュー画像）
レビューに添付する画像

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | 画像ID (PK) |
| review_id | uuid | NOT NULL | - | レビューID (FK) |
| image_url | text | NOT NULL | - | 画像URL（Supabase Storage） |
| display_order | integer | NOT NULL | 0 | 表示順序 |
| created_at | timestamptz | NOT NULL | now() | 作成日時 |

**インデックス:**
- PRIMARY KEY: id
- FOREIGN KEY: review_id → reviews(id) ON DELETE CASCADE
- INDEX: (review_id, display_order)

---

## 補足事項

### UUID使用
- すべてのテーブルでUUID v4を主キーとして使用
- セキュリティとスケーラビリティの向上

### タイムスタンプ
- `created_at`, `updated_at` はすべて UTC (timestamptz) で管理
- `updated_at` は自動更新トリガーを設定

### カスケード削除
- 店舗削除時に関連データ（レビュー、営業時間等）も削除
- データ整合性の維持

### スコア計算
- `restaurants.average_score` はレビュー追加/更新時にトリガーで自動計算
- 将来的にレビュアー重み付けに対応可能な設計

### 画像保存
- Supabase Storage を使用
- `review_images.image_url` にストレージパスを保存

---

## 将来拡張予定

### フェーズ2
- `reviewer_weights` テーブル: レビュアー重み付けロジック
- `restaurant_profiles` テーブル: 店舗プロファイル詳細（評価軸の重み等）

### フェーズ3
- `reward_history` テーブル: アマギフ報酬履歴
- `ai_analysis` テーブル: AI解析結果の保存
