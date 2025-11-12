export const tabs = [
  {
    label: "詳細",
    value: "details",
    loader: () => import("~/components/detail/panels/DetailTabGeneral.vue"),
  },
  {
    label: "ネットワーキング",
    value: "network",
    loader: () => import("~/components/detail/panels/DetailTabNetwork.vue"),
  },
  {
    label: "ストレージ",
    value: "storage",
    loader: () => import("~/components/detail/panels/DetailTabStorage.vue"),
  },
];

//loaderを使わず直接読み込みたい場合 component: DetailTabGeneral のように指定できます
