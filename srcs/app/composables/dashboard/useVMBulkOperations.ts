import { ref, onMounted, onUnmounted, watch } from "vue";
import { useToast } from "~/composables/useToast";
import { useApiClient } from "~/composables/useResourceClient";
import { useModal } from "~/composables/useModal";
import {
  MACHINE,
  VM_ACTION_CONFIRMATION,
  VM_ACTION_SUCCESS,
} from "@/utils/constants";

type VmActionResponse = {
  message: string;
  data: { id: string; status?: VirtualMachineResponse["status"] };
};

type ConfirmDialogState = {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  actionValue: string;
  vmId: string;
};

type AlertDialogState = {
  show: boolean;
  title: string;
  message: string;
};

/**
 * VM一覧画面での一括操作（チェックボックス選択、起動/停止/シャットダウン/再起動/リセット）を管理
 */
export function useVMBulkOperations() {
  const { addToast } = useToast();
  const apiClient = useApiClient();
  const { activeModal } = useModal();

  // チェックボックス選択
  const selectedVmIds = ref<string[]>([]);
  const showActionMenu = ref(false);

  const toggleVmSelection = (vmId: string) => {
    const index = selectedVmIds.value.indexOf(vmId);
    index > -1
      ? selectedVmIds.value.splice(index, 1)
      : selectedVmIds.value.push(vmId);
  };

  const clearSelection = () => {
    selectedVmIds.value = [];
  };

  const toggleActionMenu = () => {
    showActionMenu.value = !showActionMenu.value;
  };

  const closeActionMenu = () => {
    showActionMenu.value = false;
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".action-menu-container")) {
      showActionMenu.value = false;
    }
  };

  onMounted(() => document.addEventListener("click", handleClickOutside));
  onUnmounted(() => document.removeEventListener("click", handleClickOutside));

  // モーダルが開いたら操作メニューを閉じる
  watch(activeModal, (newVal) => {
    if (newVal !== null) {
      closeActionMenu();
    }
  });

  // ダイアログ管理
  const confirmDialog = ref<ConfirmDialogState>({
    show: false,
    title: "",
    message: "",
    confirmText: "確認",
    actionValue: "",
    vmId: "",
  });

  const alertDialog = ref<AlertDialogState>({
    show: false,
    title: "",
    message: "",
  });

  const closeConfirmDialog = () => {
    Object.assign(confirmDialog.value, {
      show: false,
      actionValue: "",
      vmId: "",
    });
  };

  const closeAlertDialog = () => {
    alertDialog.value.show = false;
  };

  const showAlert = (title: string, message: string) => {
    Object.assign(alertDialog.value, { show: true, title, message });
  };

  // VM操作
  const callVmAction = (vmId: string, actionValue: string) =>
    apiClient.post<VmActionResponse>(`${MACHINE.name}/${vmId}/${actionValue}`, {
      action: actionValue,
    });

  const executeVmAction = async (vmId: string, actionValue: string) => {
    try {
      const res = await callVmAction(vmId, actionValue);
      addToast({
        message:
          VM_ACTION_SUCCESS[actionValue as keyof typeof VM_ACTION_SUCCESS] ??
          res.message,
        type: "success",
      });
      return true;
    } catch (e) {
      console.error("VM操作失敗:", actionValue, e);
      addToast({ message: "操作に失敗しました", type: "error" });
      return false;
    }
  };

  const executeBulkVmAction = async (
    vmIds: string[],
    actionValue: string
  ): Promise<{ successCount: number; failCount: number }> => {
    const results = await Promise.allSettled(
      vmIds.map((vmId) => callVmAction(vmId, actionValue))
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.length - successCount;

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("VM操作失敗:", vmIds[index], actionValue, result.reason);
      }
    });

    if (successCount > 0) {
      const message =
        VM_ACTION_SUCCESS[actionValue as keyof typeof VM_ACTION_SUCCESS];
      addToast({
        message: `${successCount}台のVMを${
          message?.replace("VMを", "") ?? "操作しました"
        }`,
        type: "success",
      });
    }
    if (failCount > 0) {
      addToast({
        message: `${failCount}台のVMの操作に失敗しました`,
        type: "error",
      });
    }

    return { successCount, failCount };
  };

  const showBulkActionConfirm = (
    actionValue: string,
    vmNames: string[],
    vmCount: number
  ) => {
    const config =
      VM_ACTION_CONFIRMATION[
        actionValue as keyof typeof VM_ACTION_CONFIRMATION
      ];
    if (!config) return false;

    Object.assign(confirmDialog.value, {
      show: true,
      title: config.title,
      message: `以下の${vmCount}台の仮想マシンを${config.confirmText.replace(
        "する",
        ""
      )}します：\n\n${vmNames.join("、")}\n\n${config.message}`,
      confirmText: config.confirmText,
      actionValue,
      vmId: "",
    });
    return true;
  };

  return {
    selectedVmIds,
    showActionMenu,
    toggleVmSelection,
    clearSelection,
    toggleActionMenu,
    closeActionMenu,
    confirmDialog,
    alertDialog,
    confirmationConfig: VM_ACTION_CONFIRMATION,
    actionSuccessMessage: VM_ACTION_SUCCESS,
    closeConfirmDialog,
    closeAlertDialog,
    executeVmAction,
    executeBulkVmAction,
    showBulkActionConfirm,
    showAlert,
  };
}
