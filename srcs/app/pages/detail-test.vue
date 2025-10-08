<template>
  <BaseDetail
    title="（画面タイトル）"
    :descriptions="descriptions"
    :tables="tables"
    :summary="summaryStats"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
  >
    <!-- ヘッダー右側に自由配置 -->
    <template #header-right>
      <!-- 例：状態バッジ等 -->
      <span class="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs">Draft</span>
    </template>

    <!-- サマリーの中身を差し替えたい場合 -->
    <!--
    <template #summary>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 pb-4">
        <div class="rounded-xl border p-4">
          <p class="text-xs text-gray-500 mb-1">任意のKPI</p>
          <p class="text-xl font-semibold">123</p>
        </div>
      </div>
    </template>
    -->

    <!-- 説明/テーブルの前に入れたい場合 -->
    <!-- <template #before-content>任意のカスタムブロック</template> -->

    <!-- 説明/テーブルの後に入れたい場合 -->
    <!-- <template #after-content>任意のカスタムブロック</template> -->
  </BaseDetail>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import BaseDetail from '@/components/BaseDetail.vue'

// サマリーのダミー値
const summaryStats = reactive({
  cpu: 0, memory: 0, storage: 0, network: 0
})

// 説明のダミー
const descriptions = reactive([
  { title: '説明', text: 'ここに説明テキスト' }
])

// テーブルのダミー
const tables = reactive([
  {
    title:'テーブルA',
    columns: [
      { key:'name', label:'名前' },
      { key:'value', label:'値' },
    ],
    rows: [
      { name:'例1', value:'123' },
      { name:'例2', value:'456' },
    ]
  }
])

// ヘッダーのボタン群（index.vueに合わせた形）
const headerButtons = [
  { label: '新規作成', action: 'create' },
  {
    label: '編集',
    type: 'menu',
    items: [
      { label: 'ダッシュボードレイアウトの新規作成', action: 'create-layout' },
      { label: '複製', action: 'duplicate' },
      { label: '名前変更', action: 'rename' },
      { label: '削除', action: 'delete' },
      { label: '共有…', action: 'share' }
    ]
  }
]

function onHeaderAction(action: string) {
  // TODO: 実処理は後で（今はUIのみ）
  console.log('[detail header]', action)
}
</script>
