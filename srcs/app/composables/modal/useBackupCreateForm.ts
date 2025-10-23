/**
 * =================================================================================
 * バックアップ作成フォーム Composable (useBackupCreateForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoBackupCreateコンポーネントで使用される
 * フォームの状態管理、バリデーション、依存関係のあるプルダウンのデータ取得、
 * API送信ロジックをカプセル化します。
 * APIの型定義は `~/shared/types` ディレクトリからインポートします。
 * =================================================================================
 */
import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useResourceList } from "~/composables/useResourceList";
import { useToast } from "~/composables/useToast";
// ★ 共有型定義ファイルから型をインポート (パスを修正)
import type { BackupCreateRequestDTO, BackupDTO } from "~~/shared/types"; // バックアップ用
import type { VirtualMachineDTO, AttachedStorageDTO } from "~~/shared/types"; // VM用

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "バックアップ名は必須です。"),
  targetVmId: z.string({ required_error: "仮想マシンを選択してください。" }),
  targetStorageId: z.string({
    required_error: "ストレージを選択してください。",
  }),
});

const validationSchema = toTypedSchema(zodSchema);
// Zodスキーマからフォームの型を推論します
type FormValues = z.infer<typeof zodSchema>;

/**
 * メインのComposable関数
 */
export function useBackupCreateForm() {
  // ============================================================================
  // Form Setup (フォーム設定)
  // VeeValidateのuseFormを使って、フォーム全体を管理します。
  // ============================================================================
  const { errors, defineField, handleSubmit, setFieldValue, values } =
    useForm<FormValues>({
      validationSchema,
      initialValues: {
        // フォームの初期値を設定します
        name: "",
        targetVmId: undefined, // 初期状態では未選択
        targetStorageId: undefined, // 初期状態では未選択
      },
    });

  // 各フォームフィールドとVeeValidateを連携させます
  const [name, nameAttrs] = defineField("name");
  const [targetVmId] = defineField("targetVmId"); // FormSelect用
  const [targetStorageId] = defineField("targetStorageId"); // FormSelect用

  // ============================================================================
  // API Data Fetching (APIデータ取得)
  // ============================================================================
  const { addToast } = useToast();

  // --- 仮想マシン一覧の取得 ---
  // (このAPIレスポンスが 'attachedStorages' を含む)
  const {
    data: virtualMachines,
    pending: vmsPending,
    error: vmsError,
  } = useResourceList<VirtualMachineDTO>("virtual-machines"); // VM一覧APIのエンドポイント

  // --- 選択されたVMに紐づくストレージ一覧 (Computed) ---
  // 404エラー修正: 別のAPIを叩かず、取得済みのVMリストからストレージを計算する
  const availableStorages = computed(() => {
    // 1. 選択中のVM IDを取得
    const selectedVmId = values.targetVmId;
    if (!selectedVmId || !virtualMachines.value) {
      return []; // VMが未選択、またはVMリストが未ロードの場合は空
    }

    // 2. VMリストから選択中のVMオブジェクトを検索
    const selectedVm = virtualMachines.value.find(
      (vm) => vm.id === selectedVmId
    );
    if (!selectedVm || !selectedVm.attachedStorages) {
      return []; // VMが見つからない、またはストレージがない場合は空
    }

    // 3. API仕様に基づき、`attachedStorages` 配列から `storage` オブジェクトを抽出します。
    //    `FormSelect` は `options` として `{ id: '...', name: '...' }` の配列を期待しているため、
    //    `attachment.storage` オブジェクト (これが期待される形式) をそのまま返します。
    return selectedVm.attachedStorages
      .map((attachment) => attachment.storage) // attachment.storage ({ id, name, ... }) を抽出
      .filter((storage) => !!storage); // storage が null や undefined の場合を除外
  });

  // targetVmId が変更されたら、ストレージのプルダウン選択をリセットする
  watch(targetVmId, (newVmId, oldVmId) => {
    // 選択肢が変更された場合のみリセット
    if (newVmId !== oldVmId) {
      setFieldValue("targetStorageId", undefined); // ストレージ選択をリセット
    }
  });

  // ============================================================================
  // API Submission (API送信処理)
  // API仕様 'POST /api/backups' に基づき、{ name, targetStorageId } を送信します。
  // ============================================================================
  const { executeCreate: executeBackupCreation, isCreating } =
    useResourceCreate<
      BackupCreateRequestDTO, // 送信データ型 { name, targetStorageId }
      BackupDTO // 受信データ型
    >("backups"); // APIエンドポイント '/api/backups' に対応

  /**
   * フォーム送信時の処理を定義します。
   * handleSubmitでラップされているため、バリデーション通過後にのみ実行されます。
   * @param emit - 親コンポーネントへイベントを通知するための関数 ('success', 'close')
   */
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      // APIに送信するデータ（ペイロード）を構築します
      const payload: BackupCreateRequestDTO = {
        name: formValues.name,
        targetStorageId: formValues.targetStorageId, // UIで選択された「バックアップ対象のストレージ」ID
      };

      // APIリクエスト (`POST /api/backups`) を実行します
      const result = await executeBackupCreation(payload);

      // 結果に応じてトースト通知を表示し、親コンポーネントにイベントを通知します
      if (result.success) {
        addToast({
          message: `バックアップ「${payload.name}」を作成しました。`,
          type: "success",
        });
        emit("success"); // 成功イベントを通知
        emit("close"); // モーダルを閉じるイベントを通知
      } else {
        addToast({
          message: "バックアップの作成に失敗しました。",
          type: "error",
          details: result.error?.message, // APIからのエラー詳細を表示
        });
      }
    });

  // ============================================================================
  // Expose (外部への公開)
  // コンポーネント側で利用するリアクティブな状態や関数を返却します。
  // ============================================================================
  return {
    errors, // バリデーションエラーオブジェクト
    // フォームフィールドの値と属性
    name,
    nameAttrs,
    targetVmId, // v-model用 (選択されたVM ID)
    targetStorageId, // v-model用 (選択されたストレージ ID)
    // プルダウン用データと状態
    virtualMachines, // VMリスト (ref<VirtualMachineDTO[] | null>)
    vmsPending, // VMリスト読み込み中か (ref<boolean>)
    vmsError, // VMリスト読み込みエラー (ref<Error | null>)
    availableStorages, // 選択中VMのストレージリスト (computed<StorageDTO[]>)
    // ★ ストレージのPending/Errorは、VMのPending/Errorと連動させる
    storagesPending: vmsPending, // VM読み込み中 = ストレージもまだ不明
    storagesError: vmsError, // VM読み込みエラー = ストレージも取得不可
    // 状態とアクション
    isCreating, // API通信中か (ローディング表示用)
    onFormSubmit, // フォーム送信ハンドラ
  };
}
