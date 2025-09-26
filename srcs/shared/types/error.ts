export type DeleteResult = {
  success: boolean;
  error?: {
    type: "permission" | "notFound" | "unknown" | "conflict";
    message: string;
    statusCode: number;
  };
};

export interface DashboardActionsOptions {
  resourceName: string; // APIのエンドポイント名 (例: 'security-groups')
  resourceLabel: string; // UI表示用のリソース名 (例: 'セキュリティグループ')
  refresh: () => Promise<void>; // useResourceListから受け取るリスト更新関数
}
