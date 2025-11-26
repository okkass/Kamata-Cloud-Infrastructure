import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { formatDateTime } from "@/utils/date";
import type { UserResponse as UserDTO } from "~~/shared/types/dto/user";

/* =========================== Types =========================== */
export type UserRow = {
  id: string;
  name: string; // ユーザー名 (アカウント名)
  email: string;
  limitsText: string; // "CPU: 2, メモリ: 4GB..."
  lastLoginText: string;
  originalData: UserDTO; // 編集用に元のDTOを保持
};

/* =========================== Helper Functions =========================== */
function formatResourceLimits(user: UserDTO): string {
  const cpu = user.maxCpuCore != null ? `${user.maxCpuCore}` : "無制限";

  const memory =
    user.maxMemorySize != null && user.maxMemorySize > 0
      ? `${convertByteToUnit(user.maxMemorySize, "GB")} GB`
      : "無制限";

  const storage =
    user.maxStorageSize != null && user.maxStorageSize > 0
      ? `${convertByteToUnit(user.maxStorageSize, "GB")} GB`
      : "無制限";

  return `CPU: ${cpu}, メモリ: ${memory}, ストレージ: ${storage}`;
}

/* =========================== Main Composable =========================== */
export function useUserManagement() {
  // APIデータ取得
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<UserDTO>("users");

  // テーブル設定
  const columns: TableColumn[] = [
    { key: "name", label: "アカウント名", align: "left" },
    { key: "email", label: "メールアドレス", align: "left" },
    { key: "limitsText", label: "最大リソース", align: "left" },
    { key: "lastLoginText", label: "最終ログイン", align: "left" },
  ];

  const headerButtons = [{ action: "add", label: "利用者追加" }];

  // データ整形
  const rows = computed<UserRow[]>(() =>
    (rawList.value ?? []).map((u) => ({
      id: u.id,
      name: u.name, // DTOの構造によっては u.accountName など
      email: u.email ?? "-",
      limitsText: formatResourceLimits(u),
      lastLoginText: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-",
      originalData: u, // 元データを保持
    }))
  );

  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
  };
}
