// ImageCreateRequest.ts
// openapi ImageCreateRequest.yml から自動生成
import type { ImageClientUpdatable } from "./ImageClientUpdatable";
import type { ImageCreateOnly } from "./ImageCreateOnly";

/**
 * 仮想マシンイメージ作成リクエストオブジェクトのインターフェースにゃん
 * ImageClientUpdatable, ImageCreateOnly を継承
 */
export interface ImageCreateRequest extends ImageClientUpdatable, ImageCreateOnly {}
