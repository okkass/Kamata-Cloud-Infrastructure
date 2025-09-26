import { ref, shallowRef, markRaw } from "vue";

// ----------------------------------------------------------------------------
// State (シングルトン)
// ----------------------------------------------------------------------------
// Composable関数の外で定義することで、アプリ全体で単一の状態を共有する

/** 現在アクティブなモーダルのIDを保持する (例: 'delete-security-groups') */
const activeModal = ref<string | null>(null);

/** BaseModalで使うモーダルのタイトル */
const baseModalTitle = ref<string>("");

/** BaseModalで表示するコンポーネント本体 (shallowRef/markRawでパフォーマンス最適化) */
const baseModalContent = shallowRef<Component | null>(null);

// ----------------------------------------------------------------------------
// Composable
// ----------------------------------------------------------------------------

/**
 * アプリケーション全体のモーダル表示状態を管理するComposable
 */
export function useModal() {
  /**
   * モーダルを開く
   * @param {string} modalName - 開きたいモーダルのユニークなID
   * @param {BaseModalOptions} [options] - BaseModalで動的に中身を変える場合のオプション
   */
  const openModal = (modalName: string, options?: BaseModalOptions) => {
    // 最初にBaseModal関連のstateをリセットし、前回表示した情報が残るのを防ぐ
    baseModalTitle.value = "";
    baseModalContent.value = null;

    // optionsが渡された場合、BaseModal用のstateを設定
    if (options?.title) {
      baseModalTitle.value = options.title;
    }
    if (options?.component) {
      baseModalContent.value = markRaw(options.component);
    }

    // 最後に、指定されたモーダルのIDをアクティブにする
    activeModal.value = modalName;
  };

  /**
   * 現在開いているすべてのモーダルを閉じる
   */
  const closeModal = () => {
    activeModal.value = null;
    baseModalTitle.value = "";
    baseModalContent.value = null;
  };

  return {
    // State
    activeModal,
    baseModalTitle,
    baseModalContent,
    // Methods
    openModal,
    closeModal,
  };
}
