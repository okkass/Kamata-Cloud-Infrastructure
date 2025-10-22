<template>
  <div class="relative">
    <!-- 右上に編集ボタン（ドロップダウン） -->
    <div class="absolute top-4 right-4 z-10">
      <div class="relative" @mouseleave="showMenu = false">
        <button
          class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-blue-500"
          @click="showMenu = !showMenu"
        >
          編集 ▼
        </button>
        <div
          v-if="showMenu"
          class="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg"
        >
          <ul>
            <li>
              <button class="w-full text-left px-4 py-2 hover:bg-gray-100" @click="onEdit">編集</button>
            </li>
            <li>
              <button class="w-full text-left px-4 py-2 hover:bg-gray-100" @click="onDelete">削除</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 既存の詳細表示 -->
    <BaseDetail
      title="test 詳細"
      :descriptions="[
        { title: '説明', text: model.description }
      ]"
      :tables="[
        { title:'test テーブルA', columns: tableACols, rows: tableARows },
        { title:'test テーブルB', columns: tableBCols, rows: tableBRows }
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseDetail from '@/components/BaseDetail.vue'

const model = reactive({
  name: 'test-resource-001',
  description: '動作確認用テキストです。'
})

const tableACols = [
  { key:'name', label:'ルール名' },
  { key:'port', label:'ポート番号' },
  { key:'protocol', label:'プロトコル' },
  { key:'cidr', label:'IP/CIDR' },
  { key:'effect', label:'許可/拒否' },
]
const tableARows = reactive([
  { name:'allow-http', port:'80', protocol:'TCP', cidr:'0.0.0.0/0', effect:'許可' },
  { name:'deny-ftp',   port:'21', protocol:'TCP', cidr:'0.0.0.0/0', effect:'拒否' },
])

const tableBCols = [
  { key:'name', label:'サブネット名' },
  { key:'cidr', label:'アドレス範囲' },
  { key:'external', label:'外部接続' },
]
const tableBRows = reactive([
  { name:'subnet-a', cidr:'192.168.1.0/24', external:'Yes' },
  { name:'subnet-b', cidr:'192.168.2.0/24', external:'No'  },
])

// ドロップダウン表示制御
const showMenu = ref(false)

// 編集ボタンのクリック処理
function onEdit() {
  showMenu.value = false
  alert('編集ボタンがクリックされました')
}

// 削除ボタンのクリック処理（例）
function onDelete() {
  showMenu.value = false
  alert('削除ボタンがクリックされました')
}
</script>
