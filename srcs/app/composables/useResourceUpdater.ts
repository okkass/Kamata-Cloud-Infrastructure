import { ref, computed, watch, type Ref } from "vue";

// ==========================================
// 型定義
// ==========================================

/**
 * 配列（サブリソース）の差分検知設定
 */
interface CollectionConfig {
  /** サブリソースのエンドポイント (例: `/api/vms/1/nics`) */
  endpoint: string;
  /** IDとして扱うプロパティ名 (例: `id`) */
  idKey: string;
  /** 新規アイテムを識別するためのIDプレフィックス (例: `new-`) */
  newIdPrefix: string;
  /** 変更(PATCH)を検知するプロパティ名のリスト */
  fields: string[];
}

/**
 * リソース全体の差分検知設定
 */
export interface ResourceConfig {
  /** メインリソース（基本情報）の設定 */
  base?: {
    /** エンドポイント (例: `/api/vms/1`) */
    endpoint: string;
    /** 変更(PATCH)を検知するプロパティ名のリスト */
    fields: string[];
  };
  /** 配列（サブリソース）の設定マップ */
  collections?: Record<string, CollectionConfig>;
}

/**
 * 計算された差分データの構造
 */
type DirtyState = {
  /** 基本情報の変更分 (PATCH用) */
  base: Record<string, any>;
  /** コレクションごとの変更分 */
  collections: {
    [key: string]: {
      /** 新規追加リスト (POST用) */
      added: any[];
      /** 削除対象IDリスト (DELETE用) */
      removed: string[];
      /** 更新対象リスト (PATCH用) */
      updated: { id: string; payload: Record<string, any> }[];
    };
  };
};

// ==========================================
// Composable 本体
// ==========================================

/**
 * データモデルの変更を追跡し、RESTful APIリクエストを生成・実行する汎用コンポーザブル
 * * @param originalData 変更前のオリジナルデータ (Ref)
 * @param editedData 編集中のリアクティブデータ (reactiveオブジェクト)
 * @param config APIマッピングと差分検知の設定
 */
