# 開発ルール・規約

**最終更新**: 2025-11-22

このファイルは、RamenDBプロジェクトの開発において守るべきルールと規約を定義します。

---

## 🌿 ブランチ戦略

### ブランチ構成
```
main (本番環境)
  ↑
  └── develop (開発統合ブランチ)
        ↑
        ├── feature/xxx (機能開発)
        ├── feature/yyy (機能開発)
        └── bugfix/zzz (バグ修正)
```

### ブランチ命名規則
- **feature/機能名** - 新機能開発（例: `feature/restaurant-search`, `feature/review-system`）
- **bugfix/バグ名** - バグ修正（例: `bugfix/login-error`, `bugfix/data-fetch-error`）
- **hotfix/緊急修正名** - 本番の緊急修正（例: `hotfix/security-patch`）

### ブランチルール
- **main**: 本番環境用、直接コミット禁止
- **develop**: 開発統合用、直接コミット禁止（PRでマージのみ）
- **feature/xxx**: 機能開発用、developから分岐、developにマージ

---

## 📝 作業フロー

### 1. 作業開始時
- [ ] `CURRENT_STATUS.md`を読み、現在の状況を把握
- [ ] TODOリストから次にやるべきタスクを選択
- [ ] **developブランチに移動し、最新の状態に更新**
  ```bash
  git checkout develop
  git pull origin develop
  ```
- [ ] **feature/xxxブランチを作成**
  ```bash
  git checkout -b feature/作業内容の説明
  # 例: git checkout -b feature/add-restaurant-form
  ```
- [ ] `CURRENT_STATUS.md`のGit状態を更新

### 2. 作業中
- [ ] `CURRENT_STATUS.md`のTODOを更新（作業開始時にチェック）
- [ ] 新しい問題や気づきを「未解決の問題」に記録
- [ ] 重要な変更は「開発メモ」に記録
- [ ] **意味のある単位でこまめにコミット**
  ```bash
  git add .
  git commit -m "機能: 〇〇を追加"
  ```

### 3. 作業終了時・機能完成時
- [ ] `CURRENT_STATUS.md`を更新
  - 完了したTODOにチェックマーク
  - 新しいTODOの追加
  - 「最終更新」のタイムスタンプを更新
  - 「Git状態」を更新（ブランチ名含む）
- [ ] **関連ドキュメントを更新**（該当する場合）
  - テスト方法が変わった場合 → `tests/e2e/README.md`, `README.md`を更新
  - デプロイ方法が変わった場合 → `DEPLOY.md`, `README.md`を更新
  - 開発環境のセットアップが変わった場合 → `README.md`を更新
  - 新機能追加の場合 → `README.md`の「主な機能」を更新
  - API変更の場合 → API仕様書を更新
- [ ] **すべての変更をコミット**（ドキュメント更新含む）
- [ ] **feature/xxxブランチをプッシュ**
  ```bash
  git push origin feature/xxx
  ```
- [ ] **PRを作成（developへ）**
  - タイトル: わかりやすい機能説明
  - 本文: 変更内容・テスト内容を記載
  - ドキュメント更新の有無を明記
  - レビュー依頼（チーム開発の場合）
- [ ] **PRをマージ後、ブランチ削除**
  ```bash
  git checkout develop
  git pull origin develop
  git branch -d feature/xxx
  ```

### 4. 作業中断時
- [ ] `CURRENT_STATUS.md`に現在の作業内容を詳細に記録
- [ ] コミット＆プッシュ（途中でもOK）
  ```bash
  git add .
  git commit -m "WIP: 〇〇の途中まで実装"
  git push origin feature/xxx
  ```

---

## 🔄 リリースフロー

### developからmainへのマージ
1. developで十分にテスト
2. PRを作成（develop → main）
3. 最終確認
4. mainにマージ
5. タグを作成（バージョン管理）
  ```bash
  git tag -a v0.2.0 -m "リリース v0.2.0: 〇〇機能追加"
  git push origin v0.2.0
  ```

---

## 📋 コミットメッセージ規約

### フォーマット
```
種類: 簡潔な説明（50文字以内）

詳細な説明（必要に応じて）
- 変更点1
- 変更点2
```

### 種類（プレフィックス）
- **機能**: 新機能追加
- **修正**: バグ修正
- **改善**: 既存機能の改善
- **リファクタ**: コードの整理（機能変更なし）
- **ドキュメント**: ドキュメントのみの変更
- **スタイル**: コードスタイルの修正（動作変更なし）
- **テスト**: テストの追加・修正
- **ビルド**: ビルドシステム・依存関係の変更
- **WIP**: 作業途中（コミットのみ、マージ前に修正）

