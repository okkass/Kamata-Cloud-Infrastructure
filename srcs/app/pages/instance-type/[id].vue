<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードのみ -->
    <div v-if="!instanceType && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <div v-else-if="!instanceType && error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <!-- 取得後は常に表示 -->
    <ResourceDetailShell
      v-else
      :title="`${INSTANCE_TYPE.label}詳細`"
      subtitle="Instance Type Information"
      :tabs="instanceTypeTabs"
      :context="instanceType!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル -->
    <MoInstanceTypeEdit
      :show="isEditOpen"
      :instance-type-data="editInstanceTypeData"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { INSTANCE_TYPE } from "~/utils/constants";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
import { instanceTypeTabs } from "~/composables/detail/useInstanceTypeTabs";

// auto-import 前提
const route = useRoute();
const router = useRouter();

// データ取得
const {
  data: instanceType,
  pending,
  error,
  refresh,
} = await useResourceDetail<InstanceTypeResponse>(
  INSTANCE_TYPE.name,
  route.params.id as string
);

// 戻る
const goBack = () => {
  router.back();
};

// 操作メニュー
const actions = ref([{ label: "編集", value: "edit" }]);

// ===== 編集モーダル制御（※ここを先に定義）=====
const isEditOpen = ref(false);

// モーダルに渡すデータ（undefined で統一）
const editInstanceTypeData = ref<InstanceTypeResponse | undefined>(undefined);

// ===== ポーリング =====
const polling = createPolling(async () => {
  await refresh();
});

onMounted(() => {
  polling.startPolling();
});

onUnmounted(() => {
  polling.stopPolling();
});

// 編集中はポーリング停止
watch(
  () => isEditOpen.value,
  (open) => {
    if (open) polling.stopPolling();
    else polling.startPolling();
  }
);

// ===== モーダル操作 =====
const openEditModal = async () => {
  if (!instanceType.value) return;

  editInstanceTypeData.value = undefined;
  await nextTick();

  editInstanceTypeData.value = instanceType.value;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  try {
    await refresh();
  } catch (e) {
    console.error("InstanceType再取得に失敗しました", e);
  }

  if (instanceType.value) {
    editInstanceTypeData.value = instanceType.value;
  }
};

// アクション処理
const handleAction = async (action: { label: string; value: string }) => {
  if (action.value === "edit") {
    await openEditModal();
  }
};
</script>
