// app/composables/useUserManagement.ts
import { computed } from "vue";

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
  // usePageActions が要求する name を必須で持たせる（account のエイリアス）
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
function bytesToGb(bytes?: number): number {
  if (!bytes || Number.isNaN(bytes)) return 0;
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}
function formatDate(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(
    d.getDate()
  )} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function useUserManagement() {
  // Nuxt の useAsyncData / $fetch を想定
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

  const headerButtons = [
    { key: "add", label: "＋ 利用者追加", kind: "primary" },
  ];

  const rows = computed<UserRow[]>(() =>
    (data.value ?? []).map((u) => {
      const account = u.accountName ?? u.name ?? "-";
      const name = account; // name を account のエイリアスとして設定（usePageActions 互換）
      const email = u.email ?? "-";

      // キャッシュして複数回の toNumber 呼び出しを避ける
      const maxCpu = toNumber(u.maxCpuCore);
      const limitsCpu = toNumber(u.limits?.cpu);
      const cpu = maxCpu || limitsCpu || 0;

      const maxMemorySize = toNumber(u.maxMemorySize);
      const limitsMemoryGb = toNumber(u.limits?.memoryGb);
      const limitsMemorySize = toNumber(u.limits?.memorySize);
      const memoryGb =
        (maxMemorySize > 0 && bytesToGb(maxMemorySize)) ||
        (limitsMemoryGb > 0 && limitsMemoryGb) ||
        (limitsMemorySize > 0 && bytesToGb(limitsMemorySize)) ||
        0;

      const maxStorageSize = toNumber(u.maxStorageSize);
      const limitsStorageGb = toNumber(u.limits?.storageGb);
      const limitsStorageSize = toNumber(u.limits?.storageSize);
      const storageGb =
        (maxStorageSize > 0 && bytesToGb(maxStorageSize)) ||
        (limitsStorageGb > 0 && limitsStorageGb) ||
        (limitsStorageSize > 0 && bytesToGb(limitsStorageSize)) ||
        0;

      const limitsText = `CPU: ${cpu} / Mem: ${memoryGb}GB / Sto: ${storageGb}GB`;
      const lastLoginText = u.lastLoginAt ? formatDate(u.lastLoginAt) : "-";

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
