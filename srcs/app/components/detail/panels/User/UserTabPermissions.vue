<template>
  <section class="space-y-4">
    <h2 class="detail-heading-sm">権限・リソース上限</h2>

    <div class="detail-card space-y-6">
      <!-- 管理者権限 -->
      <div>
        <div class="detail-label">管理者権限</div>

        <div v-if="hasAnyAdmin" class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="item in adminFlags"
            :key="item.key"
            class="detail-pill"
            :class="item.enabled ? 'detail-pill-yes' : 'detail-pill-no'"
          >
            {{ item.label }}
          </span>
        </div>

        <p v-else class="mt-2 text-sm text-neutral-500">
          管理者権限は付与されていません。
        </p>
      </div>

      <!-- リソース上限 -->
      <div class="detail-card-section">
        <div class="detail-label">リソース上限</div>

        <div class="mt-2 detail-grid-2col">
          <div>
            <div class="detail-label">最大 vCPU (コア)</div>
            <div class="detail-value">
              {{ maxCpuText }}
            </div>
          </div>
          <div>
            <div class="detail-label">最大メモリ</div>
            <div class="detail-value">
              {{ maxMemoryText }}
            </div>
          </div>
          <div>
            <div class="detail-label">最大ストレージ</div>
            <div class="detail-value">
              {{ maxStorageText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { convertByteToUnit } from "@/utils/format";
import { DISABLE_ROUNDING } from "@/utils/constants";

// ★ 画面用の最小限 User 型（このファイル内だけで完結）
//   - DTO / Response 型は import しない

const props = defineProps<{
  context: UserResponse;
}>();

const user = computed(() => props.context);

// 管理者フラグを配列にまとめる
const adminFlags = computed(() => [
  {
    key: "admin",
    label: "全体管理者",
    enabled: user.value.isAdmin,
  },
  {
    key: "image",
    label: "イメージ管理",
    enabled: user.value.isImageAdmin,
  },
  {
    key: "instanceType",
    label: "インスタンスタイプ管理",
    enabled: user.value.isInstanceTypeAdmin,
  },
  {
    key: "node",
    label: "物理ノード管理",
    enabled: user.value.isNodeAdmin,
  },
  {
    key: "network",
    label: "ネットワーク管理",
    enabled: user.value.isNetworkAdmin,
  },
  {
    key: "virtualMachine",
    label: "仮想マシン管理",
    enabled: user.value.isVirtualMachineAdmin,
  },
  {
    key: "securityGroup",
    label: "セキュリティグループ管理",
    enabled: user.value.isSecurityGroupAdmin,
  },
]);

const hasAnyAdmin = computed(() =>
  adminFlags.value.some((flag) => flag.enabled)
);

// リソース上限表示
const maxCpuText = computed(() =>
  user.value.maxCpuCore == null ? "制限なし" : `${user.value.maxCpuCore} コア`
);

const maxMemoryText = computed(() => {
  const size = user.value.maxMemorySize;
  if (size == null) return "制限なし";

  const gb = convertByteToUnit(size, "GB", !DISABLE_ROUNDING);
  return `${gb} GB`;
});

const maxStorageText = computed(() => {
  const size = user.value.maxStorageSize;
  if (size == null) return "制限なし";

  const gb = convertByteToUnit(size, "GB", !DISABLE_ROUNDING);
  return `${gb} GB`;
});
</script>
