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
- **Database**: TBD (Supabase, Firebase, or PostgreSQL)

## Project Structure

```
RamenDB/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ホーム画面
│   ├── globals.css          # グローバルスタイル
│   └── api/                 # APIルート
├── components/
│   └── ui/                  # shadcn/ui コンポーネント
├── data/                    # サンプルデータ・定数
├── types/
│   └── index.ts             # TypeScript型定義
├── lib/
│   └── utils.ts             # ユーティリティ関数
└── docs/
    └── requirements.md      # 要件定義書
```

## Architecture & Design Principles

### Core Concepts

1. **使いやすさ**: シンプルで直感的なUI
2. **データ駆動**: ラーメン店の詳細な情報管理
3. **コミュニティ**: ユーザーレビューと評価の共有
4. **発見性**: エリアやカテゴリでの検索・フィルタリング

### Data Model

- **Restaurant**: ラーメン店の情報（名前、住所、カテゴリ、評価など）
- **Review**: レビュー情報（ユーザー、評価、コメント、画像など）
- **User**: ユーザー情報（認証、プロフィール、お気に入りなど）
- **Category**: カテゴリ情報（ラーメンのスタイル、エリアなど）

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

- 現在はプロジェクトの初期セットアップ段階
- データベース選定を検討中（Supabase推奨）
- モバイルファーストのレスポンシブデザイン
- PWA対応を検討
