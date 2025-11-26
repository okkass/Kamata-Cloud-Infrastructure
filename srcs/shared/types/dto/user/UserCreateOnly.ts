/**
 * ユーザ作成時のみに設定可能なプロパティ
 */
export interface UserCreateOnly {
  /**
   * ユーザのパスワード
   * format: password
   */
  password: string;
}
