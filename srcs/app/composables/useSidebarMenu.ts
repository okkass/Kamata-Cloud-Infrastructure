/**
 * useSidebarMenu.ts
 * サイドバーのメニュー構成を権限に応じて動的に生成するコンポーザブル
 */

interface MenuLink {
  text: string;
  href: string;
}

interface MenuSection {
  title: string;
  links: MenuLink[];
}

type PermissionCheckFn = (
  perms: ReturnType<typeof useUserPermission>
) => boolean;

interface SidebarMenuItemDef {
  title: string;
  links: MenuLink[];
  shouldDisplay: PermissionCheckFn;
}

/**
 * ユーザーの権限に応じてサイドバーメニューを生成
 */
export const useSidebarMenu = () => {
  const permissions = useUserPermission();

  /**
   * サイドバーメニュー項目定義
   * 各セクションに必要な権限を shouldDisplay 関数で定義
   */
  const sidebarMenuItems: SidebarMenuItemDef[] = [
    {
      title: "仮想マシン管理",
      links: [
        { text: "仮想マシン一覧", href: "/machine" },
        { text: "スナップショット", href: "/snapshot" },
        { text: "バックアップ管理", href: "/backup" },
      ],
      shouldDisplay: () => true,
    },
    {
      title: "仮想ネットワーク管理",
      links: [{ text: "仮想ネットワーク", href: "/network" }],
      shouldDisplay: () => true,
    },
    {
      title: "セキュリティグループ",
      links: [{ text: "セキュリティグループ", href: "/security-group" }],
      shouldDisplay: () => true,
    },
    {
      title: "ノード",
      links: [{ text: "ノード管理ダッシュボード", href: "/node" }],
      shouldDisplay: (p) => p.isNodeAdmin.value || p.isAdmin.value,
    },
    {
      title: "利用者管理",
      links: [{ text: "利用者管理ダッシュボード", href: "/user" }],
      shouldDisplay: (p) => p.isAdmin.value,
    },
    {
      title: "イメージ管理",
      links: [{ text: "イメージ管理ダッシュボード", href: "/image" }],
      shouldDisplay: (p) => p.isImageAdmin.value || p.isAdmin.value,
    },
    {
      title: "ストレージ",
      links: [{ text: "ストレージプール", href: "/storage-pool" }],
      shouldDisplay: (p) => p.isAdmin.value,
    },
    {
      title: "インスタンスタイプ",
      links: [{ text: "インスタンスタイプ", href: "/instance-type" }],
      shouldDisplay: (p) => p.isInstanceTypeAdmin.value || p.isAdmin.value,
    },
  ];

  /**
   * 権限に応じたメニューセクションを取得
   */
  const getSidebarMenuSections = computed((): MenuSection[] => {
    return sidebarMenuItems
      .filter((item) => item.shouldDisplay(permissions))
      .map((item) => ({
        title: item.title,
        links: item.links,
      }))
      .concat([
        {
          title: "その他",
          links: [{ text: "アカウント設定", href: "/settings" }],
        },
      ]);
  });

  /**
   * サイドバーのタイトルを取得
   */
  const getSidebarTitle = computed((): string => {
    return permissions.isAdmin.value || permissions.hasAdminAccess.value
      ? "管理者メニュー"
      : "利用者メニュー";
  });

  return {
    getSidebarMenuSections,
    getSidebarTitle,
  };
};
