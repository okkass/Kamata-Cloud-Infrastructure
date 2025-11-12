// app/composables/useUserManagement.ts
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

type RawUser = {
  id: string;
  accountName?: string;
  name?: string;
  email?: string;
  limits?: { cpu?: number; memoryGb?: number; storageGb?: number };
  lastLoginAt?: string; // ISO
  description?: string;
};

export type UserRow = {
  id: string;
  account: string;
  email: string;
  limitsText: string;
  lastLoginText: string;
  description?: string;
};

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
      const cpu = u.limits?.cpu ?? 0;
      const mem = u.limits?.memoryGb ?? 0;
      const sto = u.limits?.storageGb ?? 0;
      return {
        id: u.id,
        account,
        email,
        limitsText: `CPU: ${cpu}, メモリ: ${mem} GB, ストレージ: ${sto} GB`,
        lastLoginText: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-",
        description: u.description,
      };
    })
  );

  return { pending, error, columns, headerButtons, rows, refresh };
}
