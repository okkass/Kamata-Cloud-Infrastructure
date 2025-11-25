// app/composables/useUserManagement.ts
import { computed } from "vue";
import { convertByteToUnit } from "@/utils/format";
import { formatDateTime } from "@/utils/date";

type RawUser = {
  id: string;
  accountName?: string;
  name?: string;
  email?: string;
  lastLoginAt?: string;
  description?: string;
  maxCpuCore?: number;
  maxMemorySize?: number; // bytes
  maxStorageSize?: number; // bytes
  limits?: {
    cpu?: number;
    memoryGb?: number;
    storageGb?: number;
    memorySize?: number; // bytes
    storageSize?: number; // bytes
  };
};

export type UserRow = {
  id: string;
  // usePageActions と互換を保つため name を必須にする
  name: string;
  account: string;
  email: string;
  limitsText: string;
  lastLoginText: string;
  description?: string;
  editUrl?: string;
};

function toNumber(v: unknown): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function useUserManagement() {
  const { data, pending, error, refresh } = useAsyncData<RawUser[]>(
    "users-list",
    () => $fetch("/api/users")
  );

  const columns = [
    { key: "account", label: "アカウント名", align: "left" as const },
    { key: "email", label: "メールアドレス", align: "left" as const },
    { key: "limitsText", label: "最大リソース", align: "left" as const },
    { key: "lastLoginText", label: "最終ログイン", align: "left" as const },
  ];

  // headerButtons に key を明示
  const headerButtons = [{ key: "add", label: "＋ 利用者追加", action: "add" }];

  const rows = computed<UserRow[]>(() =>
    (data.value ?? []).map((u) => {
      const account = u.accountName ?? u.name ?? "-";
      // name を必須に合わせて account を代入
      const name = account;
      const email = u.email ?? "-";

      // --- CPU: キャッシュして重複呼び出しを削減 ---
      const maxCpuRaw = u.maxCpuCore;
      const limitsCpuRaw = u.limits?.cpu;
      const hasCpuInfo = maxCpuRaw != null || limitsCpuRaw != null;
      const cpuValue =
        (maxCpuRaw != null ? toNumber(maxCpuRaw) : 0) || toNumber(limitsCpuRaw);
      const cpuText = hasCpuInfo ? String(cpuValue) : "無制限";

      // --- Memory: 必要な値を一度だけ取得 ---
      const maxMemoryRaw = u.maxMemorySize;
      const limitsMemoryGbRaw = u.limits?.memoryGb;
      const limitsMemorySizeRaw = u.limits?.memorySize;
      const hasMemoryInfo =
        maxMemoryRaw != null ||
        limitsMemoryGbRaw != null ||
        limitsMemorySizeRaw != null;
      let memoryGb = 0;
      if (maxMemoryRaw != null && toNumber(maxMemoryRaw) > 0) {
        memoryGb = convertByteToUnit(maxMemoryRaw, "GB");
      } else if (limitsMemoryGbRaw != null && toNumber(limitsMemoryGbRaw) > 0) {
        memoryGb = toNumber(limitsMemoryGbRaw);
      } else if (
        limitsMemorySizeRaw != null &&
        toNumber(limitsMemorySizeRaw) > 0
      ) {
        memoryGb = convertByteToUnit(limitsMemorySizeRaw, "GB");
      }
      const memoryText = hasMemoryInfo ? `${memoryGb} GB` : "無制限";

      // --- Storage: 同上 ---
      const maxStorageRaw = u.maxStorageSize;
      const limitsStorageGbRaw = u.limits?.storageGb;
      const limitsStorageSizeRaw = u.limits?.storageSize;
      const hasStorageInfo =
        maxStorageRaw != null ||
        limitsStorageGbRaw != null ||
        limitsStorageSizeRaw != null;
      let storageGb = 0;
      if (maxStorageRaw != null && toNumber(maxStorageRaw) > 0) {
        storageGb = convertByteToUnit(maxStorageRaw, "GB");
      } else if (
        limitsStorageGbRaw != null &&
        toNumber(limitsStorageGbRaw) > 0
      ) {
        storageGb = toNumber(limitsStorageGbRaw);
      } else if (
        limitsStorageSizeRaw != null &&
        toNumber(limitsStorageSizeRaw) > 0
      ) {
        storageGb = convertByteToUnit(limitsStorageSizeRaw, "GB");
      }
      const storageText = hasStorageInfo ? `${storageGb} GB` : "無制限";

      const limitsText = `CPU: ${cpuText}, メモリ: ${memoryText}, ストレージ: ${storageText}`;
      const lastLoginText = u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-";

      return {
        id: u.id,
        name,
        account,
        email,
        limitsText,
        lastLoginText,
        description: u.description,
        editUrl: `/users/${encodeURIComponent(u.id)}`,
      };
    })
  );

  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
  } as const;
}
