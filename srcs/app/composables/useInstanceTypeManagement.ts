// app/composables/useInstanceTypeManagement.ts
import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { usePageActions } from "@/composables/usePageActions";
import { useResourceDelete } from "@/composables/useResourceDelete";
import { useResourceList } from "@/composables/useResourceList";
import { formatDateTime } from "~/utils/date";

type RawInstanceType = {
  id: string;
  name: string;
  createdAt: string;
  cpuCores?: number;
  cpuCore?: number;
  memorySize: number; // bytes（保持はそのまま。表示は画面側で MB 変換）
};

export type InstanceTypeRow = {
  id: string;
  name: string;
  vcpu: number;
  memorySize: number; // bytes を保持
  description?: string;
  createdAtText?: string;
};

export function useInstanceTypeManagement() {
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<RawInstanceType>("instance-types");

  const pageActions = usePageActions<InstanceTypeRow>({
    resourceName: "instance-types",
    resourceLabel: "インスタンスタイプ",
    refresh,
  });

  const activeModal = pageActions.activeModal ?? ref<string | null>(null);
  const openModal = pageActions.openModal ?? ((_key: string) => {});
  const closeModal = pageActions.close ?? pageActions.closeModal ?? (() => {});
  const targetForDeletion =
    pageActions.targetForDeletion ?? ref<InstanceTypeRow | null>(null);
  const targetForEditing =
    pageActions.targetForEditing ?? ref<InstanceTypeRow | null>(null);
  const isDeleting = pageActions.isDeleting ?? ref(false);
  const pageExecuteDelete =
    pageActions.executeDelete ?? pageActions.handleDelete ?? undefined;
  const pageHandleSuccess = pageActions.handleSuccess ?? (async () => {});
  const pageCancelAction = pageActions.cancelAction ?? (() => {});

  // 予備の削除実装（pageActions に無い場合）
  const { executeDelete: fallbackDelete, isDeleting: fallbackIsDeleting } =
    useResourceDelete("instance-types");

  const isDeletingId = ref<string | null>(null);

  const columns: Array<{
    key: keyof InstanceTypeRow | "createdAtText";
    label: string;
    align?: "left" | "center" | "right";
  }> = [
    { key: "name", label: "名前", align: "left" },
    { key: "vcpu", label: "vCPU", align: "right" },
    { key: "memorySize", label: "メモリ (MB)", align: "right" },
    { key: "createdAtText", label: "作成日時", align: "left" },
  ];

  const headerButtons = [
    {
      action: "add-instance-type",
      label: "インスタンスタイプ追加",
      variant: "primary",
    },
  ] as const;

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
        memorySize: r.memorySize ?? 0, // 表示側で MB に変換
        description: "",
        createdAtText: formatDateTime(r.createdAt),
      };
    })
  );

  // ルーターは Nuxt/純 Vue 両対応
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
        await nav(path);
        return;
      } catch {
        // noop
      }
    }
    try {
      if (router?.push) {
        await router.push(path);
        return;
      }
    } catch {
      // noop
    }
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
      if (typeof pageExecuteDelete === "function") {
        await pageExecuteDelete(id);
      } else {
        const res = await fallbackDelete(id);
        if (!res.success)
          throw new Error(res.error?.message ?? "delete failed");
      }
      await refresh();
      pageCancelAction();
      await pageHandleSuccess();
    } catch (e) {
      console.error("delete error:", e);
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
    isDeleting: isDeleting ?? fallbackIsDeleting,
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
