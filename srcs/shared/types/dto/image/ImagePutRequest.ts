// ImagePutRequest.ts
// openapi ImagePutRequest.yml から自動生成
import type { ImageClientUpdatable } from "./ImageClientUpdatable";

/**
 * 仮想マシンイメージ更新リクエスト(PUT)オブジェクトのインターフェースにゃん
 * ImageClientUpdatable を継承
 */
export type ImagePutRequest = Omit<
  ImageClientUpdatable,
  "name" | "description"
> & {
  name: NonNullable<Required<ImageClientUpdatable>["name"]>;
  description: NonNullable<Required<ImageClientUpdatable>["description"]>;
}; // name と description を必須プロパティとして再定義するにゃん
