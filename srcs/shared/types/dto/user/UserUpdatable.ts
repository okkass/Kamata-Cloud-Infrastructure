/**
 * ユーザの更新可能プロパティ
 */
export interface UserUpdatable {
  /**
   * ユーザの表示名
   */
  name?: string;

  /**
   * ユーザのメールアドレス
   * format: email
   */
  email?: string;

  /**
   * ユーザが管理者権限を持つかどうか
   */
  isAdmin?: boolean;

  /**
   * ユーザがイメージ管理者かどうかを示すフラグ
   * example: false
   */
  isImageAdmin?: boolean;

  /**
   * ユーザがインスタンスタイプ管理者かどうかを示すフラグ
   * example: false
   */
  isInstanceTypeAdmin?: boolean;

  /**
   * ユーザが物理ノード管理者かどうかを示すフラグ
   * example: false
   */
  isPhysicalNodeAdmin?: boolean;
}