### 例
```bash
git commit -m "機能: レストラン検索機能を追加"
git commit -m "修正: データ取得時のエラーを修正"
git commit -m "改善: 検索パフォーマンス改善"
git commit -m "ドキュメント: DEVELOPMENT_RULES.mdを更新"
git commit -m "WIP: レビュー機能の実装途中"
```

---

## 🏗️ コーディング規約

### ファイル・ディレクトリ構成
```
app/              # Next.js App Router（画面・API）
├── page.tsx      # 各ルートの画面
├── layout.tsx    # レイアウト
└── api/          # APIルート

components/       # 共通コンポーネント
└── ui/           # shadcn/uiコンポーネント

lib/              # ユーティリティ・ヘルパー関数
├── storage.ts    # LocalStorage操作
├── logger.ts     # ロガー
└── database.ts   # データベース操作

data/             # サンプルデータ・定数

types/            # TypeScript型定義
└── index.ts      # 共通型定義

docs/             # ドキュメント
```

### TypeScript規約

#### 型定義
- すべての関数に型を明示
- `any`の使用は最小限に（やむを得ない場合のみ）
- 共通型は `types/index.ts` に定義
- エクスポートする型は必ずコメントを付ける

```typescript
// ✅ Good
export interface Restaurant {
  id: string;
  name: string;
  location: string;
  // ...
}

export function getRestaurants(areaId: string): Restaurant[] {
  // ...
}

// ❌ Bad
export function getRestaurants(areaId) {
  // ...
}
```

#### 命名規則
- **変数・関数**: camelCase (`restaurantName`, `getRestaurants`)
- **型・インターフェース**: PascalCase (`Restaurant`, `ReviewData`)
- **定数**: UPPER_SNAKE_CASE (`MAX_RESULTS`, `API_KEY`)
- **プライベート関数**: `_` プレフィックス（オプション）

#### コメント
- 複雑なロジックには必ずコメント
- 関数の上に簡潔な説明コメント
- TODOコメントは `// TODO: 説明` 形式

```typescript
// LocalStorageからレストランデータを取得
export function getRestaurants(areaId: string): Restaurant[] {
  // ...
}
```

### React/Next.js規約

#### コンポーネント
- Server Componentを基本とする
- Client Componentは `'use client'` を明示
- 1ファイル1コンポーネント（小さい場合は複数可）
- propsは必ず型定義

```typescript
// ✅ Good
interface Props {
  restaurantId: string;
  onUpdate: () => void;
}

export default function RestaurantPage({ restaurantId, onUpdate }: Props) {
  // ...
}
```

#### Hooks
- カスタムHooksは `use` プレフィックス
- `useEffect`の依存配列を必ず指定
- 状態管理はシンプルに（まずuseState、必要に応じてZustand等）

#### スタイリング
- Tailwind CSSを使用
- カスタムCSSは最小限
- レスポンシブデザイン必須（モバイルファースト）

```tsx
// ✅ Good: Tailwindクラス
<div className="flex flex-col gap-4 p-4 md:p-6">

// ❌ Bad: インラインstyle（特別な理由がない限り）
<div style={{ display: 'flex', padding: '16px' }}>
```

### API規約

#### エンドポイント
- RESTful設計
- POST/GET/PUT/DELETEを適切に使用
- エラーハンドリング必須

```typescript
// app/api/restaurants/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');

    if (!areaId) {
      return NextResponse.json(
        { error: 'areaIdが必要です' },
        { status: 400 }
      );
    }

    // 処理...

    return NextResponse.json({ restaurants });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### レスポンス形式
- 成功: `{ data: ... }` または `{ restaurants: [...] }`
- エラー: `{ error: "エラーメッセージ" }`
- ステータスコードを適切に設定

---

## 🗃️ データ管理

### LocalStorage
- キー名は `ramendb_` プレフィックス
- データはJSON形式で保存
- 必ずtry-catchでエラーハンドリング
- SSR対応（`typeof window === 'undefined'` チェック）

```typescript
const RESTAURANTS_KEY = 'ramendb_restaurants';

