# データベース設計書

## 概要

このアプリケーションはFirebase Firestoreをデータベースとして使用します。
プロジェクト単位で経費建て替えを管理し、プロジェクト内のユーザー間で清算を行います。

---

## Firestoreデータ構造

### 1. projectsコレクション

プロジェクト情報を格納するルートコレクション

#### スキーマ

| フィールド名 | 型 | 必須 | 説明 |
|------------|------|------|------|
| id | string | ○ | プロジェクトの一意識別子（自動生成） |
| name | string | ○ | プロジェクト名 |
| createdAt | Timestamp | ○ | プロジェクト作成日時 |
| updatedAt | Timestamp | ○ | プロジェクト更新日時 |

#### サンプルデータ

```javascript
{
  id: "proj_abc123",
  name: "旅行プロジェクト",
  createdAt: Timestamp(2026-01-01 10:00:00),
  updatedAt: Timestamp(2026-01-01 10:00:00)
}
```

#### インデックス

- デフォルトの自動インデックス（id）

#### セキュリティルール

```javascript
// 誰でも読み書き可能（プロジェクトIDを知っている人のみアクセス可能）
match /projects/{projectId} {
  allow read, write: if true;
}
```

---

### 2. projects/{projectId}/usersサブコレクション

プロジェクト内のユーザー情報を格納するサブコレクション

#### スキーマ

| フィールド名 | 型 | 必須 | 説明 |
|------------|------|------|------|
| id | string | ○ | ユーザーの一意識別子（自動生成） |
| name | string | ○ | ユーザー名（重複可） |
| createdAt | Timestamp | ○ | ユーザー作成日時 |

#### サンプルデータ

```javascript
{
  id: "user_xyz789",
  name: "田中太郎",
  createdAt: Timestamp(2026-01-01 10:05:00)
}
```

#### インデックス

- デフォルトの自動インデックス（id）

#### セキュリティルール

```javascript
match /projects/{projectId}/users/{userId} {
  allow read, write: if true;
}
```

#### 制約

- 同一プロジェクト内でユーザー名の重複は許可
- ユーザー削除時は、そのユーザーに紐づく経費記録が存在する場合は削除不可
  （アプリケーションレイヤーで制御）

---

### 3. projects/{projectId}/expensesサブコレクション

プロジェクト内の経費建て替え記録を格納するサブコレクション

#### スキーマ

| フィールド名 | 型 | 必須 | 説明 |
|------------|------|------|------|
| id | string | ○ | 経費記録の一意識別子（自動生成） |
| payerId | string | ○ | 支払者のユーザーID |
| payerName | string | ○ | 支払者名（スナップショット） |
| beneficiaries | Array | ○ | 受益者の配列 |
| beneficiaries[].userId | string | ○ | 受益者のユーザーID |
| beneficiaries[].userName | string | ○ | 受益者名（スナップショット） |
| amount | number | ○ | 金額（正の整数） |
| memo | string | × | メモ（任意） |
| date | Timestamp | ○ | 経費発生日 |
| createdAt | Timestamp | ○ | レコード作成日時 |
| updatedAt | Timestamp | ○ | レコード更新日時 |

#### サンプルデータ

```javascript
{
  id: "expense_def456",
  payerId: "user_xyz789",
  payerName: "田中太郎",
  beneficiaries: [
    {
      userId: "user_abc123",
      userName: "佐藤花子"
    },
    {
      userId: "user_xyz789",
      userName: "田中太郎"
    }
  ],
  amount: 3000,
  memo: "ランチ代",
  date: Timestamp(2026-01-04 12:00:00),
  createdAt: Timestamp(2026-01-04 12:30:00),
  updatedAt: Timestamp(2026-01-04 12:30:00)
}
```

#### インデックス

複合インデックスを設定（firestore.indexes.jsonで定義済み）:

```json
{
  "collectionGroup": "expenses",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "date",
      "order": "DESCENDING"
    }
  ]
}
```

#### セキュリティルール

```javascript
match /projects/{projectId}/expenses/{expenseId} {
  allow read, write: if true;
}
```

#### バリデーション（アプリケーションレイヤー）

