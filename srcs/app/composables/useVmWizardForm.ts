import { ref, markRaw, computed } from "vue";
import TabGeneral from "~/components/vm-tabs/TabGeneral.vue";
import TabConfig from "~/components/vm-tabs/TabConfig.vue";
import TabOsMiddleware from "~/components/vm-tabs/TabOsMiddleware.vue";
import TabNetwork from "~/components/vm-tabs/TabNetwork.vue";

export function useVmWizardForm() {
  // --- State ---
  const { addToast } = useToast();
  const currentTab = ref(0);
  const tabRefs = ref<any[]>([]);
  const tabs = [
    { name: "概要", component: markRaw(TabGeneral) },
    { name: "構成", component: markRaw(TabConfig) },
    { name: "OS/ミドルウェア", component: markRaw(TabOsMiddleware) },
    { name: "ネットワーク/セキュリティ", component: markRaw(TabNetwork) },
  ];

  // --- Computed ---
  const tabValidity = computed(() => {
    return tabRefs.value.map((tab) => tab?.isValid?.valid ?? false);
  });

  // --- Methods ---
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
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // handleSubmitのロジック本体
  const buildPayloadAndValidate = async () => {
    const invalidTabs = tabRefs.value.reduce((acc, tab, index) => {
      if (!tab?.isValid?.valid) {
        if (tabs[index]) acc.push(tabs[index].name);
      }
      return acc;
    }, [] as string[]);

    if (invalidTabs.length > 0) {
      addToast({
        message: `「${invalidTabs.join("」「")}」タブに入力エラーがあります。`,
        type: "error",
      });
      // 3. 最初の無効なタブのインデックス番号を見つける
      const firstInvalidIndex = tabRefs.value.findIndex(
        (tab) => !tab?.isValid?.valid
      );

      // 4. 見つかったインデックスに現在のタブを切り替える（ジャンプする）
      if (firstInvalidIndex !== -1) {
        currentTab.value = firstInvalidIndex;
      }
      return;
    }

    const generalData = tabRefs.value[0]?.formData;
    const configData = tabRefs.value[1]?.formData;
    const osData = tabRefs.value[2]?.formData;
    const networkData = tabRefs.value[3]?.formData;

    const basePayload = {
      name: generalData?.name ?? "",
      nodeId: generalData?.nodeId ?? null,
      subnetId: networkData?.subnetId ?? null,
      publicKey: networkData?.keyPairFile
        ? await readFileAsText(networkData.keyPairFile)
        : null,
      securityGroupId: networkData?.securityGroupId ?? null,
      imageId: osData?.osImageId ?? null,
      middleWareId: osData?.middlewareId,
      storages:
        configData?.storages.map((storage: any) => ({
          name: storage.name,
          size: convertUnitToByte(storage.size, "GB"),
          poolId: storage.poolId,
          backupId: storage.type === "backup" ? configData.backupId : null,
        })) ?? [],
    };

    let payload: VirtualMachineCreateRequestDTO;

    if (configData?.templateId) {
      // パターンA: インスタンスタイプIDがある場合
      payload = {
        ...basePayload,
        instanceTypeId: configData.templateId,
      };
    } else {
      // パターンB: CPUとメモリをカスタム指定する場合
      payload = {
        ...basePayload,
        cpuCore: configData?.cpuCore,
        memorySize: convertUnitToByte(configData?.memorySize, "MB"),
      };
    }
    return payload;
  };

  // コンポーネントが使えるように、必要な変数や関数を返す
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
