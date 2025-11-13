/**
 * 仮想マシンイメージ更新リクエストオブジェクト
 */
export interface ImageUpdateRequestDTO {
  /**
   * 仮想マシンイメージの名前
   */
  name?: string;
  /**
   * 仮想マシンイメージの説明
   */
  description?: string;
}
