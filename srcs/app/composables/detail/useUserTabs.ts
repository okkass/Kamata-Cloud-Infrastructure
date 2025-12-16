// /workspace/srcs/app/composables/detail/useusertabs.ts

import type { Component } from "vue";

export type UserTabConfig = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: Component;
};

// ★ ユーザー詳細のタブ構成
export const userTabs: UserTabConfig[] = [
  {
    label: "基本情報",
    value: "basic",
    loader: () =>
      import(
        "~/components/detail/panels/User/UserTabBasic.vue"
      ),
  },
  {
    label: "権限・リソース",
    value: "permissions",
    loader: () =>
      import(
        "~/components/detail/panels/User/UserTabPermissions.vue"
      ),
  },
];
