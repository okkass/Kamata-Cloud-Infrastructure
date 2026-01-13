<template>
  <div class="modal-space space-y-6">
    <!-- ネットワークインターフェース設定 -->
    <NetworkInterfaceSection
      :model-value="networkInterfaces"
      :networks="networks ?? []"
      :networks-pending="networksPending"
      :networks-error="networksError"
      :error="errors?.networkInterfaces"
      :error-message="errors?.networkInterfaces"
      @update:model-value="updateNetworkInterface($event.index, $event.value)"
      @remove="removeNetworkInterface($event)"
      @add="addNetworkInterface"
    />

    <hr class="border-gray-200" />

    <!-- セキュリティグループ設定 -->
    <SecurityGroupSection
      :model-value="securityGroupIds"
      :master-security-groups="securityGroupMaster ?? []"
      :error="sgError"
      :error-message="errors?.securityGroupIds"
      @add="addSecurityGroup"
      @remove="removeSecurityGroup"
    />

    <hr class="border-gray-200" />

    <!-- SSH公開鍵 -->
    <section>
      <DropZone
        label="公開鍵 (任意)"
        name="keyPairFile"
        accept=".pub"
        :error="errors.keyPairFile"
        v-model="keyPairFile"
        v-bind="keyPairFileAttrs"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ネットワーク/セキュリティ タブ (TabNetwork.vue)
 * ---------------------------------------------------------------------------------
 * 仮想マシン作成ウィザードのネットワーク設定を行うタブ。
 * 複数のネットワークインターフェース、セキュリティグループ、SSH公開鍵の設定を行います。
 * =================================================================================
 */
import { computed } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

// サブコンポーネント
import NetworkInterfaceSection from "./NetworkInterfaceSection.vue";
import SecurityGroupSection from "./SecurityGroupSection.vue";
import DropZone from "~/components/Form/DropZone.vue";
import { vmNetworkCreateSchema } from "~/utils/validations/virtual-machine";

/**
 * ==============================================================================
 * Data Structures
 * ==============================================================================
 */

interface SecurityGroupItem {
  id: string;
  name: string;
}

/**
 * ==============================================================================
 * Validation Schema
 * ==============================================================================
 */
const validationSchema = toTypedSchema(vmNetworkCreateSchema);

/**
 * ==============================================================================
 * Form State Management
 * ==============================================================================
 */
const { errors, defineField, values, meta, validate } = useForm({
  validationSchema,
  initialValues: {
    networkInterfaces: [{ vpcId: "", subnetIds: [] }],
    securityGroupIds: [],
    keyPairFile: undefined,
  },
});

const [keyPairFile, keyPairFileAttrs] = defineField("keyPairFile");

/**
 * ネットワークインターフェース配列を useFieldArray で管理
 */
const {
  fields: networkInterfaceFields,
  push: pushNetworkInterface,
  remove: removeNetworkInterface,
} = useFieldArray<NetworkInterface>("networkInterfaces");

/**
 * セキュリティグループ配列を useFieldArray で管理
 */
const {
  fields: securityGroupFields,
  push: pushSecurityGroup,
  remove: removeSecurityGroup,
} = useFieldArray<SecurityGroupItem>("securityGroupIds");

/**
 * テンプレート用: networkInterfaceFields を unwrap
 */
const networkInterfaces = computed(() => {
  return networkInterfaceFields.value.map((field) =>
    field && typeof field === "object" && "value" in field ? field.value : field
  );
});

/**
 * テンプレート用: securityGroupFields を unwrap
 */
const securityGroupIds = computed(() => {
  return securityGroupFields.value.map((field) =>
    field && typeof field === "object" && "value" in field ? field.value : field
  );
});

/**
 * ネットワークインターフェースを追加
 */
const addNetworkInterface = () => {
  pushNetworkInterface({
    vpcId: "",
    subnetIds: [],
  } as NetworkInterface);
};

/**
 * セキュリティグループを追加
 */
const addSecurityGroup = (sg: SecurityGroupItem) => {
  pushSecurityGroup(sg);
};

/**
 * ネットワークインターフェースを更新
 */
const updateNetworkInterface = (index: number, updated: NetworkInterface) => {
  const field = networkInterfaceFields.value[index];
  if (field) {
    field.value = updated;
  }
};

/**
 * バリデーションを実行（外部から呼び出し用）
 */
const validateForm = async () => {
  const { valid } = await validate();
  return valid;
};

/**
 * ==============================================================================
 * API Data Fetching
 * ==============================================================================
 */
// 1. 仮想ネットワーク (VPC)
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<VirtualNetworkResponse>(NETWORK.name);

// 2. セキュリティグループ
const { data: securityGroupMaster, error: sgError } =
  useResourceList<SecurityGroupResponse>(SECURITY_GROUP.name);
/**
 * ==============================================================================
 * Expose
 * ==============================================================================
 */
defineExpose({
  formData: values,
  isValid: meta,
  errors,
  validate: validateForm,
});
</script>

<style scoped>
.modal-space {
  @apply p-1;
}
</style>
