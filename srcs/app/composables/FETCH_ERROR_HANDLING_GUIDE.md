## データ取得エラーハンドリングガイド

### 概要

データ取得時のエラーを、エラーページ表示ではなくトースト通知で表示するための実装ガイドです。

### 基本的な使い方

#### 1. リスト表示ページ（一覧取得）での使用例

```typescript
import { useResourceList } from "@/composables/useResourceList";
import { useResourceFetchHandler } from "@/composables/useResourceFetchHandler";

export function useMyResourceManagement() {
  const { data, error, refresh } =
    useResourceList<MyResourceDTO>("my-resources");

  // エラーハンドリング（トースト通知で表示）
  useResourceFetchHandler(error, {
    errorMessage: "リソースの取得に失敗しました",
  });

  return { data, error, refresh };
}
```

#### 2. 詳細ページでの使用例（エラーページが必要な場合）

```typescript
import { useResourceDetail } from "@/composables/useResourceDetail";
import { useResourceErrorGuard } from "@/composables/useResourceErrorGuard";

export function useResourceDetail(id: string) {
  const { data, pending, error, refresh } = useResourceDetail<MyResourceDTO>(
    "my-resources",
    id,
  );

  // ⚠️ 詳細ページではエラーページを表示したい場合
  // useResourceErrorGuard を使用してください
  useResourceErrorGuard(data, pending, error, {
    notFoundMessage: "リソースが見つかりません",
  });

  return { data, pending, error, refresh };
}
```

#### 3. エラーコールバック

```typescript
useResourceFetchHandler(error, {
  errorMessage: "ユーザー情報の取得に失敗しました",
  onError: (err) => {
    console.error("エラー発生:", err);
    // エラー時の追加処理
  },
});
```
