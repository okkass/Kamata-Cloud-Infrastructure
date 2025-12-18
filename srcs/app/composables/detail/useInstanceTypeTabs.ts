// composables/detail/useInstanceTypeTabs.ts

import type { Component } from "vue";

export type InstanceTypeTabConfig = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: Component;
};

export const instanceTypeTabs: InstanceTypeTabConfig[] = [
  {
    label: "基本情報",
    value: "basic",
    loader: () =>
      import(
        "~/components/detail/panels/InstanceType/InstanceTypeBasic.vue"
      ),
  },
];
