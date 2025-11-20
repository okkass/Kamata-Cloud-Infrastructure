import { PhysicalNodeStatusEnum } from "../dto/node/PhysicalNodeDTO";

/**
 * UI表示用に整形された物理ノードのデータ型。
 * APIから取得した`PhysicalNodeDTO`を、ダッシュボードのテーブルなどで
 * 表示しやすい形式に変換したものです。
 */
export type UiNode = {
  /**
   * 物理ノードを識別するための一意なID
   * (PhysicalNodeDTO.id と同じ)
   */
  id: string;

  /**
   * 物理ノードの名前
   * (PhysicalNodeDTO.name と同じ)
   */
  name: string;

  /**
   * 物理ノードのIPアドレス
   * (PhysicalNodeDTO.ipAddress に対応)
   */
  ip: string;

  /**
   * 物理ノードの状態
   */
  status: PhysicalNodeStatusEnum;

  /**
   * CPU使用率 (UI表示用のパーセント文字列)
   * (例: PhysicalNodeDTO.cpuUtilization の 0.7 を '70%' に変換)
   */
  cpu: string;

  /**
   * メモリ使用率 (UI表示用のパーセント文字列)
   * (例: PhysicalNodeDTO.memoryUtilization の 0.6 を '60%' に変換)
   */
  mem: string;

  /**
   * ストレージ使用率 (UI表示用のパーセント文字列)
   * (例: PhysicalNodeDTO.storageUtilization の 0.8 を '80%' に変換)
   */
  storage: string;

  /**
   * 物理ノードが管理ノードかどうかを示すフラグ
   * (PhysicalNodeDTO.isAdmin に対応)
   */
  isMgmt: boolean;

  /**
   * 物理ノードが作成された日時 (ISO文字列)
   * (PhysicalNodeDTO.createdAt と同じ。必要に応じて`formatDateTime`などでフォーマットして表示)
   */
  createdAt: string;
};
