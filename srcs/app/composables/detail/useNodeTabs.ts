import type { TabItem } from "~/components/detail/ResourceDetailShell.vue";

export const nodeTabs: TabItem[] = [
  {
    label: "基本情報",
    value: "basic",
    loader: () =>
      import("~/components/detail/panels/Node/NodeTabBasic.vue"),
  },
  {
    label: "使用率",
    value: "metrics",
    loader: () =>
      import("~/components/detail/panels/Node/NodeTabMetrics.vue"),
  },
];
