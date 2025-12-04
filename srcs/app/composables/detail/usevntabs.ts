// composables/detail/usevntabs.ts

import type { Component } from "vue";

export type VnTabConfig = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: Component;
};

export const vnTabs: VnTabConfig[] = [
  {
    label: "基本情報",
    value: "basic",
    loader: () =>
      import("~/components/detail/panels/VirtualNetwork/VnTabBasic.vue"),
  },
  {
    label: "サブネット",
    value: "subnets",
    loader: () =>
      import("~/components/detail/panels/VirtualNetwork/VnTabSubnets.vue"),
  },
  {
    label: "接続リソース",
    value: "attachments",
    loader: () =>
      import("~/components/detail/panels/VirtualNetwork/VnTabAttachments.vue"),
  },
];
