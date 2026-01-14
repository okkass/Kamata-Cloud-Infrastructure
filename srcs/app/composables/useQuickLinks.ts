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
      shouldDisplay: (p) =>
        p.isVirtualMachineAdmin.value ||
        p.isAdmin.value ||
        !p.hasAdminAccess.value,
    },
    {
      text: "ノード",
      href: "/node",
      shouldDisplay: (p) => p.isNodeAdmin.value || p.isAdmin.value,
    },
    {
      text: "イメージ管理",
      href: "/image",
      shouldDisplay: (p) => p.isImageAdmin.value || p.isAdmin.value,
    },
    {
      text: "インスタンスタイプ",
      href: "/instance-type",
      shouldDisplay: (p) => p.isInstanceTypeAdmin.value || p.isAdmin.value,
    },
    {
      text: "仮想ネットワーク管理",
      href: "/network",
      shouldDisplay: (p) =>
        p.isNetworkAdmin.value || p.isAdmin.value || !p.hasAdminAccess.value,
    },
    {
      text: "セキュリティグループ",
      href: "/security-group",
      shouldDisplay: (p) =>
        p.isSecurityGroupAdmin.value ||
        p.isVirtualMachineAdmin.value ||
        p.isAdmin.value ||
        !p.hasAdminAccess.value,
    },
    {
      text: "ストレージ",
      href: "/storage-pool",
      shouldDisplay: (p) => p.isAdmin.value,
    },
    {
      text: "利用者管理",
      href: "/user",
      shouldDisplay: (p) => p.isAdmin.value,
    },
    {
      text: "アカウント設定",
      href: "/settings",
      shouldDisplay: () => true, // 全員表示
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
