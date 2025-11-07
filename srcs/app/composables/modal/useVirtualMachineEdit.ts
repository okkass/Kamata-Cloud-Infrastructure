/**
 * =================================================================================
 * 仮想マシン編集モーダル Composable (useVirtualMachineEdit.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoVirtualMachineEditコンポーネント（親）で使用される
 * VM詳細データの取得、タブの状態管理、各タブ（子）への初期値データ提供、
 * および最終的な更新APIへの送信ロジックをカプセル化します。
 *
 * ★ 親 (MoVirtualMachineEdit.vue) は v-if="vmData" を使い、データ取得後に
 * 子タブを描画し、:initial-data="getInitialDataForTab(index)" で初期値を渡します。
 * ★ 子 (VmEditTab...) は props で initialData を受け取り、
 * useForm の initialValues に設定します。
 * =================================================================================
 */
import { ref, computed, watch, markRaw, nextTick } from "vue";
import { useToast } from "~/composables/useToast";
import { useAsyncData } from "#app";

// ★ 必要な型定義を、ご提示いただいたパスに基づいてインポート
import type {
  VirtualMachineDTO, // GET /api/virtual-machines/{vmId} のレスポンス型
  VirtualMachineUpdateRequestDTO, // PUTリクエストの型
  AttachedStorageDTO, // ★ PUTリクエストが使用する型
  NetworkInterfaceDTO, // ★ PUTリクエストが使用する型
} from "~~/shared/types/virtual-machines";

// ★ ModelInstanceTypeDTO を instance-types.ts から直接インポート
import type { ModelInstanceTypeDTO } from "~~/shared/types/instance-types"; //

// 各タブのコンポーネントをインポート
import VmEditTabGeneral from "~/components/vm-edit-tabs/VmEditTabGeneral.vue";
import VmEditTabConfig from "~/components/vm-edit-tabs/VmEditTabConfig.vue";
import VmEditTabNetwork from "~/components/vm-edit-tabs/VmEditTabNetwork.vue";

// コンポーネントから受け取るPropsの型定義
interface Props {
  show: boolean;
  vmId: string | null;
}

// 各タブコンポーネントが expose すべきメソッド/プロパティの型
// (親が子を制御するために必要なもの)
interface TabComponent {
  validate: () => Promise<{ valid: boolean }>; // バリデーション実行
  values: Record<string, any>; // 現在のフォームの値
  meta: { valid: boolean }; // 現在のバリデーション状態
  // resetForm は子が自分で行うため、親は呼び出さない
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
  const currentTab = ref(0); // 現在表示中のタブのインデックス
  const tabRefs = ref<TabComponent[]>([]); // 各タブコンポーネントの参照を保持する配列
  const isSubmitting = ref(false); // 更新APIの実行中フラグ
  const submitError = ref<string | null>(null); // 更新APIのエラーメッセージ

