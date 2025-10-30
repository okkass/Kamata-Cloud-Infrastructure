/**
 * =================================================================================
 * 仮想マシン編集モーダル Composable (useVirtualMachineEdit.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoVirtualMachineEditコンポーネントで使用される
 * VM詳細データの取得、タブの状態管理、各タブのフォーム初期化、
 * および更新APIへの送信ロジックをカプセル化します。
 * =================================================================================
 */
import { ref, computed, watch, markRaw, nextTick } from "vue";
import { useToast } from "~/composables/useToast";
// ★ Nuxt 3 推奨のデータ取得方法 useAsyncData を利用
import { useAsyncData } from "#app";
// ★ 共有型定義ファイルから必要な型をインポート (パスとファイル名は想定)
import type {
  VirtualMachineDTO,
  VirtualMachineUpdateRequestDTO,
  AttachedStorageUpdateRequestDTO,
  AttachedNicUpdateRequestDTO,
} from "~~/shared/types"; // VM詳細と更新リクエスト用
// 各タブのコンポーネントをインポート
import VmEditTabGeneral from "~/components/vm-edit-tabs/VmEditTabGeneral.vue";
import VmEditTabConfig from "~/components/vm-edit-tabs/VmEditTabConfig.vue";
import VmEditTabNetwork from "~/components/vm-edit-tabs/VmEditTabNetwork.vue";

// コンポーネントから受け取るPropsの型定義
interface Props {
  show: boolean;
  vmId: string | null;
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
  const tabRefs = ref<any[]>([]); // 各タブコンポーネントの参照を保持する配列
  const isSubmitting = ref(false); // 更新APIの実行中フラグ
  const submitError = ref<string | null>(null); // 更新APIのエラーメッセージ

  // ============================================================================
  // API Data Fetching (VM詳細データ取得)
  // useAsyncData を使用して、vmId が指定されたときにデータを取得します。
  // ============================================================================
  const {
    data: vmData, // 取得したVMデータ (ref<VirtualMachineDTOO | null>)
    pending, // データ取得中フラグ (ref<boolean>)
    error, // データ取得エラー (ref<Error | null>)
    refresh: reloadData, // データ再取得関数
    execute: fetchData, // データ取得を手動で実行する関数
  } = useAsyncData<VirtualMachineDTO>(
    `vm-detail-${props.vmId || "new"}`, // vmIdごとに一意なキーを生成
    async () => {
      // vmId が null または undefined の場合は取得を実行しない
      if (!props.vmId) {
        // console.warn('vmId is not provided. Skipping fetch.');
        // エラーではなく、null を返すことで pending: false, error: null, data: null の状態にする
        return null;
      }
      try {
        // ★ APIエンドポイント /api/virtual-machines/{vmId} からデータを取得
        return await $fetch<VirtualMachineDTO>(
          `/api/virtual-machines/${props.vmId}`
        );
      } catch (fetchError: any) {
        console.error("Failed to fetch VM details:", fetchError);
        // Nuxt のエラーハンドリング機構を利用してエラーを管理
        throw createError({
          statusCode: fetchError.statusCode || 500,
          statusMessage:
            fetchError.data?.message || "VM情報の取得に失敗しました。",
          fatal: false,
        });
      }
    },
    {
      immediate: false, // props.vmId が確定してから手動で実行するため false
      server: false, // クライアントサイドでのみ取得
      // watch: [() => props.vmId], // vmId の変更を監視して自動で再取得 (今回は手動実行)
    }
  );

  // ============================================================================
  // Tabs (タブ管理)
  // ============================================================================
  // タブの定義 (名前と対応するコンポーネント)
  const tabs = ref([
    { name: "概要", component: markRaw(VmEditTabGeneral) },
    { name: "構成", component: markRaw(VmEditTabConfig) },
    { name: "ネットワーク", component: markRaw(VmEditTabNetwork) },
  ]);

  // モーダルタイトルの動的設定 (データ取得後にVM名を表示)
  const modalTitle = computed(() =>
    vmData.value ? `仮想マシン編集: ${vmData.value.name}` : "仮想マシン編集"
  );

