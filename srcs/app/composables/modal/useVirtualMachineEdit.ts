/**
 * =================================================================================
 * 仮想マシン編集モーダル Composable (useVirtualMachineEdit.ts)
 * ---------------------------------------------------------------------------------
 * 汎用 Composable (useResourceUpdate, useToast) を活用した最終版
 * =================================================================================
 */
import { ref, computed, watch, markRaw } from "vue";
import { useToast } from "~/composables/useToast"; //
import { useAsyncData } from "#app";

// ★ 汎用更新 Composable をインポート
import { useResourceUpdate } from "~/composables/useResourceEdit"; //

// ★ 型定義 (virtual-machines.ts を参照)
import type {
  VirtualMachineDTO,
  VirtualMachineUpdateRequestDTO,
  AttachedStorageDTO,
  NetworkInterfaceDTO,
  VirtualStorageDTO, // createdAt を渡すために使用
} from "~~/shared/types/virtual-machines"; //
import type { ModelInstanceTypeDTO } from "~~/shared/types/instance-types"; //

// ★ タブコンポーネント
import VmEditTabGeneral from "~/components/vm-edit-tabs/VmEditTabGeneral.vue"; //
import VmEditTabConfig from "~/components/vm-edit-tabs/VmEditTabConfig.vue"; //
import VmEditTabNetwork from "~/components/vm-edit-tabs/VmEditTabNetwork.vue"; //

// (Props, TabComponent インターフェースは変更なし)
interface Props {
  show: boolean;
  vmId: string | null;
}
interface TabComponent {
  validate: () => Promise<{ valid: boolean }>;
  values: Record<string, any>;
  meta: { valid: boolean };
}

/**
 * メインのComposable関数
 */
