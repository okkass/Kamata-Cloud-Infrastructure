<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">接続リソース</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
      <!-- TODO: API 実装後にここで vnet に紐づくリソースを表示する -->
      <p class="text-sm text-neutral-700">
        この仮想ネットワークに接続されているリソース
        （仮想マシン、ゲートウェイなど）を表示する予定です。
      </p>

      <p class="text-sm text-neutral-500">
        現在は API / データ仕様が未確定のため、プレースホルダ表示になっています。
      </p>

      <!-- 例：将来こういう一覧を出す想定
      <ul class="space-y-2 text-sm">
        <li
          v-for="att in attachments"
          :key="att.id"
          class="flex items-center justify-between"
        >
          <div>
            <div class="font-medium text-neutral-900">{{ att.name }}</div>
            <div class="text-xs text-neutral-500">
              種別: {{ att.type }} / ID: {{ att.id }}
            </div>
          </div>
          <span class="text-xs font-mono text-neutral-600">
            {{ att.status }}
          </span>
        </li>
      </ul>
      -->
    </div>
  </section>
</template>

<script setup lang="ts">
// 将来ここに型を定義していく想定
// type Attachment = {
//   id: string
//   type: "vm" | "gateway" | "load-balancer" | string
//   name: string
//   status?: string
// }

const props = defineProps<{
  // API 仕様が固まったら context.attachments などをここで読む想定
  context?: any;
}>();

// 今はまだ使わないけど、あとで attachments を計算するとき用
// const attachments = computed<Attachment[]>(() => props.context?.attachments ?? [])
</script>
