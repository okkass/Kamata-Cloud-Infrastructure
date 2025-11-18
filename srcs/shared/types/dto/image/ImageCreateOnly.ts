// ImageCreateOnly.ts
// openapi ImageCreateOnly.yml から自動生成
/**
 * 仮想マシンイメージ作成時に必要な情報を表すインターフェースにゃん
 */
export interface ImageCreateOnly {
  /**
   * 仮想マシンイメージのファイル(base64エンコードされたバイナリデータ)
   * format: binary
   */
  imageFile: string;
}
