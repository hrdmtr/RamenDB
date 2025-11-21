# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RamenDB**は、ラーメン店の情報を管理・共有するためのデータベースアプリケーションです。ユーザーはラーメン店の検索、詳細情報の閲覧、レビューの投稿、お気に入り登録などができます。

## Development Commands

```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# リント
npm run lint
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React useState (将来的にZustand or Reduxを検討)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (画像保存)

## Project Structure

```
RamenDB/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ホーム画面
│   ├── globals.css          # グローバルスタイル
│   └── api/                 # APIルート（今後追加）
├── components/
│   └── ui/                  # shadcn/ui コンポーネント
├── lib/
│   ├── utils.ts             # ユーティリティ関数
│   └── supabase.ts          # Supabaseクライアント
├── types/
│   └── index.ts             # TypeScript型定義
└── docs/
    ├── 要件定義.md          # 要件定義書
    └── database-design.md   # データベース設計書
```

## Architecture & Design Principles

### Core Concepts

1. **使いやすさ**: シンプルで直感的なUI
2. **データ駆動**: ラーメン店の詳細な情報管理
3. **コミュニティ**: ユーザーレビューと評価の共有
4. **発見性**: エリアやカテゴリでの検索・フィルタリング

### Data Model

詳細は `docs/database-design.md` を参照

**主要テーブル:**
- **users**: ユーザー情報（認証、プロフィール、レビュアースコア）
- **restaurants**: ラーメン店の基本情報（名前、住所、評価など）
- **categories**: カテゴリ（家系、二郎系、味噌、ラーショ等）
- **tags**: 特性タグ（朝ラー、健康志向、中高年向け等）
- **reviews**: レビュー情報（スコア、コメント、来店日）
- **review_images**: レビュー画像
- **business_hours**: 営業時間（複数スロット対応）
- **restaurant_categories**: 店舗-カテゴリ関連
- **restaurant_tags**: 店舗-タグ関連

### Screen Flow

```
ホーム画面 (/)
  → 検索・フィルタリング
  → ラーメン店一覧
    → ラーメン店詳細 (/restaurants/[id])
      → レビュー閲覧
      → レビュー投稿
      → お気に入り登録
```

## Initial Scope (v0.1)

今後実装予定：

- 🏠 ホーム画面：検索機能、人気店表示
- 🔍 検索機能：エリア、カテゴリ、評価でのフィルタリング
- 🏪 ラーメン店詳細：基本情報、地図、レビュー表示
- 💬 レビュー機能：評価、コメント、画像投稿
- ⭐ お気に入り機能：ブックマーク、リスト管理
- 👤 ユーザー認証：ログイン、プロフィール管理
- 📊 統計・分析：人気ランキング、トレンド表示

## Development Notes

- Next.js 15 + TypeScript + Tailwind CSS のセットアップ完了
- Supabase (PostgreSQL) をデータベースとして採用
- データベース設計完了（9テーブル、UUID使用）
- モバイルファーストのレスポンシブデザイン
- PWA対応を検討

## Database

データベース設計の詳細は `docs/database-design.md` を参照してください。

**主要な設計方針:**
- UUID v4 を主キーとして使用
- タイムスタンプは UTC (timestamptz) で管理
- カスケード削除によるデータ整合性の維持
- レビュアー重み付けに対応可能な拡張性のある設計
