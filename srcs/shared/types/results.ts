
export type DeleteResult = {
  success: boolean;
  error?: {
    type: "permission" | "notFound" | "unknown" | "conflict";
    message: string;
    statusCode: number;
  };
};

export type CreateResult<T> = {
  success: boolean;
  data?: T;
  error?: {
    type: "validation" | "permission" | "notFound" | "unknown" | "conflict";
    message: string | Error;
    statusCode: number;
  };
};

export type UpdateResult<T> = {
  success: boolean;
  data?: T; // 成功時に更新されたリソースのデータ
  error?: {
    type: "validation" | "permission" | "notFound" | "conflict" | "unknown";
    message: string;
    statusCode: number;
  };
};

export interface PageActionsOptions {
  resourceName: string; // APIのエンドポイント名 (例: 'security-groups')
  resourceLabel: string; // UI表示用のリソース名 (例: 'セキュリティグループ')
  refresh: () => Promise<void>; // useResourceListから受け取るリスト更新関数
}
