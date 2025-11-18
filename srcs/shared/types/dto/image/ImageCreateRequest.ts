// ImageCreateRequest.ts
// openapi ImageCreateRequest.yml から自動生成
import type { ImageClientUpdatable } from "./ImageClientUpdatable";

/**
 * 仮想マシンイメージ作成リクエストオブジェクトのインターフェースにゃん
 * ImageClientUpdatableを継承
 */
export interface ImageCreateRequest extends ImageClientUpdatable {
  name: string;
}
