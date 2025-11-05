// app/composables/useInstanceTypeManagement.ts
import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";

type RawInstanceType = {
  id: string;
  name: string;
  createdAt: string;
  cpuCores: number;
  memorySize: number; // bytes
  storageSize: number; // bytes
};

export type InstanceTypeRow = {
  id: string;
  name: string;
  vcpu: number;
  memoryGb: number;
  diskGb: number;
  description?: string;
  createdAtText?: string;
};

const GB = 1024 * 1024 * 1024;
const toGb = (b: number) => Math.round(b / GB);
const p2 = (n: number) => String(n).padStart(2, "0");
const toText = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(
    d.getHours()
  )}:${p2(d.getMinutes())}`;
};

export function useInstanceTypeManagement() {
  const { addToast } = useToast();

  const columns = [
    { key: "name", label: "名前", align: "left" },
    { key: "vcpu", label: "vCPU", align: "right" },
    { key: "memoryGb", label: "メモリ", align: "right" },
    { key: "diskGb", label: "ストレージ", align: "right" },
    { key: "createdAtText", label: "作成日時", align: "left" },
  ];

  const headerButtons = [
    {
      action: "add-instance-type",
      label: "インスタンスタイプ追加",
      variant: "primary",
    },
  ];

  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useAsyncData<RawInstanceType[]>(
    "instance-types:list",
    () => $fetch<RawInstanceType[]>("/api/instance-types"),
    { immediate: true }
  );

  const displayInstanceTypes = computed<InstanceTypeRow[]>(() =>
    (rawList.value ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      vcpu: r.cpuCores,
      memoryGb: toGb(r.memorySize),
      diskGb: toGb(r.storageSize),
      description: "",
      createdAtText: toText(r.createdAt),
    }))
  );

  const activeModal = ref<
    null | "add-instance-type" | "delete-instance-type" | "edit-instance-type"
  >(null);
  const targetForDeletion = ref<InstanceTypeRow | null>(null);
  const editingTarget = ref<InstanceTypeRow | null>(null);
  const isDeleting = ref(false);
  const isDeletingId = ref<string | null>(null);

  function handleDashboardHeaderAction(key: string) {
    if (key === "add-instance-type") activeModal.value = "add-instance-type";
  }

  const router = (() => {
    try {
      return useRouter();
    } catch {
      return null;
    }
  })();

  async function openEdit(row: InstanceTypeRow) {
    const path = `/instance-type/${encodeURIComponent(row.id)}`;
    const nav = (globalThis as any).navigateTo;
    if (typeof nav === "function") {
      try {
        nav(path);
        return;
      } catch {}
    }
    try {
      if (router?.push) {
        await router.push(path);
        return;
      }
    } catch {}
    window.location.href = path;
  }

  function promptForDeletion(row: InstanceTypeRow) {
    targetForDeletion.value = row;
    activeModal.value = "delete-instance-type";
  }

  function openEditModal(row: InstanceTypeRow) {
    editingTarget.value = row;
    activeModal.value = "edit-instance-type";
  }

  function cancelAction() {
    activeModal.value = null;
    targetForDeletion.value = null;
    editingTarget.value = null;
    isDeleting.value = false;
    isDeletingId.value = null;
  }

  function closeModal() {
    activeModal.value = null;
    editingTarget.value = null;
  }

  async function handleEditSuccess() {
    closeModal();
    await refresh();
  }

  async function handleDelete() {
    if (!targetForDeletion.value) return;
    const id = targetForDeletion.value.id;
    try {
      isDeleting.value = true;
      isDeletingId.value = id;
      await $fetch(`/api/instance-types/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      // 成功トースト（addToast が関数であることを確認してから呼ぶ）
      if (typeof addToast === "function") {
        addToast({ type: "success", message: "削除しました。" });
      }
      await refresh();
      // モーダルを閉じる
      cancelAction();
    } catch (e: any) {
      console.error("handleDelete error:", e);
      if (typeof addToast === "function") {
        addToast({
          type: "error",
          message: "削除に失敗しました。",
          details: e?.data?.message ?? e?.message ?? String(e),
        });
      }
    } finally {
      isDeleting.value = false;
      isDeletingId.value = null;
    }
  }

  async function handleAddSuccess() {
    closeModal();
    await refresh();
  }

  if (process?.dev) {
    watchEffect(() => {
      if (error?.value)
        console.error("[instance-types] fetch error:", error.value);
    });
  }

  return {
    columns,
    headerButtons,
    displayInstanceTypes,
    activeModal,
    targetForDeletion,
    editingTarget,
    isDeleting,
    isDeletingId,
    handleDashboardHeaderAction,
    openEdit,
    openEditModal,
    promptForDeletion,
    cancelAction,
    handleDelete,
    closeModal,
    handleAddSuccess,
    handleEditSuccess,
    pending,
    refresh,
  } as const;
}
