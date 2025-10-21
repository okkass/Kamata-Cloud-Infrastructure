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
            @click="handleFinalSubmit"
            :disabled="isCreating"
            class="btn btn-submit"
          >
            {{ isCreating ? "作成中..." : "作成" }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import useVmWizardForm from "~/composables/modal/useVmWizardForm";

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
//    - 全タブのデータを集約し、API送信用データ（ペイロード）を構築する責務も持ちます。
const {
  currentTab,
  tabRefs,
  tabs,
  tabValidity,
  prevTab, // 関数名をより具体的に
  nextTab, // 関数名をより具体的に
  buildPayloadAndValidate,
} = useVmWizardForm();

// 2. APIリソース作成 (useResourceCreate)
//    - 指定されたリソース（ここでは 'virtual-machines'）の作成処理を抽象化します。
const {
  executeCreate: executeVirtualMachineCreation, // 関数名をより具体的に
  isCreating,
} = useResourceCreate<VirtualMachineCreateRequestDTO, VirtualMachineDTO>(
  "virtual-machines"
);

// 3. トースト通知 (useToast)
//    - ユーザーへのフィードバック（成功・エラー通知）を表示します。
const { addToast } = useToast();

// --- コンポーネントのローカルState ---
const modalTitle = ref("仮想マシン作成");

// ==============================================================================
// イベントハンドラ
// ==============================================================================

/**
 * 最終的な「作成」ボタンがクリックされたときの処理
 */
const handleFinalSubmit = async () => {
  // 1. 全てのタブのバリデーションを実行し、API送信用データを構築
  //    - エラーがある場合は `buildPayloadAndValidate` がnullを返し、内部でトースト通知を出す
  const payload = await buildPayloadAndValidate();
  if (!payload) return; // バリデーションエラーがあればここで処理を中断

  // 2. APIリクエストを実行
  const result = await executeVirtualMachineCreation(payload);

  // 3. 結果に応じてトースト通知を表示
  if (result.success) {
    addToast({
      type: "success",
      message: `仮想マシン「${payload.name}」が作成されました`,
    });
    emit("success"); // 親コンポーネントに成功を通知
    emit("close"); // モーダルを閉じる
  } else {
    addToast({
      type: "error",
      message: "仮想マシンの作成に失敗しました。",
      details: result.error?.message,
    });
  }
};
</script>
