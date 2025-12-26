import { computed, onMounted, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { MACHINE } from "@/utils/constants";
import { createPolling } from "@/utils/polling";
import { calculateTotalStorage } from "@/utils/status";
import { convertByteToUnit } from "@/utils/format";

export type VirtualMachineRow = VirtualMachineResponse & {
  totalStorageGB: number;
  specText: string;
  cpuUsageText: string;
  cpuUtilizationPercent: number;
  memoryUsageText: string;
  memoryUtilizationPercent: number;
};

export function useVMachineManagement() {
  const {
    data: virtualMachines,
    pending,
    refresh,
    error,
  } = useResourceList<VirtualMachineResponse>(MACHINE.name);

  // --- ポーリング設定 ---
  const { startPolling, stopPolling, runOnce, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    }
  );

  // マウント時に即時実行し、その後ポーリング開始。アンマウント時に停止。
  onMounted(() => {
    void runOnce();
    startPolling();
  });

  onUnmounted(() => {
    stopPolling();
  });

  const columns = [
    { key: "name", label: "仮想マシン名", align: "left" as const },
    { key: "status", label: "状態", align: "left" as const },
    {
      key: "instanceType",
      label: "スペック (CPU/メモリ)",
      align: "left" as const,
    },
    { key: "storage", label: "ストレージ", align: "right" as const },
    { key: "node", label: "配置ノード", align: "left" as const },
    { key: "createdAt", label: "作成日時", align: "left" as const },
    { key: "cpu", label: "CPU使用率", align: "right" as const },
    { key: "memory", label: "メモリ使用率", align: "right" as const },
  ];

  const headerButtons = [{ label: "新規作成", action: "create" }];

  const CREATE_VIRTUAL_MACHINE_ACTION = `create-${MACHINE.name}`;
  const EDIT_VIRTUAL_MACHINE_ACTION = `edit-${MACHINE.name}`;
  const DELETE_VIRTUAL_MACHINE_ACTION = `delete-${MACHINE.name}`;

  const rows = computed<VirtualMachineRow[]>(() =>
    (virtualMachines.value ?? []).map((vm) => {
      const memoryMB = convertByteToUnit(vm.memorySize, "MB");
      const specText =
        vm.cpuCore !== undefined && vm.memorySize !== undefined
          ? `${vm.cpuCore} cores / ${memoryMB} MB`
          : "-";

      // CPU使用率の計算：cpuCore がコア数、cpuUtilization が 0-1 の値
      const cpuUsedCores = (vm.cpuUtilization ?? 0) * (vm.cpuCore ?? 0);
      const cpuUsageText = `${cpuUsedCores.toFixed(1)} Cores / ${
        vm.cpuCore ?? 0
      } Cores`;
      const cpuUtilizationPercent = Math.round((vm.cpuUtilization ?? 0) * 100);

      // メモリ使用率の計算：memorySize（バイト）から MB に変換
      const memoryTotalMB = convertByteToUnit(vm.memorySize, "MB");
      const memoryUsedMB = (vm.memoryUtilization ?? 0) * memoryTotalMB;
      const memoryUsageText = `${memoryUsedMB.toFixed(
        1
      )} MB / ${memoryTotalMB} MB`;
      const memoryUtilizationPercent = Math.round(
        (vm.memoryUtilization ?? 0) * 100
      );

      return {
        ...vm,
        totalStorageGB: calculateTotalStorage(vm.storages),
        specText,
        cpuUsageText,
        cpuUtilizationPercent,
        memoryUsageText,
        memoryUtilizationPercent,
      };
    })
  );

  return {
    columns,
    headerButtons,
    rows,
    pending,
    error,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    CREATE_VIRTUAL_MACHINE_ACTION,
    EDIT_VIRTUAL_MACHINE_ACTION,
    DELETE_VIRTUAL_MACHINE_ACTION,
  } as const;
}
