import __nuxt_component_1 from './index-CICjSpIO.mjs';
import { defineComponent, ref, computed, defineAsyncComponent, resolveComponent, mergeProps, createVNode, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderSuspense, ssrRenderVNode } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ResourceDetailShell",
  __ssrInlineRender: true,
  props: {
    title: {},
    subtitle: {},
    context: {},
    actions: {},
    tabs: {}
  },
  emits: ["back", "action"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const isMenuOpen = ref(false);
    ref(null);
    const displayActions = computed(() => props.actions ?? []);
    const defaultTab = props.tabs?.[0]?.value ?? "";
    const activeTab = ref(defaultTab);
    const activeComponent = computed(() => {
      if (!props.tabs || props.tabs.length === 0) return null;
      const currentTab = props.tabs.find((t) => t.value === activeTab.value) ?? props.tabs[0];
      if (currentTab?.component) {
        return currentTab.component;
      }
      if (currentTab?.loader) {
        return defineAsyncComponent(currentTab.loader);
      }
      return null;
    });
    const context = computed(() => props.context ?? {});
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      const _component_RouterView = resolveComponent("RouterView");
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "detail-container" }, _attrs))}><header class="detail-header"><div class="detail-header-inner"><div class="flex items-start gap-3"><button type="button" class="detail-back-button" aria-label="戻る">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:chevron-left",
        class: "h-6 w-6"
      }, null, _parent));
      _push(`</button><div><h1 class="detail-title">${ssrInterpolate(__props.title)}</h1>`);
      if (__props.subtitle) {
        _push(`<p class="detail-subtitle">${ssrInterpolate(__props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="flex items-center gap-3">`);
      ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
      if (displayActions.value.length > 0) {
        _push(`<div class="relative"><button type="button" class="detail-menu-button"> 操作 `);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:chevron-down",
          class: "h-4 w-4 text-gray-500"
        }, null, _parent));
        _push(`</button>`);
        if (isMenuOpen.value) {
          _push(`<div class="detail-menu-dropdown"><!--[-->`);
          ssrRenderList(displayActions.value, (action) => {
            _push(`<button type="button" class="detail-menu-item">${ssrInterpolate(action.label)}</button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></header>`);
      if (__props.tabs && __props.tabs.length > 0) {
        _push(`<div class="detail-tabs-wrapper"><nav class="detail-tabs-nav" aria-label="Tabs"><!--[-->`);
        ssrRenderList(__props.tabs, (tab) => {
          _push(`<button class="${ssrRenderClass([[
            activeTab.value === tab.value ? "detail-tab-active" : "detail-tab-inactive"
          ], "detail-tab-button"])}"${ssrRenderAttr("aria-current", activeTab.value === tab.value ? "page" : void 0)}>${ssrInterpolate(tab.label)}</button>`);
        });
        _push(`<!--]--></nav></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="min-h-[300px]">`);
      if (!activeComponent.value) {
        _push(ssrRenderComponent(_component_RouterView, null, null, _parent));
      } else {
        ssrRenderSuspense(_push, {
          fallback: () => {
            _push(`<div class="detail-loading"><div class="detail-spinner"></div></div>`);
          },
          default: () => {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(activeComponent.value), {
              key: activeTab.value,
              context: context.value
            }, null), _parent);
          },
          _: 1
        });
      }
      _push(`</div></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/ResourceDetailShell.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ResourceDetailShell = Object.assign(_sfc_main, { __name: "DetailResourceDetailShell" });

export { ResourceDetailShell as R };
//# sourceMappingURL=ResourceDetailShell-BS8fimHs.mjs.map
