/**
 * ポートフォリオオブジェクト
 */
export interface PortfolioDTO {
  /**
   * ポートフォリオを識別するための一意なID
   */
  id: string;
  /**
   * 過去24時間のビュー数
   */
  viewCount24Hour: number;
  /**
   * 過去7日間のビュー数
   */
  viewCount7Day: number;
}

export const PortfolioArticleStatusEnum = {
  Published: "published",
  Draft: "draft",
} as const;

export type PortfolioArticleStatusEnum =
  (typeof PortfolioArticleStatusEnum)[keyof typeof PortfolioArticleStatusEnum];
