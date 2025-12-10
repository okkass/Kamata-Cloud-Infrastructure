<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- ローディング -->
    <div v-if="pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <!-- エラー -->
    <div v-else-if="error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <!-- 詳細本体 -->
    <!-- ★ コメントはタグの外に出す -->
    <!-- ユーザー用タブ (基本情報 / 権限など) は userTabs で定義 -->
    <ResourceDetailShell
      v-else
      title="利用者詳細"
      subtitle="User Information"
      :tabs="userTabs"
      :context="user!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル -->
    <MoUserEdit
      v-if="user"
      :show="isEditOpen"
      :user-data="user"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { userTabs } from "~/composables/detail/useusertabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import MoUserEdit from "@/components/MoUserEdit.vue";
import { useToast } from "@/composables/useToast";
import { USER } from "@/utils/constants";
// ★ サーバ側のベース型をインポート（MoUserEdit でも使っているやつ）
import type { UserServerBase } from "~~/shared/types/dto/user/UserServerBase";

const { addToast } = useToast();

// ★ 変更: VirtualNetworkResponse を元にした画面用ローカル型に揃えた
type VirtualNetworkDetail = {
  id: string;
  name: string;
  cidr: string;        // ← 必須に変更（?: を削除）
  createdAt: string;   // ← 必須に変更（?: を削除）
  subnets?: {
    id: string;
    name: string;
    cidr: string;
    createdAt: string; // ← external ではなく createdAt に統一
  }[];
};

const route = useRoute();
const router = useRouter();

const {
  data: user,
  pending,
  error,
  refresh,
} = await useResourceDetail<UserDetail>(
  USER.name, // "users"
  route.params.id as string
);

// 戻るボタン
const goBack = () => {
  router.back();
};

// ★ 操作メニュー（とりあえず「編集」のみ）
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダル表示フラグ
const isEditOpen = ref(false);

// 操作ボタン押下時
const handleAction = (action: { label: string; value: string }) => {
  if (!user.value) return;

  if (action.value === "edit") {
    isEditOpen.value = true;
  }
};

// モーダル close
const handleEditClose = () => {
  isEditOpen.value = false;
};

// モーダル側で emit("save", editableNetwork) されたとき
// ★ 変更: 引数の型も VirtualNetworkDetail に揃えた
const handleEditSave = async (updated: VirtualNetworkDetail) => {
  // ひとまずローカルの表示を更新
  vnet.value = updated;
  isEditOpen.value = false;

  addToast({
    message: "利用者情報を更新しました（ダミー）",
    type: "success",
  });

  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("ユーザー情報の再取得に失敗しました", e);
    }
  }
};
</script>