  // 前のタブへ移動する関数
  const prevTab = () => {
    if (currentTab.value > 0) {
      currentTab.value--;
    }
  };

  // 次のタブへ移動する関数 (バリデーション付き)
  const nextTab = async () => {
    // 現在アクティブなタブコンポーネントの参照を取得
    const currentTabComponent = tabRefs.value[currentTab.value];
    // validate メソッドが存在すれば実行
    if (
      currentTabComponent &&
      typeof currentTabComponent.validate === "function"
    ) {
      const { valid } = await currentTabComponent.validate(); // バリデーション結果を取得
      if (!valid) {
        addToast({
          type: "warning",
          message: "現在のタブに入力エラーがあります。",
        });
        return; // バリデーションエラーがあれば進まない
      }
    }
    // バリデーションOK、かつ最後のタブでなければ次に進む
    if (currentTab.value < tabs.value.length - 1) {
      currentTab.value++;
    }
  };

  // タブコンポーネントの参照を設定するための関数 (v-for内で使用)
  const setTabRef = (index: number) => (el: any) => {
    if (el) {
      tabRefs.value[index] = el;
    }
  };

  /**
   * 指定されたインデックスのタブが有効か（バリデーションエラーがないか）をチェックする関数
   * @param index チェックするタブのインデックス
   * @returns boolean タブが有効な場合は true
   */
  const isValid = (index: number): boolean => {
    const tab = tabRefs.value[index];
    // タブコンポーネントが VeeValidate の useForm を使っていて、
    // `meta` ref を expose していると仮定してチェック
    if (tab?.meta) {
      return tab.meta.valid;
    }
    // もしくは、独自の `isValid` ref/computed を公開している場合
    if (typeof tab?.isValid === "boolean") {
      return tab.isValid;
    }
    // どちらでもない、または参照がなければ、一旦有効とみなす（エラー表示はさせない）
    return true;
  };

  // ============================================================================
  // Initialization (フォーム初期化)
  // ============================================================================
  // vmData の変更を監視し、データが取得できたら各タブのフォームを初期化
  watch(
    vmData,
    (newData) => {
      // モーダル表示中、データあり、タブ参照設定後に初期化
      if (props.show && newData && tabRefs.value.length === tabs.value.length) {
        // nextTick を使って、DOM更新が完了しタブ参照が確実に設定された後に実行
        nextTick(() => {
          initializeForms(newData);
        });
      }
    },
    { immediate: false }
  ); // immediate: false で初期レンダリング時は実行しない

  // モーダル表示状態(props.show)を監視してデータ取得を開始/リセット
  watch(
    () => props.show,
    (isVisible) => {
      if (isVisible && props.vmId && !vmData.value && !pending.value) {
        // モーダルが開かれ、vmIdがあり、データがまだなく、ロード中でもない場合 -> データ取得開始
        if (error.value) error.value = null; // 以前のエラーがあればクリア
        fetchData(); // useAsyncDataのexecuteを呼び出してデータ取得を開始
        currentTab.value = 0; // 常に最初のタブから表示
        submitError.value = null; // 送信エラーもクリア
      } else if (isVisible && props.vmId && vmData.value) {
        // モーダルが再度表示され、データが既にある場合 -> フォームを再初期化
        nextTick(() => {
          // vmData.value が null でないことを保証
          if (vmData.value) {
            initializeForms(vmData.value);
          }
        });
        currentTab.value = 0; // 常に最初のタブから表示
        submitError.value = null; // 送信エラーもクリア
      }
      // モーダルが閉じられた時のリセット処理はオプション (必要なら追加)
      // else if (!isVisible) { ... }
    },
    { immediate: true }
  ); // immediate: true でコンポーネント初期化時にもチェック

