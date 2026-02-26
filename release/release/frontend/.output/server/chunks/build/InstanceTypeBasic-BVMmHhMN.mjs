import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { c as convertByteToUnit } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "InstanceTypeBasic",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const instanceType = computed(() => props.context);
    const formattedCreatedAt = computed(() => formatDateTime(instanceType.value.createdAt));
    const memoryGB = computed(() => convertByteToUnit(instanceType.value.memorySize, "GB"));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">基本情報</h2><div class="detail-card"><div><div class="detail-label">名前</div><div class="text-base font-medium text-neutral-900">${ssrInterpolate(instanceType.value.name)}</div></div><div><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(formattedCreatedAt.value)}</div></div><div class="detail-card-section"><div class="detail-heading-sm">スペック</div><div class="detail-grid-2col"><div><div class="detail-label">CPU</div><div class="detail-value">${ssrInterpolate(instanceType.value.cpuCore)} cores </div></div><div><div class="detail-label">メモリ</div><div class="detail-value">${ssrInterpolate(memoryGB.value)} GB </div></div></div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/InstanceType/InstanceTypeBasic.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const InstanceTypeBasic = Object.assign(_sfc_main, { __name: "DetailPanelsInstanceTypeBasic" });

export { InstanceTypeBasic as default };
//# sourceMappingURL=InstanceTypeBasic-BVMmHhMN.mjs.map
