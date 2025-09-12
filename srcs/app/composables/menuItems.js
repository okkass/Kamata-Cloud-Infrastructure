// composables/menuItems.js

// 利用者用のメニューデータ
export const userSidebarSections = [
  {
    title: "利用者ダッシュボード",
    links: [{ text: "利用者ダッシュボード", href: "/user/dashboard" }],
  },
  {
    title: "仮想ネットワーク管理",
    links: [{ text: "仮想ネットワーク", href: "/user/networks" }],
  },
  {
    title: "仮想マシン管理",
    links: [
      { text: "仮想マシン一覧", href: "/user/vms" },
      { text: "スナップショット", href: "/user/snapshots" },
    ],
  },
];

// 管理者用のメニューデータ
export const adminSidebarSections = [
  {
    title: "管理者ダッシュボード",
    links: [{ text: "管理者ダッシュボード", href: "/admin/dashboard" }],
  },
  {
    title: "物理ノード",
    links: [{ text: "物理ノードダッシュボード", href: "/admin/users" }],
  },
  {
    title: "利用者管理",
    links: [{ text: "利用者管理ダッシュボード", href: "/admin/users" }],
  },
  {
    title: "イメージ管理",
    links: [{ text: "イメージ管理ダッシュボード", href: "/admin/monitoring" }],
  },
];
