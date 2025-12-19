<template>
  <BaseModal :show="show" title="仮想ネットワーク作成" @close="handleClose">
    <form
      id="network-create-form"
      @submit.prevent="submitForm"
      class="space-y-6"
    >
      <div class="space-y-4">
        <FormInput
          label="ネットワーク名"
          name="network-name-create"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
          placeholder="例: vpc-frontend"
        />

        <FormInput
          label="IPアドレス / CIDR"
          name="ip-address-create"
          type="text"
          v-model="cidr"
          v-bind="cidrAttrs"
          :error="errors.cidr"
          :required="true"
          placeholder="例: 192.168.0.0/16"
        />
      </div>
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          :disabled="isCreating || !isValid"
          :loading="isCreating"
          label="仮想ネットワークを作成"
          form="network-create-form"
          type="submit"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 仮想ネットワーク作成モーダル (MoVirtualNetworkCreate.vue)
 * =================================================================================
 */
import { useVirtualNetworkCreateForm } from "~/composables/modal/useVirtualNetworkCreateForm";
import FormInput from "~/components/Form/Input.vue";
import UiSubmitButton from "~/components/ui/SubmitButton.vue";

// --- 親コンポーネントとの連携 ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors,
  name,
  nameAttrs,
  cidr,
  cidrAttrs,
  isValid,
  isCreating,
  onFormSubmit,
  makehandleClose,
} = useVirtualNetworkCreateForm();

// --- イベントハンドラ ---
const submitForm = onFormSubmit(emit);
const handleClose = makehandleClose(emit);
</script>
