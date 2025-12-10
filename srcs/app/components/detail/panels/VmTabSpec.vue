<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">構成</h2>

    <!-- ★ 基本情報タブと同じカードレイアウト（既存デザインをそのまま使用） -->
    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <!-- CPU / メモリ -->
      <dl class="space-y-3 text-sm">
        <div>
          <dt class="text-xs text-neutral-500">CPUコア</dt>
          <dd class="text-sm text-neutral-900 font-medium">
            {{ cpuDisplay }}
          </dd>
        </div>

        <div>
          <dt class="text-xs text-neutral-500">メモリサイズ</dt>
          <dd class="text-sm text-neutral-900 font-medium">
            {{ memoryDisplay }}
          </dd>
        </div>
      </dl>

      <!-- ストレージ -->
      <div class="pt-3 border-t border-neutral-200">
        <h3 class="mb-2 text-sm font-semibold text-neutral-700">
          ストレージ
        </h3>

        <div class="space-y-2">
          <article
            v-for="storage in storages"
            :key="storage.id"
            class="rounded-lg border border-neutral-200 px-4 py-3"
          >
            <p class="text-xs text-neutral-500">
              {{ storage.name }}
            </p>
            <p class="text-sm text-neutral-900 font-medium">
              サイズ：{{ sizeGb(storage.size) }}GB
            </p>
            <p class="text-sm text-neutral-900 font-medium">
              プール: {{ storage.poolLabel }}
            </p>
          </article>

          <!-- ★ ストレージが 1 件も無いときだけ表示 -->
          <p
            v-if="storages.length === 0"
            class="text-sm text-neutral-500"
          >
            ストレージは接続されていません。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { convertByteToUnit } from "~/utils/format"; // ★ 既存の変換ユーティリティを使用
import type { components } from "~~/shared/types";

// ★ DTO 自作禁止 → OpenAPI 生成の VirtualMachineResponse を使う
type VirtualMachineResponse =
  components["schemas"]["VirtualMachineResponse"];

// ★ 画面表示用の最小限の型（表示用の型は OK と言われていたのでここだけ自前）
type StorageView = {
  id: string;
  name: string;
  size: number;
  poolLabel: string;
};

const props = defineProps<{
  // ★ context の型を VirtualMachineResponse に統一
  context?: VirtualMachineResponse | null;
}>();

// ★ null ガード付きで vm を作っておく（template から参照しやすくするだけ）
const vm = computed(() => props.context ?? null);

/**
 * CPU コア数表示
 * - VirtualMachineResponse.cpuCore をそのまま利用
 */
const cpuDisplay = computed(() => {
  const cores = vm.value?.cpuCore;
  if (typeof cores !== "number" || !Number.isFinite(cores)) {
    return "—";
  }
  return cores;
});

/**
 * メモリサイズ表示
 * - VirtualMachineResponse.memorySize（byte）から MB に変換
 */
const memoryDisplay = computed(() => {
  const bytes = vm.value?.memorySize;
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) {
    return "—";
  }
  const mb = convertByteToUnit(bytes, "MB");
  return `${mb}MB`;
});

/**
 * ストレージ一覧
 * - 正式版: vm.storages（VirtualMachineResponse の定義）
 * - いまのモック: vm.attachedStorages をフォールバックで拾う
 *   → backend が storages に揃ったタイミングで自動的にそっちに切り替わる
 */
const storages = computed<StorageView[]>(() => {
  const ctx: any = vm.value;

  // ① 正式スキーマ: storages
  if (Array.isArray(ctx?.storages) && ctx.storages.length > 0) {
    return ctx.storages.map((s: any) => ({
      id: s.id,
      name: s.name,
      size: s.size,
      poolLabel: s.pool?.name ?? s.pool?.id ?? "—",
    }));
  }

  // ② 現状モック: attachedStorages
  if (Array.isArray(ctx?.attachedStorages) && ctx.attachedStorages.length > 0) {
    return ctx.attachedStorages.map((a: any) => ({
      id: a.storage.id,
      name: a.storage.name,
      size: a.storage.size,
      poolLabel: a.storage.pool,
    }));
  }

  return [];
});

/** GB 表示用ヘルパー */
const sizeGb = (bytes: number) => {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  return convertByteToUnit(bytes, "GB");
};
</script>
