// app/composables/useUserManagement.ts
import { computed } from "vue";
import { convertByteToUnit } from "@/utils/format";
import { formatDateTime } from "@/utils/date";
// shared 側のエクスポートを参照（プロジェクトのエントリに合わせて index から取得）
import type { UserResponse as UserDTO } from "~~/shared/types/dto/user";

export type UserRow = {
  id: string;
  name: string; // usePageActions と整合するため必須
  account: string;
  email: string;
  dto: UserDTO;
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

export function formatCpu(dto: UserDTO): string {
  const cpu = dto.maxCpuCore ?? dto.limits?.cpu;
  return cpu != null ? String(toNumber(cpu)) : "無制限";
}
export function formatMemory(dto: UserDTO): string {
  const max = dto.maxMemorySize;
  const memGb = dto.limits?.memoryGb;
  const memSize = dto.limits?.memorySize;
  if (max != null && toNumber(max) > 0)
    return `${convertByteToUnit(max, "GB")} GB`;
  if (memGb != null && toNumber(memGb) > 0) return `${toNumber(memGb)} GB`;
  if (memSize != null && toNumber(memSize) > 0)
    return `${convertByteToUnit(memSize, "GB")} GB`;
  return "無制限";
}
export function formatStorage(dto: UserDTO): string {
  const max = dto.maxStorageSize;
  const storGb = dto.limits?.storageGb;
  const storSize = dto.limits?.storageSize;
  if (max != null && toNumber(max) > 0)
    return `${convertByteToUnit(max, "GB")} GB`;
  if (storGb != null && toNumber(storGb) > 0) return `${toNumber(storGb)} GB`;
  if (storSize != null && toNumber(storSize) > 0)
    return `${convertByteToUnit(storSize, "GB")} GB`;
  return "無制限";
}
export function formatLimits(dto: UserDTO): string {
  return `CPU: ${formatCpu(dto)}, メモリ: ${formatMemory(
    dto
  )}, ストレージ: ${formatStorage(dto)}`;
}

export function useUserManagement() {
  const { data, pending, error, refresh } = useAsyncData<UserDTO[]>(
    "users-list",
    () => $fetch("/api/users")
  );

  const columns = [
    { key: "account", label: "アカウント名", align: "left" as const },
    { key: "email", label: "メールアドレス", align: "left" as const },
    { key: "limitsText", label: "最大リソース", align: "left" as const },
    { key: "lastLoginText", label: "最終ログイン", align: "left" as const },
  ];

  // 他コンポーネントと命名規則を合わせて key を明示
  
  const headerButtons = [
    { key: "create", label: "＋ 利用者追加", primary: true },
  ];

  const rows = computed<UserRow[]>(() =>
    (data.value ?? []).map((u) => {
      // accountName や name のどちらが来ても表示できるようにフォールバック
      const account = (u as any).accountName ?? u.name ?? "-";
      return {
        id: u.id,
        name: account,
        account,
        email: u.email ?? "-",
        dto: u,
        limitsText: formatLimits(u),
        lastLoginText: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-",
        description: u.description,
        editUrl: `/users/${encodeURIComponent(u.id)}`,
      };
    })
  );

  return { pending, error, columns, headerButtons, rows, refresh } as const;
}
