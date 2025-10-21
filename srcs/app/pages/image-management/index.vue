<!-- pages/image-management/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import DashboardLayout from "~/components/DashboardLayout.vue";
import MoImageAdd from "~/components/MoImageAdd.vue";

/* ===== 型 ===== */
type ImageId = string;
interface VirtualMachineImage {
  id: ImageId;
  name: string;
  description?: string;
  createdAt: string; // ISO8601
  size: number; // bytes
}
interface TableRow {
  id: ImageId;
  name: string;
  size: string; // human readable
  createdAt: string; // YYYY-MM-DD
}

/* ===== テーブル定義（ケバブ＝row-actions を使う） ===== */
const columns = [
  { key: "name", label: "イメージ名" },
  { key: "size", label: "サイズ" },
  { key: "createdAt", label: "登録日" },
  { key: "actions", label: "操作" }, // DashboardLayout 側でケバブが出る列
] as const;

const HEADER_BUTTONS = [{ label: "イメージ追加", action: "add" }] as const;
const ROW_ACTIONS = [
  { label: "詳細", action: "detail" },
  { label: "削除", action: "delete" },
] as const;

/* ===== 状態 ===== */
const rows = ref<TableRow[]>([]);
const isLoading = ref(false);

/* MoImageAdd（どの実装でも確実に開くよう両対応） */
const isAddOpen = ref(false);
const addModalRef = ref<any>(null);

/* ===== Util ===== */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}
function toHumanSize(bytes: number): string {
  if (!Number.isFinite(bytes)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0,
    v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 10 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}${
    units[i]
  }`;
}
function toYMD(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ===== API ===== */
async function reloadImages() {
  isLoading.value = true;
  try {
    const data = await $fetch<VirtualMachineImage[]>("/api/images", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    rows.value = (data || []).map((x) => ({
      id: x.id,
      name: x.name,
      size: toHumanSize(x.size),
      createdAt: toYMD(x.createdAt),
    }));
  } catch (e: any) {
    alert(
      `イメージ一覧の取得に失敗しました：${e?.data?.message ?? e?.message ?? e}`
    );
  } finally {
    isLoading.value = false;
  }
}
async function showDetail(id: ImageId) {
  try {
    const img = await $fetch<VirtualMachineImage>(`/api/images/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    alert(
      `ID: ${img.id}\n名前: ${img.name}\n説明: ${img.description ?? "—"}\n` +
        `サイズ: ${toHumanSize(img.size)} (${img.size} bytes)\n登録日: ${toYMD(
          img.createdAt
        )}`
    );
  } catch (e: any) {
    alert(`詳細取得に失敗しました：${e?.data?.message ?? e?.message ?? e}`);
  }
}
async function deleteImage(id: ImageId, name: string) {
  if (!confirm(`${name} を削除しますか？`)) return;
  try {
    await $fetch<void>(`/api/images/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    alert("削除しました。");
    await reloadImages();
  } catch (e: any) {
    alert(`削除に失敗しました：${e?.data?.message ?? e?.message ?? e}`);
  }
}
async function createImage(payload: {
  name: string;
  description?: string;
  fileBase64: string;
}) {
  try {
    const form = new FormData();
    form.append("name", payload.name);
    if (payload.description) form.append("description", payload.description);
    // 仕様：base64 文字列を file フィールドに格納
    form.append("file", payload.fileBase64);

    await $fetch<VirtualMachineImage>("/api/images", {
      method: "POST",
      headers: getAuthHeaders(), // Content-Type は FormData に任せる
      body: form,
    });
    alert("イメージを作成しました。");
    isAddOpen.value = false;
    addModalRef.value?.close?.();
    await reloadImages();
  } catch (e: any) {
    alert(`イメージ作成に失敗しました：${e?.data?.message ?? e?.message ?? e}`);
  }
}

/* ===== イベント（両表記対応＋stop 修飾で確実に届く） ===== */
function onHeaderAction(action: string) {
  if (action !== "add") return;
  // どの実装でも開く：v-model系/メソッド系 両対応
  isAddOpen.value = true;
  addModalRef.value?.open?.();
}
function onRowAction(payload: { action: string; row: TableRow }) {
  const { action, row } = payload || ({} as any);
  if (!row) return;
  if (action === "detail") showDetail(row.id);
  if (action === "delete") deleteImage(row.id, row.name);
}
function onAddSubmit(e: {
  name: string;
  description?: string;
  fileBase64: string;
}) {
  createImage(e);
}

onMounted(reloadImages);
</script>

<template>
  <div class="image-page-root">
    <DashboardLayout
      title="イメージ管理ダッシュボード"
      :columns="columns"
      :rows="rows"
      rowKey="id"
      :headerButtons="HEADER_BUTTONS"
      :rowActions="ROW_ACTIONS"
      @header-action.stop="onHeaderAction"
      @headerAction.stop="onHeaderAction"
      @row-action.stop="onRowAction"
      @rowAction.stop="onRowAction"
    >
      <!-- ケバブメニューに差し込む中身。emit は DashboardLayout 側が渡す想定 -->
      <template #row-actions="{ emit }">
        <button type="button" class="menu-item" @click.stop="emit('detail')">
          詳細を表示
        </button>
        <button
          type="button"
          class="menu-item--danger"
          @click.stop="emit('delete')"
        >
          削除
        </button>
      </template>

      <!-- 読み込み表示（任意） -->
      <template v-if="isLoading" #footer>
        <div class="px-4 py-3 text-slate-500">読み込み中…</div>
      </template>
    </DashboardLayout>

    <!-- 追加モーダル：あらゆる開閉方式に対応 -->
    <MoImageAdd
      ref="addModalRef"
      v-model:open="isAddOpen"
      :model-value="isAddOpen"
      :open="isAddOpen"
      :is-open="isAddOpen"
      @update:modelValue="(v:boolean)=>isAddOpen=v"
      @update:open="(v:boolean)=>isAddOpen=v"
      @update:isOpen="(v:boolean)=>isAddOpen=v"
      @close="isAddOpen = false"
      @cancel="isAddOpen = false"
      @submit="onAddSubmit"
    />
  </div>
</template>

<style scoped>
/* --- ケバブのポップオーバーがスクロール領域に切られないよう保険 --- */
.image-page-root {
  overflow: visible;
}

/* DashboardLayout 内部のスクロールラッパを想定した緩めの対策 */
:deep(.overflow-x-auto) {
  overflow-y: visible;
}

/* 代表的なポップオーバークラス名への z-index ブースト（存在すれば効く） */
:deep(.menu-popover),
:deep(.dropdown-menu),
:deep(.context-menu),
:deep(.row-actions-popover) {
  z-index: 70 !important;
}

/* メニュー項目の見た目（あなたの既存テーマに寄せた最小） */
.menu-item {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200;
}
.menu-item--danger {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold text-red-600 hover:bg-[#fff1f1] border-t border-slate-200;
}
</style>
