/**
 * =================================================================================
 * ノード追加フォーム Composable (useAddNodeForm.ts)
 * =================================================================================
 */
import { useResourceList } from "~/composables/useResourceList";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

export function useAddNodeForm() {
  const { addToast } = useToast();

  // 1. ノード候補一覧の取得
  const {
    data: candidateNodes,
    pending: candidatesPending,
    error: candidatesError,
    refresh: refreshCandidates,
  } = useResourceList<NodeResponse>("nodes");

  // 2. ノード追加 API (POST /api/nodes)
  const { executeCreate, isCreating } = useResourceCreate<
    NodeCreateRequest,
    NodeResponse
  >("nodes");

  /**
   * ノード追加実行処理
   * @param node 対象ノード
   * @param password 入力されたルートパスワード
   * @param emit イベントエミッター
   */
  const handleAddNode = async (
    node: NodeResponse,
    password: string,
    emit: (event: "success" | "close") => void
  ) => {
    // [変更] ブラウザ標準のconfirmは廃止し、呼出し元で確認モーダルを制御する設計に変更

    // リクエストペイロード作成
    const payload: NodeCreateRequest = {
      name: node.name,
      ipAddress: node.ipAddress,
      isAdmin: false,
      rootPassword: password,
    };

    // API実行
    const result = await executeCreate(payload);

    if (result.success) {
      addToast({
        type: "success",
        message: `ノード「${node.name}」を追加しました。`,
      });

      // 成功したら一覧を再取得（追加済みのノードをリストから消すため）
      await refreshCandidates();

      // [質問への回答] 連続追加を可能にするため、ここでは 'success' のみを通知し、
      // 'close' イベントは発火させない仕様とします。
      // ※ 親コンポーネントが @success でモーダルを閉じる実装になっている場合は親側の修正が必要です。
      emit("success");

      return true;
    } else {
      addToast({
        type: "error",
        message: "ノードの追加に失敗しました。",
        details: result.error?.message,
      });
      return false;
    }
  };

  return {
    candidateNodes,
    candidatesPending,
    candidatesError,
    isCreating,
    handleAddNode,
    refreshCandidates,
  };
}
