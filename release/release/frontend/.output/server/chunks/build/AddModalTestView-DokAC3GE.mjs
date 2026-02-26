import { defineComponent, ref, computed, markRaw, mergeProps, createVNode, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderVNode } from 'vue/server-renderer';
import { M as MoVirtualMachineCreate } from './MoVirtualMachineCreate-EwEz0Xgv.mjs';
import { M as MoAddNodeToCluster } from './MoAddNode-DQSVdGQo.mjs';
import { M as MoImageAdd } from './MoImageAdd-BjI-okVc.mjs';
import { M as MoInstanceTypeAdd } from './MoInstanceTypeAdd-joaO4O4s.mjs';
import { _ as __nuxt_component_3 } from './MoSecurityGroupCreate-DETdv46_.mjs';
import { M as MoUserAdd } from './MoUserAdd-P_a7-gDr.mjs';
import { M as MoVirtualNetworkCreate } from './MoVirtualNetworkCreate-CipS8Q50.mjs';
import { M as MoStorageAdd } from './MoStorageAdd-B2clbFov.mjs';
import { M as MoBackupCreate } from './MoBackupCreate-DmD5Xa4H.mjs';
import { M as MoSnapshotCreate } from './MoSnapshotCreate-QWJCLv10.mjs';
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
import './SubmitButton-BLZt3uil.mjs';
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
import './useResourceList-BY3jHLdB.mjs';
import './fetch-kOzZWayB.mjs';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import 'vee-validate';
import '@vee-validate/zod';
import 'zod';
import './Input-jfnKbGQs.mjs';
import './Select-Cb_WFau-.mjs';
import './index-CICjSpIO.mjs';
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './Section-B8lyqO8a.mjs';
import './StorageConfigTable-BkExsU01.mjs';
import './DropZone-DuFc6jYt.mjs';
import './useModalAction-CCl6IdMe.mjs';
import './useResourceCreate-C_T3ufwz.mjs';
import './BaseAlert-BSViR_4S.mjs';
import './image-SWhs2cAJ.mjs';
import './errorHandler-Bj20B0ou.mjs';
import './instance-type-BB8zzCzi.mjs';
import './RuleTable-DJ0ZiAQN.mjs';
import './Textarea-BGnieQ5E.mjs';
import './user-BB0TVvYL.mjs';
import './virtual-network-9nD05ROF.mjs';
import './useResourceClient-CRkQUuKV.mjs';
import './storage-mOgjHrQq.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AddModalTestView",
  __ssrInlineRender: true,
  setup(__props) {
    const activeModal = ref(null);
    const createAddModals = computed(() => [
      {
        id: "vmCreate",
        buttonText: "VM作成",
        component: markRaw(MoVirtualMachineCreate),
        props: {}
        // Create系モーダルは通常Props不要
      },
      {
        id: "netCreate",
        buttonText: "NW作成",
        component: markRaw(MoVirtualNetworkCreate),
        props: {}
      },
      {
        id: "storageAdd",
        buttonText: "ストレージ追加",
        component: markRaw(MoStorageAdd),
        // props: { nodes: [], availableDisks: [] }, // 必要に応じてAPI連携
        props: {}
        // ダミーデータ削除
      },
      {
        id: "nodeAdd",
        buttonText: "クラスターにノード追加",
        component: markRaw(MoAddNodeToCluster),
        // props: { nodes: [] }, // 必要に応じてAPI連携
        props: {}
        // ダミーデータ削除
      },
      {
        id: "imageAdd",
        buttonText: "イメージ追加",
        component: markRaw(MoImageAdd),
        props: {}
      },
      {
        id: "instanceTypeAdd",
        buttonText: "タイプ追加",
        component: markRaw(MoInstanceTypeAdd),
        props: {}
      },
      {
        id: "sgCreate",
        buttonText: "SG作成",
        component: markRaw(__nuxt_component_3),
        props: {}
      },
      {
        id: "userAdd",
        buttonText: "利用者追加",
        component: markRaw(MoUserAdd),
        props: {}
      },
      {
        id: "backupCreate",
        buttonText: "BU作成",
        component: markRaw(MoBackupCreate),
        props: {}
      },
      {
        id: "snapshotCreate",
        buttonText: "SS作成",
        component: markRaw(MoSnapshotCreate),
        props: {}
      }
      // --- Edit系のモーダル定義は削除 ---
    ]);
    const closeModal = () => {
      activeModal.value = null;
    };
    const handleSuccess = () => {
      closeModal();
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8 space-y-8" }, _attrs))}><div><h1 class="text-2xl font-bold mb-4">作成・追加モーダル テストページ</h1><p class="text-gray-600"> 各ボタンをクリックして、作成 (Create) / 追加 (Add) 系のモーダルの見た目と基本的な動作を確認します。 </p></div><div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"><!--[-->`);
      ssrRenderList(createAddModals.value, (modal) => {
        _push(`<button class="btn btn-primary">${ssrInterpolate(modal.buttonText)}</button>`);
      });
      _push(`<!--]--></div><!--[-->`);
      ssrRenderList(createAddModals.value, (modal) => {
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(modal.component), mergeProps({
          key: modal.id,
          show: activeModal.value === modal.id
        }, { ref_for: true }, modal.props, {
          onClose: closeModal,
          onSuccess: handleSuccess
        }), null), _parent);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/AddModalTestView.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=AddModalTestView-DokAC3GE.mjs.map
