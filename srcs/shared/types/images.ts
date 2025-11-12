/**
 * 仮想マシンイメージオブジェクト
 */
export interface ImageDTO {
  /**
   * 仮想マシンイメージを識別するための一意なID
   */
  id: string;
  /**
   * 仮想マシンイメージの名前
   */
  name: string;
  /**
   * 仮想マシンイメージの説明
   */
  description?: string;
  /**
   * 仮想マシンイメージが作成された日時
   */
  createdAt: string;
  /**
   * 仮想マシンイメージのサイズ
   */
  size: number;
}
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
