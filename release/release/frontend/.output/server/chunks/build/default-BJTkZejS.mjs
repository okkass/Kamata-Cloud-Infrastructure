import { defineComponent, withAsyncContext, mergeProps, unref, readonly, ref, withCtx, createVNode, createTextVNode, toDisplayString, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderSlot, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
import { _ as _export_sfc } from './server.mjs';
import { _ as __nuxt_component_1$1 } from './cross-BwfcbiN4.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import __nuxt_component_1 from './index-CICjSpIO.mjs';
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
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';

const isSidebarOpen = ref(false);
function useSidebar() {
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };
  const open = () => {
    isSidebarOpen.value = true;
  };
  const close = () => {
    isSidebarOpen.value = false;
  };
  return {
    isSidebarOpen: readonly(isSidebarOpen),
    toggleSidebar,
    open,
    close
  };
}
const _sfc_main$3 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    xmlns: "http://www.w3.org/2000/svg",
    class: "h-6 w-6",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/icon/menu.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$1]]), { __name: "IconMenu" });
const useSidebarMenu = () => {
  const permissions = useUserPermission();
  const sidebarMenuItems = [
    {
      title: "仮想マシン管理",
      links: [
        { text: "仮想マシン一覧", href: "/machine" },
        { text: "スナップショット", href: "/snapshot" },
        { text: "バックアップ管理", href: "/backup" }
      ],
      shouldDisplay: () => true
    },
    {
      title: "仮想ネットワーク管理",
      links: [{ text: "仮想ネットワーク", href: "/network" }],
      shouldDisplay: () => true
    },
    {
      title: "セキュリティグループ",
      links: [{ text: "セキュリティグループ", href: "/security-group" }],
      shouldDisplay: () => true
    },
    {
      title: "ノード",
      links: [{ text: "ノード管理ダッシュボード", href: "/node" }],
      shouldDisplay: (p) => p.isNodeAdmin.value || p.isAdmin.value
    },
    {
      title: "利用者管理",
      links: [{ text: "利用者管理ダッシュボード", href: "/user" }],
      shouldDisplay: (p) => p.isAdmin.value
    },
    {
      title: "イメージ管理",
      links: [{ text: "イメージ管理ダッシュボード", href: "/image" }],
      shouldDisplay: (p) => p.isImageAdmin.value || p.isAdmin.value
    },
    {
      title: "ストレージ",
      links: [{ text: "ストレージプール", href: "/storage-pool" }],
      shouldDisplay: (p) => p.isAdmin.value
    },
    {
      title: "インスタンスタイプ",
      links: [{ text: "インスタンスタイプ", href: "/instance-type" }],
      shouldDisplay: (p) => p.isInstanceTypeAdmin.value || p.isAdmin.value
    }
  ];
  const getSidebarMenuSections = computed(() => {
    return sidebarMenuItems.filter((item) => item.shouldDisplay(permissions)).map((item) => ({
      title: item.title,
      links: item.links
    })).concat([
      {
        title: "その他",
        links: [{ text: "アカウント設定", href: "/settings" }]
      }
    ]);
  });
  const getSidebarTitle = computed(() => {
    return permissions.isAdmin.value || permissions.hasAdminAccess.value ? "管理者メニュー" : "利用者メニュー";
  });
  return {
    getSidebarMenuSections,
    getSidebarTitle
  };
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Sidebar",
  __ssrInlineRender: true,
  setup(__props) {
    const { isSidebarOpen: isSidebarOpen2 } = useSidebar();
    const { getSidebarMenuSections, getSidebarTitle } = useSidebarMenu();
    const openSections = ref(/* @__PURE__ */ new Set());
    const isSectionOpen = (title) => {
      return openSections.value.has(title);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_IconMenu = __nuxt_component_0;
      const _component_IconCross = __nuxt_component_1$1;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<aside${ssrRenderAttrs(mergeProps({
        class: ["fixed top-16 left-0 bottom-0 bg-white text-slate-800 transition-all duration-300 ease-in-out select-none border-r border-gray-200", unref(isSidebarOpen2) ? "w-64" : "w-16"]
      }, _attrs))}>`);
      if (!unref(isSidebarOpen2)) {
        _push(`<div class="flex flex-col items-center h-full"><div class="mb-4"><button class="p-2 rounded-md hover:bg-gray-100 transition-colors mt-4" aria-label="メニューを開く"><span>`);
        _push(ssrRenderComponent(_component_IconMenu, null, null, _parent));
        _push(`</span></button></div></div>`);
      } else {
        _push(`<div class="flex flex-col h-full overflow-hidden"><div class="p-4 mb-4 flex justify-between items-center whitespace-nowrap"><span class="text-lg font-bold">${ssrInterpolate(unref(getSidebarTitle))}</span><button class="p-1 rounded-full hover:bg-gray-200" aria-label="メニューを閉じる"><span>`);
        _push(ssrRenderComponent(_component_IconCross, null, null, _parent));
        _push(`</span></button></div><div class="flex-grow overflow-y-auto px-3 whitespace-nowrap"><!--[-->`);
        ssrRenderList(unref(getSidebarMenuSections), (section) => {
          _push(`<div class="mb-2 border-b border-gray-200 last:border-b-0"><div class="flex justify-between items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"><span class="font-semibold text-sm">${ssrInterpolate(section.title)}</span><span class="${ssrRenderClass([{ "rotate-180": isSectionOpen(section.title) }, "transform transition-transform duration-100"])}">▼</span></div>`);
          if (isSectionOpen(section.title)) {
            _push(`<div class="mt-2 mb-3 space-y-1 overflow-hidden"><!--[-->`);
            ssrRenderList(section.links, (link) => {
              _push(ssrRenderComponent(_component_NuxtLink, {
                key: link.text,
                to: link.href,
                class: "block text-sm pl-6 py-2 rounded-md hover:bg-gray-100 transition-colors"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(link.text)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(link.text), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div>`);
      }
      _push(`</aside>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Sidebar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const UserSidebar = Object.assign(_sfc_main$2, { __name: "Sidebar" });
const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_nuxt_link = __nuxt_component_0$1;
  const _component_Icon = __nuxt_component_1;
  _push(`<header${ssrRenderAttrs(mergeProps({ class: "fixed top-0 w-full bg-white text-sm text-gray-700 z-40 px-4 border-b border-gray-200" }, _attrs))}><div class="flex items-center justify-between h-16"><div class="flex items-center">`);
  _push(ssrRenderComponent(_component_nuxt_link, {
    to: "/",
    class: "text-lg font-bold flex items-center"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_Icon, {
          name: "images:logo",
          size: "3em"
        }, null, _parent2, _scopeId));
        _push2(`<span class="ml-2"${_scopeId}>Kamata-Cloud-Infrastructure</span>`);
      } else {
        return [
          createVNode(_component_Icon, {
            name: "images:logo",
            size: "3em"
          }),
          createVNode("span", { class: "ml-2" }, "Kamata-Cloud-Infrastructure")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><nav><ul class="flex space-x-4"><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, {
    to: "/logout",
    class: "hover:underline"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Logout `);
      } else {
        return [
          createTextVNode(" Logout ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li>`);
  _push(ssrRenderComponent(_component_nuxt_link, {
    to: "/settings",
    class: "hover:underline"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Settings `);
      } else {
        return [
          createTextVNode(" Settings ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li></ul></nav></div></header>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DefaultHeader.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const DefaultHeader = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]), { __name: "DefaultHeader" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { fetchUser } = useUserPermission();
    const { isSidebarOpen: isSidebarOpen2 } = useSidebar();
    [__temp, __restore] = withAsyncContext(() => fetchUser()), await __temp, __restore();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-[calc(100vh-theme(spacing.16))] pt-8" }, _attrs))}>`);
      _push(ssrRenderComponent(DefaultHeader, null, null, _parent));
      _push(`<div>`);
      _push(ssrRenderComponent(UserSidebar, null, null, _parent));
      _push(`<main class="${ssrRenderClass([unref(isSidebarOpen2) ? "ml-56" : "ml-8", "p-8 transition-all duration-300"])}">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-BJTkZejS.mjs.map
