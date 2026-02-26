import { defineComponent, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
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
  __name: "test-user-permission",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      user,
      isAdmin,
      isImageAdmin,
      isInstanceTypeAdmin,
      isNetworkAdmin,
      isNodeAdmin,
      isSecurityGroupAdmin,
      isVirtualMachineAdmin,
      fetchUser
    } = useUserPermission();
    fetchUser();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 class="text-2xl font-bold mb-4">Test User Permission Page</h1><p>ユーザーパーミッションのテストページです。</p><div><p>ユーザーID: ${ssrInterpolate(unref(user)?.id)}</p><p>管理者ですか？ ${ssrInterpolate(unref(isAdmin))}</p><p>イメージ管理者ですか？ ${ssrInterpolate(unref(isImageAdmin))}</p><p>インスタンスタイプ管理者ですか？ ${ssrInterpolate(unref(isInstanceTypeAdmin))}</p><p>ネットワーク管理者ですか？ ${ssrInterpolate(unref(isNetworkAdmin))}</p><p>ノード管理者ですか？ ${ssrInterpolate(unref(isNodeAdmin))}</p><p>セキュリティグループ管理者ですか？ ${ssrInterpolate(unref(isSecurityGroupAdmin))}</p><p>仮想マシン管理者ですか？ ${ssrInterpolate(unref(isVirtualMachineAdmin))}</p></div><p> 表示を切り替えるには、mock/server/api/users/me.get.tsを参照してください。 </p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test-user-permission.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=test-user-permission-CUBfgvQp.mjs.map
