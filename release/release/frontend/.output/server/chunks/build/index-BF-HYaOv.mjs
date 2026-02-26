import { defineComponent, computed, unref, withCtx, createVNode, withModifiers, toDisplayString, createBlock, createCommentVNode, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate } from 'vue/server-renderer';
import { B as BACKUP } from './fetch-kOzZWayB.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { t as toSize } from './server.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { M as MoBackupCreate } from './MoBackupCreate-DmD5Xa4H.mjs';
import { M as MoBackupRestore } from './MoBackupRestore-DxGsGKPY.mjs';
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
import 'vue-router';
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceCreate-C_T3ufwz.mjs';
import './useModalAction-CCl6IdMe.mjs';
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
import './SubmitButton-BLZt3uil.mjs';
import './BaseAlert-BSViR_4S.mjs';
import './ConfirmationModal-DY_3GDmV.mjs';

function resolveSize(r) {
  if (r.size != null && Number.isFinite(r.size)) return Number(r.size);
  const ts = r.targetStorage?.size;
  if (ts != null && Number.isFinite(ts)) return Number(ts);
  return void 0;
}
function useBackupManagement() {
  const { fetchUser, isAdmin } = useUserPermission();
  void fetchUser();
  const isManager = computed(() => isAdmin.value === true);
  const tableTitle = computed(() => {
    return isManager.value ? "バックアップ・復元管理（全ユーザー）" : "バックアップ・復元管理";
  });
  const queryOptions = computed(() => {
    return isManager.value ? { scope: "all" } : void 0;
  });
  const {
    data: rawList,
    pending,
    refresh,
    error
  } = useResourceList(BACKUP.name, queryOptions);
  const { startPolling, stopPolling, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    }
  );
  const columns = [
    { key: "name", label: "バックアップ名", align: "left" },
    { key: "ownerName", label: "所有者", align: "left" },
    { key: "createdAtText", label: "作成日", align: "left" },
    { key: "sizeText", label: "サイズ", align: "right" }
  ];
  const headerButtons = [{ label: "バックアップ作成", action: "add" }];
  const ADD_BACKUP_ACTION = `add-${BACKUP.name}`;
  const DELETE_BACKUP_ACTION = `delete-${BACKUP.name}`;
  const RESTORE_BACKUP_ACTION = `restore-${BACKUP.name}`;
  const rows = computed(
    () => (rawList.value ?? []).map((r) => {
      const size = resolveSize(r);
      return {
        id: String(r.id),
        name: String(r.name ?? r.id),
        description: r.description,
        ownerName: r.owner?.name ?? "-",
        createdAt: r.createdAt,
        createdAtText: formatDateTime(r.createdAt),
        sizeText: size != null && Number.isFinite(size) ? toSize(size) : "—",
        originalData: r
      };
    })
  );
  return {
    columns,
    headerButtons,
    rows,
    pending,
    error,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    ADD_BACKUP_ACTION,
    DELETE_BACKUP_ACTION,
    RESTORE_BACKUP_ACTION,
    tableTitle
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      columns,
      headerButtons,
      rows: backups,
      refresh,
      ADD_BACKUP_ACTION,
      DELETE_BACKUP_ACTION,
      RESTORE_BACKUP_ACTION,
      tableTitle
    } = useBackupManagement();
    const {
      activeModal,
      openModal,
      closeModal,
      targetForDeletion,
      targetForEditing,
      isDeleting,
      handleRowAction,
      handleDelete,
      handleSuccess,
      cancelAction
    } = usePageActions({
      resourceName: BACKUP.name,
      refresh
    });
    function handleHeaderAction(action) {
      if (action === "add") {
        openModal(ADD_BACKUP_ACTION);
      }
    }
    function onRowAction({ action, row }) {
      if (action === "restore") {
        targetForEditing.value = row;
        openModal(RESTORE_BACKUP_ACTION);
        return;
      }
      handleRowAction({ action, row });
    }
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当にバックアップ「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(__nuxt_component_0, {
        title: unref(tableTitle),
        columns: unref(columns),
        rows: unref(backups),
        rowKey: "id",
        headerButtons: unref(headerButtons),
        onHeaderAction: handleHeaderAction,
        onRowAction
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div${_scopeId}><span${_scopeId}>${ssrInterpolate(row.name)}</span>`);
            if (row.description) {
              _push2(`<div class="cell-description text-sm text-gray-500"${_scopeId}>${ssrInterpolate(row.description)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", null, [
                createVNode("span", null, toDisplayString(row.name), 1),
                row.description ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "cell-description text-sm text-gray-500"
                }, toDisplayString(row.description), 1)) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        "cell-ownerName": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(row.ownerName)}</span>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(row.ownerName), 1)
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
        "cell-sizeText": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.sizeText)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.sizeText), 1)
            ];
          }
        }),
        "row-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button type="button" class="action-item action-item-primary"${_scopeId}> 復元 </button><button type="button" class="action-item action-item-danger"${ssrIncludeBooleanAttr(unref(isDeleting) && unref(targetForDeletion)?.id === row?.id) ? " disabled" : ""}${_scopeId}> 削除 </button>`);
          } else {
            return [
              createVNode("button", {
                type: "button",
                class: "action-item action-item-primary",
                onClick: withModifiers(($event) => row && onRowAction({ action: "restore", row }), ["stop", "prevent"])
              }, " 復元 ", 8, ["onClick"]),
              createVNode("button", {
                type: "button",
                class: "action-item action-item-danger",
                disabled: unref(isDeleting) && unref(targetForDeletion)?.id === row?.id,
                onClick: withModifiers(($event) => row && onRowAction({ action: "delete", row }), ["stop", "prevent"])
              }, " 削除 ", 8, ["disabled", "onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(MoBackupCreate, {
        show: unref(activeModal) === unref(ADD_BACKUP_ACTION),
        onClose: unref(closeModal),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(__nuxt_component_2, {
        show: unref(activeModal) === unref(DELETE_BACKUP_ACTION),
        message: unref(deleteMessage),
        "is-loading": unref(isDeleting),
        onClose: unref(cancelAction),
        onConfirm: unref(handleDelete)
      }, null, _parent));
      _push(ssrRenderComponent(MoBackupRestore, {
        show: unref(activeModal) === unref(RESTORE_BACKUP_ACTION),
        data: unref(targetForEditing)?.originalData ?? unref(targetForEditing) ?? void 0,
        onClose: unref(closeModal),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/backup/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BF-HYaOv.mjs.map