  // ============================================================================
  // API Data Fetching (VM詳細データ取得)
  // ============================================================================
  const {
    data: vmData, // 取得したVMデータ (ref<VirtualMachineDTO | null>)
    pending, // データ取得中フラグ (ref<boolean>)
    error, // データ取得エラー (ref<Error | null>)
    refresh: reloadData, // データ再取得関数
    execute: fetchData, // データ取得を手動で実行する関数
  } = useAsyncData<VirtualMachineDTO>(
    `vm-detail-${props.vmId || "new"}`, // vmIdごとに一意なキーを生成
    async () => {
      if (!props.vmId) return null;
      try {
        // ★ APIエンドポイント (GET /api/virtual-machines/{vmId})
        return await $fetch<VirtualMachineDTO>(
          `/api/virtual-machines/${props.vmId}`
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
      immediate: false, // props.show の watch で手動実行
      server: false,
    }
  );

  // ============================================================================
  // Tabs (タブ管理)
  // ============================================================================
  const tabs = ref([
    { name: "概要", component: markRaw(VmEditTabGeneral) },
    { name: "構成", component: markRaw(VmEditTabConfig) },
    { name: "ネットワーク", component: markRaw(VmEditTabNetwork) },
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

  // タブコンポーネントの参照を設定 (v-for内で使用)
  const setTabRef = (index: number) => (el: any) => {
    if (el) tabRefs.value[index] = el as TabComponent;
  };

  // 指定タブのバリデーション状態をチェック (UIのエラーアイコン表示用)
  const isValid = (index: number): boolean => {
    const tab = tabRefs.value[index];
    if (tab?.meta) return tab.meta.valid;
    return true; // 参照がまだない場合はOKとみなす
  };

  // ============================================================================
  // Initialization (データ取得トリガーと初期値提供)
  // ============================================================================

  // モーダル表示状態(props.show)を監視してデータ取得/リセット
  watch(
    () => props.show,
    (isVisible) => {
      if (isVisible && props.vmId) {
        // モーダルが開かれ、vmId がある場合
        if (error.value) error.value = null; // 既存のエラーをクリア
        if (!pending.value) fetchData(); // データを取得 (useAsyncData が重複実行を防止)
        currentTab.value = 0;
        submitError.value = null;
        tabRefs.value = []; // タブ参照をクリア (コンポーネントが再マウントされるため)
      } else if (!isVisible) {
        // モーダルが閉じられたら、取得したデータをリセット（次回開くときに再取得するため）
        vmData.value = null;
      }
    },
    { immediate: true }
  ); // 初期化時にもチェック

  /**
   * ★ 新方針: 子コンポーネントに props として渡すための初期値データを整形する
   * (MoVirtualMachineEdit.vue の v-if="vmData" の後で呼ばれる)
   * @param index 取得するタブのインデックス
   */
  const getInitialDataForTab = (index: number) => {
    if (!vmData.value) return undefined;

    const data = vmData.value;

    try {
      if (index === 0) {
        // --- 概要タブ (VmEditTabGeneral) ---
        return {
          name: data.name,
          nodeId: data.node?.id || null, //
        };
      }
      if (index === 1) {
        // --- 構成タブ (VmEditTabConfig) ---
        //
        const memorySizeGiB =
          (data.instanceType?.memorySize || data.memorySize || 0) /
          (1024 * 1024 * 1024);
        const storagesGiB = (data.attachedStorages || []).map((s) => ({
          id: s.storage.id,
          name: s.storage.name,
          size: Math.round(s.storage.size / (1024 * 1024 * 1024)), // Byte to GiB
          poolId: s.storage.poolId, // (storage.poolId を参照)
          type: s.path === "/dev/sda" ? "os" : "manual", // OSディスク判定
        }));

        return {
          instanceTypeId: data.instanceType?.id || null, //
          cpuCores: data.instanceType?.cpuCore || data.cpuCore || 0, //
          memorySize: Math.round(memorySizeGiB), // GiB
          storages: storagesGiB,
        };
      }
      if (index === 2) {
        // --- ネットワークタブ (VmEditTabNetwork) ---
        //
        const nicsData = (data.attachedNics || []).map((nic) => ({
          id: nic.id, // NIC自体のID
          subnetId: nic.subnetId || null,
          name: nic.name,
          macAddress: nic.macAddress,
          ipAddress: nic.ipAddress, //
        }));

        return {
          nics: nicsData, // ★ NIC情報を配列で渡す
          securityGroupIds: (data.securityGroups || []).map((sg) => sg.id), //
        };
      }
    } catch (err: any) {
      console.error(`Error preparing initial data for tab ${index}:`, err);
      // エラーが発生したらグローバルエラーとして設定し、UIにフィードバック
      error.value = new Error(
        `タブ ${index + 1} の初期化に失敗しました: ${err.message}`
      );
    }
    return undefined;
  };

  // ============================================================================
  // API Submission (更新処理)
  // ============================================================================
  /**
   * 「更新」ボタンが押されたときの処理
   * @param emit - 親コンポーネントへイベントを通知するための関数
   */
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
      // 2. 各タブから更新用データを収集 (各タブが `values` ref を expose している前提)
      const generalValues = tabRefs.value[0]?.values || {};
      const configValues = tabRefs.value[1]?.values || {};
      const networkValues = tabRefs.value[2]?.values || {};

      // 3. APIリクエストボディ (PUT /api/virtual-machines/{vmId}) を構築
      // VirtualMachineUpdateRequestDTO に従う
      const payload: VirtualMachineUpdateRequestDTO = {
        name: generalValues.name, // 概要タブから

        // --- 構成タブ ---
        // (注: VmEditTabConfig が instanceTypeId と cpu/memory を排他的に管理している前提)
        instanceType: configValues.instanceTypeId
          ? ({ id: configValues.instanceTypeId } as ModelInstanceTypeDTO) // 型アサーション
          : undefined,
        cpuCore: configValues.instanceTypeId
          ? undefined
          : configValues.cpuCores,
        memorySize: configValues.instanceTypeId
          ? undefined
          : configValues.memorySize * 1024 * 1024 * 1024, // GiB to Bytes

        // attachedStorages は DTO の配列
        // (注: VmEditTabConfig 側で、新規/削除/変更をハンドリングし、
        // APIが期待する DTO の配列を 'values.storages' として返す必要がある)
        attachedStorages: (configValues.storages || []).map(
          (s: any): AttachedStorageDTO => ({
            id: s.id, // 既存ストレージのID
            storage: {
              id: s.id,
              name: s.name,
              size: s.size * 1024 * 1024 * 1024, // GiB to Bytes
              poolId: s.poolId,
            },
            path: s.type === "os" ? "/dev/sda" : "/dev/vdb", // (注: API仕様に準拠)
          })
        ),

        // --- ネットワークタブ ---
        // attachedNics は DTO の配列
        // (注: VmEditTabNetwork 側で、新規/削除/変更をハンドリングし、
        // APIが期待する DTO の配列を 'values.nics' として返す必要がある)
        attachedNics: (networkValues.nics || []).map(
          (n: any): NetworkInterfaceDTO => ({
            id: n.id, // 既存NICのID
            subnetId: n.subnetId,
            name: n.name,
            macAddress: n.macAddress,
            ipAddress: n.ipAddress,
          })
        ),
        securityGroupIds: networkValues.securityGroupIds || [], //
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
      emit("success"); // 親コンポーネントに成功を通知
      emit("close"); // モーダルを閉じる
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
    reloadData,
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
