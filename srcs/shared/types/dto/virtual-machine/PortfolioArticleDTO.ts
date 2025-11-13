import { PortfolioArticleStatusEnum } from "./PortfolioDTO";
/**
 * ポートフォリオ記事オブジェクト
 */
export interface PortfolioArticleDTO {
  /**
   * ポートフォリオ記事を識別するための一意なID
   */
  id: string;
  /**
   * ポートフォリオ記事のタイトル
   */
  title: string;
  /**
   * ポートフォリオ記事が作成された日時
   */
  createdAt: string;
  status: PortfolioArticleStatusEnum;
}
