import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createVNode, withModifiers, watch, computed, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { useForm, useFieldArray } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceUpdater } from './useResourceUpdater-D_YM1lnm.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { R as RuleTable, s as securityGroupSchema } from './RuleTable-DJ0ZiAQN.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormTextarea } from './Textarea-BGnieQ5E.mjs';

function useSecurityGroupEditForm(props) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { editedData, init, save, isDirty, isSaving } = useResourceUpdater();
  const {
    errors,
    handleSubmit,
    defineField,
    meta,
    resetForm,
    setValues,
    values
  } = useForm({
    validationSchema: toTypedSchema(securityGroupSchema),
    initialValues: {
      name: "",
      description: "",
      inboundRules: [],
      outboundRules: []
    }
  });
  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");
  const {
    fields: inboundRules,
    push: pushInbound,
    remove: removeInbound
  } = useFieldArray("inboundRules");
  const {
    fields: outboundRules,
    push: pushOutbound,
    remove: removeOutbound
  } = useFieldArray("outboundRules");
  watch(
    () => [props.show, props.data],
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
        const inbound = data.rules?.filter((r) => r.ruleType === "inbound").map((r) => ({
          ...r,
          action: r.action ?? "allow"
        })) ?? [];
        const outbound = data.rules?.filter((r) => r.ruleType === "outbound").map((r) => ({
          ...r,
          action: r.action ?? "allow"
        })) ?? [];
        setValues({
          name: data.name,
          description: data.description || "",
          inboundRules: inbound,
          outboundRules: outbound
        });
      }
    },
    { immediate: true }
  );
  function getResourceConfig(data) {
    return {
      base: {
        endpoint: `security-groups/${data.id}`,
        fields: ["name", "description"]
      },
      collections: {
        rules: {
          endpoint: `security-groups/${data.id}/rules`,
          bulkEndpoint: `security-groups/${data.id}/rules/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: [
            "name",
            "protocol",
            "port",
            "targetIp",
            "action",
            "ruleType"
          ]
        }
      }
    };
  }
  watch(
    () => values,
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.description = newValues.description;
        editedData.value.rules = [
          ...newValues.inboundRules,
          ...newValues.outboundRules
        ].map((rule) => ({
          ...rule,
          createdAt: rule.createdAt ?? (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    },
    { deep: true }
  );
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      execute: async () => {
        const success = await save();
        return { success };
      },
      onSuccess: () => {
        resetForm();
      },
      onSuccessMessage: () => `セキュリティグループ「${values.name}」を更新しました。`,
      emitCloseImmediately: true
    },
    emit
  );
  const createEmptyRule = (type) => ({
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    protocol: "tcp",
    port: null,
    targetIp: "0.0.0.0/0",
    action: "allow",
    ruleType: type
  });
  const addInboundRule = () => pushInbound(createEmptyRule("inbound"));
  const removeInboundRule = (idx) => removeInbound(idx);
  const addOutboundRule = () => pushOutbound(createEmptyRule("outbound"));
  const removeOutboundRule = (idx) => removeOutbound(idx);
  const makehandleClose = (emit) => makeHandleClose(resetForm, emit);
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
    makehandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoSecurityGroupEdit",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean, required: true },
    data: {
      type: Object,
      default: null
    }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const {
      errors,
      name,
      nameAttrs,
      description,
      descriptionAttrs,
      inboundRules,
      outboundRules,
      addInboundRule,
      removeInboundRule,
      addOutboundRule,
      removeOutboundRule,
      isSaving,
      isValid,
      onFormSubmit,
      makehandleClose
    } = useSecurityGroupEditForm(props);
    const onSubmit = onFormSubmit(emit);
    const handleClose = makehandleClose(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "セキュリティグループ編集",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              disabled: unref(isSaving) || !unref(isValid),
              loading: unref(isSaving),
              label: "セキュリティグループを更新",
              form: "security-group-edit-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(_component_UiSubmitButton, {
                  disabled: unref(isSaving) || !unref(isValid),
                  loading: unref(isSaving),
                  label: "セキュリティグループを更新",
                  form: "security-group-edit-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="security-group-edit-form" class="space-y-6"${_scopeId}><div class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "セキュリティグループ名",
              name: "sg-name-edit",
              type: "text",
              modelValue: unref(name),
              "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
            }, unref(nameAttrs), {
              error: unref(errors).name,
              required: true,
              placeholder: "例: web-server-sg"
            }), null, _parent2, _scopeId));
            _push2(ssrRenderComponent(FormTextarea, mergeProps({
              label: "説明",
              name: "sg-description-edit",
              rows: 3,
              modelValue: unref(description),
              "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null
            }, unref(descriptionAttrs), {
              error: unref(errors).description,
              placeholder: "例: Webサーバー用のHTTP/HTTPS通信を許可するグループ"
            }), null, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(RuleTable, {
              title: "インバウンドルール",
              rules: unref(inboundRules),
              errors: unref(errors),
              "field-name-prefix": "inboundRules",
              onAddRule: unref(addInboundRule),
              onDeleteRule: unref(removeInboundRule)
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(RuleTable, {
              title: "アウトバウンドルール",
              rules: unref(outboundRules),
              errors: unref(errors),
              "field-name-prefix": "outboundRules",
              onAddRule: unref(addOutboundRule),
              onDeleteRule: unref(removeOutboundRule)
            }, null, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                id: "security-group-edit-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "space-y-6"
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "セキュリティグループ名",
                    name: "sg-name-edit",
                    type: "text",
                    modelValue: unref(name),
                    "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
                  }, unref(nameAttrs), {
                    error: unref(errors).name,
                    required: true,
                    placeholder: "例: web-server-sg"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormTextarea, mergeProps({
                    label: "説明",
                    name: "sg-description-edit",
                    rows: 3,
                    modelValue: unref(description),
                    "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null
                  }, unref(descriptionAttrs), {
                    error: unref(errors).description,
                    placeholder: "例: Webサーバー用のHTTP/HTTPS通信を許可するグループ"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
                ]),
                createVNode(RuleTable, {
                  title: "インバウンドルール",
                  rules: unref(inboundRules),
                  errors: unref(errors),
                  "field-name-prefix": "inboundRules",
                  onAddRule: unref(addInboundRule),
                  onDeleteRule: unref(removeInboundRule)
                }, null, 8, ["rules", "errors", "onAddRule", "onDeleteRule"]),
                createVNode(RuleTable, {
                  title: "アウトバウンドルール",
                  rules: unref(outboundRules),
                  errors: unref(errors),
                  "field-name-prefix": "outboundRules",
                  onAddRule: unref(addOutboundRule),
                  onDeleteRule: unref(removeOutboundRule)
                }, null, 8, ["rules", "errors", "onAddRule", "onDeleteRule"])
              ], 40, ["onSubmit"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoSecurityGroupEdit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main, { __name: "MoSecurityGroupEdit" });

export { __nuxt_component_4 as _ };
//# sourceMappingURL=MoSecurityGroupEdit-DSXzzQ8a.mjs.map
