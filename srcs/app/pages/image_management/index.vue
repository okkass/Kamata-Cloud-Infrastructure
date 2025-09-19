<script>
import DashboardLayout from "./../../components/DashboardLayout.vue";

export default {
  name: "ImageManagement",
  components: { DashboardLayout },
  data() {
    return {
      columns: [
        { key: "name", label: "イメージ名" },
        { key: "size", label: "サイズ" },
        { key: "createdAt", label: "登録日" },
        { key: "status", label: "状態" },
      ],
      rows: [
        {
          id: 1,
          name: "Ubuntu 22.04 LTS",
          size: "1.5GB",
          createdAt: "2025-06-20",
          status: "稼働中",
          protected: true,
        },
        {
          id: 2,
          name: "CentOS 8 Stream",
          size: "2.1GB",
          createdAt: "2025-06-15",
          status: "停止中",
          protected: false,
        },
        {
          id: 3,
          name: "AlmaLinux 9",
          size: "1.9GB",
          createdAt: "2025-07-01",
          status: "",
          protected: false,
        },
      ],
      headerButtons: [{ label: "イメージ追加", action: "add" }],
      rowActions: [
        { label: "詳細", action: "detail" },
        { label: "削除", action: "delete" },
      ],
    };
  },
  methods: {
    onHeader(action) {
      if (action === "add") {
        alert("イメージ追加（仮処理）");
      }
    },
    onRow({ action, row }) {
      if (action === "detail") {
        alert(`詳細を表示: ${row.name}`);
      } else if (action === "delete") {
        if (row.protected) {
          alert("保護されているため削除できません。");
        } else {
          const ok = confirm(`${row.name} を削除しますか？`);
          if (ok) {
            alert("削除しました（仮処理）");
          }
        }
      }
    },
  },
};
</script>

<template>
  <DashboardLayout
    title="イメージ管理ダッシュボード"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    @header-action="onHeader"
    @row-action="onRow"
  >
    <!-- 状態セルのカスタム表示 -->
    <template #cell-status="{ row }">
      <span
        :class="{
          'text-emerald-600 font-extrabold text-[18px]':
            row.status === '稼働中',
          'text-red-600 font-extrabold text-[18px]': row.status === '停止中',
          'text-slate-500 font-bold tracking-wider': row.status === '—',
        }"
      >
        {{ row.status }}
      </span>
    </template>

    <!-- 行操作スロット -->
    <template #row-actions="{ row, emit }">
      <a
        href="#"
        @click.prevent="emit('detail')"
        class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
      >
        詳細を表示
      </a>
      <a
        v-if="!row.protected"
        href="#"
        @click.prevent="emit('delete')"
        class="block px-4 py-3 text-[15px] font-semibold text-red-600 hover:bg-[#fff1f1] border-t border-slate-200"
      >
        削除
      </a>
      <span
        v-else
        class="block px-4 py-3 text-[15px] font-semibold text-slate-400 bg-[#fafafa] border-t border-slate-200 select-none"
      >
        削除不可（保護）
      </span>
    </template>
  </DashboardLayout>
</template>
