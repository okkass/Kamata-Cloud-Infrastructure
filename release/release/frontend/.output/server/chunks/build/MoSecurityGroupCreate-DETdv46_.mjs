import { _ as _sfc_main$1 } from './BaseModal-XreF1fHA.mjs';
import { _ as __nuxt_component_1 } from './Section-B8lyqO8a.mjs';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { defineComponent, mergeProps, unref, withCtx, isRef, createBlock, createCommentVNode, createVNode, openBlock, toDisplayString, withModifiers, computed, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { useForm, useFieldArray } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';
import { R as RuleTable, s as securityGroupSchema } from './RuleTable-DJ0ZiAQN.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { g as SECURITY_GROUP } from './fetch-kOzZWayB.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormTextarea } from './Textarea-BGnieQ5E.mjs';

function useSecurityGroupForm() {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { executeCreate, isCreating } = useResourceCreate(SECURITY_GROUP.name);
  const { errors, handleSubmit, defineField, meta, resetForm } = useForm({
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
  const onFormSubmit = (emit) => handleFormSubmit(
    handleSubmit,
    {
      execute: async (values) => {
        const mapRules = (rules) => rules.map((rule) => ({
          id: rule.id.startsWith("new-") ? void 0 : rule.id,
          name: rule.name,
          protocol: rule.protocol,
          port: rule.port ?? null,
          targetIp: rule.targetIp,
          action: rule.action,
          ruleType: rule.ruleType
        }));
        const payload = {
          name: values.name,
          description: values.description,
          rules: [
            ...mapRules(values.inboundRules),
            ...mapRules(values.outboundRules)
          ]
        };
        const response = await executeCreate(payload);
        return response;
      },
      onSuccess: () => {
        resetForm();
      },
      onSuccessMessage: (payload) => `セキュリティグループ「${payload.name}」を作成しました。`,
      emitCloseImmediately: true
    },
    emit
  );
  const makehandleClose = (emit) => makeHandleClose(resetForm, emit);
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
    makehandleClose
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoSecurityGroupCreate",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean, required: true },
    group: { type: Object, required: false }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const {
      errors,
      name,
      nameAttrs,
      description,
      descriptionAttrs,
      inboundRules,
      outboundRules,
      // 操作関数
      addInboundRule,
      removeInboundRule,
      addOutboundRule,
      removeOutboundRule,
      isCreating,
      isValid,
      onFormSubmit,
      makehandleClose
    } = useSecurityGroupForm();
    const handleClose = makehandleClose(emit);
    const onSubmit = onFormSubmit(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$1;
      const _component_FormSection = __nuxt_component_1;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "セキュリティグループ作成",
        onClose: unref(handleClose)
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiSubmitButton, {
              disabled: unref(isCreating) || !unref(isValid),
              loading: unref(isCreating),
              label: "セキュリティグループを作成",
              form: "security-group-create-form",
              type: "submit"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode(_component_UiSubmitButton, {
                  disabled: unref(isCreating) || !unref(isValid),
                  loading: unref(isCreating),
                  label: "セキュリティグループを作成",
                  form: "security-group-create-form",
                  type: "submit"
                }, null, 8, ["disabled", "loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="security-group-create-form" class="space-y-6"${_scopeId}><div class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(FormInput, mergeProps({
              label: "セキュリティグループ名",
              name: "sg-name",
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
              name: "sg-description",
              rows: 3,
              modelValue: unref(description),
              "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null
            }, unref(descriptionAttrs), {
              error: unref(errors).description,
              placeholder: "例: Webサーバー用のHTTP/HTTPS通信を許可するグループ"
            }), null, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_FormSection, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (unref(errors).inboundRules) {
                    _push3(`<div class="text-sm text-red-600 px-1"${_scopeId2}>${ssrInterpolate(unref(errors).inboundRules)}</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(RuleTable, {
                    title: "インバウンドルール",
                    rules: unref(inboundRules),
                    errors: unref(errors),
                    "field-name-prefix": "inboundRules",
                    onAddRule: unref(addInboundRule),
                    onDeleteRule: unref(removeInboundRule)
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(RuleTable, {
                    title: "アウトバウンドルール",
                    rules: unref(outboundRules),
                    errors: unref(errors),
                    "field-name-prefix": "outboundRules",
                    onAddRule: unref(addOutboundRule),
                    onDeleteRule: unref(removeOutboundRule)
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    unref(errors).inboundRules ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-sm text-red-600 px-1"
                    }, toDisplayString(unref(errors).inboundRules), 1)) : createCommentVNode("", true),
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
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                id: "security-group-create-form",
                onSubmit: withModifiers(unref(onSubmit), ["prevent"]),
                class: "space-y-6"
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "セキュリティグループ名",
                    name: "sg-name",
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
                    name: "sg-description",
                    rows: 3,
                    modelValue: unref(description),
                    "onUpdate:modelValue": ($event) => isRef(description) ? description.value = $event : null
                  }, unref(descriptionAttrs), {
                    error: unref(errors).description,
                    placeholder: "例: Webサーバー用のHTTP/HTTPS通信を許可するグループ"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
                ]),
                createVNode(_component_FormSection, null, {
                  default: withCtx(() => [
                    unref(errors).inboundRules ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-sm text-red-600 px-1"
                    }, toDisplayString(unref(errors).inboundRules), 1)) : createCommentVNode("", true),
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
                  ]),
                  _: 1
                })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoSecurityGroupCreate.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main, { __name: "MoSecurityGroupCreate" });

export { __nuxt_component_3 as _ };
//# sourceMappingURL=MoSecurityGroupCreate-DETdv46_.mjs.map
