/**
 * =================================================================================
 * インスタンスタイプ編集フォーム Composable (useInstanceTypeEditForm.ts)
 * ---------------------------------------------------------------------------------
 * MoInstanceTypeEdit コンポーネントのフォーム状態管理、バリデーション、
 * および API 送信ロジックを担当します。
 * =================================================================================
 */
import { ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useToast } from "~/composables/useToast";
// ★ 単位変換ユーティリティをインポート
import { convertByteToUnit, convertUnitToByte } from "~/utils/format";
// ★ 型定義をインポート
import type {
  ModelInstanceTypeDTO,
  InstanceTypeUpdateRequestDTO,
} from "~~/shared/types/instance-types";

// --- Props の型定義 ---
interface InstanceTypeEditProps {
  show: boolean;
  instanceTypeData: ModelInstanceTypeDTO | null;
}

// --- バリデーションスキーマ ---
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "インスタンスタイプ名は必須です。"),
    cpuCore: z
      .number({ invalid_type_error: "vCPU数は必須です。" })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。"),
    memorySizeInMb: z
      .number({ invalid_type_error: "メモリは必須です。" })
      .int("整数で入力してください。")
      .min(1, "1MB以上の値を入力してください。"),
  })
);

/**
 * インスタンスタイプ編集フォームのロジック
 * @param props MoInstanceTypeEdit から渡される props
 */
export function useInstanceTypeEditForm(props: InstanceTypeEditProps) {
  const { addToast } = useToast();
  const isUpdating = ref(false); // 更新処理中のフラグ

  // --- VeeValidate のセットアップ ---
  const { errors, defineField, handleSubmit, resetForm } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      cpuCore: 1,
      memorySizeInMb: 1024,
    },
  });

  // --- フォームフィールドの定義 ---
  const [name, nameAttrs] = defineField("name");
  const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
  const [memorySizeInMb, memorySizeInMbAttrs] = defineField("memorySizeInMb");

  // --- 初期値の設定 (Props監視) ---
  watch(
    () => props.instanceTypeData,
    (newData) => {
      if (props.show && newData) {
        resetForm({
          values: {
            name: newData.name,
            cpuCore: newData.cpuCore,
            memorySizeInMb: convertByteToUnit(newData.memorySize, "MB"),
          },
        });
      }
    },
    { immediate: true }
  );

  watch(
    () => props.show,
    (isVisible) => {
      if (isVisible && props.instanceTypeData) {
        resetForm({
          values: {
            name: props.instanceTypeData.name,
            cpuCore: props.instanceTypeData.cpuCore,
            memorySizeInMb: convertByteToUnit(
              props.instanceTypeData.memorySize,
              "MB"
            ),
          },
        });
      }
    }
  );

  // --- フォーム送信処理 ---
  /**
   * フォーム送信イベントを処理する高階関数
   * @param emit - コンポーネントの emit 関数
   */
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    // VeeValidate の handleSubmit でバリデーションを行う
    // ★ handleSubmit は引数としてバリデーション済みの 'values' を渡してくれる
    return handleSubmit(async (values) => {
      if (!props.instanceTypeData) {
        addToast({
          type: "error",
          message: "編集対象のインスタンスタイプが見つかりません。",
        });
        return;
      }

      isUpdating.value = true;

      const payload: InstanceTypeUpdateRequestDTO = {
        name: values.name,
        cpuCore: values.cpuCore,
        memorySize: convertUnitToByte(values.memorySizeInMb, "MB"),
      };

      try {
        // API (PUT /api/instance-types/{id}) の呼び出し
        // (updatedData は $fetch の戻り値。 204 No Content の場合、空になる可能性がある)
        const updatedData = await $fetch<ModelInstanceTypeDTO>(
          `/api/instance-types/${props.instanceTypeData.id}`,
          {
            method: "PUT",
            body: payload,
          }
        );

        // ★★★ 修正箇所 ★★★
        // APIのレスポンス (updatedData.name) ではなく、
        // 送信に成功したフォームの値 (values.name) を使用します。
        // これにより、APIが 204 No Content を返した場合でも 'undefined' になりません。
        addToast({
          type: "success",
          message: `「${values.name}」を更新しました。`,
        });
        // ★★★ 修正ここまで ★★★

        emit("success");
        emit("close");
      } catch (error: any) {
        console.error("Failed to update instance type:", error);
        addToast({
          type: "error",
          message: "インスタンスタイプの更新に失敗しました。",
          details: error.data?.message || error.message,
        });
      } finally {
        isUpdating.value = false;
      }
    });
  };

  // --- 公開 (MoInstanceTypeEdit.vue が使用) ---
  return {
    errors,
    name,
    nameAttrs,
    cpuCore,
    cpuCoreAttrs,
    memorySizeInMb,
    memorySizeInMbAttrs,
    isUpdating,
    onFormSubmit,
  };
}
