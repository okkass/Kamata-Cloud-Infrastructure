<template>
  <!-- 全体：背景白・文字黒 -->
  <section class="min-h-screen bg-white text-black p-4 space-y-4">
    <!-- タイトル -->
    <header>
      <h1 class="text-2xl font-bold">{{ props.title }}</h1>
    </header>

    <!-- =========================================
         説明セクション（すべてプルダウンで開閉）
         ========================================= -->
    <section
      v-for="(d,i) in props.descriptions"
      :key="'desc-'+i"
      class="bg-white border border-gray-300 rounded-xl"
    >
      <!-- 見出しバー（クリックで開閉） -->
      <button
        type="button"
        class="w-full px-4 py-2 flex items-center justify-between gap-4 text-left"
        @click="toggleDesc(i)"
        :aria-expanded="isDescOpen(i)"
        :aria-controls="`desc-panel-${i}`"
      >
        <span class="text-sm font-semibold">{{ d.title || '説明' }}</span>
        <span
          class="i-ico transition-transform"
          :class="isDescOpen(i) ? 'rotate-180' : ''"
          aria-hidden="true"
        >▼</span>
      </button>

      <!-- 本文（開閉する部分） -->
      <div
        :id="`desc-panel-${i}`"
        v-show="isDescOpen(i)"
        class="border-t border-gray-300 p-4 whitespace-pre-wrap"
      >
        {{ d.text }}
      </div>
    </section>

    <!-- =========================================
         テーブルセクション（すべてプルダウンで開閉）
         ========================================= -->
    <section
      v-for="(t,i) in props.tables"
      :key="'table-'+i"
      class="bg-white border border-gray-300 rounded-xl"
    >
      <!-- 見出しバー（クリックで開閉） -->
      <button
        type="button"
        class="w-full px-4 py-2 flex items-center justify-between gap-4 text-left"
        @click="toggleTable(i)"
        :aria-expanded="isTableOpen(i)"
        :aria-controls="`table-panel-${i}`"
      >
        <span class="text-sm font-semibold">{{ t.title || '一覧' }}</span>
        <span
          class="i-ico transition-transform"
          :class="isTableOpen(i) ? 'rotate-180' : ''"
          aria-hidden="true"
        >▼</span>
      </button>

      <!-- テーブル本体（開閉する部分） -->
      <div
        :id="`table-panel-${i}`"
        v-show="isTableOpen(i)"
        class="border-t border-gray-300 overflow-x-auto p-4"
      >
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="text-gray-600">
              <th
                v-for="(col,ci) in t.columns"
                :key="ci"
                class="px-3 py-2 border-b border-gray-300 text-left"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row,ri) in t.rows"
              :key="ri"
              class="odd:bg-gray-50 even:bg-gray-100"
            >
              <td
                v-for="(col,ci) in t.columns"
                :key="ci"
                class="px-3 py-2 border-b border-gray-300"
              >
                <!-- accessor があればそれを使う／なければ row[key] -->
                {{ col.accessor ? col.accessor(row) : (row[col.key] ?? '') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

/** 列／テーブル／説明の型 */
type Column = { key: string; label: string; accessor?: (row:any)=>unknown }
type TableSection = { title?: string; columns: Column[]; rows: any[] }
type DescSection = { title?: string; text: string }

/** props
 *  - descriptions / tables はデフォルトを空配列にして undefined 警告を回避
 *  - defaultOpen: true なら最初から開いた状態に
 */
const props = withDefaults(defineProps<{
  title: string
  descriptions?: DescSection[]
  tables?: TableSection[]
  defaultOpen?: boolean
}>(), {
  descriptions: () => [],
  tables: () => [],
  defaultOpen: false, // ← 初期状態：閉じる（プルダウンらしく）
})

/** 開閉状態（インデックスごとの true/false） */
const openDesc = ref<boolean[]>([])
const openTables = ref<boolean[]>([])

/** props の長さが変わったら配列を再構成（defaultOpen を反映） */
watchEffect(() => {
  openDesc.value = Array.from({ length: props.descriptions.length }, () => !!props.defaultOpen)
  openTables.value = Array.from({ length: props.tables.length }, () => !!props.defaultOpen)
})

/** 説明の開閉をトグル */
function toggleDesc(i: number) {
  if (i < 0 || i >= openDesc.value.length) return
  openDesc.value[i] = !openDesc.value[i]
}
function isDescOpen(i: number) {
  return openDesc.value[i] === true
}

/** テーブルの開閉をトグル */
function toggleTable(i: number) {
  if (i < 0 || i >= openTables.value.length) return
  openTables.value[i] = !openTables.value[i]
}
function isTableOpen(i: number) {
  return openTables.value[i] === true
}
</script>

<!-- ちょい補助：▼マークに使うクラス（Tailwind のみでOK） -->
<style scoped>
.i-ico { display:inline-block; transform-origin:center; }
</style>