- `amount`: 正の数値のみ
- `payerId`: プロジェクト内に存在するユーザーID
- `beneficiaries`: 最低1人以上、プロジェクト内に存在するユーザーID
- `date`: 有効な日付

#### スナップショットについて

`payerName`と`beneficiaries[].userName`は、ユーザー名のスナップショット（コピー）を保存しています。
これにより、ユーザー名が変更されても過去の経費記録は変更されません。

---

## ローカルストレージ設計

ブラウザのlocalStorageを使用して、ユーザーの参加プロジェクト情報を保存します。

### キー: `projects`

#### スキーマ

```javascript
{
  currentProjectId: string,  // 現在選択中のプロジェクトID
  currentUserId: string,     // 現在のユーザーID
  projects: [                // 参加中のプロジェクト一覧
    {
      projectId: string,     // プロジェクトID
      projectName: string,   // プロジェクト名
      userId: string,        // このプロジェクトでのユーザーID
      userName: string       // ユーザー名
    }
  ]
}
```

#### サンプルデータ

```javascript
{
  currentProjectId: "proj_abc123",
  currentUserId: "user_xyz789",
  projects: [
    {
      projectId: "proj_abc123",
      projectName: "旅行プロジェクト",
      userId: "user_xyz789",
      userName: "田中太郎"
    },
    {
      projectId: "proj_def456",
      projectName: "会社ランチ",
      userId: "user_ghi012",
      userName: "田中太郎"
    }
  ]
}
```

#### 用途

- プロジェクト選択画面で参加中プロジェクトを表示
- アプリ起動時に最後に使用していたプロジェクトを自動選択
- プロジェクト切り替え機能

---

## データアクセスパターン

### 1. プロジェクト作成

```javascript
const projectRef = await addDoc(collection(db, "projects"), {
  name: "プロジェクト名",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
```

### 2. ユーザー追加

```javascript
const userRef = await addDoc(collection(db, "projects", projectId, "users"), {
  name: "ユーザー名",
  createdAt: serverTimestamp()
});
```

### 3. ユーザー一覧取得

