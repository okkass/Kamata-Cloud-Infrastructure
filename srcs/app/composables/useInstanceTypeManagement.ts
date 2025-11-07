import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { usePageActions } from "@/composables/usePageActions";
import { formatDateTime } from "./../utils/date";

type RawInstanceType = {
  id: string;
  name: string;
  createdAt: string;
  cpuCores?: number;
  cpuCore?: number;
  memorySize: number; // bytes (そのまま保持)
};

export type InstanceTypeRow = {
  id: string;
  name: string;
  vcpu: number;
  memorySize: number; // bytes をそのまま保持（表示は画面側で MB に変換）
  description?: string;
  createdAtText?: string;
};

export function useInstanceTypeManagement() {
  const isDeletingId = ref<string | null>(null);

  const columns = [
    { key: "name", label: "名前", align: "left" },
    { key: "vcpu", label: "vCPU", align: "right" },
    // テンプレ側で MB に変換して表示する（bytes をそのまま渡す）
    { key: "memorySize", label: "メモリ (MB)", align: "right" },
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

  // usePageActions は refresh を受け取る想定 -> fetch の refresh を渡してから利用
  const pageActions = usePageActions<InstanceTypeRow>({
    resourceName: "instance-types",
    resourceLabel: "インスタンスタイプ",
    refresh,
  });

  // pageActions の戻り値を安全に参照
  const activeModal = (pageActions as any).activeModal ?? ref(null);
  const openModal = (pageActions as any).openModal ?? ((id: string) => {});
  const closeModal = (pageActions as any).closeModal ?? (() => {});
  const targetForDeletion =
    (pageActions as any).targetForDeletion ?? ref<InstanceTypeRow | null>(null);
  const targetForEditing =
    (pageActions as any).targetForEditing ?? ref<InstanceTypeRow | null>(null);
  const isDeleting = (pageActions as any).isDeleting ?? ref(false);
  const pageHandleDelete =
    (pageActions as any).handleDelete ?? (async () => {});
  const pageHandleSuccess =
    (pageActions as any).handleSuccess ?? (async () => {});
  const pageCancelAction = (pageActions as any).cancelAction ?? (() => {});

  const displayInstanceTypes = computed<InstanceTypeRow[]>(() =>
    (rawList.value ?? []).map((r) => {
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
        memorySize: r.memorySize ?? 0, // bytes をそのまま返す
        description: "",
        createdAtText: formatDateTime(r.createdAt),
      };
    })
  );

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
    targetForEditing.value = row;
    openModal("edit-instance-type");
  }

  function promptForDeletion(row: InstanceTypeRow) {
    targetForDeletion.value = row;
    openModal("delete-instance-type");
  }

  const handleDelete = async () => {
    if (!targetForDeletion.value) return;
    const id = targetForDeletion.value.id;
    isDeletingId.value = id;
    try {
      await pageHandleDelete();
    } finally {
      isDeletingId.value = null;
    }
  };

  const cancelAction = () => {
    pageCancelAction();
  };

  const handleAddSuccess = async () => {
    await pageHandleSuccess();
  };

  const handleEditSuccess = async () => {
    await pageHandleSuccess();
  };

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
    editingTarget: targetForEditing,
    isDeleting,
    isDeletingId,
    handleDashboardHeaderAction: (key: string) => {
      if (key === "add-instance-type") openModal("add-instance-type");
    },
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
