<template>
  <BaseModal :show="show" :title="modalTitle" @close="$emit('close')" size="lg">
    <div>
      <div class="flex border-b border-gray-200">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          @click="currentTab = index"
          :class="[
            'relative py-2 px-4 text-sm font-medium',
            currentTab === index ? 'tab-button-active' : 'tab-button',
          ]"
        >
          {{ tab.name }}
          <span
            v-if="!tabValidity[index]"
            class="tab-error-indicator"
            title="このタブに入力エラーがあります"
          ></span>
        </button>
      </div>

      <div class="pt-6 min-h-[300px]">
        <component
          v-for="(tab, index) in tabs"
          :key="index"
          v-show="currentTab === index"
          :is="tab.component"
          :ref="
            (el) => {
              if (el) tabRefs[index] = el;
            }
          "
        />
      </div>
    </div>
    <template #footer>
      <div class="modal-footer">
        <div class="flex gap-3">
          <SecondaryButton @click="prevTab" :disabled="currentTab === 0">
            戻る
          </SecondaryButton>

          <button
            v-if="currentTab < tabs.length - 1"
            @click="nextTab"
            class="btn btn-primary"
          >
            次へ
          </button>

          <button
            v-else
            @click="onFinalSubmit"
            :disabled="isCreating"
            class="btn btn-submit"
          >
            {{ isCreating ? "作成中..." : "作成" }}
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { useVmWizardForm } from "~/composables/modal/useVmWizardForm";
/**
 * =================================================================================
 * 仮想マシン作成モーダル (MoVirtualMachineCreate.vue)
 * ---------------------------------------------------------------------------------
 * このコンポーネントは、複数のタブコンポーネントを内包するウィザード形式のモーダルです。
 * 各タブの管理、バリデーションの集約、最終的なAPIへのデータ送信といった、
 * 全体を統括する役割を担います。
 * =================================================================================
 */

// --- 親コンポーネントとの連携 ---
// `show` prop を受け取り、`close` と `success` イベントを通知します。
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composableのセットアップ ---

// 1. ウィザードフォーム管理 (useVmWizardForm)
//    - タブの状態（現在のタブ、各タブの参照など）とロジックを管理します。
//    - 全タブのデータを集約し、バリデーション、API送信ロジックも統合しています。
const {
  currentTab,
  tabRefs,
  tabs,
  tabValidity,
  prevTab,
  nextTab,
  handleFinalSubmit,
  isCreating,
} = useVmWizardForm();

// --- コンポーネントのローカルState ---
const modalTitle = ref("仮想マシン作成");

// handleFinalSubmitに emit を注入
const onFinalSubmit = () => handleFinalSubmit(emit);
</script>
