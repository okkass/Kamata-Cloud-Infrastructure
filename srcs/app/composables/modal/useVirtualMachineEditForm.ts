import { ref, computed } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";
import { convertByteToUnit, convertUnitToByte } from "~/utils/format";

// フォーム用の拡張型: 既存のレスポンス型にUI用の補助フィールドを追加
export type VmStorageForm = NonNullable<
  VirtualMachineResponse["storages"]
> extends Array<infer T>
  ? T & { poolId?: string }
  : never;

export type VmNetworkInterfaceForm = NonNullable<
  VirtualMachineResponse["networkInterfaces"]
> extends Array<infer T>
  ? T & { subnetId?: string; networkId?: string }
  : never;

export type VirtualMachineEditForm = Omit<
  VirtualMachineResponse,
  "storages" | "networkInterfaces"
> & {
  storages?: VmStorageForm[];
  networkInterfaces?: VmNetworkInterfaceForm[];
};

export const useVirtualMachineEditForm = () => {
  const { addToast } = useToast();

  // タブの管理
  const activeTab = ref<"general" | "config" | "network">("general");

  // useResourceUpdater の初期化
  const {
    editedData, // これを各タブの v-model に渡します
    isSaving,
    init,
    save: saveResource, // 名前重複回避のためエイリアス
    isDirty,
  } = useResourceUpdater<VirtualMachineEditForm>();

  const updaterError = ref<string | null>(null);

  // エラーメッセージの状態
  const validationErrors = computed(() => {
    const errors: {
      name?: string;
      cpuCore?: string;
      memorySize?: string;
      storages: Record<
        number,
        { name?: string; size?: string; poolId?: string }
      >;
      networkInterfaces: Record<
        number,
        { networkId?: string; subnetId?: string }
      >;
      securityGroups?: string;
    } = {
      storages: {},
      networkInterfaces: {},
    };
    const data = editedData.value;
    if (!data) return errors;

    // 基本情報
    if (!data.name || !data.name.trim()) errors.name = "名前は必須です。";
    if (!data.cpuCore || data.cpuCore < 1)
      errors.cpuCore = "1以上の値を指定してください。";
    if (!data.memorySize || data.memorySize < 1)
      errors.memorySize = "1以上の値を指定してください。";

    // セキュリティグループ
    if (!data.securityGroups || data.securityGroups.length === 0) {
      errors.securityGroups = "セキュリティグループは1つ以上必須です。";
    }

    // ストレージ
    if (data.storages) {
      data.storages.forEach((s, index) => {
        const storageErrors: { name?: string; size?: string; poolId?: string } =
          {};
        if (!s.name || !s.name.trim()) storageErrors.name = "名前は必須です。";
        if (!s.size || s.size <= 0)
          storageErrors.size = "正の数値を指定してください。";
        if (!s.poolId) storageErrors.poolId = "プールを選択してください。";

        if (Object.keys(storageErrors).length > 0) {
          errors.storages[index] = storageErrors;
        }
      });
    }

    // ネットワーク
    if (data.networkInterfaces) {
      data.networkInterfaces.forEach((nic, index) => {
        const nicErrors: { networkId?: string; subnetId?: string } = {};
        // フォーム上で追加されたが、まだ選択されていない場合のみエラーとする
        // 削除された場合(配列から消える)はループ対象外なので問題ないはずだが、
        // 空のオブジェクトが残っている可能性を考慮
        if (!nic.networkId)
          nicErrors.networkId = "ネットワークを選択してください。";
        if (!nic.subnetId)
          nicErrors.subnetId = "サブネットを選択してください。";

        if (Object.keys(nicErrors).length > 0) {
          errors.networkInterfaces[index] = nicErrors;
        }
      });
    }

    return errors;
  });

  // バリデーションチェック
  const isValid = computed(() => {
    const e = validationErrors.value;
    if (e.name || e.cpuCore || e.memorySize || e.securityGroups) return false;
    if (Object.keys(e.storages).length > 0) return false;
    if (Object.keys(e.networkInterfaces).length > 0) return false;
    return true;
  });

  // 保存ボタンの活性状態
  const canSave = computed(() => isDirty.value && isValid.value);

  /**
   * フォーム初期化
   * 親コンポーネントで watch(() => props.vmData, ...) の中で呼び出されます
   */
  const initializeForm = (data: VirtualMachineResponse) => {
    // 1. メモリ単位変換 (Bytes -> MB)
    // UI上ではMBで扱いたいので、初期化時に変換します
    const formattedData: VirtualMachineEditForm = {
      ...data,
      memorySize: convertByteToUnit(data.memorySize, "MB"),
      storages: data.storages?.map((storage: any) => ({
        ...storage,
        size: convertByteToUnit(storage.size, "GB"),
        poolId: storage.pool?.id,
      })),
      networkInterfaces: data.networkInterfaces?.map(
        (iface: VmNetworkInterfaceForm) => ({
          ...iface,
          subnetId: iface.subnet?.id,
          networkId: iface.subnet?.parent?.id,
        })
      ),
    };

    const id = data.id;

    // 2. ResourceUpdater の設定
    // ★重要: 先頭の "/" を削除して重複を防いでいます
    const config: ResourceConfig = {
      base: {
        // Base情報の PATCH 先: /api/virtual-machines/{id}
        endpoint: `virtual-machines/${id}`,
        fields: ["name", "description", "cpuCore", "memorySize"],
      },
      collections: {
        storages: {
          endpoint: "", // bulk使用時は未使用
          // Bulk送信先: /api/virtual-machines/{id}/storages/bulk
          bulkEndpoint: `virtual-machines/${id}/storages/bulk`,
          idKey: "id",
          newIdPrefix: "new-", // UI側で新規作成時に "new-xxx" というIDを振る必要があります
          fields: ["name", "size", "poolId", "type"],
          bulkKeys: { create: "add", update: "patch", delete: "remove" },
        },
        networkInterfaces: {
          endpoint: "",
          bulkEndpoint: `virtual-machines/${id}/network-interfaces/bulk`,
          idKey: "id", // ネットワークIF自体がIDを持つ前提
          newIdPrefix: "new-",
          fields: ["subnetId"],
          bulkKeys: { create: "add", update: "patch", delete: "remove" },
        },
        securityGroups: {
          endpoint: "",
          bulkEndpoint: `virtual-machines/${id}/security-groups/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: [], // SGはIDの紐付けのみなのでフィールド監視は不要
          bulkKeys: { create: "add", delete: "remove" },
          isAttachable: true,
        },
      },
    };

    init(formattedData, config);
    updaterError.value = null;

    // 初期化時は General タブを表示
    activeTab.value = "general";
  };

  /**
   * 保存処理
   */
  const save = async (emit: (event: "success" | "close") => void) => {
    if (!editedData.value) return;

    // 変更がない場合
    if (!isDirty.value) {
      addToast({ type: "warning", message: "変更がありません。" });
      return;
    }

    // バリデーションエラーの場合（ボタンが無効化されているはずだが念のため）
    if (!isValid.value) {
      addToast({ type: "error", message: "入力内容に不備があります。" });
      return;
    }

    // 保存開始
    isSaving.value = true;
    updaterError.value = null;

    // 退避用変数
    let currentMemoryMB = 0;
    let currentStoragesGB: VmStorageForm[] = [];

    try {
      // メモリ単位の逆変換 (MB -> Bytes)
      // ResourceUpdater は editedData を直接参照して差分判定するため、
      // 一時的に数値をAPI仕様(Bytes)に戻してあげる必要があります。
      currentMemoryMB = editedData.value.memorySize;
      editedData.value.memorySize = convertUnitToByte(currentMemoryMB, "MB");

      // ストレージ単位の逆変換 (GB -> Bytes)
      if (editedData.value.storages) {
        currentStoragesGB = JSON.parse(
          JSON.stringify(editedData.value.storages)
        );
        editedData.value.storages = editedData.value.storages.map(
          (storage: VmStorageForm) => ({
            ...storage,
            size: convertUnitToByte(storage.size, "GB"),
          })
        );
      }

      // useResourceUpdater の save を実行
      // これが config に従って PATCH (Base) や POST (Bulk) を自動で投げ分けます
      const success = await saveResource();

      // UI表示用に MB に戻す (成功しても失敗しても、画面が開いたままならMBに戻しておく)
      editedData.value.memorySize = currentMemoryMB;
      if (editedData.value.storages && currentStoragesGB.length > 0) {
        editedData.value.storages = currentStoragesGB;
      }

      if (success) {
        addToast({ type: "success", message: "保存しました。" });
        emit("success");
        emit("close");
      } else {
        // useResourceUpdater 内部でエラー時は false が返り、errorMessage に詳細が入る想定ですが、
        // ここでは汎用メッセージを出しています。必要に応じて updaterError を参照してください。
        updaterError.value = "保存に失敗しました。";
        addToast({ type: "error", message: "保存に失敗しました。" });
      }
    } catch (err: unknown) {
      console.error(err);
      updaterError.value = "予期せぬエラーが発生しました。";
      addToast({ type: "error", message: "予期せぬエラーが発生しました。" });

      // エラー時も復元を試みる
      if (currentMemoryMB) editedData.value.memorySize = currentMemoryMB;
      if (
        currentStoragesGB.length > 0 &&
        editedData.value &&
        editedData.value.storages
      ) {
        editedData.value.storages = currentStoragesGB;
      }
    } finally {
      isSaving.value = false;
    }
  };

  return {
    activeTab,
    editedData,
    isSaving,
    isDirty,
    isValid,
    validationErrors,
    canSave, // UI側でボタンのdisabled制御に使用
    updaterError,
    initializeForm,
    save,
  };
};
