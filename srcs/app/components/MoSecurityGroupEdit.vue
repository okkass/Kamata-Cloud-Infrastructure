<template>
  <BaseModal
    :show="show"
    title="セキュリティグループの編集"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label for="sg-name" class="block text-sm font-medium text-gray-700"
            >グループ名</label
          >
          <!-- `v-if` を使って、データが渡されてから表示する -->
          <input
            v-if="securityGroupData"
            type="text"
            id="sg-name"
            :value="securityGroupData.name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </form>

      <div class="pt-4 border-t">
        <h3 class="text-lg font-semibold text-gray-800">
          渡された全グループ一覧（確認用）
        </h3>
        <!-- preタグを使うと、オブジェクトを整形して表示できるのでデバッグに便利 -->
        <pre
          class="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-x-auto"
        ><code>{{ securityGroupData }}</code></pre>
      </div>

      <!-- 保存/キャンセルボタン -->
      <div class="flex justify-end items-center gap-4 pt-4 border-t">
        <button type="button" @click="$emit('close')" class="btn-secondary">
          キャンセル
        </button>
        <button type="submit" @click="submit" class="btn-primary">保存</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { type PropType } from "vue";

// propsの定義は変更なし
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  securityGroupData: {
    type: Object as PropType<SecurityGroupDTO | null>,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

const submit = () => {
  emit("success");
};
</script>

<style scoped>
/* ボタンのスタイルはここに定義、または直接クラスを記述 */
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 rounded-md;
}
.btn-primary {
  @apply py-2 px-4 bg-blue-600 text-white rounded-md;
}
</style>
