// srcs/app/composables/detail/useSecurityGroupTabs.ts
import type { Component } from "vue";

export type SecurityGroupTabConfig = {
  label: string;
  value: string;
  loader?: () => Promise<any>;
  component?: Component;
};

export const securityGroupTabs: SecurityGroupTabConfig[] = [
  {
    label: "基本情報",
    value: "basic",
    loader: () =>
      import(
        "~/components/detail/panels/SecurityGroup/SecurityGroupTabBasic.vue"
      ),
  },
  {
    label: "ルール一覧",
    value: "rules",
    loader: () =>
      import(
        "~/components/detail/panels/SecurityGroup/SecurityGroupTabRules.vue"
      ),
  },
];
