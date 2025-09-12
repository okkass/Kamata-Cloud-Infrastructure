<script>
import DashboardLayout from "./../../components/DashboardLayout.vue";

export default {
  name: "Networks",
  components: { DashboardLayout },
  data() {
    return {
      columns: [
        { key: "netName", label: "仮想ネットワーク名" },
        { key: "cidr", label: "アドレス範囲" },
        { key: "subnets", label: "サブネット数" },
        { key: "status", label: "状態" },
      ],
      rows: [
        { id: 10, netName: "dev-network", cidr: "192.168.0.0/16", subnets: 2, status: "稼働中" },
        { id: 11, netName: "test-network", cidr: "10.0.0.0/8", subnets: 1, status: "停止中" },
      ],
      headerButtons: [
        { label: "仮想ネットワーク新規作成", action: "create-network" },
      ],
      rowActions: [
        { label: "詳細", action: "detail" },
        { label: "編集", action: "edit" },
        { label: "削除", action: "delete" },
      ],
    };
  },
  methods: {
    onHeader(action) {
      if (action === "create-network") {
        alert("仮想ネットワーク新規作成");
      }
    },
    onRow({ action, row }) {
      alert(`${row.netName} に対して ${action} を実行`);
    },
  },
};
</script>

<template>
  <DashboardLayout
    title="仮想ネットワークダッシュボード"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    @header-action="onHeader"
    @row-action="onRow"
  />
</template>
