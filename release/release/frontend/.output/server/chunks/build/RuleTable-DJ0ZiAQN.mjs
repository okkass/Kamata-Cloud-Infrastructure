import * as z from 'zod';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';
import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';

const ruleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "ルール名は必須です。"),
  protocol: z.enum(["tcp", "udp", "icmp", "any"]),
  port: z.preprocess(
    (val) => val === "" || val === null ? null : Number(val),
    z.number({ message: "数値を入力してください。" }).int("整数で入力してください").min(0).max(65535).nullable().optional()
  ),
  targetIp: z.cidrv4("有効なCIDR形式で入力してください。"),
  action: z.enum(["allow", "deny"]),
  ruleType: z.enum(["inbound", "outbound"]),
  createdAt: z.string().optional()
});
const securityGroupSchema = z.object({
  name: z.string().min(1, "グループ名は必須です。"),
  description: z.string().optional(),
  inboundRules: z.array(ruleSchema),
  outboundRules: z.array(ruleSchema)
}).refine(
  (data) => data.inboundRules.length > 0 || data.outboundRules.length > 0,
  {
    message: "インバウンドルールまたはアウトバウンドルールのいずれかを設定してください。",
    path: ["inboundRules"]
  }
);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "RuleTable",
  __ssrInlineRender: true,
  props: {
    title: { type: String, default: "ルール" },
    // どんな形式の配列でも受け取れるように any[] に緩和
    rules: { type: Array, default: () => [] },
    errors: {
      type: Object,
      default: () => ({})
    },
    fieldNamePrefix: { type: String, required: true }
  },
  emits: ["add-rule", "delete-rule"],
  setup(__props) {
    const props = __props;
    const displayRules = computed(() => {
      return props.rules.map((item) => {
        return item && typeof item === "object" && "value" in item ? item.value : item;
      });
    });
    const protocolOptions = [
      { id: "tcp", name: "TCP" },
      { id: "udp", name: "UDP" },
      { id: "icmp", name: "ICMP" },
      { id: "any", name: "Any" }
    ];
    const actionOptions = [
      { id: "allow", name: "許可 (Allow)" },
      { id: "deny", name: "拒否 (Deny)" }
    ];
    const isPortDisabled = (protocol) => {
      const p = protocol ? protocol.toLowerCase() : "";
      return p === "icmp" || p === "any";
    };
    const onProtocolChange = (rule) => {
      if (isPortDisabled(rule.protocol)) {
        rule.port = null;
      }
    };
    const getError = (index, field) => {
      const bracketKey = `${props.fieldNamePrefix}[${index}].${field}`;
      const dotKey = `${props.fieldNamePrefix}.${index}.${field}`;
      return props.errors[bracketKey] || props.errors[dotKey];
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FormInput = FormInput;
      const _component_FormSelect = FormSelect;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border rounded-md overflow-hidden bg-white" }, _attrs))} data-v-b0b1af94><div class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center" data-v-b0b1af94><h3 class="font-bold text-sm text-gray-700" data-v-b0b1af94>${ssrInterpolate(__props.title)}</h3><button type="button" class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors" data-v-b0b1af94> + 追加 </button></div><div class="p-4" data-v-b0b1af94>`);
      if (__props.rules.length === 0) {
        _push(`<div class="text-center text-gray-400 py-4 text-sm" data-v-b0b1af94> ルールがありません。 </div>`);
      } else {
        _push(`<div class="space-y-4" data-v-b0b1af94><!--[-->`);
        ssrRenderList(displayRules.value, (rule, index) => {
          _push(`<div class="rule-row" data-v-b0b1af94><div class="grid grid-cols-12 gap-3 items-start" data-v-b0b1af94><div class="col-span-4 min-h-[5.5rem]" data-v-b0b1af94>`);
          _push(ssrRenderComponent(_component_FormInput, {
            name: `rule-name-${index}`,
            label: "名前",
            modelValue: rule.name,
            "onUpdate:modelValue": ($event) => rule.name = $event,
            error: getError(index, "name"),
            placeholder: "ルール名"
          }, null, _parent));
          _push(`</div><div class="col-span-3 min-h-[5.5rem]" data-v-b0b1af94>`);
          _push(ssrRenderComponent(_component_FormSelect, {
            name: `rule-protocol-${index}`,
            label: "プロトコル",
            modelValue: rule.protocol,
            "onUpdate:modelValue": ($event) => rule.protocol = $event,
            options: protocolOptions,
            onChange: ($event) => onProtocolChange(rule),
            placeholder: "選択してください",
            placeholderValue: "",
            required: "",
            class: "py-1 text-sm"
          }, null, _parent));
          _push(`</div><div class="col-span-3 min-h-[5.5rem]" data-v-b0b1af94>`);
          _push(ssrRenderComponent(_component_FormInput, {
            name: `rule-port-${index}`,
            label: "ポート",
            type: "number",
            modelValue: rule.port,
            "onUpdate:modelValue": ($event) => rule.port = $event,
            modelModifiers: { number: true },
            error: getError(index, "port"),
            placeholder: "Any",
            disabled: isPortDisabled(rule.protocol)
          }, null, _parent));
          _push(`</div><div class="col-span-2 flex justify-start" data-v-b0b1af94><button type="button" class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded hover:bg-red-50 h-fit mt-6" title="削除" data-v-b0b1af94><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" data-v-b0b1af94><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" data-v-b0b1af94></path></svg></button></div></div><div class="grid grid-cols-12 gap-3 items-start mt-4" data-v-b0b1af94><div class="col-span-8 min-h-[5.5rem]" data-v-b0b1af94>`);
          _push(ssrRenderComponent(_component_FormInput, {
            name: `rule-targetIp-${index}`,
            label: "送信元/宛先 IP",
            modelValue: rule.targetIp,
            "onUpdate:modelValue": ($event) => rule.targetIp = $event,
            error: getError(index, "targetIp"),
            placeholder: "0.0.0.0/0"
          }, null, _parent));
          _push(`</div><div class="col-span-4 min-h-[5.5rem]" data-v-b0b1af94>`);
          _push(ssrRenderComponent(_component_FormSelect, {
            name: `rule-action-${index}`,
            label: "アクション",
            modelValue: rule.action,
            "onUpdate:modelValue": ($event) => rule.action = $event,
            options: actionOptions,
            placeholder: "選択してください",
            placeholderValue: "",
            required: "",
            class: "py-1 text-sm"
          }, null, _parent));
          _push(`</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RuleTable.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const RuleTable = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-b0b1af94"]]), { __name: "RuleTable" });

export { RuleTable as R, securityGroupSchema as s };
//# sourceMappingURL=RuleTable-DJ0ZiAQN.mjs.map
