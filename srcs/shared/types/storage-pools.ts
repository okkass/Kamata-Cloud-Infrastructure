/**
 * ネットワークストレージプールオブジェクト
 */
export interface NetworkStoragePoolDTO {
  /**
   * ストレージプールを識別するための一意なID
   */
  id: string;
  /**
   * ストレージプールの名前
   */
  name: string;
  /**
   * ストレージプールが作成された日時
   */
  createdAt: string;
  /**
   * ストレージプールの総サイズ（バイト単位）
   */
  totalSize: number;
  /**
   * 使用中のストレージサイズ（バイト単位）
   */
  usedSize: number;
  /**
   * 対応するローカルストレージプールのID
   */
  localStoragePoolId: string;
}
/**
 * ローカルストレージプールオブジェクト
 */
export interface LocalStoragePoolDTO {
  /**
   * ストレージプールを識別するための一意なID
   */
  id: string;
  /**
   * ストレージプールの名前
   */
  name: string;
  /**
   * ストレージプールが作成された日時
   */
  createdAt: string;
  /**
   * ストレージプールの総サイズ（バイト単位）
   */
  totalSize: number;
  /**
   * 使用中のストレージサイズ（バイト単位）
   */
  usedSize: number;
  /**
   * ストレージプールが存在する物理ノードのID
   */
  nodeId: string;
  /**
   * ストレージデバイスのパス
   */
  devFile: string;
}

/**
 * ローカルストレージプール作成リクエストオブジェクト
 */
export interface LocalStoragePoolCreateRequestDTO {
  /**
   * ストレージプールの名前
   */
  name: string;
  /**
   * ストレージプールを作成する物理ノードのID
   */
  nodeId: string;
  /**
   * ストレージプールのサイズ（バイト単位）
   */
  size: number;
  /**
   * ストレージデバイスのパス
   */
  devFile: string;
}

/**
 * ストレージデバイスファイルオブジェクト
 */
export interface DeviceFileDTO {
  /**
   * ストレージデバイスのパス
   */
  file: string;
  /**
   * ストレージデバイスのサイズ（バイト単位）
   */
  size: number;
  /**
   * ストレージデバイスのベンダー情報
   */
  vendor: string;
  /**
   * ストレージデバイスのモデル情報
   */
  model: string;
}

/**
 * ネットワークストレージプール作成リクエストオブジェクト
 */
export interface NetworkStoragePoolCreateRequestDTO {
  /**
   * ストレージプールの名前
   */
  name: string;
  /**
   * ストレージプールのサイズ（バイト単位）
   */
  size: number;
  /**
   * 使用するローカルストレージのID
   */
  localStorageId: string;
}
