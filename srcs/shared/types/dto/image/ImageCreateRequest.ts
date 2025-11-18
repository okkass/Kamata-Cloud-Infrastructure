// ImageCreateRequest.ts
// openapi ImageCreateRequest.yml から自動生成
import type { ImageClientUpdatable } from "./ImageClientUpdatable";

/**
 * 仮想マシンイメージ作成リクエストオブジェクトのインターフェースにゃん
 * ImageClientUpdatableを継承
 */
export type ImageCreateRequest = Omit<ImageClientUpdatable, "name"> & {
  name: NonNullable<Required<ImageClientUpdatable["name"]>>;
}; // name を必須プロパティとして再定義するにゃん
