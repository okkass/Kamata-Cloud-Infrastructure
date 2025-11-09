/**
 * =================================================================================
 * スナップショット作成フォーム Composable (useSnapshotCreateForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoSnapshotCreateコンポーネントで使用される
 * フォームの状態管理、バリデーション、仮想マシン一覧の取得、
 * API送信ロジックをカプセル化します。
 * APIの型定義は `~/shared/types` ディレクトリからインポートします。
 * =================================================================================
 */
import { ref, computed } from "vue"; // computed は現時点では未使用
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useResourceList } from "~/composables/useResourceList";
import { useToast } from "~/composables/useToast";
import type { SnapShotCreateRequestDTO, SnapShotDTO } from "~~/shared/types"; // スナップショット用
import type { VirtualMachineDTO } from "~~/shared/types"; // VM用

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "スナップショット名は必須です。"),
  targetVmId: z.string({
    required_error: "対象仮想マシンを選択してください。",
  }),
});

const validationSchema = toTypedSchema(zodSchema);
// Zodスキーマからフォームの型を推論します
type FormValues = z.infer<typeof zodSchema>;

/**
 * メインのComposable関数
 */
export function useSnapshotCreateForm() {
  // ============================================================================
  // Form Setup (フォーム設定)
  // VeeValidateのuseFormを使って、フォーム全体を管理します。
  // ============================================================================
  const { errors, defineField, handleSubmit } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      // フォームの初期値を設定します
      name: "",
      targetVmId: undefined, // 初期状態では未選択
    },
  });

  // 各フォームフィールドとVeeValidateを連携させます
  const [name, nameAttrs] = defineField("name");
  // FormSelectコンポーネントはv-modelで直接 targetVmId ref を更新するため、属性(Attrs)は通常不要
  const [targetVmId] = defineField("targetVmId");

  // ============================================================================
  // API Data Fetching (APIデータ取得)
  // ============================================================================
  const { addToast } = useToast();

  // --- 対象仮想マシン一覧の取得 ---
  const {
    data: virtualMachines, // 取得したVMのリスト (ref)
    pending: vmsPending, // データ取得中かどうかを示すフラグ (ref)
    error: vmsError, // データ取得時にエラーが発生したか (ref)
  } = useResourceList<VirtualMachineDTO>("virtual-machines"); // VM一覧APIのエンドポイント

  // ============================================================================
  // API Submission (API送信処理)
  // useResourceCreate Composableを使ってAPIへのPOSTリクエストを管理します。
  // ============================================================================
  const { executeCreate: executeSnapshotCreation, isCreating } =
    useResourceCreate<
      SnapShotCreateRequestDTO, // 送信するデータの型 { name, targetVmId }
      SnapShotDTO // API成功時に受け取るデータの型
    >("snapshots"); // APIエンドポイント '/api/snapshots' に対応

  /**
   * フォーム送信時の処理を定義します。
   * handleSubmitでラップされているため、バリデーション通過後にのみ実行されます。
   * @param emit - 親コンポーネントへイベントを通知するための関数 ('success', 'close')
   */
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      // APIに送信するデータ（ペイロード）を構築します
      const payload: SnapShotCreateRequestDTO = {
        name: formValues.name,
        targetVmId: formValues.targetVmId, // 選択されたVMのID
        // description はAPI仕様に含まれていないため、送信しない
      };

      // APIリクエスト (`POST /api/snapshots`) を実行します
      const result = await executeSnapshotCreation(payload);

      // 結果に応じてトースト通知を表示し、親コンポーネントにイベントを通知します
      if (result.success) {
        // 成功した場合
        addToast({
          message: `スナップショット「${payload.name}」を作成しました。`,
          type: "success",
        });
        emit("success"); // 親コンポーネントに成功を通知
        emit("close"); // 親コンポーネントにモーダルを閉じるよう通知
      } else {
        // 失敗した場合
        addToast({
          message: "スナップショットの作成に失敗しました。",
          type: "error",
          details: result.error?.message, // APIからのエラーメッセージ詳細を表示
        });
      }
    });

  // ============================================================================
  // Expose (外部への公開)
  // コンポーネント側で利用するリアクティブな状態や関数を返却します。
  // ============================================================================
  return {
    errors, // バリデーションエラーオブジェクト ({ name?: string, targetVmId?: string })
    // フォームフィールドの値と属性
    name, // スナップショット名の v-model 用 (ref<string>)
    nameAttrs, // スナップショット名の v-bind 用
    targetVmId, // 対象VMの v-model 用 (ref<string | undefined>)
    // プルダウン（FormSelect）用データと状態
    virtualMachines, // VMリスト (ref<VirtualMachineDTO[] | null>)
    vmsPending, // VMリスト読み込み中か (ref<boolean>)
    vmsError, // VMリスト読み込みエラー (ref<Error | null>)
    // 状態とアクション
    isCreating, // API通信中か (ref<boolean>)
    onFormSubmit, // フォーム送信ハンドラ (バリデーション実行 + API送信)
  };
}
