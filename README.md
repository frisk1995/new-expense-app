# 経費建て替え管理アプリ

プロジェクトメンバー間での経費建て替えを記録・管理するスマートフォン向けWebアプリケーション

## 機能

- プロジェクト管理（作成・参加）
- ユーザー管理
- 建て替え記録のCRUD
- 収支計算と清算提案

## 技術スタック

- **フロントエンド**: React 18 + Vite
- **UIライブラリ**: Tailwind CSS + DaisyUI
- **ルーティング**: React Router v6
- **バックエンド**: Firebase (Firestore)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestoreを有効化
3. プロジェクト設定からFirebase設定を取得
4. `.env.example`をコピーして`.env`ファイルを作成
5. Firebase設定値を`.env`ファイルに記入

```bash
cp .env.example .env
# .envファイルを編集してFirebase設定を追加
```

### 3. Firestoreセキュリティルール

Firebaseコンソールで以下のセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // プロジェクトは誰でも読み書き可能（IDを知っている人のみアクセス）
    match /projects/{projectId} {
      allow read, write: if true;
      
      // ユーザーサブコレクション
      match /users/{userId} {
        allow read, write: if true;
      }
      
      // 建て替え記録サブコレクション
      match /expenses/{expenseId} {
        allow read, write: if true;
      }
    }
  }
}
```

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## ビルド

```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

## デプロイ（Firebase Hosting）

### 1. Firebase CLIをインストール

```bash
npm install -g firebase-tools
```

### 2. Firebaseにログイン

```bash
firebase login
```

### 3. Firebaseプロジェクトを初期化

```bash
firebase init hosting
```

設定：
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub auto deploy: お好みで

### 4. デプロイ

```bash
npm run build
firebase deploy
```

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── ExpenseList.jsx
│   ├── BalanceView.jsx
│   └── UserManagement.jsx
├── pages/               # ページコンポーネント
│   ├── ProjectSelector.jsx
│   ├── UserSelector.jsx
│   └── MainApp.jsx
├── firebase/            # Firebase関連
│   └── config.js
├── App.jsx              # メインアプリ
├── main.jsx             # エントリーポイント
└── index.css            # グローバルスタイル
```

## 今後の実装予定

- [ ] Firebase Firestoreとの連携
- [ ] 建て替え記録の追加・編集・削除機能
- [ ] フィルター機能
- [ ] 清算計算アルゴリズムの実装
- [ ] エラーハンドリングの強化
- [ ] ローディング状態の表示
- [ ] レスポンシブデザインの最適化

## ライセンス

MIT