export function useVirtualMachineEdit(props: Props) {
  //
  const { addToast } = useToast(); //

  // --- State ---
  const currentTab = ref(0); //
  const tabRefs = ref<TabComponent[]>([]); //
  const submitError = ref<string | null>(null); //

  // ============================================================================
  // API Data Fetching (VM詳細データ取得)
  // ★ (L56, L66 エラー修正) useAsyncData の構文を修正
  // ============================================================================
  const asyncDataKey = computed(() => `vm-detail-${props.vmId || "new"}`);
  const {
    data: vmData,
    pending,
    error,
    /**
     * ★ (reloadData エラー修正)
     * 'refresh' を 'reloadData' という名前にリネーム（エイリアス）して取り出す
     */
    refresh: reloadData,
  } = useAsyncData<VirtualMachineDTO | null>(
    asyncDataKey, // 1. Key
    async () => {
      // 2. Handler (API fetch logic)
      const currentVmId = props.vmId;
      if (!currentVmId) return null;
      try {
        return await $fetch<VirtualMachineDTO>(
          `/api/virtual-machines/${currentVmId}`
        );
      } catch (fetchError: any) {
        throw createError({
          statusCode: fetchError.statusCode || 500,
          statusMessage:
            fetchError.data?.message || "VM情報の取得に失敗しました。",
          fatal: false,
        });
      }
    },
    {
      // 3. Options
      immediate: false, // watch で手動実行する
      server: false,
      watch: [], // キーの変更で自動実行しない
    }
  );

  // --- Tabs ---
  const tabs = ref([
    { name: "概要", component: markRaw(VmEditTabGeneral) }, //
    { name: "構成", component: markRaw(VmEditTabConfig) }, //
    { name: "ネットワーク", component: markRaw(VmEditTabNetwork) }, //
  ]);
  const modalTitle = computed(() =>
    vmData.value ? `仮想マシン編集: ${vmData.value.name}` : "仮想マシン編集"
  ); //

  const prevTab = () => {
    if (currentTab.value > 0) currentTab.value--;
  }; //
  const nextTab = async () => {
    //
    const currentTabComponent = tabRefs.value[currentTab.value];
    if (
      currentTabComponent &&
      typeof currentTabComponent.validate === "function"
    ) {
      const { valid } = await currentTabComponent.validate();
      if (!valid) {
        addToast({
          //
          type: "warning",
          message: "現在のタブに入力エラーがあります。",
        });
        return;
      }
    }
    if (currentTab.value < tabs.value.length - 1) currentTab.value++;
  };
  const setTabRef = (index: number) => (el: any) => {
    if (el) tabRefs.value[index] = el as TabComponent;
  }; //

  /**
   * isValid の戻り値は void ではなく boolean でなければなりません。
   * (MoVirtualMachineEdit.vue で v-if="!isValid(index)" のように使われるため)
   */
  const isValid = (index: number): boolean => {
    //
    const tab = tabRefs.value[index];
    if (tab?.meta) return tab.meta.valid;
    return true; // 参照がまだない場合はOKとみなす
  };

  // --- Initialization ---
  watch(
    () => props.show,
    (isVisible) => {
      //
      if (isVisible && props.vmId) {
        if (error.value) error.value = null;
        // ★ 正しくエイリアスされた reloadData() を呼ぶ
        if (!pending.value) reloadData();
        currentTab.value = 0;
        submitError.value = null;
        tabRefs.value = [];
      } else if (!isVisible) {
        vmData.value = null;
        if (error.value) error.value = null;
      }
    },
    { immediate: false }
  );

  /**
   * ★ (実装補完 & createdAt 修正)
   * 子コンポーネントに props として渡すための初期値データを整形する
   */
  const getInitialDataForTab = (index: number) => {
    //
    if (!vmData.value) return undefined;
    const data = vmData.value;
    try {
      if (index === 0) {
        // --- 概要タブ ---
        return {
          name: data.name,
          nodeId: data.node?.id || null,
        };
      }
      if (index === 1) {
        // --- 構成タブ ---
        const memorySizeGiB =
          (data.instanceType?.memorySize || data.memorySize || 0) /
          (1024 * 1024 * 1024);
        const storagesGiB = (data.attachedStorages || []).map((s) => {
          const storage = s.storage as VirtualStorageDTO; // 型アサーション
          return {
            id: storage.id, //
            name: storage.name, //
            size: Math.round(storage.size / (1024 * 1024 * 1024)), // Byte to GiB
            poolId: storage.poolId, //
            type: s.path === "/dev/sda" ? "os" : "manual", //
            /**
             * ★ (createdAt エラー修正)
             * フォームに createdAt も渡す
             */
            createdAt: storage.createdAt, //
          };
        });
        return {
          instanceTypeId: data.instanceType?.id || null,
          cpuCores: data.instanceType?.cpuCore || data.cpuCore || 0,
          memorySize: Math.round(memorySizeGiB),
          storages: storagesGiB,
        };
      }
      if (index === 2) {
        // --- ネットワークタブ ---
        const nicsData = (data.attachedNics || []).map((nic) => ({
          id: nic.id, //
          subnetId: nic.subnetId || null, //
          name: nic.name, //
          macAddress: nic.macAddress, //
          ipAddress: nic.ipAddress, //
        }));
        return {
          nics: nicsData,
          securityGroupIds: (data.securityGroups || []).map((sg) => sg.id),
        };
      }
    } catch (err: any) {
      console.error(`Error preparing initial data for tab ${index}:`, err);
      error.value = new Error(
        `タブ ${index + 1} の初期化に失敗しました: ${err.message}`
      );
    }
    return undefined;
  };

  // ★ useResourceUpdate をインスタンス化
  const {
    executeUpdate,
    isUpdating: isSubmitting, // isUpdating を isSubmitting にリネーム
  } = useResourceUpdate<
    VirtualMachineUpdateRequestDTO, // TPayload
    VirtualMachineDTO // TResponse
  >("virtual-machines"); // resourceName

  // ============================================================================
  // API Submission (更新処理) ★ useResourceUpdate を活用
  // ============================================================================
  const handleSubmit = async (emit: (event: "success" | "close") => void) => {
    //
    submitError.value = null; //

    // 1. バリデーション (変更なし)
    const validationPromises = tabRefs.value.map((tab) =>
      tab?.validate ? tab.validate() : Promise.resolve({ valid: true })
    );
    const validationResults = await Promise.all(validationPromises);
    if (validationResults.some((result) => !result.valid)) {
      addToast({
        type: "warning",
        message: "現在のタブに入力エラーがあります。",
      }); //
      const firstInvalidTabIndex = validationResults.findIndex((r) => !r.valid);
      if (firstInvalidTabIndex !== -1) currentTab.value = firstInvalidTabIndex;
      return;
    }

    // 2. ペイロード構築 (変更なし)
    const generalValues = tabRefs.value[0]?.values || {};
    const configValues = tabRefs.value[1]?.values || {};
    const networkValues = tabRefs.value[2]?.values || {};

    const payload: VirtualMachineUpdateRequestDTO = {
      //
      name: generalValues.name,
      instanceType: configValues.instanceTypeId
        ? ({ id: configValues.instanceTypeId } as ModelInstanceTypeDTO)
        : undefined,
      cpuCore: configValues.instanceTypeId ? undefined : configValues.cpuCores,
      memorySize: configValues.instanceTypeId
        ? undefined
        : configValues.memorySize * 1024 * 1024 * 1024,
      attachedStorages: (configValues.storages || []).map(
        (s: any): AttachedStorageDTO => ({
          id: s.id,
          storage: {
            id: s.id,
            name: s.name,
            size: s.size * 1024 * 1024 * 1024, // GiB to Bytes
            poolId: s.poolId,
            /**
             * ★ (createdAt エラー修正)
             * フォームから受け取った createdAt を "横流し" する
             */
            createdAt: s.createdAt, //
          } as VirtualStorageDTO, // 型アサーション
          path: s.type === "os" ? "/dev/sda" : "/dev/vdb",
        })
      ),
      attachedNics: (networkValues.nics || []).map(
        (n: any): NetworkInterfaceDTO => ({
          id: n.id,
          subnetId: n.subnetId,
          name: n.name,
          macAddress: n.macAddress,
          ipAddress: n.ipAddress,
        })
      ),
      securityGroupIds: networkValues.securityGroupIds || [],
    };

    // 3. ★ 更新実行 (useResourceUpdate を使用)
    if (!props.vmId) {
      submitError.value = "VM ID が見つかりません。";
      return;
    }
    const result = await executeUpdate(props.vmId, payload); //

    // 4. ★ 結果ハンドリング
    if (result.success && result.data) {
      // --- 成功 ---
      const updatedVm = result.data;
      addToast({
        //
        type: "success",
        message: `仮想マシン「${updatedVm.name}」を更新しました。`,
      });
      emit("success");
      emit("close");
    } else if (result.error) {
      // --- 失敗 ---
      console.error("Failed to update VM:", result.error); //
      const errorMessage =
        result.error.message || "更新処理中にエラーが発生しました。"; //
      submitError.value = errorMessage; //
      addToast({
        //
        type: "error",
        message: "仮想マシンの更新に失敗しました。",
        details: errorMessage,
      });
    }
  };

  // ============================================================================
  // Expose (外部への公開)
  // ============================================================================
  return {
    vmData,
    pending,
    error,
    reloadData, // ★ 正しくエイリアスされた reloadData
    tabs,
    currentTab,
    modalTitle,
    prevTab,
    nextTab,
    setTabRef,
    isValid,
    handleSubmit,
    isSubmitting, // ★ useResourceUpdate からの ref
    submitError,
    getInitialDataForTab,
  };
}
