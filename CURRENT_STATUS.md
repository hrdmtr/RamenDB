# プロジェクト状況

**最終更新**: 2025-11-22 04:45
**現在のブランチ**: main
**プロジェクト状態**: 初期セットアップ段階

---

## 📋 現在のTODO

### フェーズ1: プロジェクト初期セットアップ

- [ ] Next.js + TypeScript プロジェクトの初期化
  - [ ] package.jsonの作成
  - [ ] Next.js 15 のインストール
  - [ ] TypeScript の設定
  - [ ] Tailwind CSS の設定
  - [ ] shadcn/ui のセットアップ
- [ ] Supabase プロジェクトのセットアップ
  - [ ] Supabase プロジェクトの作成
  - [ ] 環境変数の設定
  - [ ] Supabase クライアントの設定
- [ ] データベース設計
  - [ ] ERD（Entity Relationship Diagram）の作成
  - [ ] テーブル定義書の作成
  - [ ] Supabase マイグレーションファイルの作成
- [ ] TypeScript 型定義の作成
  - [ ] Restaurant 型
  - [ ] Review 型
  - [ ] User 型
  - [ ] Category/Tag 型
- [ ] 基本的なプロジェクト構造の構築
  - [ ] ディレクトリ構成の整備
  - [ ] 共通コンポーネントの作成
  - [ ] ユーティリティ関数の作成

### フェーズ2: MVP機能実装（優先順位順）

- [ ] 店舗管理機能
  - [ ] 店舗一覧画面
  - [ ] 店舗詳細画面
  - [ ] 店舗登録フォーム（管理者用）
  - [ ] 店舗編集機能（管理者用）
- [ ] レビュー機能
  - [ ] レビュー表示
  - [ ] レビュー投稿フォーム
  - [ ] 画像アップロード機能
- [ ] 検索・ランキング機能
  - [ ] 店名検索
  - [ ] エリア/駅/路線検索
  - [ ] カテゴリ絞り込み
  - [ ] スコア順ランキング
- [ ] 管理者機能
  - [ ] 管理者ログイン
  - [ ] 店舗管理画面
  - [ ] レビュー管理画面

---

## 🏗️ プロジェクト構造

```
RamenDB/
├── .git/                     # Gitリポジトリ
├── docs/                     # ドキュメント
│   └── 要件定義.md          # 要件定義書
├── CLAUDE.md                 # プロジェクト概要（AI向け）
├── CURRENT_STATUS.md         # 本ファイル
├── DEVELOPMENT_RULES.md      # 開発ルール・規約
├── .gitignore               # Git除外設定
├── .env.example             # 環境変数サンプル
└── .dockerignore            # Docker除外設定

（以下、今後作成予定）
├── app/                     # Next.js App Router
├── components/              # 共通コンポーネント
├── lib/                     # ユーティリティ・ヘルパー
├── types/                   # TypeScript型定義
├── public/                  # 静的ファイル
├── package.json             # 依存関係
├── tsconfig.json            # TypeScript設定
├── tailwind.config.ts       # Tailwind設定
└── next.config.ts           # Next.js設定
```

---

## 📊 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

### バックエンド・データベース
- **Supabase** (PostgreSQL)
- **Supabase Auth** (認証)
- **Supabase Storage** (画像保存)

### AI連携（将来実装）
- **OpenAI API** / **Claude API**

### デプロイ（予定）
- **Vercel** (フロントエンド)
- **Supabase** (バックエンド・DB)

---

## 🎯 フェーズ計画

### フェーズ1: MVP（目標: 3ヶ月）
- 店舗登録・表示
- レビュー投稿・表示
- シンプルなスコア集計（平均）
- 基本的な検索・ランキング
- 管理画面の最低限

### フェーズ2: 機能拡充
- タグ・カテゴリの拡充
- レビュアープロフィール
- 簡易なレビュアー信頼度

### フェーズ3: AI・報酬システム
- AI解析・レビュアー重み付け
- アマギフ報酬システム
- 店舗向けダッシュボード

---

## 📝 開発メモ

### 2025-11-22
- プロジェクト開始
- felearnプロジェクトから開発ルールをコピー
  - DEVELOPMENT_RULES.md
  - CLAUDE.md
  - .gitignore
  - .env.example
  - .dockerignore
- 要件定義書を確認（docs/要件定義.md）
- CURRENT_STATUS.md を作成（本ファイル）

---

## ❓ 未解決の問題

現時点ではなし

---

## 🔗 関連リンク

- [要件定義書](./docs/要件定義.md)
- [開発ルール](./DEVELOPMENT_RULES.md)
- [Claude向け説明](./CLAUDE.md)

---

## 次のステップ

1. Next.js + TypeScript プロジェクトの初期化
2. Supabase プロジェクトのセットアップ
3. データベース設計（ERD作成）
4. 型定義の作成
