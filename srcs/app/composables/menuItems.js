// composables/menuItems.js

// 利用者用のメニューデータ
export const userSidebarSections = [
  {
    title: "利用者ダッシュボード",
    links: [{ text: "利用者ダッシュボード", href: "/user-dashboard" }],
  },
  {
    title: "仮想ネットワーク管理",
    links: [{ text: "仮想ネットワーク", href: "/network" }],
  },
  {
    title: "仮想マシン管理",
    links: [
      { text: "仮想マシン一覧", href: "/machine" },
      { text: "スナップショット", href: "/snapshot" },
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
    title: "ノード",
    links: [{ text: "ノード管理ダッシュボード", href: "/node" }],
  },
  {
    title: "利用者管理",
    links: [{ text: "利用者管理ダッシュボード", href: "/user" }],
  },
  {
    title: "イメージ管理",
    links: [{ text: "イメージ管理ダッシュボード", href: "/image" }],
  },
];
