// MiddlewareServerBase.ts
// openapi MiddlewareServerBase.yml から自動生成
/**
 * ミドルウェアの基本情報を表すインターフェース
 */
export interface MiddlewareServerBase {
  /** ミドルウェアを識別するための一意なID (uuid) */
  id: string;
  /** ミドルウェアの名前 */
  name: string;
}
