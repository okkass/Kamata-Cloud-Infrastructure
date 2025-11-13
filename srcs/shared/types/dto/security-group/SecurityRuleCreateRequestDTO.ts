import { SecurityRuleRuleTypeEnum } from "./SecurityRuleDTO";
import {
  SecurityRuleProtocolEnum,
  SecurityRuleActionEnum,
} from "./SecurityRuleDTO";

/**
 * セキュリティルール作成リクエストオブジェクト
 */
export interface SecurityRuleCreateRequestDTO {
  /**
   * セキュリティルールの名前
   */
  name: string;
  /**
   * ルールのタイプ（インバウンドまたはアウトバウンド）
   */
  ruleType: SecurityRuleRuleTypeEnum;
  /**
   * 適用されるポート番号
   */
  port: number | null;
  /**
   * 適用されるプロトコル
   */
  protocol: SecurityRuleProtocolEnum;
  /**
   * ターゲットIPアドレス
   */
  targetIp: string;
  /**
   * アクション（許可または拒否）
   */
  action: SecurityRuleActionEnum;
}
