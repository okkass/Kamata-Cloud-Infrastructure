/**
 * =================================================================================
 * インスタンスタイプ編集フォーム Composable (useInstanceTypeEditForm.ts)
 * ---------------------------------------------------------------------------------
 * MoInstanceTypeEdit コンポーネントのフォーム状態管理、バリデーション、
 * および API 送信ロジックを担当します。
 * ★ 汎用Composable (useResourceUpdate) を使用
 * =================================================================================
 */
import { ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useToast } from "~/composables/useToast";
import { convertByteToUnit, convertUnitToByte } from "~/utils/format";
// ★ 汎用更新Composableをインポート
import { useResourceUpdate } from "~/composables/useResourceEdit";
import type {
  InstanceTypeDTO as ModelInstanceTypeDTO,
  InstanceTypeUpdateRequestDTO,
} from "~~/shared/types/dto/instance-type";

// --- Props の型定義 ---
interface InstanceTypeEditProps {
  show: boolean;
  instanceTypeData: ModelInstanceTypeDTO | null;
}

// --- バリデーションスキーマ ---
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "インスタンスタイプ名を入力してください。"),
    cpuCore: z
      .number({ message: "数値を入力してください。" })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。"),
    memorySizeInMb: z
      .number({ message: "数値を入力してください。" })
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

  // ★ 汎用の更新Composableをセットアップ
  // TPayload = InstanceTypeUpdateRequestDTO, TResponse = ModelInstanceTypeDTO
  const { executeUpdate, isUpdating } = useResourceUpdate<
    InstanceTypeUpdateRequestDTO,
    ModelInstanceTypeDTO
  >("instance-types"); // (APIパス)

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
    return handleSubmit(async (values) => {
      if (!props.instanceTypeData) {
        addToast({
          type: "error",
          message: "編集対象のインスタンスタイプが見つかりません。",
        });
        return;
      }

      // 1. API (PUT) リクエストボディを作成
      const payload: InstanceTypeUpdateRequestDTO = {
        name: values.name,
        cpuCore: values.cpuCore,
        memorySize: convertUnitToByte(values.memorySizeInMb, "MB"),
      };

      // 2. ★ 汎用Composableの executeUpdate を呼び出す
      const { success, error } = await executeUpdate(
        props.instanceTypeData.id,
        payload
      );

      // 3. 結果をハンドリング
      if (success) {
        addToast({
          type: "success",
          message: `「${values.name}」を更新しました。`,
        });
        emit("success");
        emit("close");
      } else {
        // useResourceUpdate が返したエラーメッセージを利用
        addToast({
          type: "error",
          message: "インスタンスタイプの更新に失敗しました。",
          details: error?.message || "不明なエラーです。",
        });
      }
    });
  };

  // --- 公開 (MoInstanceTypeEdit.vue が使用) ---
  return {
    errors,
    // フォームフィールド
    name,
    nameAttrs,
    cpuCore,
    cpuCoreAttrs,
    memorySizeInMb,
    memorySizeInMbAttrs,
    // 状態とアクション
    isUpdating, // ★ useResourceUpdate から受け取った isUpdating を返す
    onFormSubmit,
  };
}
