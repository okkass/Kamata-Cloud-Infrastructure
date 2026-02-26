import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "UserTabBasic",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const user = computed(() => props.context);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="detail-heading-sm">基本情報</h2><div class="detail-card"><div><div class="detail-label">名前</div><div class="detail-value">${ssrInterpolate(user.value.name || "—")}</div></div><div><div class="detail-label">メールアドレス</div><div class="detail-value font-mono">${ssrInterpolate(user.value.email || "—")}</div></div><div><div class="detail-label">作成日時</div><div class="detail-value">${ssrInterpolate(unref(formatDateTime)(user.value.createdAt))}</div></div><div><div class="detail-label">最終ログイン</div><div class="detail-value">${ssrInterpolate(unref(formatDateTime)(user.value.lastLoginAt))}</div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/User/UserTabBasic.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const UserTabBasic = Object.assign(_sfc_main, { __name: "DetailPanelsUserTabBasic" });

export { UserTabBasic as default };
//# sourceMappingURL=UserTabBasic-BapFvYFw.mjs.map
