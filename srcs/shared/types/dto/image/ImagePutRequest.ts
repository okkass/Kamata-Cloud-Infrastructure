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
  name: ImageClientUpdatable["name"];
  description: ImageClientUpdatable["description"];
}; // name と description の型を元の型から継承するにゃん
