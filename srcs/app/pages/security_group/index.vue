<script>
import DashboardLayout from "./../../components/DashboardLayout.vue";

export default {
  name: "SecurityGroupIndex",
  components: { DashboardLayout },
  data() {
    return {
      columns: [
        { key: "groupName", label: "グループ名" },
        { key: "sgId", label: "セキュリティグループID" },
        { key: "description", label: "説明" },
        { key: "rules", label: "イン/アウト ルール数" },
      ],
      rows: [
        {
          id: 1,
          groupName: "default-web-server-sg",
          sgId: "sg-0123456789abcdef0",
          description:
            "デフォルトのWebサーバー用SG。HTTP/HTTPS(80/443)を社内ネットワークおよびCDNのエッジIPからのみ許可。メンテナンス期間中は一時的に22番ポートを開放し、時間経過で自動閉鎖。説明が長い場合の見え方確認用テキストです。運用手順は運用設計書参照。",
          inRules: 2,
          outRules: 1,
        },
        {
          id: 2,
          groupName: "db-server-sg",
          sgId: "sg-fedcba9876543210f",
          description:
            "DBサーバー用。特定のアプリケーションサブネットからのみ3306/TCPを許可。バックアップ時のみNFSの一時開放を実施。",
          inRules: 1,
          outRules: 1,
        },
      ],
      headerButtons: [{ label: "＋ 新規作成", action: "create" }],
      rowActions: [
        { label: "編集", action: "edit" },
        { label: "削除", action: "delete" },
      ],
      expandedDescId: null, // 説明の展開状態
    };
  },
  methods: {
    onHeader(action) {
      if (action === "create") {
        alert("セキュリティグループ新規作成（仮）");
      }
    },
    onRow({ action, row }) {
      if (action === "edit") {
        alert(`編集（仮）：${row.groupName}`);
      } else if (action === "delete") {
        const ok = confirm(`「${row.groupName}」を削除しますか？`);
        if (ok) {
          alert("削除しました（仮）");
          // TODO: API呼び出し→再取得
        }
      }
    },
    toggleDesc(id) {
      this.expandedDescId = this.expandedDescId === id ? null : id;
    },
  },
};
</script>

<template>
  <DashboardLayout
    title="セキュリティグループダッシュボード"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    @header-action="onHeader"
    @row-action="onRow"
  >
    <!-- イン/アウト ルール数の整形表示 -->
    <template #cell-rules="{ row }">
      <span class="tabular-nums">{{ row.inRules }} / {{ row.outRules }}</span>
    </template>

    <!-- 説明：2行省略 + もっと見る/閉じる + ホバーツールチップ -->
    <template #cell-description="{ row }">
      <div class="space-y-1 max-w-[56ch]" :title="row.description">
        <p
          v-if="expandedDescId !== row.id"
          class="leading-snug text-[15px] text-slate-700 line-clamp-2 break-words"
        >
          {{ row.description }}
        </p>
        <p
          v-else
          class="leading-snug text-[15px] text-slate-700 whitespace-pre-wrap break-words"
        >
          {{ row.description }}
        </p>

        <button
          class="text-[13px] font-semibold text-blue-600 hover:underline focus:outline-none"
          :aria-expanded="expandedDescId === row.id"
          @click.stop="toggleDesc(row.id)"
        >
          {{ expandedDescId === row.id ? "閉じる" : "もっと見る" }}
        </button>
      </div>
    </template>
  </DashboardLayout>
</template>

<style scoped>
/* Tailwind の line-clamp プラグイン未使用でも動く簡易版 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
