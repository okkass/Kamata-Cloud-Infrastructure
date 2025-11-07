/**
 * =================================================================================
 * 仮想マシン編集モーダル Composable (useVirtualMachineEdit.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoVirtualMachineEditコンポーネント（親）で使用される
 * VM詳細データの取得、タブの状態管理、各タブ（子）への初期値データ提供、
 * および最終的な更新APIへの送信ロジックをカプセル化します。
 * =================================================================================
 */
import { ref, computed, watch, markRaw, type Component } from "vue";
import { useToast } from "~/composables/useToast";
import { useAsyncData } from "#app";

// 型定義 (アップロードされたファイルに基づく)
import type {
  VirtualMachineDTO,
  VirtualMachineUpdateRequestDTO,
  AttachedStorageDTO,
  NetworkInterfaceDTO,
} from "~~/shared/types/virtual-machines";
import type { ModelInstanceTypeDTO } from "~~/shared/types/instance-types";

// 各タブのコンポーネント
import VmEditTabGeneral from "~/components/vm-edit-tabs/VmEditTabGeneral.vue";
import VmEditTabConfig from "~/components/vm-edit-tabs/VmEditTabConfig.vue";
import VmEditTabNetwork from "~/components/vm-edit-tabs/VmEditTabNetwork.vue";

// コンポーネントから受け取るPropsの型定義
interface Props {
  show: boolean;
  vmId: string | null;
}

// 各タブコンポーネントが expose すべきメソッド/プロパティの型
interface TabComponent {
  validate: () => Promise<{ valid: boolean }>;
  values: Record<string, any>;
  meta: { valid: boolean };
}

/**
 * メインのComposable関数
 * @param props - コンポーネントから渡されるProps (vmIdを含む)
 */
