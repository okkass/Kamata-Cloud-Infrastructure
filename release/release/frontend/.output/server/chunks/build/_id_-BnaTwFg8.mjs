import { defineComponent, withAsyncContext, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { a as MACHINE } from './fetch-kOzZWayB.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { R as ResourceDetailShell } from './ResourceDetailShell-BS8fimHs.mjs';
import { M as MoVirtualMachineEdit } from './MoVirtualMachineEdit-FYCnnHIz.mjs';
import { C as ConfirmationModal } from './ConfirmationModal-DY_3GDmV.mjs';
import { u as useResourceDetail } from './useResourceDetail-BPCZWJMv.mjs';
import { u as useToast } from './server.mjs';
import { u as useApiClient } from './useResourceClient-CRkQUuKV.mjs';
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
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import './index-CICjSpIO.mjs';
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
import './useResourceUpdater-D_YM1lnm.mjs';
import './Input-jfnKbGQs.mjs';
import './StorageConfigTable-BkExsU01.mjs';
import './Select-Cb_WFau-.mjs';
import './useResourceList-BY3jHLdB.mjs';

const vmTabs = [
  {
    label: "基本情報",
    value: "basic",
    loader: () => import('./VmTabBasic-CLSeQvDS.mjs')
  },
  {
    label: "構成",
    value: "spec",
    loader: () => import('./VmTabSpec-C7hJ79Lf.mjs')
  },
  {
    label: "セキュリティグループ",
    value: "security",
    loader: () => import('./VmTabSecurity-D87nO2Ma.mjs')
  },
  {
    label: "ネットワークインターフェース",
    value: "nic",
    loader: () => import('./VmTabNic-Coi7stc1.mjs')
  }
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { addToast } = useToast();
    const apiClient = useApiClient();
    const route = useRoute();
    const router = useRouter();
    const {
      data: vm,
      pending,
      error,
      refresh
    } = ([__temp, __restore] = withAsyncContext(() => useResourceDetail(
      MACHINE.name,
      route.params.id
    )), __temp = await __temp, __restore(), __temp);
    createPolling(async () => {
      try {
        await refresh();
      } catch (err) {
        console.error("Failed to refresh VM in polling", err);
      }
    });
    const goBack = () => {
      router.back();
    };
    const actions = ref([
      { label: "起動", value: "start" },
      { label: "停止", value: "stop" },
      { label: "シャットダウン", value: "shutdown" },
      { label: "再起動", value: "reboot" },
      { label: "リセット", value: "reset" },
      { label: "編集", value: "edit" }
    ]);
    const actionEndpointMap = {
      start: "start",
      stop: "stop",
      shutdown: "shutdown",
      reboot: "reboot",
      reset: "reset"
    };
    const actionSuccessMessage = {
      start: "VMを起動しました",
      stop: "VMを停止しました",
      shutdown: "VMをシャットダウンしました",
      reboot: "VMを再起動しました",
      reset: "VMをリセットしました"
    };
    const isEditOpen = ref(false);
    const openEditModal = () => {
      if (!vm.value) return;
      isEditOpen.value = true;
    };
    const handleEditClose = () => {
      isEditOpen.value = false;
    };
    const handleEditSuccess = async () => {
      isEditOpen.value = false;
      try {
        await refresh();
      } catch (e) {
        console.error("VM再取得に失敗しました", e);
        addToast({ message: "再取得に失敗しました", type: "error" });
      }
    };
    const confirmDialog = ref({
      show: false,
      title: "",
      message: "",
      confirmText: "",
      actionValue: ""
    });
    const confirmationConfig = {
      stop: {
        title: "停止の確認",
        message: "仮想マシンを強制停止します。\n保存されていないデータは失われる可能性があります。\n本当に停止しますか？",
        confirmText: "停止する"
      },
      shutdown: {
        title: "シャットダウンの確認",
        message: "仮想マシンをシャットダウンします。\n実行中のプロセスが正常に終了するまで時間がかかる場合があります。\n本当にシャットダウンしますか？",
        confirmText: "シャットダウンする"
      },
      reset: {
        title: "リセットの確認",
        message: "仮想マシンを強制的にリセットします。\n保存されていないデータは失われる可能性があります。\n本当にリセットしますか？",
        confirmText: "リセットする"
      }
    };
    const closeConfirmDialog = () => {
      confirmDialog.value.show = false;
      confirmDialog.value.actionValue = "";
    };
    const executeConfirmedAction = async () => {
      const actionValue = confirmDialog.value.actionValue;
      closeConfirmDialog();
      if (!actionValue) return;
      await executeAction(actionValue);
    };
    const handleAction = async (action) => {
      if (!vm.value) return;
      if (action.value === "edit") {
        openEditModal();
        return;
      }
      if (confirmationConfig[action.value]) {
        const config = confirmationConfig[action.value];
        confirmDialog.value = {
          show: true,
          title: config.title,
          message: config.message,
          confirmText: config.confirmText,
          actionValue: action.value
        };
        return;
      }
      await executeAction(action.value);
    };
    const executeAction = async (actionValue) => {
      if (!vm.value) return;
      const endpoint = actionEndpointMap[actionValue];
      if (!endpoint) {
        addToast({
          message: `未対応のアクションです`,
          type: "error"
        });
        return;
      }
      try {
        const res = await apiClient.post(
          `${MACHINE.name}/${vm.value.id}/${endpoint}`,
          { action: actionValue }
        );
        if (res.data?.status) {
          vm.value = { ...vm.value, status: res.data.status };
        }
        addToast({
          message: actionSuccessMessage[actionValue] ?? res.message,
          type: "success"
        });
      } catch (e) {
        console.error("操作失敗:", actionValue, e);
        addToast({
          message: `操作に失敗しました`,
          type: "error"
        });
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-6xl px-4 py-6" }, _attrs))}>`);
      if (!unref(vm) && unref(pending)) {
        _push(`<div class="text-sm text-neutral-500"> 読み込み中… </div>`);
      } else if (!unref(vm) && unref(error)) {
        _push(`<div class="text-sm text-red-500"> エラーが発生しました：${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(ResourceDetailShell, {
          title: "仮想マシン詳細",
          subtitle: "VM Information",
          tabs: unref(vmTabs),
          context: unref(vm),
          actions: actions.value,
          onBack: goBack,
          onAction: handleAction
        }, null, _parent));
      }
      if (unref(vm)) {
        _push(ssrRenderComponent(MoVirtualMachineEdit, {
          show: isEditOpen.value,
          "vm-data": unref(vm),
          onClose: handleEditClose,
          onSuccess: handleEditSuccess
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(ConfirmationModal, {
        show: confirmDialog.value.show,
        title: confirmDialog.value.title,
        message: confirmDialog.value.message,
        "confirm-text": confirmDialog.value.confirmText,
        onConfirm: executeConfirmedAction,
        onCancel: closeConfirmDialog
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/machine/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BnaTwFg8.mjs.map
