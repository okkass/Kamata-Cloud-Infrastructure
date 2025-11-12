/**
 * 仮想マシン作成リクエストの共通ベースオブジェクト
 */
interface VirtualMachineCreateBaseRequest {
  /**
   * 仮想マシンの名前
   */
  name: string;
  /**
   * 仮想マシンを収容する物理ノードのID
   */
  nodeId: string;
  /**
   * 仮想マシンを配置するサブネットのID
   */
  subnetId: string;
  /**
   * 仮想マシンに設定するSSH公開鍵
   */
  publicKey: string | null;
  /**
   * 使用する仮想マシンイメージのID
   */
  imageId: string | null;
  /**
   * インストールするミドルウェアのID
   */
  middleWareId?: string | null;
  /**
   * 仮想マシンにアタッチするストレージのリスト
   */
  storages: Array<VirtualMachineCreateRequestStoragesInnerDTO>;
  /**
   * 関連付けるセキュリティグループのIDリスト
   */
  securityGroupIds?: Array<string> | null;
}
