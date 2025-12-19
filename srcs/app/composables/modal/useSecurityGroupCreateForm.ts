/**
 * =================================================================================
 * セキュリティグループ作成フォーム Composable (useSecurityGroupCreateForm.ts)
 * =================================================================================
 */
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import {
  securityGroupSchema,
  type SecurityGroupFormValues,
  type SecurityRuleFormValues,
} from "~/utils/validations/security-group";
import { useFormAction } from "~/composables/modal/useModalAction";

export function useSecurityGroupForm() {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { executeCreate, isCreating } = useResourceCreate<
    SecurityGroupCreateRequest,
    SecurityGroupResponse
  >(SECURITY_GROUP.name);

  const { errors, handleSubmit, defineField, meta, resetForm } =
    useForm<SecurityGroupFormValues>({
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

  // ★★★ 修正: useFieldArray を使用 ★★★
  // fields はリアクティブな配列であり、各要素は書き込み可能です（{value: ...}形式）
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

  const onFormSubmit = (emit: any) =>
    handleFormSubmit<SecurityGroupFormValues, SecurityGroupResponse>(
      handleSubmit,
      {
        execute: async (values) => {
          const mapRules = (rules: SecurityRuleFormValues[]) =>
            rules.map((rule) => ({
              id: rule.id.startsWith("new-") ? undefined : rule.id,
              name: rule.name,
              protocol: rule.protocol,
              port: rule.port ?? null,
              targetIp: rule.targetIp,
              action: rule.action,
              ruleType: rule.ruleType,
            }));

          const payload: SecurityGroupCreateRequest = {
            name: values.name,
            description: values.description,
            rules: [
              ...mapRules(values.inboundRules),
              ...mapRules(values.outboundRules),
            ],
          };
          const response = await executeCreate(payload);
          return response;
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: (payload) =>
          `セキュリティグループ「${payload.name}」を作成しました。`,
      },
      emit
    );
  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    // useFieldArray の戻り値 (fields) をそのまま返す
    inboundRules,
    outboundRules,
    addInboundRule,
    removeInboundRule,
    addOutboundRule,
    removeOutboundRule,
    isValid: computed(() => meta.value.valid),
    isCreating,
    onFormSubmit,
    makehandleClose,
  };
}
