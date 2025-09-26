import { ref, shallowRef, markRaw, type Component } from "vue";

const activeModal = ref<null | string>(null);
const baseModalTitle = ref<string>("");
const baseModalContent = shallowRef<null | Component>(null);

export function useModal() {
  /**
   * モーダルを開く
   * @param {string} modalName - 開きたいモーダルの識別子
   * @param {object} [options] - BaseModalを使用する場合のオプション
   * @param {string} [options.title] - BaseModalのタイトル
   * @param {Component} [options.component] - BaseModalで表示するコンポーネント
   */
  const openModal = (
    modalName: string,
    options?: { title?: string; component?: Component }
  ) => {
    baseModalTitle.value = "";
    baseModalContent.value = null;
    if (options) {
      if (options.title) {
        baseModalTitle.value = options.title;
      }
      if (options.component) {
        baseModalContent.value = markRaw(options.component);
      }
    }
    activeModal.value = modalName;
  };

  /**
   * モーダルを閉じる
   */
  const closeModal = () => {
    activeModal.value = null;
    baseModalTitle.value = "";
    baseModalContent.value = null;
  };

  return {
    activeModal,
    baseModalTitle,
    baseModalContent,
    openModal,
    closeModal,
  };
}
