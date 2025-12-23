import { computed, watch } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";
import { useFormAction } from "~/composables/modal/useModalAction";
import {
  securityGroupSchema,
  type SecurityGroupFormValues,
  type SecurityRuleFormValues,
} from "~/utils/validations/security-group";

type Props = ModalFormProps<SecurityGroupResponse>;

export function useSecurityGroupEditForm(props: Props) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { editedData, init, save, isDirty, isSaving } =
    useResourceUpdater<SecurityGroupResponse>();

  const {
    errors,
    handleSubmit,
    defineField,
    meta,
    resetForm,
    setValues,
    values,
  } = useForm<SecurityGroupFormValues>({
    validationSchema: toTypedSchema(securityGroupSchema),
    initialValues: {
      name: "",
      description: "",
      inboundRules: [],
      outboundRules: [],
    },
  });

  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");

  const {
    fields: inboundRules,
    push: pushInbound,
    remove: removeInbound,
  } = useFieldArray<SecurityRuleFormValues>("inboundRules");

  const {
    fields: outboundRules,
    push: pushOutbound,
    remove: removeOutbound,
  } = useFieldArray<SecurityRuleFormValues>("outboundRules");

  // --- 初期化ロジック ---
  watch(
    () => [props.show, props.data] as const,
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
        const inbound =
          data.rules
            ?.filter((r) => r.ruleType === "inbound")
            .map((r) => ({
              ...r,
              action: r.action ?? "allow",
            })) ?? [];
        const outbound =
          data.rules
            ?.filter((r) => r.ruleType === "outbound")
            .map((r) => ({
              ...r,
              action: r.action ?? "allow",
            })) ?? [];
        setValues({
          name: data.name,
          description: data.description || "",
          inboundRules: inbound,
          outboundRules: outbound,
        });
      }
    },
    { immediate: true }
  );

  function getResourceConfig(data: SecurityGroupResponse): ResourceConfig {
    return {
      base: {
        endpoint: `security-groups/${data.id}`,
        fields: ["name", "description"],
      },
      collections: {
        rules: {
          endpoint: `security-groups/${data.id}/rules`,
          bulkEndpoint: `security-groups/${data.id}/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: [
            "name",
            "protocol",
            "port",
            "targetIp",
            "action",
            "ruleType",
          ],
        },
      },
    };
  }

  // --- vee-validate の値を editedData に同期 ---
  watch(
    () => values,
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.description = newValues.description;
        editedData.value.rules = [
          ...newValues.inboundRules,
          ...newValues.outboundRules,
        ].map((rule) => ({
          ...rule,
          createdAt: rule.createdAt ?? new Date().toISOString(),
        }));
      }
    },
    { deep: true }
  );

  // --- バリデーション ---
  const validate = (): boolean => {
    return meta.value.valid;
  };

  // --- 送信ハンドラ ---
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<SecurityGroupFormValues, SecurityGroupResponse>(
      handleSubmit,
      {
        execute: async () => {
          const success = await save();
          return { success };
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: () =>
          `セキュリティグループ「${values.name}」を更新しました。`,
      },
      emit
    );

  // --- ルール操作ヘルパー ---
  const createEmptyRule = (
    type: "inbound" | "outbound"
  ): SecurityRuleFormValues => ({
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    protocol: "tcp",
    port: null,
    targetIp: "0.0.0.0/0",
    action: "allow",
    ruleType: type,
  });

  const addInboundRule = () => pushInbound(createEmptyRule("inbound"));
  const removeInboundRule = (idx: number) => removeInbound(idx);
  const addOutboundRule = () => pushOutbound(createEmptyRule("outbound"));
  const removeOutboundRule = (idx: number) => removeOutbound(idx);

  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    // State
    errors,
    isDirty,
    isSaving,

    // Form fields
    name,
    nameAttrs,
    description,
    descriptionAttrs,

    // Computed Lists
    inboundRules,
    outboundRules,

    // Methods
    addInboundRule,
    removeInboundRule,
    addOutboundRule,
    removeOutboundRule,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makehandleClose,
  };
}