export function useVirtualMachineEdit(props: Props) {
  const { addToast } = useToast();

  // ============================================================================
  // State (状態管理)
  // ============================================================================
  const currentTab = ref(0);
  const tabRefs = ref<TabComponent[]>([]);
  const isSubmitting = ref(false);
  const submitError = ref<string | null>(null);

  // ============================================================================
  // API Data Fetching (VM詳細データ取得)
  // ============================================================================

  // useAsyncData のキーが props.vmId に依存
  const asyncDataKey = computed(() => `vm-detail-${props.vmId || "new"}`);

  const {
    data: vmData,
    pending,
    error,
    refresh: reloadData, // refresh (強制再取得)
  } = useAsyncData<VirtualMachineDTO | null>( // null も許容
    asyncDataKey, // computed なキーを使用
    async () => {
      // 実行時の vmId を再確認
      const currentVmId = props.vmId;
      if (!currentVmId) {
        console.warn("useVirtualMachineEdit: vmId is null, skipping fetch.");
        return null; // ガード
      }
      try {
        return await $fetch<VirtualMachineDTO>(
          `/api/virtual-machines/${currentVmId}`
        );
      } catch (fetchError: any) {
        console.error("Failed to fetch VM details:", fetchError);
        throw createError({
          statusCode: fetchError.statusCode || 500,
          statusMessage:
            fetchError.data?.message || "VM情報の取得に失敗しました。",
          fatal: false,
        });
      }
    },
    {
      immediate: false,
      server: false,
      /**
       * ★ エラー解決のポイント
       * `watch: []` を指定し、キー(asyncDataKey)の変更による
       * useAsyncData の自動実行を防ぎます。
       * データ取得は props.show の watch 内で `reloadData()` によって明示的に制御します。
       */
      watch: [],
    }
  );

  // ============================================================================
  // Tabs (タブ管理)
  // ============================================================================
  const tabs = ref([
    { name: "概要", component: markRaw(VmEditTabGeneral) as any },
    { name: "構成", component: markRaw(VmEditTabConfig) as any },
    { name: "ネットワーク", component: markRaw(VmEditTabNetwork) as any },
  ]);

  const modalTitle = computed(() =>
    vmData.value ? `仮想マシン編集: ${vmData.value.name}` : "仮想マシン編集"
  );

  // 前のタブへ移動
  const prevTab = () => {
    if (currentTab.value > 0) currentTab.value--;
  };

  // 次のタブへ移動 (バリデーション付き)
  const nextTab = async () => {
    const currentTabComponent = tabRefs.value[currentTab.value];
    if (
      currentTabComponent &&
      typeof currentTabComponent.validate === "function"
    ) {
      const { valid } = await currentTabComponent.validate();
      if (!valid) {
        addToast({
          type: "warning",
          message: "現在のタブに入力エラーがあります。",
        });
        return;
      }
    }
    if (currentTab.value < tabs.value.length - 1) currentTab.value++;
  };

  // タブコンポーネントの参照を設定
  const setTabRef = (index: number) => (el: any) => {
    if (el) tabRefs.value[index] = el as TabComponent;
  };

  // 指定タブのバリデーション状態をチェック
  const isValid = (index: number): boolean => {
    const tab = tabRefs.value[index];
    if (tab?.meta) return tab.meta.valid;
    return true; // 参照がまだない場合はOKとみなす
  };

  // ============================================================================
  // Initialization (データ取得トリガーと初期値提供)
  // ============================================================================

  watch(
    () => props.show,
    (isVisible) => {
      if (isVisible && props.vmId) {
        // モーダルが開かれ、vmId がある場合
        if (error.value) error.value = null; // 既存のエラーをクリア

        /**
         * ★ エラー解決のポイント
         * execute (fetchData) ではなく refresh (reloadData) を呼び出します。
         * これにより、同じ vmId で再度モーダルを開いた場合でも、
         * キャッシュではなく常に最新のデータが取得されます。
         */
        if (!pending.value) reloadData();

        currentTab.value = 0;
        submitError.value = null;
        tabRefs.value = []; // タブ参照をクリア (コンポーネントが再マウントされるため)
      } else if (!isVisible) {
        // モーダルが閉じられたら、取得したデータをリセット
        vmData.value = null;
        // エラーもリセット
        if (error.value) error.value = null;
      }
    },
    {
      /**
       * ★ (修正)
       * immediate: true は不要。
       * コンポーネントマウント時(show=false)に実行されると、
       * else if (!isVisible) が実行され vmData.value = null が呼ばれますが、
       * 意図しない動作を避けるため、モーダル表示状態の変更時のみ実行します。
       */
      immediate: false,
    }
  );

  /**
   * 子コンポーネントに props として渡すための初期値データを整形する
   * (アップロードされたコードから変更なし)
   */
  const getInitialDataForTab = (index: number) => {
    if (!vmData.value) return undefined;
    const data = vmData.value;
    // ... (概要タブ、構成タブ、ネットワークタブの初期値整形ロジック) ...
    // (省略: アップロードされた useVirtualMachineEdit.ts と同様)
    try {
      if (index === 0) {
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
          // ★ s (AttachedStorageDTO) から storage (VirtualStorageDTO) を安全に取得
          // ★ storage が null や undefined の場合、空のオブジェクトをデフォルト値にする
          const storage = s.storage || {};

          return {
            // ★ storage.id が無い場合も考慮
            id: storage.id || s.id, // storage.id がなければ s.id (AttachedStorageDTOのid) を使う
            // ★ storage.name が無い場合も考慮
            name: storage.name || "不明なストレージ",
            // ★ storage.size が無い場合も考慮
            size: Math.round((storage.size || 0) / (1024 * 1024 * 1024)), // Byte to GiB
            // ★ storage.poolId を安全に取得
            poolId: storage.poolId || null,
            type: s.path === "/dev/sda" ? "os" : "manual",
          };
        });

        return {
          instanceTypeId: data.instanceType?.id || null,
          cpuCore: data.instanceType?.cpuCore || data.cpuCore || 0,
          memorySize: Math.round(memorySizeGiB), // GiB
          storages: storagesGiB,
        };
      }
      if (index === 2) {
        const nicsData = (data.attachedNics || []).map((nic) => ({
          id: nic.id,
          subnetId: nic.subnetId || null,
          name: nic.name,
          macAddress: nic.macAddress,
          ipAddress: nic.ipAddress,
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

  // ============================================================================
  // API Submission (更新処理)
  // (アップロードされたコードから変更なし)
  // ============================================================================
  const handleSubmit = async (emit: (event: "success" | "close") => void) => {
    isSubmitting.value = true;
    submitError.value = null;

    // 1. 全タブのバリデーションを実行
    const validationPromises = tabRefs.value.map((tab) =>
      tab?.validate ? tab.validate() : Promise.resolve({ valid: true })
    );
    const validationResults = await Promise.all(validationPromises);

    if (validationResults.some((result) => !result.valid)) {
      addToast({
        type: "error",
        message: "入力内容を確認してください。エラーのあるタブがあります。",
      });
      const firstInvalidTabIndex = validationResults.findIndex(
        (result) => !result.valid
      );
      if (firstInvalidTabIndex !== -1) currentTab.value = firstInvalidTabIndex;
      isSubmitting.value = false;
      return;
    }

    // --- API送信処理 ---
    try {
      // 2. 各タブから更新用データを収集
      const generalValues = tabRefs.value[0]?.values || {};
      const configValues = tabRefs.value[1]?.values || {};
      const networkValues = tabRefs.value[2]?.values || {};

      // 3. APIリクエストボディ (PUT /api/virtual-machines/{vmId}) を構築
      const payload: VirtualMachineUpdateRequestDTO = {
        name: generalValues.name,

        instanceType: configValues.instanceTypeId
          ? ({ id: configValues.instanceTypeId } as ModelInstanceTypeDTO)
          : undefined,
        cpuCore: configValues.instanceTypeId
          ? undefined
          : configValues.cpuCores,
        memorySize: configValues.instanceTypeId
          ? undefined
          : configValues.memorySize * 1024 * 1024 * 1024, // GiB to Bytes

        attachedStorages: (configValues.storages || []).map(
          (s: any): AttachedStorageDTO => ({
            id: s.id,
            storage: {
              id: s.id,
              name: s.name,
              size: s.size * 1024 * 1024 * 1024, // GiB to Bytes
              poolId: s.poolId,
            },
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

      // 4. 更新API (PUT) を実行
      const updatedVm = await $fetch<VirtualMachineDTO>(
        `/api/virtual-machines/${props.vmId}`,
        {
          method: "PUT",
          body: payload,
        }
      );

      // --- 成功時の処理 ---
      addToast({
        type: "success",
        message: `仮想マシン「${updatedVm.name}」を更新しました。`,
      });
      emit("success");
      emit("close");
    } catch (updateError: any) {
      // --- 失敗時の処理 ---
      console.error("Failed to update VM:", updateError);
      const errorMessage =
        updateError.data?.message ||
        updateError.message ||
        "更新処理中にエラーが発生しました。";
      submitError.value = errorMessage;
      addToast({
        type: "error",
        message: "仮想マシンの更新に失敗しました。",
        details: errorMessage,
      });
    } finally {
      isSubmitting.value = false; // ローディング解除
    }
  };

  // ============================================================================
  // Expose (外部への公開)
  // ============================================================================
  return {
    // データ取得
    vmData,
    pending,
    error,
    reloadData, // ★
    // タブ管理
    tabs,
    currentTab,
    modalTitle,
    prevTab,
    nextTab,
    setTabRef,
    isValid,
    // 更新処理
    handleSubmit,
    isSubmitting,
    submitError,
    // ★ 初期値提供関数
    getInitialDataForTab,
  };
}
