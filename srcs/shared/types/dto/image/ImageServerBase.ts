// ImageServerBase.ts
// openapi ImageServerBase.yml から自動生成
/**
 * 仮想マシンイメージの基本情報を表すインターフェースにゃん
 */
export interface ImageServerBase {
  /** 仮想マシンイメージを識別するための一意なID (uuid) */
  id: string;
  /** 仮想マシンイメージの名前 */
  name: string;
  /** 仮想マシンイメージの説明 */
  description?: string;
  /** 仮想マシンイメージが作成された日時 (ISO8601) */
  createdAt: string;
  /** 仮想マシンイメージのサイズ(バイト単位) */
  size: number;
}