```javascript
const usersSnapshot = await getDocs(
  collection(db, "projects", projectId, "users")
);
const users = usersSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### 4. 経費記録追加

```javascript
const expenseRef = await addDoc(
  collection(db, "projects", projectId, "expenses"),
  {
    payerId: "user_xyz789",
    payerName: "田中太郎",
    beneficiaries: [
      { userId: "user_abc123", userName: "佐藤花子" },
      { userId: "user_xyz789", userName: "田中太郎" }
    ],
    amount: 3000,
    memo: "ランチ代",
    date: Timestamp.fromDate(new Date()),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
);
```

### 5. 経費一覧取得（日付降順）

```javascript
const expensesSnapshot = await getDocs(
  query(
    collection(db, "projects", projectId, "expenses"),
    orderBy("date", "desc")
  )
);
const expenses = expensesSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### 6. 経費記録更新

```javascript
await updateDoc(doc(db, "projects", projectId, "expenses", expenseId), {
  amount: 3500,
  memo: "ランチ代（更新）",
  updatedAt: serverTimestamp()
});
```

### 7. 経費記録削除

```javascript
await deleteDoc(doc(db, "projects", projectId, "expenses", expenseId));
```

---

## 清算計算ロジック

### 残高計算アルゴリズム

各ユーザーの残高は以下のように計算します：

1. **支払額の合計**: そのユーザーが支払者として記録された経費の合計
2. **受益額の合計**: そのユーザーが受益者として含まれる経費の（金額 ÷ 受益者数）の合計
3. **残高**: 支払額の合計 - 受益額の合計

#### 計算例

経費記録：
- 記録1: 田中が3000円支払い、受益者は[田中, 佐藤, 鈴木]
- 記録2: 佐藤が2000円支払い、受益者は[田中, 佐藤]

計算：
- **田中の残高**: 3000 - (3000/3 + 2000/2) = 3000 - (1000 + 1000) = +1000円
- **佐藤の残高**: 2000 - (3000/3 + 2000/2) = 2000 - (1000 + 1000) = 0円
- **鈴木の残高**: 0 - (3000/3) = -1000円

結果：
- 田中: +1000円（受け取る）
- 佐藤: 0円（清算不要）
- 鈴木: -1000円（支払う）

### 清算提案アルゴリズム

最小の取引回数で清算する方法を提案します：

1. 全ユーザーの残高を計算
2. プラス残高のユーザー（債権者）とマイナス残高のユーザー（債務者）に分類
3. 債務者から債権者へ、金額が大きい順にマッチング
4. 取引リストを生成

#### 実装例

```javascript
function calculateSettlement(balances) {
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  
  const transactions = [];
  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].balance, -debtors[j].balance);
    transactions.push({
      from: debtors[j].name,
      to: creditors[i].name,
      amount: amount
    });
    
    creditors[i].balance -= amount;
    debtors[j].balance += amount;
    
    if (creditors[i].balance === 0) i++;
    if (debtors[j].balance === 0) j++;
  }
  
  return transactions;
}
```

---

## データ整合性とエラーハンドリング

### トランザクション不要な理由

このアプリケーションでは、以下の理由からFirestoreトランザクションは使用しません：

1. **単一ドキュメント操作**: ほとんどの操作は単一ドキュメントの読み書き
2. **競合の少なさ**: 少人数のプロジェクトメンバーで同時編集の可能性が低い
3. **最終的整合性で十分**: 一時的な不整合が発生しても、アプリの再読み込みで解決

### エラーハンドリング

アプリケーションレイヤーで以下のエラーハンドリングを実装：

1. **ネットワークエラー**: ユーザーにリトライを促す
2. **存在しないプロジェクト**: プロジェクト選択画面に戻る
3. **存在しないユーザー**: エラーメッセージを表示
4. **バリデーションエラー**: フォーム入力時にエラー表示

---

## スケーラビリティとパフォーマンス

### データ量の想定

- プロジェクト数: 無制限（各プロジェクトは独立）
- プロジェクト内ユーザー数: 10-50人程度
- プロジェクト内経費記録数: 100-1000件程度

### パフォーマンス最適化

1. **インデックスの活用**: dateフィールドに降順インデックスを設定
2. **ページネーション**: 必要に応じて経費一覧にページネーションを実装
3. **リアルタイム更新の制限**: 必要な画面のみリアルタイムリスナーを使用

### Firebase無料枠での制約

- **読み取り**: 50,000回/日
- **書き込み**: 20,000回/日
- **削除**: 20,000回/日
- **ストレージ**: 1GB

想定される使用量（10人のプロジェクト、1日10件の経費記録）：
- 読み取り: 約200回/日（ユーザーあたり20回程度）
- 書き込み: 約10回/日
- ストレージ: 数MB程度

→ 無料枠で十分運用可能

---

## セキュリティ考慮事項

### 現在の設計

- **認証なし**: Firebase Authenticationは使用しない
- **アクセス制御**: プロジェクトIDを知っている人のみアクセス可能
- **セキュリティルール**: 全てのプロジェクトに対して読み書き可能

### セキュリティリスク

1. プロジェクトIDが漏洩すると、誰でもアクセス可能
2. 悪意のあるユーザーがデータを削除・改ざん可能

### 推奨される改善策（将来的な拡張）

1. **Firebase Authentication導入**: ユーザー認証を実装
2. **セキュリティルール強化**: 
   - プロジェクトメンバーのみがアクセス可能
   - 作成者のみが削除可能
3. **プロジェクトメンバー管理**: projectsコレクションにmembersフィールドを追加

---

## まとめ

このデータベース設計は、以下の特徴を持っています：

✅ **シンプル**: 3つのコレクション/サブコレクションのみ
✅ **スケーラブル**: プロジェクト単位で独立しており、相互影響なし
✅ **パフォーマンス**: 適切なインデックスとクエリ設計
✅ **コスト効率**: Firebase無料枠で十分運用可能
✅ **拡張性**: 将来的な機能追加に対応可能

この設計により、経費建て替え管理アプリの要件を満たしつつ、シンプルで保守しやすいデータ構造を実現しています。