export function getRestaurants(areaId: string): Restaurant[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(RESTAURANTS_KEY);
    // ...
  } catch (error) {
    console.error('Failed to load:', error);
    return [];
  }
}
```

### 環境変数
- 機密情報は `.env.local` に保存（gitignore済み）
- `.env.example` にサンプルを記載
- Next.js環境変数の命名規則に従う
  - クライアント側: `NEXT_PUBLIC_`
  - サーバー側: プレフィックスなし

---

## 🧪 テスト・デバッグ

### ログ出力
- 開発中は `console.log` OK
- 本番リリース前に不要なログを削除
- エラーは必ず `console.error`
- logger.tsを活用した操作ログの記録

### デバッグ
- Chrome DevToolsを活用
- React DevToolsで状態を確認
- Network タブでAPI通信を確認

### エラーハンドリング
- すべての非同期処理にtry-catch
- ユーザーにわかりやすいエラーメッセージ
- フォールバック値を用意

---

## 📦 依存関係管理

### パッケージ追加
- 必要最小限に留める
- メジャーなライブラリを優先
- ライセンスを確認
- `package.json`に追加後、`CURRENT_STATUS.md`を更新

### バージョン管理
- Next.js, React は定期的に更新
- 破壊的変更に注意
- 更新後は必ず動作確認

---

## 🔒 セキュリティ

### APIキー
- **絶対にコミットしない**
- `.env.local` に保存
- `.env.example` にはダミー値のみ

### 入力検証
- ユーザー入力は必ずバリデーション
- XSS対策（Reactが基本的に対応）
- APIエンドポイントでの入力チェック

---

## 📄 ドキュメント

### 必須ドキュメント
- `CURRENT_STATUS.md`: 作業状況（都度更新）
- `CLAUDE.md`: プロジェクト概要・AI向け説明
- `DEVELOPMENT_RULES.md`: 本ファイル
- `README.md`: プロジェクト説明（ユーザー向け）
- `DEPLOY.md`: デプロイ手順

### ドキュメント更新の義務

**重要**: 以下の変更を行った場合、**必ず関連ドキュメントを同時に更新する**こと。

#### テスト方法が変わった場合
- [ ] `tests/e2e/README.md` を更新
- [ ] `README.md` の「テスト」セクションを更新
- [ ] 新しいテストファイルを追加した場合は、説明を追加

#### デプロイ方法が変わった場合
- [ ] `DEPLOY.md` を更新（詳細手順）
- [ ] `README.md` の「デプロイ」セクションを更新（概要）
- [ ] 環境変数が増えた場合は `.env.example` を更新

#### 開発環境のセットアップが変わった場合
- [ ] `README.md` の「開発環境のセットアップ」を更新
- [ ] 新しい依存関係は `package.json` を更新
- [ ] `.env.example` を更新（必要な場合）

#### 新機能を追加した場合
- [ ] `README.md` の「主な機能」セクションを更新
- [ ] バージョン履歴を追加（リリース時）

#### API仕様が変わった場合
- [ ] API仕様書を更新（作成予定: `docs/API.md`）
- [ ] エンドポイントの変更・追加を記録

### ドキュメント更新のベストプラクティス

1. **同時更新**: コード変更とドキュメント更新を同じPRに含める
2. **具体的に**: 「何を」「なぜ」変更したかを明記
3. **スクリーンショット**: UI変更の場合は画像を追加
4. **リンク**: 関連ドキュメント間で相互リンクを設定

### コードコメント
- 複雑なロジック
- 外部API連携部分
- 型定義の意図

### 更新タイミング
- 大きな機能追加後
- 設計変更後
- 開発ルール追加時
- **テスト方法・デプロイ方法の変更時（必須）**

---

## 🚀 デプロイ

### デプロイ前チェックリスト
- [ ] `npm run build` が成功
- [ ] `npm run lint` でエラーなし
- [ ] 環境変数が正しく設定されているか確認
- [ ] 不要な`console.log`を削除
- [ ] `CURRENT_STATUS.md`を更新
- [ ] コミット・プッシュ

---

## 🎯 設計原則

### RamenDBの設計哲学
1. **使いやすさ**: シンプルで直感的なUI
2. **データ駆動**: ラーメン店の詳細な情報管理
3. **コミュニティ**: ユーザーレビューと評価の共有
4. **発見性**: エリアやカテゴリでの検索機能

### コードの原則
- **DRY**: 同じコードを繰り返さない
- **KISS**: シンプルに保つ
- **YAGNI**: 必要になるまで実装しない
- **Single Responsibility**: 1つの関数/コンポーネントは1つの責務

---

## 📌 よくある質問

### Q: 新しい画面を追加する場合は？
1. `app/` 配下に適切なディレクトリを作成
2. `page.tsx` を作成
3. 必要なコンポーネント・ロジックを実装
4. `CURRENT_STATUS.md` の「プロジェクト構造」を更新

### Q: 新しいAPIを追加する場合は？
1. `app/api/` 配下に適切なディレクトリを作成
2. `route.ts` を作成
3. エラーハンドリングを忘れずに
4. `.env.example` に必要な環境変数を追加（必要な場合）

### Q: 型定義はどこに書く？
- 共通型: `types/index.ts`
- ファイル固有の型: 同じファイル内
- 複数ファイルで使う型: `types/index.ts` にエクスポート

---

## ✅ このルールの運用

- このファイル自体もプロジェクトとともに進化させる
- ルール追加・変更時は必ずコミットメッセージに記載
- チーム開発の場合は、全員が合意の上で変更
- AI（Claude）もこのルールに従って開発を支援

---

**重要**: このルールは「守るべき最低限」であり、より良い方法があれば積極的に提案・採用すること。
