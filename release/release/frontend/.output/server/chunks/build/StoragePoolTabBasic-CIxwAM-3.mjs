import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { t as toSize } from './server.mjs';
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
  __name: "StoragePoolTabBasic",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const pool = computed(() => props.context);
    const utilizationText = computed(() => {
      const total = pool.value?.totalSize;
      const used = pool.value?.usedSize;
      if (total === void 0 || used === void 0 || total === 0 || !Number.isFinite(total) || !Number.isFinite(used)) {
        return "—";
      }
      const ratio = Math.min(Math.max(used / total, 0), 1);
      return `${(ratio * 100).toFixed(1)}%（${toSize(used)} / ${toSize(total)}）`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">基本情報</h2><div class="detail-card"><div><div class="detail-label">名前</div><div class="detail-value">${ssrInterpolate(pool.value?.name || "-")}</div></div><div><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(("formatDateTime" in _ctx ? _ctx.formatDateTime : unref(formatDateTime))(pool.value?.createdAt))}</div></div><div><div class="detail-label">総容量</div><div class="detail-value">${ssrInterpolate(unref(toSize)(pool.value?.totalSize))}</div></div><div><div class="detail-label">使用済み</div><div class="detail-value">${ssrInterpolate(unref(toSize)(pool.value?.usedSize))}</div></div><div class="detail-card-section"><div class="detail-label mb-1">ネットワークアクセス</div><span class="${ssrRenderClass([pool.value?.hasNetworkAccess ? "detail-pill-yes" : "detail-pill-no", "detail-pill"])}">${ssrInterpolate(pool.value?.hasNetworkAccess ? "Yes" : "No")}</span></div><div class="detail-card-section"><div class="detail-label mb-1">使用率</div><span class="detail-value">${ssrInterpolate(utilizationText.value)}</span></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/StoragePool/StoragePoolTabBasic.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const StoragePoolTabBasic = Object.assign(_sfc_main, { __name: "DetailPanelsStoragePoolTabBasic" });

export { StoragePoolTabBasic as default };
//# sourceMappingURL=StoragePoolTabBasic-CIxwAM-3.mjs.map
