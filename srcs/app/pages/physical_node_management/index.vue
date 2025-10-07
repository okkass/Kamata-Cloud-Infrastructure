<!-- app/pages/physical_node_management/index.vue -->
<template>
  <DashboardLayout
    title="物理ノードダッシュボード"
    :columns="columns"
    :rows="nodesUi || []"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    :valueClassMap="valueClassMap"
    @header-action="onHeaderAction"
    @row-action="onRowAction"
  >
    <!-- 管理ノードは名称に注記＆淡色 -->
    <template #cell-name="{ row }">
      <span :class="['font-semibold', row.isMgmt ? 'text-slate-400' : '']">
        {{ row.name
        }}<span v-if="row.isMgmt" class="ml-1 text-sm">（管理ノード）</span>
      </span>
    </template>

    <!-- 管理ノードは「削除不可」バッジ、他は通常メニュー -->
    <template #row-actions="{ row, emit }">
      <template v-if="row.isMgmt">
        <div
          class="w-full text-center px-4 py-2 text-sm font-bold text-white bg-slate-500 border border-slate-700 rounded-md cursor-not-allowed select-none"
        >
          削除不可
        </div>
      </template>
      <template v-else>
        <a
          href="#"
          class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
          @click.prevent="emit('delete')"
          >削除</a
        >
        <a
          href="#"
          class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
          @click.prevent="emit('set-mgmt')"
          >管理ノードに設定</a
        >
      </template>
    </template>
  </DashboardLayout>

  <!-- 削除確認 -->
  <!-- 削除確認（そのまま） -->
  <MoDeleteConfirm
    :show="activeModal === 'delete-physical-nodes'"
    :message="`本当に '${targetForDeletion?.name}' を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="confirmDelete"
  />

  <!-- ノード追加（候補一覧; 明示的に閉じタグを付ける） -->
  <MoAddNodeToCluster
    :show="activeModal === 'create-physical-nodes'"
    :nodes="candidateNodes"
    @close="closeModal"
    @submit="handleCreateFromCandidate"
  ></MoAddNodeToCluster>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import MoAddNodeToCluster from "@/components/MoAddNodeToCluster.vue";
import { useToast } from "@/composables/useToast";

/* ===== 型 ===== */
type RawNode = {
  id: string;
  name: string;
  ipAddress: string;
  status: "active" | "inactive";
  isAdmin: boolean;
  createdAt: string;
  cpuUtilization: number;
  memoryUtilization: number;
  storageUtilization: number;
};

type UiNode = {
  id: string;
  name: string;
  ip: string;
  status: "稼働中" | "停止中";
  cpu: string;
  mem: string;
  storage: string;
  isMgmt: boolean;
  createdAt: string;
};

type CandidateDTO = { id: string; name: string; ipAddress: string };

const { showToast } = useToast();

/* ===== 変換 util ===== */
const pct = (v?: number) =>
  typeof v === "number" ? `${Math.round(v * 100)}%` : "—";
const toUi = (n: RawNode): UiNode => ({
  id: n.id,
  name: n.name,
  ip: n.ipAddress,
  status: n.status === "active" ? "稼働中" : "停止中",
  cpu: pct(n.cpuUtilization),
  mem: pct(n.memoryUtilization),
  storage: pct(n.storageUtilization),
  isMgmt: !!n.isAdmin,
  createdAt: n.createdAt,
});

/* ===== 一覧（SSRで安定取得） ===== */
const {
  data: nodesRaw,
  error,
  refresh: refreshNodes,
} = await useFetch<RawNode[]>("/api/physical-nodes");

const nodesUi = computed<UiNode[]>(() => (nodesRaw.value ?? []).map(toUi));

watchEffect(() => {
  if (error.value) {
    console.error("[physical-nodes] GET failed:", error.value);
    showToast("物理ノード一覧の取得に失敗しました。", "error");
  }
});

/* ===== 候補：モーダルを開くタイミングで都度取得 ===== */
const candidateNodes = ref<CandidateDTO[]>([]);
async function loadCandidates() {
  try {
    candidateNodes.value = await $fetch<CandidateDTO[]>(
      "/api/physical-nodes/candiates"
    );
  } catch (e) {
    console.error(e);
    candidateNodes.value = [];
    showToast("候補ノードの取得に失敗しました。", "error");
  }
}

/* ===== UI設定 ===== */
const columns = [
  { key: "name", label: "ノード名" },
  { key: "ip", label: "IPアドレス" },
  { key: "status", label: "状態" },
  { key: "cpu", label: "CPU" },
  { key: "mem", label: "メモリ" },
  { key: "storage", label: "ストレージ" },
];
const headerButtons = [{ label: "ノード追加", action: "create" }];
const rowActions = [
  { label: "削除", action: "delete" },
  { label: "管理ノードに設定", action: "set-mgmt" },
];
const valueClassMap = {
  status: {
    稼働中: "text-emerald-600 font-extrabold text-[18px]",
    停止中: "text-red-600 font-extrabold text-[18px]",
  },
};

/* ===== ページ内モーダル状態 ===== */
const activeModal = ref<"" | "create-physical-nodes" | "delete-physical-nodes">(
  ""
);
const targetForDeletion = ref<UiNode | null>(null);
const isDeleting = ref(false);
const openModal = (k: typeof activeModal.value) => (activeModal.value = k);
const closeModal = () => (activeModal.value = "");
const cancelAction = () => {
  targetForDeletion.value = null;
  closeModal();
};

/* ===== ヘッダー操作 ===== */
async function onHeaderAction(action: string) {
  if (action === "create") {
    await loadCandidates(); // 最新候補を取得
    openModal("create-physical-nodes"); // モーダル表示
  }
}

/* ===== 行操作 ===== */
async function onRowAction({ action, row }: { action: string; row: UiNode }) {
  if (action === "delete") {
    targetForDeletion.value = row;
    openModal("delete-physical-nodes");
    return;
  }
  if (action === "set-mgmt") {
    try {
      await $fetch(`/api/physical-nodes/${row.id}`, {
        method: "PUT",
        body: { isAdmin: true, isMgmt: true }, // どちらのキーでも受ける
      });
      await refreshNodes();
      showToast(`'${row.name}' を管理ノードに設定しました。`, "success");
    } catch (e) {
      console.error(e);
      showToast("管理ノードの設定に失敗しました。", "error");
    }
  }
}

/* ===== 削除確定 ===== */
async function confirmDelete() {
  if (!targetForDeletion.value) return;
  try {
    isDeleting.value = true;
    await $fetch(`/api/physical-nodes/${targetForDeletion.value.id}`, {
      method: "DELETE",
    });
    await refreshNodes();
    showToast(`'${targetForDeletion.value.name}' を削除しました。`, "success");
  } catch (e) {
    console.error(e);
    showToast("削除に失敗しました。", "error");
  } finally {
    isDeleting.value = false;
    targetForDeletion.value = null;
    closeModal();
  }
}

/* ===== 追加（モーダルの submit を受け取る／モーダルは改変しない） ===== */
async function handleCreateFromCandidate(c: CandidateDTO) {
  try {
    await $fetch("/api/physical-nodes", {
      method: "POST",
      body: {
        name: c.name,
        ip: c.ipAddress,
        status: "稼働中",
        cpu: "0%",
        mem: "0%",
        storage: "0%",
        isMgmt: false,
      },
    });
    await refreshNodes(); // 一覧更新
    showToast(`ノード '${c.name}' を追加しました。`, "success"); // トースト
  } catch (e) {
    console.error(e);
    showToast("ノードの追加に失敗しました。", "error");
  } finally {
    closeModal();
  }
}
</script>
