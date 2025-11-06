import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import { convertByteToUnit } from "./../utils/format";
import { formatDateTime } from "./../utils/date";

type RawInstanceType = {
  id: string;
  name: string;
  createdAt: string;
  cpuCore?: number;
  cpuCores?: number;
  memorySize: number; // bytes
};

export type InstanceTypeRow = {
  id: string;
  name: string;
  vcpu: number;
  memoryMb: number; // MB 表示
  description?: string;
  createdAtText?: string;
};

export function useInstanceTypeManagement() {
  const { addToast } = useToast();

  const columns = [
    { key: "name", label: "名前", align: "left" },
    { key: "vcpu", label: "vCPU", align: "right" },
    { key: "memoryMb", label: "メモリ (MB)", align: "right" },
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
    (rawList.value ?? []).map((r) => {
      // cpu のキー名が不確実なので両方に対応
      const vcpu =
        typeof r.cpuCore === "number"
          ? r.cpuCore
          : typeof r.cpuCores === "number"
          ? r.cpuCores
          : 0;
      return {
        id: r.id,
        name: r.name,
        vcpu,
        memoryMb: convertByteToUnit(r.memorySize ?? 0, "MB"),
        description: "",
        createdAtText: formatDateTime(r.createdAt),
      };
    })
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

  function openEditModal(row: InstanceTypeRow) {
    editingTarget.value = row;
    activeModal.value = "edit-instance-type";
  }

  function promptForDeletion(row: InstanceTypeRow) {
    targetForDeletion.value = row;
    activeModal.value = "delete-instance-type";
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
      if (typeof addToast === "function")
        addToast({ type: "success", message: "削除しました。" });
      await refresh();
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
