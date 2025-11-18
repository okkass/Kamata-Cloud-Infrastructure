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
}
