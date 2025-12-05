// srcs/app/composables/detail/useUserTabs.ts

import type { Component } from "vue";

export type UserTabConfig = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: Component;
};

export const userTabs: UserTabConfig[] = [
  {
    label: "基本情報",
    value: "basic",
    loader: () =>
      import(
        "~/components/detail/panels/User/UserTabBasic.vue"
      ),
  },
  // 将来タブを増やしたくなったらここに足していく
];
