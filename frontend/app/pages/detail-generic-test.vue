<template>
  <KciDetailLayout
    title="test 詳細"
    :breadcrumb="[{label:'KCI',to:'/'},{label:'test一覧',to:'/tests'},{label:model.name}]"
    :summary="summary"
    :model="model"
    :fields="fields"
  >
    <section class="kci-section">
      <header class="kci-section__header"><h2>説明</h2></header>
      <div style="padding:1rem; white-space:pre-wrap">{{ model.description }}</div>
    </section>

    <section class="kci-section" style="margin-top:1rem">
      <header class="kci-section__header"><h2>test テーブルA</h2></header>
      <div style="padding:1rem">
        <KciTable :columns="tableACols" :rows="tableARows" />
      </div>
    </section>

    <section class="kci-section" style="margin-top:1rem">
      <header class="kci-section__header"><h2>test テーブルB</h2></header>
      <div style="padding:1rem">
        <KciTable :columns="tableBCols" :rows="tableBRows" />
      </div>
    </section>
  </KciDetailLayout>
</template>

<script setup lang="ts">
import KciDetailLayout from '@/components/kci/KciDetailLayout.vue'
import KciTable from '@/components/kci/KciTable.vue'
import type { FieldSchema } from '@/components/kci/KciDetailLayout.vue'

const model = reactive({ name: 'test-resource-001', description:'これはテンプレート検証用の説明テキストです。実案件ではAPI応答で置換します。' })

const fields: FieldSchema[] = [
  { key:'name', label:'名称' },
]
const summary = [ { label:'名称', value: model.name } ]

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
  { name:'subnet-b', cidr:'192.168.2.0/24', external:'No' },
])
</script>
