/**
 * 仮想マシンイメージ作成リクエストオブジェクト
 */
export interface ImageCreateRequestDTO {
  /**
   * 仮想マシンイメージの名前
   */
  name: string;
  /**
   * 仮想マシンイメージの説明
   */
  description?: string;
  /**
   * アップロードする仮想マシンイメージファイル(base64エンコードされたバイナリデータ)
   * @format binary
   */
  file: string;
}
