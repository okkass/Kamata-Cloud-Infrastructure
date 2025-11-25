import type { UserCreateOnly } from "./UserCreateOnly";
import type { UserUpdatable } from "./UserUpdatable";

/**
 * ユーザ作成リクエストオブジェクト
 *
 * allOf:
 *  - ./UserCreateOnly.yml
 *  - ./UserUpdatable.yml
 *
 * NOTE: YAML の `required` (name, email, isAdmin) はこの合成の期待値です。型をより厳密にしたい場合は追加で調整してくださいにゃん。
 */
export interface UserCreateRequest extends UserCreateOnly, UserUpdatable {}
