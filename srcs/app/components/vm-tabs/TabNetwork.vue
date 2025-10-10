<template>
  <div class="modal-space">
    <!-- 1. 仮想ネットワーク(VPC)選択 -->
    <FormSelect
      label="仮想ネットワーク (VPC)"
      name="vpcId"
      :options="
        networks?.map((net) => ({
          id: net.id,
          name: net.name,
          label:
            net.name + (net.subnets[0] ? ' (' + net.subnets[0].cidr + ')' : ''),
          value: net.id,
        })) || []
      "
      v-model="selectedVpcId"
      :pending="networksPending"
      :error="networksError ? '取得に失敗しました。' : undefined"
      :class="{ 'form-border-error': errors.subnetId }"
      :placeholderValue="undefined"
      :required="true"
      placeholder="VPCを選択してください"
    />

    <!-- 2. サブネット選択 -->
    <FormSelect
      label="サブネット"
      name="subnetId"
      :options="
        availableSubnets.map((subnet) => ({
          id: subnet.id,
          name: subnet.name,
          label: subnet.name + ' (' + subnet.cidr + ')',
          value: subnet.id,
        }))
      "
      v-model="subnetId"
      :pending="networksPending"
      :error="networksError ? '取得に失敗しました。' : undefined"
      :class="{ 'form-border-error': errors.subnetId }"
      :placeholderValue="undefined"
      :required="true"
      placeholder="サブネットを選択してください"
      v-bind="subnetIdAttrs"
    />

    <!-- 3. セキュリティグループ選択 -->
    <FormSelect
      label="セキュリティグループ"
      name="securityGroupId"
      :options="
        securityGroups?.map((sg) => ({
          id: sg.id,
          name: sg.name,
          label: sg.name,
          value: sg.id,
        })) || []
      "
      v-model="securityGroupId"
      :pending="sgPending"
      :error="sgError ? '取得に失敗しました。' : undefined"
      :class="{ 'form-border-error': errors.securityGroupId }"
      :placeholderValue="null"
      placeholder="なし"
      v-bind="securityGroupIdAttrs"
    />

    <!-- 4. 公開鍵ファイルアップロードUI -->
    <div>
      <label class="form-label">公開鍵ファイル</label>
      <div
        class="mt-1 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
        :class="{ 'bg-blue-50': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
      >
        <div class="text-center">
          <!-- Upload Icon -->
          <svg
            class="mx-auto mb-3 h-10 w-10 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 16V4m0 0l-4 4m4-4l4 4"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
          <!-- Upload Text and Button -->
          <div class="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              for="file-upload"
              class="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
            >
              <span>クリックして選択</span>
              <input
                id="file-upload"
                ref="fileInput"
                type="file"
                class="sr-only"
                @change="handleFileSelection"
                accept=".pub"
              />
            </label>
            <p class="pl-1">、またはドラッグ＆ドロップ</p>
          </div>
          <p class="text-xs leading-5 text-gray-600">対応 : pub</p>
          <!-- Selected File Name -->
          <p
            v-if="keyPairFile"
            class="text-sm font-semibold text-green-600 mt-2"
          >
            選択中のファイル: {{ (keyPairFile as File).name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import FormSelect from "../FormSelect.vue";

// ==============================================================================
// Type Definitions
// APIのレスポンスに合わせて型を定義
// ==============================================================================
interface Subnet {
  id: string;
  name: string;
  cidr: string;
}
interface VirtualNetwork {
  id: string;
  name: string;
  subnets: Subnet[];
}
interface SecurityGroupDTO {
  id: string;
  name: string;
}

// ==============================================================================
// Validation Schema
// フォームのバリデーションルールをZodで定義
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    // サブネットIDは必須
    subnetId: z.string({ required_error: "サブネットを選択してください。" }),
    // 他は任意項目
    securityGroupId: z.string().nullable(),
    keyPairFile: z.any().nullable(),
  })
);

// ==============================================================================
// Form Setup
// VeeValidateのuseFormを使ってフォーム全体を管理
// ==============================================================================
const { errors, defineField, values, meta, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    subnetId: undefined,
    securityGroupId: null,
    keyPairFile: null,
  },
});

// VPC選択用のローカルstate。VeeValidateの管理下には置かない
const selectedVpcId = ref<string | undefined>(undefined);

// VeeValidateが管理するフォームフィールドを定義
const [subnetId, subnetIdAttrs] = defineField("subnetId");
const [securityGroupId, securityGroupIdAttrs] = defineField("securityGroupId");
const [keyPairFile] = defineField("keyPairFile"); // v-modelを使わないため、attrsは不要

// 親コンポーネントにフォームのデータとバリデーション状態を公開
defineExpose({ formData: values, isValid: meta });

// ==============================================================================
// API Data Fetching
// useResourceListを使って、プルダウンメニューの選択肢をAPIから取得
// ==============================================================================
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<VirtualNetwork>("virtual-network");
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<SecurityGroupDTO>("security-group");

// ==============================================================================
// UI Logic
// ユーザーの操作に応じたコンポーネントの挙動を定義
// ==============================================================================

/**
 * 選択されたVPCに属するサブネットのリストを動的に計算するComputedプロパティ
 */
const availableSubnets = computed(() => {
  // VPCが選択されていない、またはネットワーク一覧がまだ読み込まれていない場合は空配列を返す
  if (!selectedVpcId.value || !networks.value) return [];
  // 選択されたVPCのオブジェクトを検索
  const selectedVPC = networks.value.find(
    (net) => net.id === selectedVpcId.value
  );
  // 見つかったVPCのサブネットリストを返す（なければ空配列）
  return selectedVPC?.subnets || [];
});

/**
 * VPCの選択が変更されたことを監視し、サブネットの選択をリセットする
 */
watch(selectedVpcId, () => {
  setFieldValue("subnetId", undefined);
});
// --- File Upload Logic ---
const fileInput = ref<HTMLInputElement | null>(null); // ファイル選択ダイアログを開くための参照
const isDragging = ref(false); // ドラッグ中かどうかの状態
const { addToast } = useToast(); // トースト通知用関数を取得

/**
 * ファイル選択ダイアログを開く
 */
const triggerFilePicker = () => {
  fileInput.value?.click();
};

/**
 * ファイルが選択された（またはドロップされた）後の共通処理
 * @param {File | null} file - 選択またはドロップされたファイル
 */
const handleFileChange = (file: File | null) => {
  if (!file) return;

  // ★ 2. ファイル形式のチェック処理を追加
  if (!file.name.endsWith(".pub")) {
    addToast({
      type: "error",
      message: "無効なファイル形式です。.pubファイルを選択してください。",
    });
    // ファイル選択をリセット
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    setFieldValue("keyPairFile", null);
    return;
  }

  setFieldValue("keyPairFile", file);
};

/**
 * ファイル選択ダイアログでファイルが選ばれたときのハンドラ
 * @param {Event} event - input要素のchangeイベント
 */
const handleFileSelection = (event: Event) => {
  const target = event.target as HTMLInputElement;
  handleFileChange(target.files?.[0] || null);
};

/**
 * ファイルがドロップされたときのハンドラ
 * @param {DragEvent} event - dropイベント
 */
const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false;
  handleFileChange(event.dataTransfer?.files?.[0] || null);
};
</script>
