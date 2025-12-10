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

export function useVmWizardForm() {
  const { addToast } = useToast();
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

    const basePayload = {
      name: generalData?.name ?? "",
      nodeId: generalData?.nodeId ?? "",
      subnetId: networkData?.subnetId ?? "",
      publicKey: networkData?.keyPairFile
        ? await readFileAsText(networkData.keyPairFile)
        : "",
      securityGroupIds: networkData?.securityGroupId
        ? [networkData.securityGroupId]
        : [],
      imageId: osData?.osImageId ?? "",
      middlewareId: osData?.middlewareId ?? "",
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
        instanceTypeId: configData.templateId,
      };
    } else {
      // パターンB: カスタム構成
      payload = {
        ...basePayload,
        cpu: configData?.cpuCore,
        memory: convertUnitToByte(configData?.memorySize, "MB"),
      };
    }

    //console.log("API送信最終ペイロード:", payload);
    return payload;
  };

  return {
    currentTab,
    tabRefs,
    tabs,
    tabValidity,
    prevTab,
    nextTab,
    buildPayloadAndValidate,
  };
}
