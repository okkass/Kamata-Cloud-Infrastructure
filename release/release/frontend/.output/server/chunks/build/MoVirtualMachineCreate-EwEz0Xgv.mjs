import { _ as _sfc_main$9 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, ref, watch, mergeProps, withCtx, unref, createVNode, resolveDynamicComponent, createBlock, openBlock, Fragment, renderList, createTextVNode, createCommentVNode, toDisplayString, withDirectives, vShow, markRaw, computed, isRef, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderVNode, ssrRenderAttrs, ssrRenderSlot, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { U as UiSubmitButton } from './SubmitButton-BLZt3uil.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { useForm, useFieldArray } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';
import { a as MACHINE, N as NODE, e as INSTANCE_TYPE, B as BACKUP, d as STORAGE, I as IMAGE, f as MIDDLEWARE, b as NETWORK, g as SECURITY_GROUP } from './fetch-kOzZWayB.mjs';
import { _ as _export_sfc, c as convertByteToUnit, s as formatImageSize, q as convertUnitToByte } from './server.mjs';
import { _ as __nuxt_component_1 } from './Section-B8lyqO8a.mjs';
import { S as StorageConfigTable } from './StorageConfigTable-BkExsU01.mjs';
import { D as DropZone } from './DropZone-DuFc6jYt.mjs';
import { u as useFormAction } from './useModalAction-CCl6IdMe.mjs';
import { u as useResourceCreate } from './useResourceCreate-C_T3ufwz.mjs';

const _sfc_main$8 = {
  __name: "SecondaryButton",
  __ssrInlineRender: true,
  emits: ["click"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        type: "button",
        class: "btn btn-back"
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, () => {
        _push(`X`);
      }, _push, _parent);
      _push(`</button>`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SecondaryButton.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const vmGeneralCreateSchema = z.object({
  name: z.string().min(1, "仮想マシン名は必須です。"),
  nodeId: z.string("ノードは必須です。").min(1, "ノードを選択してください")
});
z.object({
  name: z.string().min(1, "仮想マシン名は必須です。"),
  description: z.string().optional()
});
const vmConfigSchema = z.object({
  templateId: z.string().optional(),
  cpuCore: z.preprocess(
    (val) => val === "" || val === null ? void 0 : Number(val),
    z.number().min(1, "1コア以上を指定してください。").optional()
  ),
  memorySize: z.preprocess(
    (val) => val === "" || val === null ? void 0 : Number(val),
    z.number().min(512, "512MB以上を指定してください。").optional()
  ),
  backupId: z.string().optional().nullable(),
  storages: z.array(
    z.object({
      id: z.any().optional(),
      name: z.string().min(1, "名前は必須です。"),
      size: z.number().min(1, "1GB以上の正の数値を指定してください。"),
      poolId: z.string("プールを選択してください。").min(1, "プールを選択してください。"),
      type: z.string().optional()
    })
  )
});
const vmOsMiddlewareCreateSchema = z.object({
  osImageId: z.string("OSイメージを選択してください。").min(1, "OSイメージを選択してください。"),
  middlewareId: z.string().optional().nullable()
});
const vmNetworkCreateSchema = z.object({
  networkInterfaces: z.array(
    z.object({
      vpcId: z.string().min(1, "VPCを選択してください。"),
      subnetIds: z.array(z.string()).min(1, "少なくとも1つのサブネットを選択してください。")
    })
  ).min(1, "少なくとも1つのネットワークインターフェースを追加してください。"),
  securityGroupIds: z.array(
    z.object({
      id: z.string(),
      name: z.string()
    })
  ),
  keyPairFile: z.any().optional().nullable()
});
z.object({
  networkInterfaces: z.array(
    z.object({
      id: z.string().optional(),
      networkId: z.string().min(1, "ネットワークを選択してください。"),
      subnetId: z.string().min(1, "サブネットを選択してください。")
    })
  ).optional(),
  securityGroups: z.array(
    z.object({
      id: z.string(),
      name: z.string()
    })
  ).min(1, "セキュリティグループは1つ以上必須です。")
});
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "TabGeneral",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const validationSchema = toTypedSchema(vmGeneralCreateSchema);
    const { errors, defineField, values, meta } = useForm({
      validationSchema,
      initialValues: {
        name: "",
        nodeId: void 0
      }
    });
    const [name, nameAttrs] = defineField("name");
    const [nodeId, nodeIdAttrs] = defineField("nodeId");
    const {
      data: nodes,
      pending,
      error
    } = useResourceList(NODE.name);
    const formatNodeStatus = (status) => {
      if (!status) return "不明";
      const statusMap = {
        running: "実行中",
        stopped: "停止中",
        error: "エラー",
        updating: "更新中"
      };
      return statusMap[status] || status;
    };
    const getNodeStatusClass = (status) => {
      if (!status) return "text-gray-500";
      const classMap = {
        running: "text-green-600 font-semibold",
        stopped: "text-red-600",
        error: "text-red-700 font-semibold",
        updating: "text-yellow-600"
      };
      return classMap[status] || "text-gray-600";
    };
    __expose({
      formData: values,
      isValid: meta
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-space space-y-4" }, _attrs))} data-v-292b3e34>`);
      _push(ssrRenderComponent(FormInput, mergeProps({
        label: "仮想マシン名",
        name: "vm-name",
        type: "text",
        placeholder: "例: vm-middleware01",
        required: true,
        error: unref(errors).name,
        modelValue: unref(name),
        "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null
      }, unref(nameAttrs)), null, _parent));
      _push(ssrRenderComponent(FormSelect, mergeProps({
        label: "ノード",
        name: "node-select",
        options: unref(nodes) ?? [],
        "option-label": "name",
        "option-value": "id",
        pending: unref(pending),
        error: unref(error),
        placeholder: "ノードを選択してください",
        required: true,
        "error-message": unref(errors).nodeId,
        columns: ["ノード名", "状態"],
        "grid-template-columns": "2fr 1fr",
        modelValue: unref(nodeId),
        "onUpdate:modelValue": ($event) => isRef(nodeId) ? nodeId.value = $event : null
      }, unref(nodeIdAttrs)), {
        option: withCtx(({ option }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-4 items-center w-full" style="${ssrRenderStyle({ "grid-template-columns": "2fr 1fr" })}" data-v-292b3e34${_scopeId}><div data-v-292b3e34${_scopeId}>${ssrInterpolate(option.name)}</div><div class="text-sm" data-v-292b3e34${_scopeId}><span class="${ssrRenderClass(getNodeStatusClass(option.status))}" data-v-292b3e34${_scopeId}>${ssrInterpolate(formatNodeStatus(option.status))}</span></div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "grid gap-4 items-center w-full",
                style: { "grid-template-columns": "2fr 1fr" }
              }, [
                createVNode("div", null, toDisplayString(option.name), 1),
                createVNode("div", { class: "text-sm" }, [
                  createVNode("span", {
                    class: getNodeStatusClass(option.status)
                  }, toDisplayString(formatNodeStatus(option.status)), 3)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-tabs/TabGeneral.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const TabGeneral = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$7, [["__scopeId", "data-v-292b3e34"]]), { __name: "VmTabsTabGeneral" });
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "TabConfig",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const validationSchema = toTypedSchema(
      vmConfigSchema.superRefine((data, ctx) => {
        if (!data.templateId) {
          if (!data.cpuCore) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["cpuCore"],
              message: "CPUコア数は必須です"
            });
          }
          if (!data.memorySize) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["memorySize"],
              message: "メモリサイズは必須です"
            });
          }
        }
        if (data.storages.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["storages"],
            message: "少なくとも1つのストレージが必要です"
          });
        }
      })
    );
    const { errors, defineField, values, meta } = useForm({
      validationSchema,
      initialValues: {
        templateId: void 0,
        cpuCore: 2,
        memorySize: 2048,
        backupId: null,
        storages: [
          { id: "new-0", name: "root-disk", size: 20, poolId: "", type: "manual" }
        ]
      }
    });
    const [templateId, templateIdAttrs] = defineField("templateId");
    const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
    const [memorySize, memorySizeAttrs] = defineField("memorySize");
    const [backupId, backupIdAttrs] = defineField("backupId");
    const {
      fields: storageFields,
      push: pushStorage,
      remove: removeStorage
    } = useFieldArray("storages");
    const {
      data: templates,
      pending: templatesPending,
      error: templatesError
    } = useResourceList(INSTANCE_TYPE.name);
    const {
      data: backups,
      pending: backupsPending,
      error: backupsError
    } = useResourceList(BACKUP.name);
    const {
      data: storagePools,
      pending: poolsPending,
      error: poolsError
    } = useResourceList(STORAGE.name);
    const displayStorages = computed(() => {
      return storageFields.value.map((field) => {
        return field && typeof field === "object" && "value" in field ? field.value : field;
      });
    });
    watch(templateId, (newId) => {
      if (newId && templates.value) {
        const tpl = templates.value.find((t) => t.id === newId);
        if (tpl) {
          cpuCore.value = tpl.cpuCore;
          memorySize.value = convertByteToUnit(tpl.memorySize, "MB");
        }
      }
    });
    let nextStorageId = 100;
    const addStorage = () => {
      pushStorage({
        id: `new-${nextStorageId++}`,
        name: `disk-${storageFields.value.length + 1}`,
        size: 20,
        poolId: "",
        type: "manual"
      });
    };
    watch(backupId, (newBackupId) => {
      const indiciesToRemove = [];
      storageFields.value.forEach((field, idx) => {
        const val = field.value || field;
        if (val.type === "backup") indiciesToRemove.push(idx);
      });
      for (let i = indiciesToRemove.length - 1; i >= 0; i--) {
        const indexToRemove = indiciesToRemove[i];
        if (indexToRemove !== void 0) {
          removeStorage(indexToRemove);
        }
      }
      if (newBackupId && backups.value) {
        const backup = backups.value.find((b) => b.id === newBackupId);
        if (backup) {
          pushStorage({
            id: `new-${backup.id}`,
            name: backup.name,
            size: convertByteToUnit(backup.size, "GB"),
            poolId: "",
            type: "backup"
          });
        }
      }
    });
    const getTemplateLabel = (tpl) => {
      const memMB = convertByteToUnit(tpl.memorySize, "MB");
      return `${tpl.name} (${tpl.cpuCore}vCPU, ${memMB}MB)`;
    };
    __expose({
      formData: values,
      isValid: meta
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-space space-y-6" }, _attrs))} data-v-af1f9281>`);
      _push(ssrRenderComponent(FormSelect, mergeProps({
        label: "テンプレート",
        name: "templateId",
        options: unref(templates) ?? [],
        "option-label": getTemplateLabel,
        "option-value": "id",
        pending: unref(templatesPending),
        error: unref(templatesError),
        placeholder: "使用しない（カスタム構成）",
        "placeholder-value": "",
        columns: ["テンプレート名", "CPU", "メモリ"],
        "grid-template-columns": "2fr 1fr 1fr",
        modelValue: unref(templateId),
        "onUpdate:modelValue": ($event) => isRef(templateId) ? templateId.value = $event : null
      }, unref(templateIdAttrs)), {
        option: withCtx(({ option }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-4 items-center w-full" style="${ssrRenderStyle({ "grid-template-columns": "2fr 1fr 1fr" })}" data-v-af1f9281${_scopeId}><div data-v-af1f9281${_scopeId}>${ssrInterpolate(option.name)}</div><div class="text-sm text-gray-600" data-v-af1f9281${_scopeId}>${ssrInterpolate(option.cpuCore)}vCPU</div><div class="text-sm text-gray-600" data-v-af1f9281${_scopeId}>${ssrInterpolate(("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(option.memorySize, "MB"))}MB </div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "grid gap-4 items-center w-full",
                style: { "grid-template-columns": "2fr 1fr 1fr" }
              }, [
                createVNode("div", null, toDisplayString(option.name), 1),
                createVNode("div", { class: "text-sm text-gray-600" }, toDisplayString(option.cpuCore) + "vCPU", 1),
                createVNode("div", { class: "text-sm text-gray-600" }, toDisplayString(("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(option.memorySize, "MB")) + "MB ", 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (!unref(values).templateId) {
        _push(ssrRenderComponent(__nuxt_component_1, { title: "CPU / メモリ" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="grid grid-cols-2 gap-4" data-v-af1f9281${_scopeId}>`);
              _push2(ssrRenderComponent(FormInput, mergeProps({
                label: "CPUコア数",
                name: "cpuCore",
                type: "number",
                modelValue: unref(cpuCore),
                "onUpdate:modelValue": ($event) => isRef(cpuCore) ? cpuCore.value = $event : null,
                modelModifiers: { number: true }
              }, unref(cpuCoreAttrs), {
                error: unref(errors).cpuCore,
                placeholder: "例: 2"
              }), null, _parent2, _scopeId));
              _push2(ssrRenderComponent(FormInput, mergeProps({
                label: "メモリ (MB)",
                name: "memorySize",
                type: "number",
                step: 1024,
                modelValue: unref(memorySize),
                "onUpdate:modelValue": ($event) => isRef(memorySize) ? memorySize.value = $event : null,
                modelModifiers: { number: true }
              }, unref(memorySizeAttrs), {
                error: unref(errors).memorySize,
                placeholder: "例: 2048"
              }), null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                  createVNode(FormInput, mergeProps({
                    label: "CPUコア数",
                    name: "cpuCore",
                    type: "number",
                    modelValue: unref(cpuCore),
                    "onUpdate:modelValue": ($event) => isRef(cpuCore) ? cpuCore.value = $event : null,
                    modelModifiers: { number: true }
                  }, unref(cpuCoreAttrs), {
                    error: unref(errors).cpuCore,
                    placeholder: "例: 2"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"]),
                  createVNode(FormInput, mergeProps({
                    label: "メモリ (MB)",
                    name: "memorySize",
                    type: "number",
                    step: 1024,
                    modelValue: unref(memorySize),
                    "onUpdate:modelValue": ($event) => isRef(memorySize) ? memorySize.value = $event : null,
                    modelModifiers: { number: true }
                  }, unref(memorySizeAttrs), {
                    error: unref(errors).memorySize,
                    placeholder: "例: 2048"
                  }), null, 16, ["modelValue", "onUpdate:modelValue", "error"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(FormSelect, mergeProps({
        label: "バックアップから復元（任意）",
        name: "backupId",
        options: unref(backups) ?? [],
        "option-label": "name",
        "option-value": "id",
        pending: unref(backupsPending),
        error: unref(backupsError),
        placeholder: "使用しない",
        "placeholder-value": "",
        modelValue: unref(backupId),
        "onUpdate:modelValue": ($event) => isRef(backupId) ? backupId.value = $event : null
      }, unref(backupIdAttrs)), null, _parent));
      _push(ssrRenderComponent(__nuxt_component_1, { title: "ストレージ構成" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(StorageConfigTable, {
              storages: displayStorages.value,
              "storage-pools": unref(storagePools) ?? [],
              errors: unref(errors).storages,
              "field-name-prefix": "storages",
              onAdd: addStorage,
              onRemove: unref(removeStorage)
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(StorageConfigTable, {
                storages: displayStorages.value,
                "storage-pools": unref(storagePools) ?? [],
                errors: unref(errors).storages,
                "field-name-prefix": "storages",
                onAdd: addStorage,
                onRemove: unref(removeStorage)
              }, null, 8, ["storages", "storage-pools", "errors", "onRemove"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-tabs/TabConfig.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const TabConfig = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$6, [["__scopeId", "data-v-af1f9281"]]), { __name: "VmTabsTabConfig" });
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "TabOsMiddleware",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const validationSchema = toTypedSchema(vmOsMiddlewareCreateSchema);
    const { errors, defineField, values, meta } = useForm({
      validationSchema,
      initialValues: {
        osImageId: void 0,
        middlewareId: null
      }
    });
    const [osImageId, osImageIdAttrs] = defineField("osImageId");
    const [middlewareId, middlewareIdAttrs] = defineField("middlewareId");
    const {
      data: osImages,
      pending: imagesPending,
      error: imagesError
    } = useResourceList(IMAGE.name);
    const {
      data: middlewares,
      pending: middlewaresPending,
      error: middlewaresError
    } = useResourceList(MIDDLEWARE.name);
    __expose({
      formData: values,
      isValid: meta
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-space space-y-4" }, _attrs))} data-v-5d3161ee>`);
      _push(ssrRenderComponent(FormSelect, mergeProps({
        label: "OSイメージ",
        name: "os-image-select",
        options: unref(osImages) ?? [],
        "option-label": "name",
        "option-value": "id",
        pending: unref(imagesPending),
        error: unref(imagesError),
        placeholder: "OSイメージを選択してください",
        required: true,
        "error-message": unref(errors).osImageId,
        columns: ["イメージ名", "サイズ"],
        "grid-template-columns": "2fr 1fr",
        modelValue: unref(osImageId),
        "onUpdate:modelValue": ($event) => isRef(osImageId) ? osImageId.value = $event : null
      }, unref(osImageIdAttrs)), {
        option: withCtx(({ option }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-4 items-center w-full" style="${ssrRenderStyle({ "grid-template-columns": "2fr 1fr" })}" data-v-5d3161ee${_scopeId}><div data-v-5d3161ee${_scopeId}>${ssrInterpolate(option.name)}</div><div class="text-sm text-gray-600" data-v-5d3161ee${_scopeId}>${ssrInterpolate(unref(formatImageSize)(option.size))}</div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "grid gap-4 items-center w-full",
                style: { "grid-template-columns": "2fr 1fr" }
              }, [
                createVNode("div", null, toDisplayString(option.name), 1),
                createVNode("div", { class: "text-sm text-gray-600" }, toDisplayString(unref(formatImageSize)(option.size)), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(FormSelect, mergeProps({
        label: "ミドルウェア",
        name: "middleware-select",
        options: unref(middlewares) ?? [],
        "option-label": "name",
        "option-value": "id",
        pending: unref(middlewaresPending),
        error: unref(middlewaresError),
        placeholder: "なし",
        "placeholder-value": "",
        "error-message": unref(errors).middlewareId,
        modelValue: unref(middlewareId),
        "onUpdate:modelValue": ($event) => isRef(middlewareId) ? middlewareId.value = $event : null
      }, unref(middlewareIdAttrs)), null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-tabs/TabOsMiddleware.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const TabOsMiddleware = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-5d3161ee"]]), { __name: "VmTabsTabOsMiddleware" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "NetworkInterfaceItem",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    networks: {},
    networksPending: { type: Boolean },
    networksError: {},
    errors: {},
    index: {}
  },
  emits: ["update:modelValue", "remove"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const availableSubnets = computed(() => {
      if (!props.modelValue.vpcId) return [];
      const selectedVPC = props.networks.find(
        (net) => net.id === props.modelValue.vpcId
      );
      return selectedVPC?.subnets || [];
    });
    const handleVpcChange = (newVpcId) => {
      if (typeof newVpcId === "string") {
        emit("update:modelValue", {
          ...props.modelValue,
          vpcId: newVpcId,
          subnetIds: []
        });
      }
    };
    const handleSubnetChange = (newSubnetId) => {
      if (typeof newSubnetId === "string") {
        emit("update:modelValue", {
          ...props.modelValue,
          subnetIds: [newSubnetId]
        });
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 bg-white rounded-lg section-form relative group" }, _attrs))}><div class="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">`);
      _push(ssrRenderComponent(FormSelect, {
        label: "仮想ネットワーク (VPC)",
        name: `vpc-id-${__props.index}`,
        modelValue: __props.modelValue.vpcId,
        "onUpdate:modelValue": [($event) => __props.modelValue.vpcId = $event, handleVpcChange],
        options: __props.networks,
        "error-message": __props.errors?.vpcId,
        placeholder: "VPCを選択してください",
        required: true,
        pending: __props.networksPending,
        error: __props.networksError,
        columns: ["VPC名", "CIDR"],
        "grid-template-columns": "2fr 1fr"
      }, {
        option: withCtx(({ option }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-4 items-center w-full" style="${ssrRenderStyle({ "grid-template-columns": "2fr 1fr" })}"${_scopeId}><div${_scopeId}>${ssrInterpolate(option.name)}</div><div class="text-gray-500 text-sm"${_scopeId}>${ssrInterpolate(option.cidr)}</div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "grid gap-4 items-center w-full",
                style: { "grid-template-columns": "2fr 1fr" }
              }, [
                createVNode("div", null, toDisplayString(option.name), 1),
                createVNode("div", { class: "text-gray-500 text-sm" }, toDisplayString(option.cidr), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(FormSelect, {
        label: "サブネット",
        name: `subnet-ids-${__props.index}`,
        "model-value": __props.modelValue.subnetIds?.[0],
        options: availableSubnets.value,
        "error-message": __props.errors?.subnetIds,
        placeholder: "サブネットを選択してください",
        required: true,
        pending: __props.networksPending,
        disabled: !__props.modelValue.vpcId,
        error: __props.networksError,
        columns: ["サブネット名", "CIDR"],
        "grid-template-columns": "2fr 1fr",
        "onUpdate:modelValue": handleSubnetChange
      }, {
        option: withCtx(({ option }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-4 items-center w-full" style="${ssrRenderStyle({ "grid-template-columns": "2fr 1fr" })}"${_scopeId}><div${_scopeId}>${ssrInterpolate(option.name)}</div><div class="text-gray-500 text-sm"${_scopeId}>${ssrInterpolate(option.cidr)}</div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "grid gap-4 items-center w-full",
                style: { "grid-template-columns": "2fr 1fr" }
              }, [
                createVNode("div", null, toDisplayString(option.name), 1),
                createVNode("div", { class: "text-gray-500 text-sm" }, toDisplayString(option.cidr), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><button type="button" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition-colors" title="削除"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path></svg></button></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-tabs/NetworkInterfaceItem.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const NetworkInterfaceItem = Object.assign(_sfc_main$4, { __name: "VmTabsNetworkInterfaceItem" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "NetworkInterfaceSection",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    networks: {},
    networksPending: { type: Boolean },
    networksError: {},
    errors: {}
  },
  emits: ["update:modelValue", "add", "remove"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const updateInterface = (index, newInterface) => {
      emit("update:modelValue", { index, value: newInterface });
    };
    const removeInterface = (index) => {
      emit("remove", index);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(_attrs)}><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-medium text-gray-900"> ネットワークインターフェース </h3><button type="button" class="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"> + インターフェース追加 </button></div>`);
      if (__props.networksPending) {
        _push(`<div class="text-sm text-gray-500 mb-2"> ネットワーク情報を取得中... </div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.networksError) {
        _push(`<div class="text-sm text-red-500 mb-2"> ネットワーク情報の取得に失敗しました。 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-4"><!--[-->`);
      ssrRenderList(__props.modelValue, (iface, index) => {
        _push(ssrRenderComponent(NetworkInterfaceItem, {
          key: iface.id || index,
          "model-value": iface,
          networks: __props.networks,
          "networks-pending": __props.networksPending,
          "networks-error": __props.networksError,
          errors: __props.errors?.[index],
          index,
          "onUpdate:modelValue": ($event) => updateInterface(index, $event),
          onRemove: ($event) => removeInterface(index)
        }, null, _parent));
      });
      _push(`<!--]-->`);
      if (__props.modelValue.length === 0) {
        _push(`<div class="text-center text-gray-400 py-8 border-2 border-dashed rounded-lg"> インターフェースがありません </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-tabs/NetworkInterfaceSection.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const NetworkInterfaceSection = Object.assign(_sfc_main$3, { __name: "VmTabsNetworkInterfaceSection" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SecurityGroupSection",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    masterSecurityGroups: {},
    error: {},
    errorMessage: {}
  },
  emits: ["add", "remove"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const selectedSgId = ref("");
    const availableOptions = computed(() => {
      const currentIds = new Set(props.modelValue.map((sg) => sg.id));
      return (props.masterSecurityGroups || []).filter((sg) => !currentIds.has(sg.id)).map((sg) => ({
        id: sg.id,
        name: sg.name
      }));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(_attrs)}><h3 class="text-lg font-medium text-gray-900 mb-4">セキュリティグループ</h3>`);
      if (__props.error) {
        _push(`<div class="text-sm text-red-500 mb-2"> セキュリティグループ情報の取得に失敗しました。 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-2 mb-4">`);
      _push(ssrRenderComponent(FormSelect, {
        name: "sg-select",
        modelValue: selectedSgId.value,
        "onUpdate:modelValue": ($event) => selectedSgId.value = $event,
        options: availableOptions.value,
        "option-label": "name",
        "option-value": "id",
        placeholder: "セキュリティグループを追加...",
        columns: ["名前", "説明"],
        "grid-template-columns": "2fr 1fr",
        class: "flex-1"
      }, {
        option: withCtx(({ option }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-4 items-center w-full" style="${ssrRenderStyle({ "grid-template-columns": "2fr 1fr" })}"${_scopeId}><div${_scopeId}>${ssrInterpolate(option.name)}</div><div class="text-sm text-gray-500"${_scopeId}>${ssrInterpolate(option.description || "-")}</div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "grid gap-4 items-center w-full",
                style: { "grid-template-columns": "2fr 1fr" }
              }, [
                createVNode("div", null, toDisplayString(option.name), 1),
                createVNode("div", { class: "text-sm text-gray-500" }, toDisplayString(option.description || "-"), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button type="button"${ssrIncludeBooleanAttr(!selectedSgId.value) ? " disabled" : ""} class="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"> 追加 </button></div><div class="flex flex-wrap gap-2"><!--[-->`);
      ssrRenderList(__props.modelValue, (sg, index) => {
        _push(`<div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">${ssrInterpolate(sg.name)} <button type="button" class="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-800 transition-colors"><span class="sr-only">削除</span><svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
      });
      _push(`<!--]-->`);
      if (__props.modelValue.length === 0) {
        _push(`<div class="text-sm text-gray-400 py-1"> 割り当てなし </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.errorMessage) {
        _push(`<div class="text-sm text-red-500 mt-1">${ssrInterpolate(__props.errorMessage)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-tabs/SecurityGroupSection.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const SecurityGroupSection = Object.assign(_sfc_main$2, { __name: "VmTabsSecurityGroupSection" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TabNetwork",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const validationSchema = toTypedSchema(vmNetworkCreateSchema);
    const { errors, defineField, values, meta, validate } = useForm({
      validationSchema,
      initialValues: {
        networkInterfaces: [{ vpcId: "", subnetIds: [] }],
        securityGroupIds: [],
        keyPairFile: void 0
      }
    });
    const [keyPairFile, keyPairFileAttrs] = defineField("keyPairFile");
    const {
      fields: networkInterfaceFields,
      push: pushNetworkInterface,
      remove: removeNetworkInterface
    } = useFieldArray("networkInterfaces");
    const {
      fields: securityGroupFields,
      push: pushSecurityGroup,
      remove: removeSecurityGroup
    } = useFieldArray("securityGroupIds");
    const networkInterfaces = computed(() => {
      return networkInterfaceFields.value.map(
        (field) => field && typeof field === "object" && "value" in field ? field.value : field
      );
    });
    const securityGroupIds = computed(() => {
      return securityGroupFields.value.map(
        (field) => field && typeof field === "object" && "value" in field ? field.value : field
      );
    });
    const addNetworkInterface = () => {
      pushNetworkInterface({
        vpcId: "",
        subnetIds: []
      });
    };
    const addSecurityGroup = (sg) => {
      pushSecurityGroup(sg);
    };
    const updateNetworkInterface = (index, updated) => {
      const field = networkInterfaceFields.value[index];
      if (field) {
        field.value = updated;
      }
    };
    const validateForm = async () => {
      const { valid } = await validate();
      return valid;
    };
    const {
      data: networks,
      pending: networksPending,
      error: networksError
    } = useResourceList(NETWORK.name);
    const { data: securityGroupMaster, error: sgError } = useResourceList(SECURITY_GROUP.name);
    __expose({
      formData: values,
      isValid: meta,
      errors,
      validate: validateForm
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-space space-y-6" }, _attrs))} data-v-c59807b1>`);
      _push(ssrRenderComponent(NetworkInterfaceSection, {
        "model-value": networkInterfaces.value,
        networks: unref(networks) ?? [],
        "networks-pending": unref(networksPending),
        "networks-error": unref(networksError),
        error: unref(errors)?.networkInterfaces,
        "error-message": unref(errors)?.networkInterfaces,
        "onUpdate:modelValue": ($event) => updateNetworkInterface($event.index, $event.value),
        onRemove: ($event) => unref(removeNetworkInterface)($event),
        onAdd: addNetworkInterface
      }, null, _parent));
      _push(`<hr class="border-gray-200" data-v-c59807b1>`);
      _push(ssrRenderComponent(SecurityGroupSection, {
        "model-value": securityGroupIds.value,
        "master-security-groups": unref(securityGroupMaster) ?? [],
        error: unref(sgError),
        "error-message": unref(errors)?.securityGroupIds,
        onAdd: addSecurityGroup,
        onRemove: unref(removeSecurityGroup)
      }, null, _parent));
      _push(`<hr class="border-gray-200" data-v-c59807b1><section data-v-c59807b1>`);
      _push(ssrRenderComponent(DropZone, mergeProps({
        label: "公開鍵 (任意)",
        name: "keyPairFile",
        accept: ".pub",
        error: unref(errors).keyPairFile,
        modelValue: unref(keyPairFile),
        "onUpdate:modelValue": ($event) => isRef(keyPairFile) ? keyPairFile.value = $event : null
      }, unref(keyPairFileAttrs)), null, _parent));
      _push(`</section></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-tabs/TabNetwork.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const TabNetwork = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-c59807b1"]]), { __name: "VmTabsTabNetwork" });
function useVmWizardForm() {
  const { handleModalSubmit } = useFormAction();
  const currentTab = ref(0);
  const tabRefs = ref([]);
  const tabs = [
    { name: "概要", component: markRaw(TabGeneral) },
    { name: "構成", component: markRaw(TabConfig) },
    { name: "OS/ミドルウェア", component: markRaw(TabOsMiddleware) },
    { name: "ネットワーク/セキュリティ", component: markRaw(TabNetwork) }
  ];
  const tabValidity = computed(() => {
    return tabRefs.value.map((tab) => tab?.isValid?.valid ?? false);
  });
  const prevTab = () => {
    if (currentTab.value > 0) currentTab.value--;
  };
  const nextTab = () => {
    if (currentTab.value < tabs.length - 1) currentTab.value++;
  };
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  const buildPayloadAndValidate = async () => {
    const generalData = tabRefs.value[0]?.formData;
    const configData = tabRefs.value[1]?.formData;
    const osData = tabRefs.value[2]?.formData;
    const networkData = tabRefs.value[3]?.formData;
    const allSubnetIds = networkData?.networkInterfaces?.flatMap((iface) => iface.subnetIds).filter((id) => id) ?? [];
    const securityGroupIds = networkData?.securityGroupIds?.map((sg) => sg.id) ?? [];
    const basePayload = {
      name: generalData?.name ?? "",
      nodeId: generalData?.nodeId ?? "",
      subnetIds: allSubnetIds,
      publicKey: networkData?.keyPairFile?.value ? await readFileAsText(networkData.keyPairFile.value) : "",
      securityGroupIds,
      imageId: osData?.osImageId ?? "",
      middlewareId: osData?.middlewareId || null,
      storages: configData?.storages.map((storage) => ({
        name: storage.name,
        size: convertUnitToByte(storage.size, "GB"),
        poolId: storage.poolId,
        backupId: storage.type === "backup" ? configData.backupId : void 0
      })) ?? []
    };
    let payload;
    if (!!configData?.templateId) {
      payload = {
        ...basePayload,
        spec: {
          instanceTypeId: configData.templateId
        }
      };
    } else {
      payload = {
        ...basePayload,
        spec: {
          cpu: configData?.cpuCore,
          memory: convertUnitToByte(configData?.memorySize, "MB")
        }
      };
    }
    return payload;
  };
  const { executeCreate: executeVirtualMachineCreation, isCreating } = useResourceCreate(
    MACHINE.name
  );
  const validateAllTabs = async () => {
    for (let i = 0; i < tabRefs.value.length; i++) {
      const tab = tabRefs.value[i];
      if (tab?.validate) {
        const isValid = await tab.validate();
        if (!isValid) {
          currentTab.value = i;
          throw new Error("入力に誤りがあります。各タブを確認してください。");
        }
      }
    }
  };
  const handleFinalSubmit = (emit) => {
    return handleModalSubmit(
      async () => {
        await validateAllTabs();
        return await buildPayloadAndValidate();
      },
      {
        execute: executeVirtualMachineCreation,
        onSuccessMessage: (payload) => `仮想マシン「${payload.name}」が作成されました`,
        onErrorMessage: "仮想マシンの作成に失敗しました。",
        emitCloseImmediately: true
      },
      emit
    );
  };
  const reset = () => {
    currentTab.value = 0;
  };
  return {
    currentTab,
    tabRefs,
    tabs,
    tabValidity,
    prevTab,
    nextTab,
    handleFinalSubmit,
    isCreating,
    isInvalid: computed(() => !tabValidity.value.every((valid) => valid)),
    reset
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoVirtualMachineCreate",
  __ssrInlineRender: true,
  props: { show: { type: Boolean, required: true } },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const {
      currentTab,
      tabRefs,
      tabs,
      tabValidity,
      prevTab,
      nextTab,
      handleFinalSubmit,
      isCreating,
      isInvalid,
      reset
    } = useVmWizardForm();
    const modalTitle = ref("仮想マシン作成");
    watch(
      () => props.show,
      (newShow) => {
        if (newShow) {
          reset();
        }
      }
    );
    const onFinalSubmit = () => handleFinalSubmit(emit);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$9;
      const _component_SecondaryButton = _sfc_main$8;
      const _component_UiSubmitButton = UiSubmitButton;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: modalTitle.value,
        onClose: ($event) => _ctx.$emit("close"),
        size: "lg"
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer"${_scopeId}><div class="flex gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_SecondaryButton, {
              onClick: unref(prevTab),
              disabled: unref(currentTab) === 0
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` 戻る `);
                } else {
                  return [
                    createTextVNode(" 戻る ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (unref(currentTab) < unref(tabs).length - 1) {
              _push2(`<button class="btn btn-primary"${_scopeId}> 次へ </button>`);
            } else {
              _push2(ssrRenderComponent(_component_UiSubmitButton, {
                label: "作成",
                loading: unref(isCreating),
                disabled: unref(isInvalid),
                btnVariant: "btn-submit",
                onClick: onFinalSubmit
              }, null, _parent2, _scopeId));
            }
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer" }, [
                createVNode("div", { class: "flex gap-3" }, [
                  createVNode(_component_SecondaryButton, {
                    onClick: unref(prevTab),
                    disabled: unref(currentTab) === 0
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" 戻る ")
                    ]),
                    _: 1
                  }, 8, ["onClick", "disabled"]),
                  unref(currentTab) < unref(tabs).length - 1 ? (openBlock(), createBlock("button", {
                    key: 0,
                    onClick: unref(nextTab),
                    class: "btn btn-primary"
                  }, " 次へ ", 8, ["onClick"])) : (openBlock(), createBlock(_component_UiSubmitButton, {
                    key: 1,
                    label: "作成",
                    loading: unref(isCreating),
                    disabled: unref(isInvalid),
                    btnVariant: "btn-submit",
                    onClick: onFinalSubmit
                  }, null, 8, ["loading", "disabled"]))
                ])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div${_scopeId}><div class="flex border-b border-gray-200"${_scopeId}><!--[-->`);
            ssrRenderList(unref(tabs), (tab, index) => {
              _push2(`<button class="${ssrRenderClass([
                "relative py-2 px-4 text-sm font-medium",
                unref(currentTab) === index ? "tab-button-active" : "tab-button"
              ])}"${_scopeId}>${ssrInterpolate(tab.name)} `);
              if (!unref(tabValidity)[index]) {
                _push2(`<span class="tab-error-indicator" title="このタブに入力エラーがあります"${_scopeId}></span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</button>`);
            });
            _push2(`<!--]--></div><div class="pt-6 min-h-[300px]"${_scopeId}><!--[-->`);
            ssrRenderList(unref(tabs), (tab, index) => {
              ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(tab.component), {
                key: index,
                style: unref(currentTab) === index ? null : { display: "none" },
                ref_for: true,
                ref: (el) => {
                  if (el) unref(tabRefs)[index] = el;
                }
              }, null), _parent2, _scopeId);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            return [
              createVNode("div", null, [
                createVNode("div", { class: "flex border-b border-gray-200" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(tabs), (tab, index) => {
                    return openBlock(), createBlock("button", {
                      key: tab.name,
                      onClick: ($event) => currentTab.value = index,
                      class: [
                        "relative py-2 px-4 text-sm font-medium",
                        unref(currentTab) === index ? "tab-button-active" : "tab-button"
                      ]
                    }, [
                      createTextVNode(toDisplayString(tab.name) + " ", 1),
                      !unref(tabValidity)[index] ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "tab-error-indicator",
                        title: "このタブに入力エラーがあります"
                      })) : createCommentVNode("", true)
                    ], 10, ["onClick"]);
                  }), 128))
                ]),
                createVNode("div", { class: "pt-6 min-h-[300px]" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(tabs), (tab, index) => {
                    return withDirectives((openBlock(), createBlock(resolveDynamicComponent(tab.component), {
                      key: index,
                      ref_for: true,
                      ref: (el) => {
                        if (el) unref(tabRefs)[index] = el;
                      }
                    })), [
                      [vShow, unref(currentTab) === index]
                    ]);
                  }), 128))
                ])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoVirtualMachineCreate.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoVirtualMachineCreate = Object.assign(_sfc_main, { __name: "MoVirtualMachineCreate" });

export { MoVirtualMachineCreate as M };
//# sourceMappingURL=MoVirtualMachineCreate-EwEz0Xgv.mjs.map