  /**
   * 各タブのフォームをAPIデータで初期化する関数
   * @param data - APIから取得したVM詳細データ (VirtualMachineDTO)
   */
  const initializeForms = (data: VirtualMachineDTO) => {
    try {
      // --- 概要タブ (VmEditTabGeneral) ---
      const generalTab = tabRefs.value[0];
      // タブ参照が存在し、resetForm メソッドを持つか確認
      if (generalTab && typeof generalTab.resetForm === "function") {
        generalTab.resetForm({
          // resetForm に渡す値は VmEditTabGeneral のフォームスキーマに合わせる
          values: {
            name: data.name,
            nodeId: data.node?.id || null, // node が null の可能性も考慮
          },
        });
      }

      // --- 構成タブ (VmEditTabConfig) ---
      const configTab = tabRefs.value[1];
      if (configTab && typeof configTab.resetForm === "function") {
        // メモリサイズをByteからGiBに変換 (1 GiB = 1024^3 Bytes)
        const memorySizeGiB = data.instanceType?.memorySize
          ? Math.round(data.instanceType.memorySize / (1024 * 1024 * 1024))
          : 0;
        // ストレージサイズをByteからGiBに変換
        const storagesGiB = (data.attachedStorages || []).map((s) => ({
          id: s.storage?.id || "", // storage が存在しないケースも考慮
          name: s.storage?.name || "N/A",
          size: s.storage?.size
            ? Math.round(s.storage.size / (1024 * 1024 * 1024))
            : 0,
          poolId: s.storage?.pool || s.storage?.poolId || "", // API DTOに合わせて修正
          type: s.path === "/dev/sda" ? "os" : "manual", // OSディスク判定
        }));

        configTab.resetForm({
          // resetForm に渡す値は VmEditTabConfig のフォームスキーマに合わせる
          values: {
            cpuCores: data.instanceType?.cpuCores || data.cpuCore || 0, // instanceType優先、なければカスタム値
            memorySize: memorySizeGiB,
            storages: storagesGiB,
            // ★ インスタンスタイプIDも渡す (カスタム構成の場合は null)
            instanceTypeId: data.instanceType?.id || null,
          },
        });
      }

      // --- ネットワークタブ (VmEditTabNetwork) ---
      const networkTab = tabRefs.value[2];
      if (networkTab && typeof networkTab.resetForm === "function") {
        // NIC情報を整形して渡す (複数NIC対応を想定)
        const attachedNicsData = (data.attachedNics || []).map((nic) => ({
          id: nic.id, // NIC自体のID
          subnetId: nic.subnetId || null, // サブネットID
          // VmEditTabNetwork で必要となる他の情報があればここに追加
          // 例: name: nic.name, macAddress: nic.macAddress など
        }));
        networkTab.resetForm({
          // resetForm に渡す値は VmEditTabNetwork のフォームスキーマに合わせる
          values: {
            nics: attachedNicsData, // ★ NIC情報を配列で渡す
            securityGroupIds: (data.securityGroups || []).map((sg) => sg.id),
          },
        });
      }
    } catch (initError) {
      console.error("Error initializing tab forms:", initError);
      addToast({
        type: "error",
        message: "フォームの初期化中にエラーが発生しました。",
      });
    }
  };

