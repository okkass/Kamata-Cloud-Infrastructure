import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { t as toSize } from './server.mjs';
import { defineComponent, toRef, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "ImageTabBasic",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const image = toRef(props, "context");
    computed(() => {
      const v = image.value;
      if (!v) return "-";
      if (typeof v.nodeId === "string" && v.nodeId) return v.nodeId;
      const nid = v.node?.id;
      const nname = v.node?.name;
      if (nname && nid) return `${nname} (${nid})`;
      if (nid) return nid;
      return "-";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="text-lg font-semibold">基本情報</h2><div class="detail-card"><div><div class="detail-label">名前</div><div class="detail-value">${ssrInterpolate(unref(image)?.name || "-")}</div></div><div><div class="detail-label">説明</div><div class="detail-value">${ssrInterpolate(unref(image)?.description || "-")}</div></div><div><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(("formatDateTime" in _ctx ? _ctx.formatDateTime : unref(formatDateTime))(unref(image)?.createdAt))}</div></div><div><div class="detail-label">サイズ</div><div class="detail-value">${ssrInterpolate(("toSize" in _ctx ? _ctx.toSize : unref(toSize))(unref(image)?.size ?? 0))}</div></div><div><div class="detail-label">ストレージプール</div><div class="detail-value">${ssrInterpolate(unref(image)?.storagePool?.name || "-")}</div></div><div class="detail-card-section"><div class="detail-label">ID</div><div class="detail-value">${ssrInterpolate(unref(image)?.id || "-")}</div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/Image/ImageTabBasic.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ImageTabBasic = Object.assign(_sfc_main, { __name: "DetailPanelsImageTabBasic" });

export { ImageTabBasic as default };
//# sourceMappingURL=ImageTabBasic-CLI_r1hM.mjs.map
