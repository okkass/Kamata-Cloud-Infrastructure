import { type Component } from "vue";

export interface BaseModalOptions {
  title?: string;
  component?: Component;
}

/**
 * モーダルフォーム Composables の汎用 Props インターフェース
 * @template T - フォーム対象のレスポンスデータ型
 */
export interface ModalFormProps<T> {
  show: boolean;
  data: T | null;
}