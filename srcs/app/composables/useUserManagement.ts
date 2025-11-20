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

  const headerButtons = [{ label: "＋ 利用者追加", action: "add" }];

  const rows = computed<UserRow[]>(() =>
    (data.value ?? []).map((u) => {
      const account = u.accountName ?? u.name ?? "-";
      const email = u.email ?? "-";

      const cpu = toNumber(u.maxCpuCore) || toNumber(u.limits?.cpu) || 0;

      let memoryGb = 0;
      const size = u.maxMemorySize;
      if (toNumber(size) > 0) {
        memoryGb = convertByteToUnit(size, "GB");
      } else if (toNumber(u.limits?.memoryGb) > 0) {
        memoryGb = toNumber(u.limits!.memoryGb);
      } else if (toNumber(u.limits?.memorySize) > 0) {
        memoryGb = convertByteToUnit(u.limits!.memorySize!, "GB");
      }

      let storageGb = 0;
      if (toNumber(u.maxStorageSize) > 0) {
        storageGb = convertByteToUnit(u.maxStorageSize!, "GB");
      } else if (toNumber(u.limits?.storageGb) > 0) {
        storageGb = toNumber(u.limits!.storageGb);
      } else if (toNumber(u.limits?.storageSize) > 0) {
        storageGb = convertByteToUnit(u.limits!.storageSize!, "GB");
      }

      const limitsText = `CPU: ${cpu}, メモリ: ${memoryGb} GB, ストレージ: ${storageGb} GB`;
      const lastLoginText = u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-";

      return {
        id: u.id,
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