export function useResourceUpdater<T extends Record<string, any>>(
  originalData: Ref<T | null>,
  editedData: T,
  config: ResourceConfig
) {
  // --- 状態管理 ---
  const isSaving = ref(false);
  const errorMessage = ref<string | null>(null);
  const dirtyState = ref<DirtyState>(createEmptyDirtyState());

  /** 空の差分状態オブジェクトを生成するヘルパー */
  function createEmptyDirtyState(): DirtyState {
    return { base: {}, collections: {} };
  }

  // ==========================================
  // 差分計算ロジック (内部ヘルパー関数)
  // ==========================================

  /**
   * 基本情報 (Base) の差分を計算
   */
  const calculateBaseDiff = (original: T, edited: T) => {
    const diff: Record<string, any> = {};
    if (!config.base) return diff;

    for (const field of config.base.fields) {
      // 厳密等価演算子で比較
      if (original[field] !== edited[field]) {
        diff[field] = edited[field];
      }
    }
    return diff;
  };

  /**
   * コレクション (配列) の差分を計算
   */
  const calculateCollectionDiff = (key: string, original: T, edited: T) => {
    const result = {
      added: [] as any[],
      removed: [] as string[],
      updated: [] as any[],
    };
    const collConfig = config.collections?.[key];

    if (!collConfig) return null;

    const originalItems: any[] = original[key] || [];
    const editedItems: any[] = edited[key] || [];

    // IDで高速検索できるようにMap化
    const originalMap = new Map(
      originalItems.map((item) => [item[collConfig.idKey], item])
    );
    const editedMap = new Map(
      editedItems.map((item) => [item[collConfig.idKey], item])
    );

    // 1. Added (POST) & Updated (PATCH) の検知
    for (const editedItem of editedItems) {
      const id = editedItem[collConfig.idKey];

      // 新規追加 (IDがプレフィックスで始まる場合)
      if (typeof id === "string" && id.startsWith(collConfig.newIdPrefix)) {
        // API送信時は一時的なIDを除外する
        const { [collConfig.idKey]: _tempId, ...payload } = editedItem;
        result.added.push(payload);
      }
      // 既存項目の更新チェック
      else {
        const originalItem = originalMap.get(id);
        if (originalItem) {
          const updatePayload: Record<string, any> = {};

          // 指定されたフィールドのみ比較
          for (const field of collConfig.fields) {
            if (originalItem[field] !== editedItem[field]) {
              updatePayload[field] = editedItem[field];
            }
          }

          if (Object.keys(updatePayload).length > 0) {
            result.updated.push({ id, payload: updatePayload });
          }
        }
      }
    }

    // 2. Removed (DELETE) の検知
    for (const originalItem of originalItems) {
      const id = originalItem[collConfig.idKey];
      // 編集後のリストに含まれていなければ削除とみなす
      if (!editedMap.has(id)) {
        result.removed.push(id);
      }
    }

    // 変更がなければ null を返す (dirtyState にキーを追加しないため)
    if (
      result.added.length === 0 &&
      result.removed.length === 0 &&
      result.updated.length === 0
    ) {
      return null;
    }

    return result;
  };

  /**
   * 全体の差分計算を実行するメイン関数
   */
  const calculateDiff = (): DirtyState => {
    if (!originalData.value) return createEmptyDirtyState();

    const original = originalData.value;
    const edited = editedData;
    const newState = createEmptyDirtyState();

    // 1. Baseの差分
    const baseDiff = calculateBaseDiff(original, edited);
    if (Object.keys(baseDiff).length > 0) {
      newState.base = baseDiff;
    }

    // 2. Collectionsの差分
    if (config.collections) {
      for (const key in config.collections) {
        const collectionDiff = calculateCollectionDiff(key, original, edited);
        if (collectionDiff) {
          newState.collections[key] = collectionDiff;
        }
      }
    }

    return newState;
  };

  // ==========================================
  // 監視 (Watch)
  // ==========================================

  // editedData の変更を深く(deep)監視し、差分を再計算
  watch(
    () => editedData,
    () => {
      dirtyState.value = calculateDiff();
    },
    { deep: true }
  );

  /**
   * 変更が存在するかどうかのフラグ
   */
  const isDirty = computed(
    () =>
      Object.keys(dirtyState.value.base).length > 0 ||
      Object.keys(dirtyState.value.collections).length > 0
  );

  // ==========================================
  // アクション (Methods)
  // ==========================================

  /**
   * 編集内容をリセットし、元データに戻す
   */
  const reset = () => {
    if (originalData.value) {
      // structuredClone は新しいブラウザ/Nodeで使える高速なディープコピー
      // 未対応環境のために JSON フォールバックを用意
      try {
        const clone = structuredClone(originalData.value);
        Object.assign(editedData, clone);
      } catch {
        const clone = JSON.parse(JSON.stringify(originalData.value));
        Object.assign(editedData, clone);
      }
    }
  };

  /**
   * 差分に基づいてAPIリクエストを実行
   * @returns {Promise<boolean>} 成功ならtrue, 失敗ならfalse
   */
  const save = async (): Promise<boolean> => {
    if (!isDirty.value) return true;

    isSaving.value = true;
    errorMessage.value = null;

    // Promiseの配列（実行するリクエスト一覧）
    const apiRequests: Promise<any>[] = [];

    // 1. Base Request (PATCH)
    if (Object.keys(dirtyState.value.base).length > 0 && config.base) {
      apiRequests.push(
        $fetch(config.base.endpoint, {
          method: "PATCH",
          body: dirtyState.value.base,
        })
      );
    }

    // 2. Collection Requests
    for (const key in dirtyState.value.collections) {
      const collConfig = config.collections![key];
      const state = dirtyState.value.collections[key];

      // stateやcollConfigが存在しない場合はスキップ
      if (!state || !collConfig) continue;

      // POST (Added)
      state.added.forEach((payload) => {
        apiRequests.push(
          $fetch(collConfig.endpoint, { method: "POST", body: payload })
        );
      });

      // DELETE (Removed)
      state.removed.forEach((id) => {
        apiRequests.push(
          $fetch(`${collConfig.endpoint}/${id}`, { method: "DELETE" })
        );
      });

      // PATCH (Updated)
      state.updated.forEach((update) => {
        apiRequests.push(
          $fetch(`${collConfig.endpoint}/${update.id}`, {
            method: "PATCH",
            body: update.payload,
          })
        );
      });
    }

    // --- リクエスト並列実行 ---
    try {
      // Promise.allSettled ですべての結果を待ち受ける（途中で失敗しても他は実行される）
      const results = await Promise.allSettled(apiRequests);
      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length > 0) {
        console.error("Save partial failure:", failed);
        errorMessage.value = `保存中にエラーが発生しました (${failed.length}件の失敗)`;
        return false;
      }

      // 成功時：差分状態をクリア
      dirtyState.value = createEmptyDirtyState();
      return true;
    } catch (e: any) {
      console.error("Unexpected save error:", e);
      errorMessage.value = "予期せぬエラーが発生しました。";
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  return {
    save,
    reset,
    isDirty,
    isSaving,
    errorMessage,
    // デバッグ用にReadonlyにして公開
    dirtyState: computed(() => dirtyState.value),
  };
}
