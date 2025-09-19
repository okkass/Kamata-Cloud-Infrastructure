<script>
import DashboardLayout from "./../../components/DashboardLayout.vue";

export default {
  name: "InstanceTypeIndex",
  components: { DashboardLayout },
  data() {
    return {
      columns: [
        { key: "name", label: "名前" },
        { key: "vcpu", label: "vCPU" },
        { key: "memory", label: "メモリ" },
        { key: "storage", label: "ストレージ" },
      ],
      rows: [
        {
          id: 1,
          name: "standard.small",
          vcpu: 2,
          memory: "4 GB",
          storage: "50 GB",
        },
        {
          id: 2,
          name: "standard.medium",
          vcpu: 4,
          memory: "8 GB",
          storage: "100 GB",
        },
        {
          id: 3,
          name: "compute.large",
          vcpu: 8,
          memory: "16 GB",
          storage: "200 GB",
        },
      ],
      headerButtons: [{ label: "インスタンスタイプ追加", action: "add" }],
      rowActions: [
        { label: "編集", action: "edit" },
        { label: "削除", action: "delete" },
      ],
    };
  },
  methods: {
    onHeader(action) {
      if (action === "add") {
        alert("インスタンスタイプ追加に遷移します（仮）");
      }
    },
    onRow({ action, row }) {
      if (action === "edit") {
        alert(`編集（仮）：${row.name}`);
      } else if (action === "delete") {
        if (confirm(`「${row.name}」を削除しますか？`)) {
          alert("削除しました（仮）");
          // TODO: API呼び出し→再取得
        }
      } else if (action === "detail") {
        alert(`詳細（仮）：${row.name}`);
      }
    },
  },
};
</script>

<template>
  <DashboardLayout
    title="インスタンスタイプダッシュボード"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    @header-action="onHeader"
    @row-action="onRow"
  >
    <!-- 名前はリンク風＆クリックで詳細（仮） -->
    <template #cell-name="{ row, emit }">
      <a
        href="#"
        @click.prevent="emit('detail')"
        class="text-blue-600 hover:underline"
      >
        {{ row.name }}
      </a>
    </template>
  </DashboardLayout>
</template>
