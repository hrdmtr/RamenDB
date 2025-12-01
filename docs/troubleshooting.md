# トラブルシューティング

プロジェクト開発中に発生した問題と解決策を記録します。

---

## 目次
- [ビルドエラー](#ビルドエラー)
  - [useSearchParams() Suspense境界エラー](#usesearchparams-suspense境界エラー)

---

## ビルドエラー

### useSearchParams() Suspense境界エラー

**発生日**: 2025-12-01

#### 何が起こったのか

Vercelへのデプロイ時に以下のビルドエラーが発生：

```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/auth/redirect"
Error occurred prerendering page "/auth/redirect"
```

**影響範囲**:
- `/auth/redirect` ページのビルドが失敗
- Vercelデプロイが完了しない
- 本番環境への反映ができない

**発生状況**:
- ローカル開発サーバー (`npm run dev`) では正常動作
- `npm run build` 実行時にエラー発生
- Vercel デプロイ時にビルド失敗

#### 根本原因

**Next.js 15のプリレンダリング要件違反**

1. **静的プリレンダリングの制約**
   - Next.js 15では、デフォルトで全てのページを静的にプリレンダリングしようとする
   - `useSearchParams()` は動的な値（URLパラメータ）に依存するため、ビルド時に値が確定しない

2. **クライアント専用フックの扱い**
   - `useSearchParams()` はクライアントサイドでのみ動作する
   - サーバーサイドのプリレンダリング時には実行できない

3. **Suspense境界の必要性**
   - Next.jsは、動的な値を使用するコンポーネントを `Suspense` でラップすることで、クライアントサイドレンダリングに委譲することを要求する
   - これにより、ビルド時のプリレンダリングをスキップできる

#### なぜこうなったのか

**開発プロセスでの見落とし**

1. **ローカル開発環境での検証不足**
   - `npm run dev` では正常に動作していた
   - **開発サーバーはプリレンダリングを行わない**ため、この問題に気づけなかった
   - 本番ビルド (`npm run build`) を実行していなかった

2. **Next.js 15の新しい要件への認識不足**
   - Next.js 14以前では、`useSearchParams()` を直接使用してもビルドエラーにならないケースがあった
   - Next.js 15で**プリレンダリングの挙動が厳格化**された
   - この変更を把握せずに、従来の書き方でコードを実装した

3. **リダイレクト機能の急な実装**
   - OAuth後のリダイレクト機能を追加する際、URLパラメータを使う必要があった
   - 機能を素早く実装することを優先し、ビルド時の動作確認を省略した

4. **ドキュメント確認の不足**
   - Next.js 15の公式ドキュメントや移行ガイドを十分に確認しなかった
   - `useSearchParams()` の使用時の注意事項を見逃した

#### どうすれば回避できたのか

**予防策と推奨プラクティス**

1. **PRマージ前に必ず本番ビルドを実行**
   ```bash
   npm run build
   ```
   - 開発サーバーで動いても、ビルドで失敗する可能性がある
   - ビルドエラーをローカルで早期発見できる
   - **所要時間: 1-2分** → デプロイ失敗のリスクを考えれば安い投資

2. **CI/CDパイプラインでビルドテストを自動化**
   - GitHub Actionsで PR作成時に自動ビルド
   - ビルド失敗時はマージをブロック
   - 実装例（`.github/workflows/build-test.yml`）:
   ```yaml
   name: Build Test
   on: [pull_request]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: npm ci
         - run: npm run build
   ```

3. **Next.js 15の公式ドキュメントを確認**
   - 新機能や破壊的変更を把握する
   - 特に `useSearchParams()`, `usePathname()` などの動的フックの使用方法
   - 参考: [Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

4. **動的フックを使う際のチェックリスト**
   - ✅ `useSearchParams()` を使用する場合は `Suspense` でラップ
   - ✅ `usePathname()` で動的な値を使う場合も同様
   - ✅ ビルド時のエラーメッセージを無視しない
   - ✅ 公式ドキュメントで推奨パターンを確認

5. **段階的な実装とテスト**
   ```
   ❌ 悪い例: 一気に実装 → PRマージ → デプロイ失敗
   ✅ 良い例: 実装 → ローカルビルド → 修正 → PR → デプロイ
   ```

6. **エラーメッセージを読む習慣**
   - Next.jsのエラーメッセージには解決策のリンクが含まれている
   - 例: `Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout`
   - このリンクを開けば、Suspenseでラップする必要があることが明記されている

7. **チーム内での知識共有**
   - このようなトラブルシューティングドキュメントを作成・更新
   - レビュー時に Next.js 15の要件を確認
   - 同じ問題を繰り返さない

#### 問題のあったコード

```typescript
// app/auth/redirect/page.tsx (修正前)
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ❌ Suspense境界なし

  useEffect(() => {
    const redirectPath = searchParams.get('redirect');
    // ... リダイレクト処理
  }, [searchParams, router]);

  return (
    <div>ログイン処理中...</div>
  );
}
```

**問題点**:
- `useSearchParams()` が直接コンポーネント内で呼び出されている
- `Suspense` 境界でラップされていない
- ビルド時に静的プリレンダリングしようとして失敗

#### 解決策

**`Suspense` 境界でラップ**

```typescript
// app/auth/redirect/page.tsx (修正後)
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// useSearchParams() を使用するコンポーネントを分離
function AuthRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Suspense内で安全に使用

  useEffect(() => {
    const redirectPath = searchParams.get('redirect');
    // ... リダイレクト処理
  }, [searchParams, router]);

  return (
    <div>ログイン処理中...</div>
  );
}

// メインコンポーネントでSuspenseラップ
export default function AuthRedirectPage() {
  return (
    <Suspense fallback={
      <div>ログイン処理中...</div>
    }>
      <AuthRedirectContent />
    </Suspense>
  );
}
```

**変更点**:
1. `useSearchParams()` を使用するロジックを `AuthRedirectContent` コンポーネントに分離
2. `Suspense` でラップし、`fallback` にローディングUIを指定
3. これにより、ビルド時はfallbackをプリレンダリングし、クライアントサイドで実際のコンテンツをレンダリング

#### 検証方法

**ローカルでのビルドテスト**:
```bash
npm run build
```

**期待される結果**:
```
✓ Generating static pages (12/12)
✓ Finalizing page optimization
```

**確認ポイント**:
- ビルドエラーが発生しない
- `/auth/redirect` ページが正常にビルドされる
- Vercelデプロイが成功する

#### 参考リンク

- [Next.js 15 - Missing Suspense with CSR bailout](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)
- [Next.js - useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [React - Suspense](https://react.dev/reference/react/Suspense)

#### 教訓・予防策

**今後の開発で注意すべきこと**:

1. **動的なフックは常にSuspenseでラップ**
   - `useSearchParams()`
   - `usePathname()` (動的な場合)
   - その他クライアント専用フック

2. **ビルドテストを必ず実行**
   - PRマージ前に `npm run build` を実行
   - ローカルで問題なくてもビルドエラーが出る可能性がある

3. **Next.js 15の新しい要件を理解**
   - プリレンダリングの挙動が変わった
   - クライアント専用コンポーネントの扱いに注意

4. **開発サーバーとビルドの違いを理解**
   - `npm run dev` は最適化なし
   - `npm run build` は本番ビルド（プリレンダリング実行）
   - 本番環境の動作は必ずビルドで確認

---

## その他の問題

今後、問題が発生した際にここに追記していきます。
