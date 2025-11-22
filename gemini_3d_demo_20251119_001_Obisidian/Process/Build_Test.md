# Build & Test

## 前提
- Node.js 14+。依存は `npm install`。

## 開発
- `npm run dev` : Vite開発サーバー (http://localhost:5173)。
- `npm run preview` : ビルド成果物のローカル確認。

## ビルド
- `npm run build` : `dist/` に本番バンドルを出力。

## テスト
- `npx vitest` : ウォッチ実行 (jsdom環境、`src/__tests__` を対象)。
- `npx vitest run --coverage` : CI向け一括＋カバレッジ。

## パス
- ソース: `src/`
- テスト: `src/__tests__/`
- 静的アセット: `public/`
- ビルド成果物: `dist/` (gitignore)
