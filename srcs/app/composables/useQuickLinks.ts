/**
 * useQuickLinks.ts
 * クイックリンクを権限に応じて動的に生成するコンポーザブル
 */

interface QuickLink {
  text: string;
  href: string;
}

type PermissionCheckFn = (
  perms: ReturnType<typeof useUserPermission>
) => boolean;

interface QuickLinkItemDef {
  text: string;
  href: string;
  shouldDisplay: PermissionCheckFn;
}

/**
 * ユーザーの権限に応じてクイックリンクを生成
 */
export const useQuickLinks = () => {
  const permissions = useUserPermission();

  /**
   * クイックリンク項目定義
   * 各リンクに必要な権限を shouldDisplay 関数で定義
   */
  const quickLinkDefinitions: QuickLinkItemDef[] = [
    {
      text: "仮想マシン管理",
      href: "/machine",
      shouldDisplay: () => true,
    },
    {
      text: "仮想ネットワーク管理",
      href: "/network",
      shouldDisplay: () => true,
    },
    {
      text: "セキュリティグループ",
      href: "/security-group",
      shouldDisplay: () => true,
    },
  ];

  /**
   * 権限に応じたクイックリンクを取得
   */
  const getQuickLinks = computed((): QuickLink[] => {
    return quickLinkDefinitions
      .filter((item) => item.shouldDisplay(permissions))
      .map((item) => ({
        text: item.text,
        href: item.href,
      }));
  });

  return {
    getQuickLinks,
  };
};
