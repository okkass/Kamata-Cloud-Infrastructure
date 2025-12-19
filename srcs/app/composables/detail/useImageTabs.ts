// ~/composables/detail/useImageTabs.ts
import type { TabItem } from "~/components/detail/ResourceDetailShell.vue";

export const imageTabs = [
  {
    label: "基本情報",
    value: "basic",
    loader: () =>
      import(
        "~/components/detail/panels/Image/ImageTabBasic.vue"
      ),
  },
];