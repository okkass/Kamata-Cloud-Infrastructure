/**
 * =================================================================================
 * イメージ編集フォーム Composable (useImageEditForm.ts)
 * ---------------------------------------------------------------------------------
 * MoImageEdit コンポーネントのフォーム状態管理、バリデーション、
 * および API 送信ロジックを担当します。
 * =================================================================================
 */
import { ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useToast } from "~/composables/useToast";
// ★ 汎用更新Composableをインポート
import { useResourceUpdate } from "~/composables/useResourceEdit";
// ★ 型定義をインポート (パスは仮定)
import type {
  ImageDTO,
  ImageUpdateRequestDTO, //
} from "~~/shared/types/images";
// --- Props の型定義 ---
interface ImageEditProps {
  show: boolean;
  imageData: ImageDTO | null;
}

// --- バリデーションスキーマ ---
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "イメージ名は必須です。"),
    description: z.string().nullable(),
  })
);

/**
 * イメージ編集フォームのロジック
 * @param props MoImageEdit から渡される props
 */
export function useImageEditForm(props: ImageEditProps) {
  const { addToast } = useToast();

  // ★ 汎用の更新Composableをセットアップ
  const { executeUpdate, isUpdating } = useResourceUpdate<
    ImageUpdateRequestDTO,
    ImageDTO
  >("images"); // APIパス

  // --- VeeValidate のセットアップ ---
  const { errors, defineField, handleSubmit, resetForm } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      description: null as string | null,
    },
  });

  // --- フォームフィールドの定義 ---
  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");

  // --- 初期値の設定 (Props監視) ---
  // モーダルが表示されるたび、またはデータが変わるたびにフォームを初期化
  watch(
    () => props.imageData,
    (newData) => {
      if (props.show && newData) {
        resetForm({
          values: {
            name: newData.name,
            description: newData.description || null,
          },
        });
      }
    },
    { immediate: true }
  );

  watch(
    () => props.show,
    (isVisible) => {
      if (isVisible && props.imageData) {
        resetForm({
          values: {
            name: props.imageData.name,
            description: props.imageData.description || null,
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
      if (!props.imageData) {
        addToast({
          type: "error",
          message: "編集対象のイメージが見つかりません。",
        });
        return;
      }

      // 1. API (PUT) リクエストボディを作成
      const payload: ImageUpdateRequestDTO = {
        name: values.name,
        description: values.description || undefined, // null を undefined に変換
      };

      // 2. ★ 汎用Composableの executeUpdate を呼び出す
      const { success, error } = await executeUpdate(
        props.imageData.id,
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
        addToast({
          type: "error",
          message: "イメージの更新に失敗しました。",
          details: error?.message || "不明なエラーです。",
        });
      }
    });
  };

  // --- 公開 (MoImageEdit.vue が使用) ---
  return {
    errors,
    // フォームフィールド
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    // 状態とアクション
    isUpdating, // ★ useResourceUpdate から受け取った isUpdating を返す
    onFormSubmit,
  };
}
