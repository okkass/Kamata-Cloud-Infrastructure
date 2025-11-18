import type { UserUpdatable } from "./UserUpdatable";

/**
 * ユーザ更新リクエストオブジェクト
 *
 * allOf:
 *  - ./UserUpdatable.yml
 *
 * required:
 *  - name
 *  - email
 */
export interface UserPutRequest extends UserUpdatable {
  /** ユーザの表示名 */
  name: string;
  /** ユーザのメールアドレス */
  email: string;
  /** ユーザが管理者権限を持つかどうか */
  isAdmin: boolean;
  /**
   * ユーザがイメージ管理者かどうかを示すフラグ
   * example: false
   */
  isImageAdmin: boolean;
  /**
   * ユーザがインスタンスタイプ管理者かどうかを示すフラグ
   * example: false
   */
  isInstanceTypeAdmin: boolean;
  /**
   * ユーザが物理ノード管理者かどうかを示すフラグ
   * example: false
   */
  isPhysicalNodeAdmin: boolean;
  /**
   * ユーザが仮想マシン管理者かどうかを示すフラグ
   */
  isVirtualMachineAdmin: boolean;
  /**
   * ユーザがネットワーク管理者かどうかを示すフラグ
   */
  isNetworkAdmin: boolean;
  /**
   * ユーザがセキュリティグループ管理者かどうかを示すフラグ
   */
  isSecurityGroupAdmin: boolean;
}
