import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { g as getNodeStatusDisplay, f as formatAsPercent } from './status-BiUv1ciD.mjs';
import './server.mjs';
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
  __name: "StoragePoolTabNode",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const node = computed(() => props.context?.node);
    const nodeStatus = computed(() => {
      const raw = node.value?.status ?? "";
      return getNodeStatusDisplay(raw);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">物理ノード</h2><div class="detail-card"><div><div class="detail-label">名前</div><div class="detail-value">${ssrInterpolate(node.value?.name || "-")}</div></div><div><div class="detail-label">IPアドレス</div><div class="detail-value">${ssrInterpolate(node.value?.ipAddress || "-")}</div></div><div><div class="detail-label">状態</div><span class="${ssrRenderClass([nodeStatus.value.class, "detail-pill"])}">${ssrInterpolate(nodeStatus.value.text)}</span></div><div><div class="detail-label">管理ノード</div><span class="${ssrRenderClass([node.value?.isAdmin ? "detail-pill-yes" : "detail-pill-no", "detail-pill"])}">${ssrInterpolate(node.value?.isAdmin ? "Yes" : "No")}</span></div><div><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(("formatDateTime" in _ctx ? _ctx.formatDateTime : unref(formatDateTime))(node.value?.createdAt))}</div></div><div class="detail-card-section"><div class="detail-heading-sm">使用率</div><div class="space-y-1"><div><span class="detail-label">CPU：</span><span class="detail-value">${ssrInterpolate(unref(formatAsPercent)(node.value?.cpuUtilization))}</span></div><div><span class="detail-label">メモリ：</span><span class="detail-value">${ssrInterpolate(unref(formatAsPercent)(node.value?.memoryUtilization))}</span></div><div><span class="detail-label">ストレージ：</span><span class="detail-value">${ssrInterpolate(unref(formatAsPercent)(node.value?.storageUtilization))}</span></div></div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/StoragePool/StoragePoolTabNode.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const StoragePoolTabNode = Object.assign(_sfc_main, { __name: "DetailPanelsStoragePoolTabNode" });

export { StoragePoolTabNode as default };
//# sourceMappingURL=StoragePoolTabNode-PKFIwJDR.mjs.map