  // ============================================================================
  // API Submission (更新処理)
  // ============================================================================
  /**
   * 「更新」ボタンが押されたときの処理
   * 全てのタブのバリデーションを実行し、APIに送信するデータを収集・整形して更新APIを呼び出します。
   * @param emit - 親コンポーネントへイベントを通知するための関数 ('success', 'close')
   */
  const handleSubmit = async (emit: (event: "success" | "close") => void) => {
    isSubmitting.value = true;
    submitError.value = null; // 既存のエラーメッセージをクリア

    // 1. 全てのタブのバリデーションを非同期で実行
    const validationPromises = tabRefs.value.map(
      (tab) =>
        tab && typeof tab.validate === "function"
          ? tab.validate() // validateメソッドを呼ぶ
          : Promise.resolve({ valid: true }) // validateがなければ常に有効とみなす
    );
    // 全てのバリデーションPromiseの結果を待つ
    const validationResults = await Promise.all(validationPromises);

    // 2. いずれかのタブでバリデーションエラーがあれば処理を中断
    if (validationResults.some((result) => !result.valid)) {
      addToast({
        type: "error",
        message: "入力内容を確認してください。エラーのあるタブがあります。",
      });
      // エラーのある最初のタブにフォーカスを移動する（オプション）
      const firstInvalidTabIndex = validationResults.findIndex(
        (result) => !result.valid
      );
      if (firstInvalidTabIndex !== -1) {
        currentTab.value = firstInvalidTabIndex;
      }
      isSubmitting.value = false; // ローディング解除
      return; // ここで処理を中断
    }

    // --- API送信処理 ---
    try {
      // 3. 各タブから更新用データを収集 (各タブが `values` ref を expose している前提)
      //    expose されていない場合は、 `getValues()`のようなメソッドをタブ側で用意して呼ぶ
      const generalValues = tabRefs.value[0]?.values || {};
      const configValues = tabRefs.value[1]?.values || {};
      const networkValues = tabRefs.value[2]?.values || {};

      // 4. APIリクエストボディ (PUT /api/virtual-machines/{vmId}) を構築
      const payload: VirtualMachineUpdateRequestDTO = {
        name: generalValues.name, // 概要タブから

        // --- 構成タブ ---
        // API仕様に合わせて instanceTypeId または cpuCore/memorySize を設定
        // instanceTypeId: configValues.instanceTypeId || undefined, // タイプが選択されていればIDを送信
        cpuCore: configValues.cpuCores, // APIが個別指定を許容する場合
        memorySize: configValues.memorySize * 1024 * 1024 * 1024, // GiB to Bytes

        // ストレージ: API仕様に合わせて整形 (例)
        // 削除/追加/サイズ変更をどう表現するかはAPI次第。ここでは既存のものを更新する想定
        attachedStorages: (configValues.storages || []).map(
          (s: any): AttachedStorageUpdateRequestDTO => ({
            id: s.id, // 既存ストレージのID (更新対象の識別子)
            storage: {
              // APIが storage オブジェクトを期待する場合
              id: s.id, // ストレージ自体のID (API仕様による)
              name: s.name, // フォームで編集可能なら含める
              size: s.size * 1024 * 1024 * 1024, // GiB to Bytes (サイズ変更の場合)
              poolId: s.poolId, // 変更可能か？
            },
            path: s.type === "os" ? "/dev/sda" : undefined, // APIが必要なら
          })
        ) as any[], // 型アサーション (API仕様に合わせて正確な型を指定)

        // --- ネットワークタブ ---
        // NIC: API仕様に合わせて整形 (例)
        attachedNics: (networkValues.nics || []).map(
          (n: any): AttachedNicUpdateRequestDTO => ({
            id: n.id, // 既存NICのID (更新対象の識別子)
            subnetId: n.subnetId, // サブネット変更の場合
            // name, macAddress, ipAddress などAPIが更新可能な項目を追加
          })
        ) as any[], // 型アサーション

        securityGroupIds: networkValues.securityGroupIds || [], // 適用するSG IDの配列
      };

      // 不要なキーや値があれば削除 (例: APIが更新しない項目など)

      // 5. 更新API (PUT) を実行
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
      // エラーメッセージを取得 (Nuxtのエラー形式を考慮)
      const errorMessage =
        updateError.data?.message ||
        updateError.message ||
        "更新処理中にエラーが発生しました。";
      submitError.value = errorMessage; // UIに表示するためのエラーメッセージ
      addToast({
        type: "error",
        message: "仮想マシンの更新に失敗しました。",
        details: errorMessage, // 詳細なエラー情報をトーストに表示
      });
    } finally {
      isSubmitting.value = false; // ローディング解除
    }
  };

  // ============================================================================
  // Expose (外部への公開)
  // コンポーネント側で利用するリアクティブな状態や関数を返却します。
  // ============================================================================
  return {
    // データ取得
    vmData, // VM詳細データ (ref)
    pending, // データ取得中フラグ (ref)
    error, // データ取得エラー (ref)
    reloadData, // データ再取得関数
    // タブ管理
    tabs, // タブ定義 (ref)
    currentTab, // 現在のタブインデックス (ref)
    modalTitle, // モーダルタイトル (computed)
    prevTab, // 前のタブへ移動
    nextTab, // 次のタブへ移動 (バリデーション付き)
    setTabRef, // タブ参照設定用関数
    isValid, // タブ有効性チェック関数
    // 更新処理
    handleSubmit, // 更新実行関数
    isSubmitting, // 更新中フラグ (ref)
    submitError, // 更新エラーメッセージ (ref)
  };
}
