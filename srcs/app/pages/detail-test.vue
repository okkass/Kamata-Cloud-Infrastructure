<template>
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
</template>

<script setup lang="ts">
import { reactive } from 'vue'
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
</script>
