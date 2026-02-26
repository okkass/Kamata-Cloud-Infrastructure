import { defineComponent, ref, computed, markRaw, mergeProps, unref, createVNode, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderVNode } from 'vue/server-renderer';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { M as MoVirtualMachineEdit } from './MoVirtualMachineEdit-FYCnnHIz.mjs';
import { M as MoInstanceTypeEdit } from './MoInstanceTypeEdit-B3h2N012.mjs';
import { M as MoImageEdit } from './MoImageEdit-WbfvqdTK.mjs';
import { M as MoUserEdit } from './MoUserEdit-CgkziSP5.mjs';
import { _ as __nuxt_component_4 } from './MoSecurityGroupEdit-DSXzzQ8a.mjs';
import { M as MoBackupRestore } from './MoBackupRestore-DxGsGKPY.mjs';
import { M as MoSnapshotRestore } from './MoSnapshotRestore-DTRZeopY.mjs';
import { M as MoStorageEdit } from './MoStorageEdit-DpWdngYi.mjs';
import { M as MoVirtualNetworkEdit } from './MoVirtualNetworkEdit-CbOw2k03.mjs';
import './fetch-kOzZWayB.mjs';
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
import './server.mjs';
import 'vue-router';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
import './useResourceUpdater-D_YM1lnm.mjs';
import './useResourceClient-CRkQUuKV.mjs';
import './Input-jfnKbGQs.mjs';
import './StorageConfigTable-BkExsU01.mjs';
import './Select-Cb_WFau-.mjs';
import './index-CICjSpIO.mjs';
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './SubmitButton-BLZt3uil.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './instance-type-BB8zzCzi.mjs';
import 'zod';
import './useModalAction-CCl6IdMe.mjs';
import './useResourceEdit-BDkGI_Ar.mjs';
import './image-SWhs2cAJ.mjs';
import './Textarea-BGnieQ5E.mjs';
import './user-BB0TVvYL.mjs';
import './Section-B8lyqO8a.mjs';
import './RuleTable-DJ0ZiAQN.mjs';
import './BaseAlert-BSViR_4S.mjs';
import './date-D5dH0cF_.mjs';
import './useResourceCreate-C_T3ufwz.mjs';
import './ConfirmationModal-DY_3GDmV.mjs';
import './storage-mOgjHrQq.mjs';
import './virtual-network-9nD05ROF.mjs';

