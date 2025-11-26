// app/composables/useUserManagement.ts
import { computed } from "vue";
import { convertByteToUnit } from "@/utils/format";
import { formatDateTime } from "@/utils/date";
import { useResourceList } from "@/composables/useResourceList";
import type { UserResponse as UserDTO } from "~~/shared/types/dto/user";

export const addUserAction = "add-users";
export const editUserAction = "edit-users";
export const deleteUserAction = "delete-users";

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

function toNumber(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function formatCpu(dto: UserDTO): string {
  const cpu = dto.maxCpuCore ?? dto.limits?.cpu;
  return cpu != null ? String(toNumber(cpu) ?? 0) : "無制限";
}

function formatMemory(dto: UserDTO): string {
  const max = dto.maxMemorySize;
  const memGb = dto.limits?.memoryGb;
  const memSize = dto.limits?.memorySize;
  if (max != null && (toNumber(max) ?? 0) > 0)
    return `${convertByteToUnit(max, "GB")} GB`;
  if (memGb != null && (toNumber(memGb) ?? 0) > 0)
    return `${toNumber(memGb)} GB`;
  if (memSize != null && (toNumber(memSize) ?? 0) > 0)
    return `${convertByteToUnit(memSize, "GB")} GB`;
  return "無制限";
}

function formatStorage(dto: UserDTO): string {
  const max = dto.maxStorageSize;
  const storGb = dto.limits?.storageGb;
  const storSize = dto.limits?.storageSize;
  if (max != null && (toNumber(max) ?? 0) > 0)
    return `${convertByteToUnit(max, "GB")} GB`;
  if (storGb != null && (toNumber(storGb) ?? 0) > 0)
    return `${toNumber(storGb)} GB`;
  if (storSize != null && (toNumber(storSize) ?? 0) > 0)
    return `${convertByteToUnit(storSize, "GB")} GB`;
  return "無制限";
}

function formatLimits(dto: UserDTO): string {
  return `CPU: ${formatCpu(dto)}, メモリ: ${formatMemory(
    dto
  )}, ストレージ: ${formatStorage(dto)}`;
}

/** 編集時に渡すための数値正規化（必要な場合にのみ使用） */
export function normalizeUserNumbers(dto?: any): UserDTO | null {
  if (!dto) return null;
  const out: any = { ...dto };
  out.maxCpuCore = toNumber(out.maxCpuCore) ?? out.maxCpuCore;
  out.maxMemorySize = toNumber(out.maxMemorySize) ?? out.maxMemorySize;
  out.maxStorageSize = toNumber(out.maxStorageSize) ?? out.maxStorageSize;
  if (out.limits) {
    out.limits = { ...out.limits };
    out.limits.cpu = toNumber(out.limits.cpu) ?? out.limits.cpu;
    out.limits.memoryGb = toNumber(out.limits.memoryGb) ?? out.limits.memoryGb;
    out.limits.storageGb =
      toNumber(out.limits.storageGb) ?? out.limits.storageGb;
    out.limits.memorySize =
      toNumber(out.limits.memorySize) ?? out.limits.memorySize;
    out.limits.storageSize =
      toNumber(out.limits.storageSize) ?? out.limits.storageSize;
  }
  return out as UserDTO;
}

export function useUserManagement() {
  // 既存の共通リスト取得を利用（useInstanceTypeManagement と同じパターン）
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<UserDTO>("users");

  const columns = [
    { key: "account", label: "アカウント名", align: "left" as const },
    { key: "email", label: "メールアドレス", align: "left" as const },
    { key: "limitsText", label: "最大リソース", align: "left" as const },
    { key: "lastLoginText", label: "最終ログイン", align: "left" as const },
  ];

  const headerButtons = [
    { action: "add", label: "＋ 利用者追加", primary: true },
  ];

  const rows = computed<UserRow[]>(() =>
    (rawList.value ?? []).map((u) => {
      const account = (u as any).accountName ?? u.name ?? "-";
      const normalized = normalizeUserNumbers(u) ?? u;
      return {
        id: u.id,
        name: account,
        account,
        email: u.email ?? "-",
        dto: normalized,
        limitsText: formatLimits(normalized),
        lastLoginText: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-",
        description: u.description,
        editUrl: `/users/${encodeURIComponent(u.id)}`,
      };
    })
  );

  return { pending, error, columns, headerButtons, rows, refresh } as const;
}
