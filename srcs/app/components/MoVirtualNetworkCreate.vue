<template>
  <BaseModal :show="show" title="仮想ネットワーク作成" @close="$emit('close')">
    <div class="modal-space">
      <div>
        <label for="network-name-create" class="form-label">
          ネットワーク名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="network-name-create"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
          placeholder="例: vpc-frontend"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="ip-address-create" class="form-label">
          IPアドレス / CIDR <span class="required-asterisk">*</span>
        </label>
        <input
          id="ip-address-create"
          type="text"
          v-model="cidr"
          v-bind="cidrAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.cidr }"
          placeholder="例: 192.168.0.0/16"
        />
        <p v-if="errors.cidr" class="text-error mt-1">{{ errors.cidr }}</p>
      </div>
    </div>

    <div class="modal-footer">
      <button
        @click="handleSubmit"
        class="btn btn-primary"
        :disabled="isCreating"
      >
        {{ isCreating ? "作成中..." : "作成" }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 仮想ネットワーク作成モーダル (MoVirtualNetworkCreate.vue)
 * ---------------------------------------------------------------------------------
 * このコンポーネントは、新しい仮想ネットワーク（VPC）を作成するための
 * 情報をユーザーから受け取り、APIを介してリソースを作成する機能を提供します。
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// --- 親コンポーネントとの連携 ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "success"]);

// ==============================================================================
// Type Definitions
// APIとの通信で使用するデータの型を定義します。
// ==============================================================================
// POST /api/virtual-networks で送信するリクエストボディの型
interface VirtualNetworkCreateRequestDTO {
  name: string;
  cidr: string;
}
// POST成功後に返される、作成済み仮想ネットワークの型
interface VirtualNetworkDTO {
  id: string;
  name: string;
  cidr: string;
}

// ==============================================================================
// Validation Schema
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    // nameは1文字以上の文字列であることが必須です。
    name: z.string().min(1, "ネットワーク名は必須です。"),
    // cidrはCIDR形式に一致する文字列であることが必須です。
    cidr: z
      .string()
      .min(1, "CIDRは必須です。")
      .regex(
        /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/,
        "有効なCIDR形式で入力してください (例: 192.168.0.0/16)。"
      ),
  })
);

// ==============================================================================
// Form Setup
// VeeValidateのuseFormを使って、フォームの状態管理をセットアップします。
// ==============================================================================
const { errors, defineField, values, meta, validate } = useForm({
  validationSchema,
});

// `defineField`を使って、各フォームフィールドとVeeValidateを連携させます。
const [name, nameAttrs] = defineField("name");
const [cidr, cidrAttrs] = defineField("cidr");

// ==============================================================================
// API Submission
// Composableを使ってAPIとの通信を管理します。
// ==============================================================================
const { executeCreate: executeVirtualNetworkCreation, isCreating } =
  useResourceCreate<VirtualNetworkCreateRequestDTO, VirtualNetworkDTO>(
    "virtual-networks"
  );

const { addToast } = useToast();

// ==============================================================================
// Event Handler
// ==============================================================================

/**
 * 「作成」ボタンがクリックされたときに実行されるハンドラ
 */
const handleSubmit = async () => {
  // 1. フォーム全体のバリデーションを実行
  const validationResult = await validate();
  if (!validationResult.valid) {
    // バリデーションエラーがある場合は処理を中断
    return;
  }

  // 2. APIに送信するデータ（ペイロード）をフォームの入力値から取得
  const payload: VirtualNetworkCreateRequestDTO = values;

  // 3. APIリクエストを実行
  const result = await executeVirtualNetworkCreation(payload);

  // 4. 結果に応じてトースト通知を表示
  if (result.success) {
    addToast({
      type: "success",
      message: `仮想ネットワーク「${payload.name}」が作成されました`,
    });
    emit("success"); // 親コンポーネントに成功を通知
    emit("close"); // モーダルを閉じる
  } else {
    addToast({
      type: "error",
      message: "仮想ネットワークの作成に失敗しました。",
      details: result.error?.message,
    });
  }
};
</script>
