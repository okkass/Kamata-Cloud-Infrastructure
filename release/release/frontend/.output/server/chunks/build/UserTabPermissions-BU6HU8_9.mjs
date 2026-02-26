import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { c as convertByteToUnit } from './server.mjs';
import { D as DISABLE_ROUNDING } from './fetch-kOzZWayB.mjs';
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
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "UserTabPermissions",
  __ssrInlineRender: true,
  props: {
    context: {}
  },
  setup(__props) {
    const props = __props;
    const user = computed(() => props.context);
    const adminFlags = computed(() => [
      {
        key: "admin",
        label: "全体管理者",
        enabled: user.value.isAdmin
      },
      {
        key: "image",
        label: "イメージ管理",
        enabled: user.value.isImageAdmin
      },
      {
        key: "instanceType",
        label: "インスタンスタイプ管理",
        enabled: user.value.isInstanceTypeAdmin
      },
      {
        key: "node",
        label: "物理ノード管理",
        enabled: user.value.isNodeAdmin
      },
      {
        key: "network",
        label: "ネットワーク管理",
        enabled: user.value.isNetworkAdmin
      },
      {
        key: "virtualMachine",
        label: "仮想マシン管理",
        enabled: user.value.isVirtualMachineAdmin
      },
      {
        key: "securityGroup",
        label: "セキュリティグループ管理",
        enabled: user.value.isSecurityGroupAdmin
      }
    ]);
    const hasAnyAdmin = computed(
      () => adminFlags.value.some((flag) => flag.enabled)
    );
    const maxCpuText = computed(
      () => user.value.maxCpuCore == null ? "制限なし" : `${user.value.maxCpuCore} コア`
    );
    const maxMemoryText = computed(() => {
      const size = user.value.maxMemorySize;
      if (size == null) return "制限なし";
      const gb = convertByteToUnit(size, "GB", !DISABLE_ROUNDING);
      return `${gb} GB`;
    });
    const maxStorageText = computed(() => {
      const size = user.value.maxStorageSize;
      if (size == null) return "制限なし";
      const gb = convertByteToUnit(size, "GB", !DISABLE_ROUNDING);
      return `${gb} GB`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><h2 class="detail-heading-sm">権限・リソース上限</h2><div class="detail-card space-y-6"><div><div class="detail-label">管理者権限</div>`);
      if (hasAnyAdmin.value) {
        _push(`<div class="mt-2 flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(adminFlags.value, (item) => {
          _push(`<span class="${ssrRenderClass([item.enabled ? "detail-pill-yes" : "detail-pill-no", "detail-pill"])}">${ssrInterpolate(item.label)}</span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="mt-2 text-sm text-neutral-500"> 管理者権限は付与されていません。 </p>`);
      }
      _push(`</div><div class="detail-card-section"><div class="detail-label">リソース上限</div><div class="mt-2 detail-grid-2col"><div><div class="detail-label">最大 vCPU (コア)</div><div class="detail-value">${ssrInterpolate(maxCpuText.value)}</div></div><div><div class="detail-label">最大メモリ</div><div class="detail-value">${ssrInterpolate(maxMemoryText.value)}</div></div><div><div class="detail-label">最大ストレージ</div><div class="detail-value">${ssrInterpolate(maxStorageText.value)}</div></div></div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/detail/panels/User/UserTabPermissions.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const UserTabPermissions = Object.assign(_sfc_main, { __name: "DetailPanelsUserTabPermissions" });

export { UserTabPermissions as default };
//# sourceMappingURL=UserTabPermissions-BU6HU8_9.mjs.map
