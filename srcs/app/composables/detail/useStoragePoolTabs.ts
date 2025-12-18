// composables/detail/useStoragePoolTabs.ts

import type { Component } from "vue";

export type StoragePoolTabConfig = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: Component;
};

export const storagePoolTabs: StoragePoolTabConfig[] = [
  {
    label: "基本情報",
    value: "basic",
    loader: () =>
      import("~/components/detail/panels/StoragePool/StoragePoolTabBasic.vue"),
  },
  {
    label: "物理ノード",
    value: "node",
    loader: () =>
      import("~/components/detail/panels/StoragePool/StoragePoolTabNode.vue"),
  },
];