function useBackupValidator() {
  const isRestorable = (backup) => {
    if (!backup) return false;
    return !!backup.targetVirtualMachine && !!backup.targetStorage;
  };
  return {
    isRestorable
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "EditModalTestView",
  __ssrInlineRender: true,
  setup(__props) {
    const { isRestorable } = useBackupValidator();
    const activeModal = ref(null);
    const targetResource = ref(null);
    const {
      data: virtualMachines,
      pending: vmPending,
      error: vmError,
      refresh: refreshVms
    } = useResourceList("virtual-machines");
    const {
      data: instanceTypes,
      pending: itPending,
      error: itError,
      refresh: refreshInstanceTypes
    } = useResourceList("instance-types");
    const {
      data: images,
      pending: imPending,
      error: imError,
      refresh: refreshImages
    } = useResourceList("images");
    const {
      data: users,
      pending: usersPending,
      error: usersError,
      refresh: refreshUsers
    } = useResourceList("users");
    const {
      data: securityGroups,
      pending: sgPending,
      error: sgError,
      refresh: refreshSecurityGroups
    } = useResourceList("security-groups");
    const {
      data: storagePools,
      pending: spPending,
      error: spError,
      refresh: refreshStoragePools
    } = useResourceList("storage-pools");
    const {
      data: backups,
      pending: bkPending,
      error: bkError,
      refresh: refreshBackups
    } = useResourceList("backups");
    const {
      data: snapshots,
      pending: ssPending,
      error: ssError,
      refresh: refreshSnapshots
    } = useResourceList("snapshots");
    const {
      data: networks,
      pending: netPending,
      error: netError,
      refresh: refreshNetworks
    } = useResourceList("virtual-networks");
    const editModals = computed(() => [
      {
        id: "vmEdit",
        component: markRaw(MoVirtualMachineEdit),
        props: { vmData: targetResource.value },
        refreshFn: refreshVms
      },
      {
        id: "backupRestore",
        component: markRaw(MoBackupRestore),
        props: { data: targetResource.value },
        refreshFn: refreshVms
      },
      {
        id: "backupRestore",
        component: markRaw(MoBackupRestore),
        props: { data: targetResource.value },
        refreshFn: refreshBackups
      },
      {
        id: "snapshotRestore",
        component: markRaw(MoSnapshotRestore),
        props: { data: targetResource.value },
        refreshFn: refreshSnapshots
      },
      {
        id: "instanceTypeEdit",
        component: markRaw(MoInstanceTypeEdit),
        props: { data: targetResource.value },
        refreshFn: refreshInstanceTypes
      },
      {
        id: "imageEdit",
        component: markRaw(MoImageEdit),
        props: { data: targetResource.value },
        refreshFn: refreshImages
      },
      {
        id: "userEdit",
        component: markRaw(MoUserEdit),
        props: { data: targetResource.value },
        refreshFn: refreshUsers
      },
      {
        id: "securityGroupEdit",
        component: markRaw(__nuxt_component_4),
        props: { data: targetResource.value },
        refreshFn: refreshSecurityGroups
      },
      {
        id: "storageEdit",
        component: markRaw(MoStorageEdit),
        props: { data: targetResource.value },
        refreshFn: refreshStoragePools
      },
      {
        id: "networkEdit",
        component: markRaw(MoVirtualNetworkEdit),
        props: { data: targetResource.value },
        refreshFn: refreshNetworks
      }
    ]);
    const closeModal = () => {
      activeModal.value = null;
      targetResource.value = null;
    };
    const handleSuccess = () => {
      const closedModal = editModals.value.find((m) => m.id === activeModal.value);
      if (closedModal?.refreshFn) {
        closedModal.refreshFn();
      }
      closeModal();
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8 space-y-8" }, _attrs))}><div><h1 class="text-2xl font-bold mb-4">編集モーダル テストページ</h1><p class="text-gray-600"> 一覧から項目を選択し「編集」ボタンをクリックして、編集 (Edit) 系のモーダルの動作を確認します。 </p></div><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">仮想マシン一覧 (API連携)</h2>`);
      if (unref(vmPending)) {
        _push(`<div class="mt-2 text-gray-500"> 仮想マシン一覧を読み込み中... </div>`);
      } else if (unref(vmError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(vmError).message)}</div>`);
      } else if (unref(virtualMachines) && unref(virtualMachines).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">ステータス</th><th class="px-6 py-3">ノード</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(virtualMachines), (vm) => {
          _push(`<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${ssrInterpolate(vm.name)}</td><td class="px-6 py-4">${ssrInterpolate(vm.status)}</td><td class="px-6 py-4">${ssrInterpolate(vm.node?.name || "-")}</td><td class="px-6 py-4 text-center"><button class="btn-secondary text-xs px-3 py-1" title="仮想マシン編集"> 編集 </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<div class="mt-2 text-gray-500"> 表示できる仮想マシンがありません。 </div>`);
      }
      _push(`</div><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">イメージ一覧 (API連携)</h2>`);
      if (unref(imPending)) {
        _push(`<div class="mt-2 text-gray-500">一覧を読み込み中...</div>`);
      } else if (unref(imError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(imError).message)}</div>`);
      } else if (unref(images) && unref(images).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">説明</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(images), (img) => {
          _push(`<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${ssrInterpolate(img.name)}</td><td class="px-6 py-4">${ssrInterpolate(img.description)}</td><td class="px-6 py-4 text-center"><button class="btn-secondary"> 編集 </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">利用者一覧 (API連携)</h2>`);
      if (unref(usersPending)) {
        _push(`<div class="mt-2 text-gray-500"> 一覧を読み込み中... </div>`);
      } else if (unref(usersError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(usersError).message)}</div>`);
      } else if (unref(users) && unref(users).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">メールアドレス</th><th class="px-6 py-3">権限</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(users), (user) => {
          _push(`<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${ssrInterpolate(user.name)}</td><td class="px-6 py-4">${ssrInterpolate(user.email)}</td><td class="px-6 py-4">`);
          if (user.isAdmin) {
            _push(`<span class="text-blue-600 font-bold">全体管理者</span>`);
          } else {
            _push(`<span class="text-gray-500">一般</span>`);
          }
          _push(`</td><td class="px-6 py-4 text-center"><button class="btn-secondary"> 編集 </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">セキュリティグループ一覧 (API連携)</h2>`);
      if (unref(sgPending)) {
        _push(`<div class="mt-2 text-gray-500">一覧を読み込み中...</div>`);
      } else if (unref(sgError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(sgError).message)}</div>`);
      } else if (unref(securityGroups) && unref(securityGroups).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">説明</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(securityGroups), (sg) => {
          _push(`<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${ssrInterpolate(sg.name)}</td><td class="px-6 py-4 text-gray-600">${ssrInterpolate(sg.description || "-")}</td><td class="px-6 py-4 text-center"><button class="btn-secondary"> 編集 </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<div class="mt-2 text-gray-500"> 表示できるセキュリティグループがありません。 </div>`);
      }
      _push(`</div><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">ストレージプール一覧 (API連携)</h2>`);
      if (unref(spPending)) {
        _push(`<div class="mt-2 text-gray-500">一覧を読み込み中...</div>`);
      } else if (unref(spError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(spError).message)}</div>`);
      } else if (unref(storagePools) && unref(storagePools).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">ノード</th><th class="px-6 py-3">NWアクセス</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(storagePools), (sp) => {
          _push(`<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${ssrInterpolate(sp.name)}</td><td class="px-6 py-4">${ssrInterpolate(sp.node?.name || sp.node)}</td><td class="px-6 py-4">`);
          if (sp.hasNetworkAccess) {
            _push(`<span class="text-green-600 font-bold">許可</span>`);
          } else {
            _push(`<span class="text-gray-500">拒否</span>`);
          }
          _push(`</td><td class="px-6 py-4 text-center"><button class="btn-secondary"> 編集 </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="p-8 space-y-8"><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">スナップショット一覧 (API連携)</h2>`);
      if (unref(ssPending)) {
        _push(`<div class="mt-2 text-gray-500"> スナップショット一覧を読み込み中... </div>`);
      } else if (unref(ssError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(ssError).message)}</div>`);
      } else if (unref(snapshots) && unref(snapshots).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">説明</th><th class="px-6 py-3">作成日時</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(snapshots), (ss) => {
          _push(`<tr class="bg-white border-b hover:bg-gray-50"><td class="px-6 py-4 font-medium">${ssrInterpolate(ss.name)}</td><td class="px-6 py-4 text-gray-600">${ssrInterpolate(ss.description || "-")}</td><td class="px-6 py-4 text-gray-600">${ssrInterpolate(new Date(ss.createdAt).toLocaleString())}</td><td class="px-6 py-4 text-center"><button class="btn-secondary"> リストア </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<div class="mt-2 text-gray-500"> 表示できるスナップショットがありません。 </div>`);
      }
      _push(`</div><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">バックアップ一覧 (API連携)</h2>`);
      if (unref(bkPending)) {
        _push(`<div class="mt-2 text-gray-500"> バックアップ一覧を読み込み中... </div>`);
      } else if (unref(bkError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(bkError).message)}</div>`);
      } else if (unref(backups) && unref(backups).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">サイズ</th><th class="px-6 py-3">作成日時</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(backups), (bk) => {
          _push(`<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${ssrInterpolate(bk.name)} `);
          if (!unref(isRestorable)(bk)) {
            _push(`<span class="ml-2 text-xs text-red-500 bg-red-50 px-1 rounded"> 復元不可 </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-6 py-4">${ssrInterpolate(bk.size ? (bk.size / (1024 * 1024 * 1024)).toFixed(2) + " GB" : "-")}</td><td class="px-6 py-4">${ssrInterpolate(new Date(bk.createdAt).toLocaleString())}</td><td class="px-6 py-4 text-center"><button${ssrIncludeBooleanAttr(!unref(isRestorable)(bk)) ? " disabled" : ""} class="${ssrRenderClass([
            unref(isRestorable)(bk) ? "btn-secondary bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
            "text-xs px-3 py-1 rounded border transition-colors"
          ])}"${ssrRenderAttr(
            "title",
            unref(isRestorable)(bk) ? "" : "復元先のVMまたはストレージ情報が不足しています"
          )}> 復元 </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<div class="mt-2 text-gray-500"> 表示できるバックアップがありません。 </div>`);
      }
      _push(`</div><!--[-->`);
      ssrRenderList(editModals.value, (modal) => {
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(modal.component), mergeProps({
          key: modal.id,
          show: activeModal.value === modal.id
        }, { ref_for: true }, modal.props, {
          onClose: closeModal,
          onSuccess: handleSuccess
        }), null), _parent);
      });
      _push(`<!--]--></div><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">インスタンスタイプ一覧 (API連携)</h2>`);
      if (unref(itPending)) {
        _push(`<div class="mt-2 text-gray-500">一覧を読み込み中...</div>`);
      } else if (unref(itError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(itError).message)}</div>`);
      } else if (unref(instanceTypes) && unref(instanceTypes).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">vCPU</th><th class="px-6 py-3">メモリ</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(instanceTypes), (it) => {
          _push(`<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${ssrInterpolate(it.name)}</td><td class="px-6 py-4 text-center"><button class="btn-secondary"> 編集 </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<div class="mt-2 text-gray-500"> 表示できるインスタンスタイプがありません。 </div>`);
      }
      _push(`</div><div class="mt-8 pt-4 border-t"><h2 class="font-semibold text-lg">仮想ネットワーク一覧 (API連携)</h2>`);
      if (unref(netPending)) {
        _push(`<div class="mt-2 text-gray-500"> 一覧を読み込み中... </div>`);
      } else if (unref(netError)) {
        _push(`<div class="mt-2 text-red-600"> 一覧の取得に失敗しました: ${ssrInterpolate(unref(netError).message)}</div>`);
      } else if (unref(networks) && unref(networks).length > 0) {
        _push(`<table class="w-full mt-2 text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">名前</th><th class="px-6 py-3">CIDR</th><th class="px-6 py-3 text-center">操作</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(networks), (net) => {
          _push(`<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${ssrInterpolate(net.name)}</td><td class="px-6 py-4">${ssrInterpolate(net.cidr)}</td><td class="px-6 py-4 text-center"><button class="btn-secondary"> 編集 </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<div class="mt-2 text-gray-500"> 表示できる仮想ネットワークがありません。 </div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/EditModalTestView.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=EditModalTestView-BTE7bMHY.mjs.map
