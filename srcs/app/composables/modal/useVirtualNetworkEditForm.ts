import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { watch } from "vue";

export const useVirtualNetworkEditForm = () => {
  const { addToast } = useToast();

  const {
    editedData,
    isSaving,
    errorMessage,
    init,
    save: executeSave,
    isDirty,
  } = useResourceUpdater<VirtualNetworkResponse>();

  // ID生成用
  let newSubnetCounter = 0;
  const NEW_SUBNET_PREFIX = "new-subnet-";

  // Validation Schema
  const validationSchema = toTypedSchema(
    z.object({
      name: z.string().min(1, "ネットワーク名は必須です"),
      subnets: z.array(
        z.object({
          id: z.string(),
          name: z.string().min(1, "サブネット名は必須です"),
          cidr: z.string().cidrv4("有効なCIDR形式で入力してください"),
        })
      ),
    })
  );

  const { errors, defineField, handleSubmit, resetForm, values, meta } =
    useForm({
      validationSchema,
    });

  const [name, nameAttrs] = defineField("name");
  const { fields: subnetFields, push, remove } = useFieldArray("subnets");

  // Sync form values to editedData for useResourceUpdater
  watch(
    () => values,
    (newValues) => {
      if (editedData.value) {
        if (newValues.name !== undefined) {
          editedData.value.name = newValues.name;
        }
        if (newValues.subnets) {
          editedData.value.subnets = newValues.subnets as any;
        }
      }
    },
    { deep: true }
  );

  /**
   * フォーム初期化
   * ここで API エンドポイントと Bulk 設定を定義します
   */
  const initializeForm = (data: VirtualNetworkResponse) => {
    const resourceId = data.id;

    const config: ResourceConfig = {
      base: {
        // useApiClient は baseURL (/api/) を持っているため、そこからの相対パスを指定
        // ※ useResourceUpdater はデフォルトで PATCH を使用します。
        //   PUT が必須の場合は useResourceUpdater 側でメソッド指定できるように拡張が必要です。
        endpoint: `virtual-networks/${resourceId}`,
        fields: ["name"],
      },
      collections: {
        subnets: {
          // 個別更新用のエンドポイント (Bulk使用時は使われませんが一応定義)
          endpoint: `virtual-networks/${resourceId}/subnets`,
          // Bulk更新用のエンドポイント
          bulkEndpoint: `virtual-networks/${resourceId}/subnets/bulk`,

          idKey: "id",
          newIdPrefix: NEW_SUBNET_PREFIX,
          fields: ["name", "cidr"],
        },
      },
    };

    init(data, config);
    newSubnetCounter = 0;

    // Initialize form
    resetForm({
      values: {
        name: data.name,
        subnets: data.subnets
          ? data.subnets.map((s) => ({
              id: s.id,
              name: s.name,
              cidr: s.cidr,
            }))
          : [],
      },
    });
  };

  /**
   * サブネット追加
   */
  const addSubnet = () => {
    push({
      id: `${NEW_SUBNET_PREFIX}${newSubnetCounter++}`,
      name: "",
      cidr: "",
    });
  };

  /**
   * サブネット削除
   */
  const removeSubnet = (index: number) => {
    remove(index);
  };

  /**
   * 保存処理
   * useResourceUpdater の save を呼び出し、結果に応じて UI を制御します
   */
  const save = handleSubmit(async () => {
    // Force sync just in case
    if (editedData.value) {
      editedData.value.name = values.name!;
      editedData.value.subnets = values.subnets as any;
    }

    // 変更なしチェック
    if (!isDirty.value) {
      addToast({ type: "info", message: "変更がありません。" });
      return true;
    }

    // 実際の保存処理を実行
    const success = await executeSave();

    if (success) {
      addToast({ type: "success", message: "保存しました。" });
      return true;
    } else {
      // 失敗時は useResourceUpdater が errorMessage に値をセットしています
      addToast({
        type: "error",
        message: "保存に失敗しました。",
        details: errorMessage.value || "不明なエラーが発生しました。",
      });
      return false;
    }
  });

  return {
    editedData,
    isSaving,
    // updaterError: errorMessage, // Removed as requested
    initializeForm,
    addSubnet,
    removeSubnet,
    save,

    // Form fields
    name,
    nameAttrs,
    subnetFields,
    errors,
    meta,
  };
};
