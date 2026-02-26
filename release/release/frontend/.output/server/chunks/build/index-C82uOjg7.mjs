import { defineComponent, computed, unref, withCtx, createBlock, createCommentVNode, openBlock, createVNode, withModifiers, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { S as SNAPSHOT } from './fetch-kOzZWayB.mjs';
import { M as MoSnapshotCreate } from './MoSnapshotCreate-QWJCLv10.mjs';
import { M as MoSnapshotRestore } from './MoSnapshotRestore-DTRZeopY.mjs';
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
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceCreate-C_T3ufwz.mjs';
import './useModalAction-CCl6IdMe.mjs';
import 'zod';
import './Input-jfnKbGQs.mjs';
import './Textarea-BGnieQ5E.mjs';
import './Select-Cb_WFau-.mjs';
import './index-CICjSpIO.mjs';
import './composables-BRf5lMQQ.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './SubmitButton-BLZt3uil.mjs';
import './BaseAlert-BSViR_4S.mjs';
import './ConfirmationModal-DY_3GDmV.mjs';

const createSnapshotAction = `create-${SNAPSHOT.name}`;
const restoreSnapshotAction = `restore-${SNAPSHOT.name}`;
const deleteSnapshotAction = `delete-${SNAPSHOT.name}`;
function useSnapshotManagement() {
  const { fetchUser, isAdmin, isVirtualMachineAdmin } = useUserPermission();
  void fetchUser();
  const isManager = computed(
    () => isAdmin.value === true || isVirtualMachineAdmin.value === true
  );
  const queryOptions = computed(() => {
    return isManager.value ? { scope: "all" } : void 0;
  });
  const { data, pending, error, refresh } = useResourceList(
    SNAPSHOT.name,
    queryOptions
  );
  const columns = [
    { key: "name", label: "スナップショット名", align: "left" },
    { key: "ownerName", label: "所有者", align: "left" },
    { key: "vmName", label: "対象仮想マシン", align: "left" },
    { key: "createdAtText", label: "作成日時", align: "left" }
  ];
  const headerButtons = [{ label: "作成", action: "create" }];
  const formatSnapshot = (s) => ({
    id: s.id,
    name: s.name ?? "-",
    vmName: s.targetVirtualMachine?.name ?? "-",
    createdAtText: formatDateTime(s.createdAt),
    description: s.description,
    ownerName: s.owner?.name ?? "-",
    originalData: s
  });
  const displaySnapshots = computed(
    () => (data.value || []).map(formatSnapshot)
  );
  const { startPolling, stopPolling, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    },
    3e3
  );
  return {
    pending,
    error,
    columns,
    headerButtons,
    displaySnapshots,
    isManager,
    refresh,
    startPolling,
    stopPolling,
    lastUpdatedTime,
    CREATE_SNAPSHOT_ACTION: createSnapshotAction,
    RESTORE_SNAPSHOT_ACTION: restoreSnapshotAction,
    DELETE_SNAPSHOT_ACTION: deleteSnapshotAction
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      columns,
      headerButtons,
      displaySnapshots,
      isManager,
      refresh,
      CREATE_SNAPSHOT_ACTION,
      RESTORE_SNAPSHOT_ACTION,
      DELETE_SNAPSHOT_ACTION
    } = useSnapshotManagement();
    const {
      activeModal,
      openModal,
      closeModal,
      targetForDeletion,
      targetForEditing,
      isDeleting,
      handleRowAction,
      handleDelete,
      cancelAction
    } = usePageActions({
      resourceName: SNAPSHOT.name,
      refresh: async () => {
        await refresh();
      }
    });
    const handleHeaderAction = (action) => {
      if (action === "create") {
        openModal(CREATE_SNAPSHOT_ACTION);
      }
    };
    const onRowAction = ({ action, row }) => {
      if (action === "restore") {
        targetForEditing.value = row;
        openModal(RESTORE_SNAPSHOT_ACTION);
        return;
      }
      handleRowAction({ action, row });
    };
    const onCreateSuccess = async () => {
      closeModal();
      await refresh();
    };
    const onRestoreSuccess = async () => {
      closeModal();
      await refresh();
    };
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当にスナップショット「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(__nuxt_component_0, {
        title: unref(isManager) ? "スナップショット（全ユーザーの情報）" : "スナップショット（自分のリソース）",
        columns: unref(columns),
        rows: unref(displaySnapshots),
        rowKey: "id",
        headerButtons: unref(headerButtons),
        onHeaderAction: handleHeaderAction,
        onRowAction
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div${_scopeId}><span${_scopeId}>${ssrInterpolate(row.name)}</span>`);
            if (row.description) {
              _push2(`<span class="text-sm text-gray-500 block mt-0.5"${_scopeId}>${ssrInterpolate(row.description)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", null, [
                createVNode("span", null, toDisplayString(row.name), 1),
                row.description ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-sm text-gray-500 block mt-0.5"
                }, toDisplayString(row.description), 1)) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        "cell-vmName": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.vmName)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.vmName), 1)
            ];
          }
        }),
        "cell-createdAtText": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(row.createdAtText)}</span>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(row.createdAtText), 1)
            ];
          }
        }),
        "row-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(`<div${_scopeId}><button type="button" class="action-item"${_scopeId}> 復元 </button><button type="button" class="action-item action-item-danger"${_scopeId}> 削除 </button></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              row ? (openBlock(), createBlock("div", { key: 0 }, [
                createVNode("button", {
                  type: "button",
                  class: "action-item",
                  onClick: withModifiers(($event) => onRowAction({ action: "restore", row }), ["stop", "prevent"])
                }, " 復元 ", 8, ["onClick"]),
                createVNode("button", {
                  type: "button",
                  class: "action-item action-item-danger",
                  onClick: withModifiers(($event) => onRowAction({ action: "delete", row }), ["stop", "prevent"])
                }, " 削除 ", 8, ["onClick"])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(MoSnapshotCreate, {
        show: unref(activeModal) === unref(CREATE_SNAPSHOT_ACTION),
        onClose: unref(closeModal),
        onSuccess: onCreateSuccess
      }, null, _parent));
      _push(ssrRenderComponent(MoSnapshotRestore, {
        show: unref(activeModal) === unref(RESTORE_SNAPSHOT_ACTION),
        data: unref(targetForEditing)?.originalData,
        onClose: unref(closeModal),
        onSuccess: onRestoreSuccess
      }, null, _parent));
      _push(ssrRenderComponent(__nuxt_component_2, {
        show: unref(activeModal) === unref(DELETE_SNAPSHOT_ACTION),
        message: unref(deleteMessage),
        "is-loading": unref(isDeleting),
        onClose: unref(cancelAction),
        onConfirm: unref(handleDelete)
      }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/snapshot/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C82uOjg7.mjs.map
