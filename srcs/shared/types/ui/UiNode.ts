import type { NodeResponse } from "../api-types";

/**
 * UI表示用に整形された物理ノードのデータ型。
 * APIから取得した`NodeResponse`を、ダッシュボードのテーブルなどで
 * 表示しやすい形式に変換したものです。
 */
export type UiNode = {
  /**
   * 物理ノードを識別するための一意なID
   * (NodeResponse.id と同じ)
   */
  id: string;

  /**
   * 物理ノードの名前
   * (NodeResponse.name と同じ)
   */
  name: string;

  /**
   * 物理ノードのIPアドレス
   * (NodeResponse.ipAddress に対応)
   */
  ip: string;

  /**
   * 物理ノードの状態
   */
  status: NodeResponse["status"];

  /**
   * CPU使用率 (UI表示用のパーセント文字列)
   * (例: NodeResponse.cpuUtilization の 0.7 を '70%' に変換)
   */
  cpu: string;

  /**
   * メモリ使用率 (UI表示用のパーセント文字列)
   * (例: NodeResponse.memoryUtilization の 0.6 を '60%' に変換)
   */
  mem: string;

  /**
   * ストレージ使用率 (UI表示用のパーセント文字列)
   * (例: NodeResponse.storageUtilization の 0.8 を '80%' に変換)
   */
  storage: string;

  /**
   * 物理ノードが管理ノードかどうかを示すフラグ
   * (NodeResponse.isAdmin に対応)
   */
  isMgmt: boolean;

  /**
   * 物理ノードが作成された日時 (ISO文字列)
   * (NodeResponse.createdAt と同じ。必要に応じて`formatDateTime`などでフォーマットして表示)
   */
  createdAt: string;
};
