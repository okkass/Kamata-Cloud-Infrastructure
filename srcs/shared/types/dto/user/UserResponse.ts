import type { UserServerBase } from "./UserServerBase";

/**
 * ユーザレスポンスオブジェクト
 *
 * allOf:
 *  - ./UserServerBase.yml
 *
 * required:
 *  - id
 *  - name
 *  - email
 *  - createdAt
 *  - isAdmin
 *  - lastLoginAt
 *  - permissions
 */
export interface UserResponse extends UserServerBase {}
