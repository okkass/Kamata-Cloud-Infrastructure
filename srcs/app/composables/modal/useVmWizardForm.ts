/**
 * =================================================================================
 * 仮想マシン作成ウィザード ロジック (useVmWizardForm.ts)
 * =================================================================================
 */
import { ref, markRaw, computed } from "vue";
import TabGeneral from "~/components/vm-tabs/TabGeneral.vue";
import TabConfig from "~/components/vm-tabs/TabConfig.vue";
import TabOsMiddleware from "~/components/vm-tabs/TabOsMiddleware.vue";
import TabNetwork from "~/components/vm-tabs/TabNetwork.vue";
import { useToast } from "~/composables/useToast";
import { convertUnitToByte } from "~/utils/format";
import { useFormAction } from "~/composables/modal/useModalAction";

export function useVmWizardForm() {
  const { handleModalSubmit } = useFormAction();
  const currentTab = ref(0);
  const tabRefs = ref<any[]>([]);
  const tabs = [
    { name: "概要", component: markRaw(TabGeneral) },
    { name: "構成", component: markRaw(TabConfig) },
    { name: "OS/ミドルウェア", component: markRaw(TabOsMiddleware) },
    { name: "ネットワーク/セキュリティ", component: markRaw(TabNetwork) },
  ];

  const tabValidity = computed(() => {
    return tabRefs.value.map((tab) => tab?.isValid?.valid ?? false);
  });

  const prevTab = () => {
    if (currentTab.value > 0) currentTab.value--;
  };
  const nextTab = () => {
    if (currentTab.value < tabs.length - 1) currentTab.value++;
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  /**
   * 各タブのデータを結合し、APIリクエスト用のペイロードを構築する
   */
  const buildPayloadAndValidate = async () => {
    const generalData = tabRefs.value[0]?.formData;
    const configData = tabRefs.value[1]?.formData;
    const osData = tabRefs.value[2]?.formData;
    const networkData = tabRefs.value[3]?.formData;

    // --- 調査用ログ (送信時のみコンソールに出力) ---
    //console.log("TabConfigから吸い上げたデータ:", configData);

    // ネットワークインターフェースから全てのサブネットIDを集約
    const allSubnetIds =
      networkData?.networkInterfaces
        ?.flatMap((iface: any) => iface.subnetIds)
        .filter((id: string) => id) ?? [];

    // セキュリティグループIDのみを抽出
    const securityGroupIds =
      networkData?.securityGroupIds?.map((sg: any) => sg.id) ?? [];

    const basePayload = {
      name: generalData?.name ?? "",
      nodeId: generalData?.nodeId ?? "",
      subnetIds: allSubnetIds,
      publicKey: networkData?.keyPairFile?.value
        ? await readFileAsText(networkData.keyPairFile.value)
        : "",
      securityGroupIds: securityGroupIds,
      imageId: osData?.osImageId ?? "",
      middlewareId: osData?.middlewareId || null,
      storages:
        configData?.storages.map((storage: any) => ({
          name: storage.name,
          size: convertUnitToByte(storage.size, "GB"),
          poolId: storage.poolId,
          backupId: storage.type === "backup" ? configData.backupId : undefined,
        })) ?? [],
    };

    let payload: VirtualMachineCreateRequest;

    if (!!configData?.templateId) {
      // パターンA: テンプレート（インスタンスタイプ）指定
      payload = {
        ...basePayload,
        spec: {
          instanceTypeId: configData.templateId,
        },
      };
    } else {
      // パターンB: カスタム構成
      payload = {
        ...basePayload,
        spec: {
          cpu: configData?.cpuCore,
          memory: convertUnitToByte(configData?.memorySize, "MB"),
        },
      };
    }

    //console.log("API送信最終ペイロード:", payload);
    return payload;
  };

  const { executeCreate: executeVirtualMachineCreation, isCreating } =
    useResourceCreate<VirtualMachineCreateRequest, VirtualMachineResponse>(
      MACHINE.name
    );

  /**
   * 全タブのバリデーションを実行
   * エラーがあれば該当タブに移動してエラーをスロー
   */
  const validateAllTabs = async (): Promise<void> => {
    for (let i = 0; i < tabRefs.value.length; i++) {
      const tab = tabRefs.value[i];
      if (tab?.validate) {
        const isValid = await tab.validate();
        if (!isValid) {
          currentTab.value = i;
          throw new Error("入力に誤りがあります。各タブを確認してください。");
        }
      }
    }
  };

  /**
   * ウィザードの最終送信処理
   * バリデーション→ペイロード構築→API実行をhandleModalSubmitで統合
   */
  const handleFinalSubmit = (emit: (event: any) => void) => {
    return handleModalSubmit(
      async () => {
        await validateAllTabs();
        return await buildPayloadAndValidate();
      },
      {
        execute: executeVirtualMachineCreation,
        onSuccessMessage: (payload: VirtualMachineCreateRequest) =>
          `仮想マシン「${payload.name}」が作成されました`,
        onErrorMessage: "仮想マシンの作成に失敗しました。",
      },
      emit
    );
  };

  /**
   * モーダルをリセット（初回表示状態に戻す）
   */
  const reset = () => {
    currentTab.value = 0;
  };

  return {
    currentTab,
    tabRefs,
    tabs,
    tabValidity,
    prevTab,
    nextTab,
    handleFinalSubmit,
    isCreating,
    isInvalid: computed(() => !tabValidity.value[currentTab.value]),
    reset,
  };
}
