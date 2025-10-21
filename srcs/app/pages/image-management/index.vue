<!-- pages/image-management/index.vue -->
<template>
  <div>
    <DashboardLayout
      title="仮想マシンイメージ"
      :columns="columns"
      :rows="displayImages"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleDashboardHeaderAction"
    >
      <template #cell-name="{ row }">
        <div v-if="row">
          <span class="table-link">{{ row.name }}</span>
          <span
            v-if="row.description"
            class="text-sm text-gray-500 block mt-0.5"
            >{{ row.description }}</span
          >
        </div>
      </template>

      <template #cell-size="{ row }"
        ><span v-if="row" class="font-mono">{{ row.size }}</span></template
      >
      <template #cell-createdAt="{ row }"
        ><span v-if="row">{{ row.createdAt }}</span></template
      >

      <template #row-actions="{ row }">
        <div v-if="row">
          <button
            type="button"
            class="action-item first:border-t-0 w-full text-left"
            @click.stop.prevent="handleShowDetail(row.id)"
          >
            詳細
          </button>
          <button
            type="button"
            class="action-item action-item-danger"
            :class="{ 'action-item-disabled': deletingImageId === row.id }"
            :disabled="deletingImageId === row.id"
            @click.stop.prevent="promptForImageDeletion(row)"
          >
            削除
          </button>
        </div>
      </template>
    </DashboardLayout>
  </div>

  <MoDeleteConfirm
    :show="activeModal === 'delete-images'"
    :message="`本当にイメージ「${
      targetForDeletion?.name ?? ''
    }」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoImageAdd
    :show="activeModal === 'add-image'"
    @close="closeModal"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import DashboardLayout from "~/components/DashboardLayout.vue";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";
import MoImageAdd from "~/components/MoImageAdd.vue";

type Id = string;
type ApiImage = {
  id: Id;
  name: string;
  description?: string;
  createdAt: string;
  size: number;
};
type Row = {
  id: Id;
  name: string;
  description?: string;
  createdAt: string;
  size: string;
};

const columns = [
  { key: "name", label: "イメージ名" },
  { key: "size", label: "サイズ" },
  { key: "createdAt", label: "登録日" },
] as const;
const headerButtons = [{ label: "イメージ追加", action: "add-image" }] as const;

const images = ref<Row[]>([]);
const displayImages = computed(() => images.value);
const activeModal = ref<"" | "add-image" | "delete-images">("");
const targetForDeletion = ref<Row | null>(null);
const isDeleting = ref(false);
const deletingImageId = ref<Id | null>(null);

const auth = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});
const toSize = (b: number) => {
  if (!Number.isFinite(b)) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0,
    v = b;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 10 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}${
    u[i]
  }`;
};
const toDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

async function fetchImages() {
  try {
    const data = await $fetch<ApiImage[]>("/api/images", { headers: auth() });
    images.value = (data || []).map((x) => ({
      id: x.id,
      name: x.name,
      description: x.description,
      createdAt: toDate(x.createdAt),
      size: toSize(x.size),
    }));
  } catch (e: any) {
    alert(`イメージ一覧の取得に失敗：${e?.data?.message ?? e?.message ?? e}`);
  }
}
onMounted(fetchImages);

async function handleShowDetail(id: Id) {
  try {
    const x = await $fetch<ApiImage>(`/api/images/${id}`, { headers: auth() });
    alert(
      `ID: ${x.id}\n名前: ${x.name}\n説明: ${
        x.description ?? "—"
      }\nサイズ: ${toSize(x.size)} (${x.size} bytes)\n登録日: ${toDate(
        x.createdAt
      )}`
    );
  } catch (e: any) {
    alert(`詳細取得に失敗：${e?.data?.message ?? e?.message ?? e}`);
  }
}

function promptForImageDeletion(row: Row) {
  targetForDeletion.value = row;
  activeModal.value = "delete-images";
}

async function handleDelete() {
  if (!targetForDeletion.value) return;
  const id = targetForDeletion.value.id;
  isDeleting.value = true;
  deletingImageId.value = id;
  try {
    await $fetch<void>(`/api/images/${id}`, {
      method: "DELETE",
      headers: auth(),
    });
    await fetchImages();
    cancelAction();
    alert("削除しました。");
  } catch (e: any) {
    alert(`削除に失敗：${e?.data?.message ?? e?.message ?? e}`);
  } finally {
    isDeleting.value = false;
    deletingImageId.value = null;
  }
}

function handleDashboardHeaderAction(action: string) {
  if (action === "add-image") activeModal.value = "add-image";
}
function cancelAction() {
  targetForDeletion.value = null;
  activeModal.value = "";
}
function closeModal() {
  activeModal.value = "";
}
async function handleSuccess() {
  activeModal.value = "";
  await fetchImages();
}
</script>

<style scoped>
.table-link {
  @apply font-semibold hover:underline;
}
.action-item {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200;
}
.action-item-danger {
  @apply text-red-600 hover:bg-[#fff1f1];
}
.action-item-disabled {
  @apply opacity-60 pointer-events-none;
}
</style>
