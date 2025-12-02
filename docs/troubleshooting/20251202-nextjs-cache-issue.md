# Next.js キャッシュ破損による Web UI 表示問題

## 発生日時
2025年12月2日

## 症状
- `/admin/scraping` ページにアクセスすると「読み込み中...」のまま画面が固まる
- ブラウザのコンソールに404エラーが表示される
- エラー内容: `/_next/static/chunks/main-app.js` などの JavaScript ファイルが見つからない
- ブラウザのハードリフレッシュ（Cmd+Shift+R）でも解決しない

## 検証結果

### 正常に動作していた部分
1. ページファイルの存在: `app/admin/scraping/page.tsx` ✓
2. API の動作: `/api/admin/scraping/stats` は正常にデータを返す ✓
3. HTTPレスポンス: サーバーは `200 OK` を返す ✓
4. HTMLレンダリング: サーバーサイドで HTML は正しく生成される ✓

### 問題があった部分
- JavaScript チャンクファイルが 404 Not Found
- ブラウザが要求するファイルパスとサーバー上の実際のファイルパスが不一致

## 根本原因

**Next.js の `.next` ビルドキャッシュの破損・不整合**

### 詳細な原因
1. 開発中に以下の操作が繰り返された：
   - 新しいページ（`app/admin/scraping/page.tsx`）の作成
   - 新しい API ルート（`app/api/admin/scraping/stats/route.ts`）の作成
   - 複数回の修正とホットリロード

2. Next.js の内部動作：
   - ファイル変更を検知すると、増分ビルドを実行
   - ビルド結果を `.next` ディレクトリにキャッシュ
   - JavaScript チャンクファイルにはハッシュ値が含まれる（例: `main-app.ABC123.js`）

3. 不整合の発生：
   - HTML は新しいハッシュ値のチャンクファイルを参照
   - 実際の `.next` ディレクトリには古いハッシュ値のファイルが残存
   - ブラウザが新しいファイルを要求 → 404 エラー

### なぜブラウザリフレッシュでは解決しなかったか
- ブラウザのキャッシュクリアは**クライアント側**のみに作用
- 問題は**サーバー側**（`.next` ディレクトリ）のキャッシュにあった
- サーバーが配信する HTML と JavaScript の不整合はブラウザ操作では解消不可能

## 解決方法

```bash
# .next キャッシュを完全削除
rm -rf .next

# 開発サーバーを再起動
npm run dev
```

### 実行結果
- Next.js がクリーンな状態から完全再ビルド
- 新しいハッシュ値で統一されたチャンクファイルが生成
- HTML と JavaScript の参照が一致し、正常に動作

## このエラーが発生しやすい状況

1. **大量のファイル変更**を短時間で行った場合
2. **新しいページや API ルート**を複数追加した直後
3. **TypeScript の型エラー**が発生している状態で開発を続けた場合
4. **node_modules の更新**直後
5. **Git ブランチの切り替え**後に`.next` が残存している場合

## 予防策

### 1. 定期的なキャッシュクリア
大きな機能追加や変更後は、予防的に `.next` を削除して再起動する習慣をつける。

### 2. Clean start スクリプトの追加
`package.json` に以下を追加：

```json
"scripts": {
  "dev": "next dev",
  "dev:clean": "rm -rf .next && next dev",
  "build:clean": "rm -rf .next && next build"
}
```

使用例：
```bash
npm run dev:clean
```

### 3. エラーが出たらすぐ対処
TypeScript エラーやビルドエラーを放置せず、すぐに修正する。エラーがある状態での開発を続けると、キャッシュの不整合が起きやすい。

### 4. Git を活用
- こまめにコミットして、問題が起きたらクリーンな状態に戻せるようにする
- `.gitignore` で `.next` が除外されていることを確認（デフォルトで除外されている）

### 5. node_modules 更新時の対応
```bash
npm install
rm -rf .next
npm run dev
```

## 似た症状が出たときの診断フロー

### Step 1: エラー内容の確認
ブラウザのデベロッパーツール（F12）→ Console タブ
- 404 エラー → キャッシュ問題の可能性
- 500 エラー → サーバーサイドのコード問題
- CORS エラー → API の設定問題

### Step 2: API の動作確認
```bash
curl -s "http://localhost:3001/api/admin/scraping/stats" | jq '.'
```
API が正常に動作している場合、問題はフロントエンド側。

### Step 3: サーバーログの確認
開発サーバーのターミナル出力を確認：
- コンパイルエラーがないか
- ページが正しくコンパイルされているか（`✓ Compiled /admin/scraping`）

### Step 4: キャッシュクリアと再起動
```bash
rm -rf .next
npm run dev
```

### Step 5: それでも解決しない場合
```bash
# node_modules も含めて完全クリーン
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## 参考情報

### Next.js の開発環境でキャッシュされるもの
1. `.next/` - ビルド成果物（JavaScript チャンク、CSS、静的ファイル）
2. `node_modules/.cache/` - 各種ツールのキャッシュ
3. ブラウザキャッシュ - HTML、JavaScript、CSS、画像など

### 関連する Next.js の設定
```typescript
// next.config.ts
const config: NextConfig = {
  // 本番環境では静的最適化を無効化する場合
  output: 'standalone',

  // キャッシュ制御
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};
```

## まとめ

- **問題**: Next.js の `.next` キャッシュ破損による JavaScript ファイル 404 エラー
- **原因**: 複数回のファイル変更とホットリロードによるキャッシュの不整合
- **解決**: `.next` ディレクトリを削除して開発サーバーを再起動
- **予防**: 大きな変更後は予防的に `npm run dev:clean` を実行
- **診断**: ブラウザコンソール → API確認 → サーバーログ確認 → キャッシュクリア

このトラブルシューティングドキュメントは、同様の問題が発生した際の参考資料として活用してください。
