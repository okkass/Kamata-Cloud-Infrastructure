// ImageCreateRequest.ts
// openapi ImageCreateRequest.yml から自動生成
import type { ImageClientUpdatable } from "./ImageClientUpdatable";

/**
 * 仮想マシンイメージ作成リクエストオブジェクトのインターフェース
 * ImageServerBaseを継承
 */
export interface ImageCreateRequest extends ImageClientUpdatable {
    /** 仮想マシンイメージのname */
    name: string;
    /** 仮想マシンイメージの説明 */
    description?: string;
    /** ノードID */
    nodeId: string;
    /** imgファイル */
    file: string;
}