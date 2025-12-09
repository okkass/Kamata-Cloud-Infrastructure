/**
 * =================================================================================
 * ノード追加フォーム Composable (useAddNodeForm.ts)
 * ---------------------------------------------------------------------------------
 * ・自動検知されたノード候補の一覧取得 (GET /api/nodes/candidates)
 * ・ノードの追加実行 (POST /api/nodes)
 * =================================================================================
 */
import { useResourceList } from "~/composables/useResourceList";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// 型定義は自動インポート (NodeResponse, NodeCreateRequest)

export function useAddNodeForm() {
  const { addToast } = useToast();

  // 1. ノード候補一覧の取得
  // エンドポイントは仮定です。実環境に合わせて変更してください。
  const {
    data: candidateNodes,
    pending: candidatesPending,
    error: candidatesError,
    refresh: refreshCandidates,
  } = useResourceList<NodeResponse>("nodes/candidates");

  // 2. ノード追加 API (POST /api/nodes)
  const { executeCreate, isCreating } = useResourceCreate<
    NodeCreateRequest,
    NodeResponse
  >("nodes");

  /**
   * ノード追加処理
   * 確認ダイアログを表示し、OKなら追加を実行する
   */
  const handleAddNode = async (
    node: NodeResponse,
    emit: (event: "success" | "close") => void
  ) => {
    // 確認ダイアログ
    const confirmed = confirm(
      `ノード「${node.name} (${node.ipAddress})」をクラスターに追加しますか？\n\n※この操作は取り消せません。`
    );

    if (!confirmed) return;

    // リクエストペイロード作成
    const payload: NodeCreateRequest = {
      name: node.name,
      ipAddress: node.ipAddress,
      isAdmin: false, // 一般ノードとして追加
    };

    // API実行
    const result = await executeCreate(payload);

    if (result.success) {
      addToast({
        type: "success",
        message: `ノード「${node.name}」を追加しました。`,
      });
      // 成功したら一覧を再取得して、追加されたノードを候補から消す等の更新を行う
      await refreshCandidates();
      emit("success");
      // 連続追加できるよう、モーダルは閉じない仕様にします（必要なら close を呼んでください）
    } else {
      addToast({
        type: "error",
        message: "ノードの追加に失敗しました。",
        details: result.error?.message,
      });
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
