import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createBlock, createCommentVNode, createVNode, openBlock, withModifiers, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { d as STORAGE } from './fetch-kOzZWayB.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { t as toSize } from './server.mjs';
import { f as formatAsPercent } from './status-BiUv1ciD.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { M as MoStorageAdd } from './MoStorageAdd-B2clbFov.mjs';
import { M as MoStorageEdit } from './MoStorageEdit-DpWdngYi.mjs';
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
import './useResourceClient-CRkQUuKV.mjs';
import './useModalAction-CCl6IdMe.mjs';
import './storage-mOgjHrQq.mjs';
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
import './useResourceUpdater-D_YM1lnm.mjs';

const RESOURCE_NAME = STORAGE.name;
const ADD_STORAGE_ACTION = `add-${RESOURCE_NAME}`;
const EDIT_STORAGE_ACTION = `edit-${RESOURCE_NAME}`;
const DELETE_STORAGE_ACTION = `delete-${RESOURCE_NAME}`;
const extractNodeName = (nodeData) => {
  if (!nodeData) return "-";
  if (typeof nodeData === "object" && "name" in nodeData) {
    return nodeData.name || nodeData.id || "-";
  }
  return String(nodeData);
};
function useStorageManagement() {
  const {
    data: rawList,
    pending,
    refresh,
    error
  } = useResourceList(RESOURCE_NAME);
  const { startPolling, stopPolling, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    }
  );
  const columns = [
    { key: "name", label: "ストレージプール名", align: "left" },
    { key: "type", label: "要素", align: "left" },
    { key: "node", label: "ノード名", align: "left" },
    { key: "size", label: "サイズ", align: "right" },
    { key: "used", label: "使用済みデータ量", align: "right" },
    { key: "usage", label: "使用率", align: "right" }
  ];
  const headerButtons = [{ action: "add", label: "＋ストレージ追加" }];
  const rows = computed(
    () => (rawList.value ?? []).map((r) => {
      const totalBytes = r.totalSize ?? 0;
      const usedBytes = r.usedSize ?? 0;
      const ratio = totalBytes ? usedBytes / totalBytes : 0;
      return {
        id: String(r.id ?? `p${Date.now()}`),
        name: r.name ?? "unknown",
        type: r.hasNetworkAccess ? "ネットワーク共有" : "ローカルのみ",
        node: extractNodeName(r.node),
        size: toSize(totalBytes),
        used: toSize(usedBytes),
        usage: formatAsPercent(ratio),
        originalData: r
      };
    })
  );
  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    ADD_STORAGE_ACTION,
    EDIT_STORAGE_ACTION,
    DELETE_STORAGE_ACTION
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      columns,
      headerButtons,
      rows,
      refresh,
      ADD_STORAGE_ACTION: ADD_STORAGE_ACTION2,
      EDIT_STORAGE_ACTION: EDIT_STORAGE_ACTION2,
      DELETE_STORAGE_ACTION: DELETE_STORAGE_ACTION2
    } = useStorageManagement();
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
      resourceName: STORAGE.name,
      refresh
    });
    function handleHeaderAction(action) {
      if (action === "add") {
        openModal(ADD_STORAGE_ACTION2);
      }
    }
    function onRowAction({ action, row }) {
      handleRowAction({ action, row });
    }
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当にストレージプール「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(__nuxt_component_0, {
        title: "ストレージプール管理",
        columns: unref(columns),
        rows: unref(rows),
        rowKey: "id",
        headerButtons: unref(headerButtons),
        onHeaderAction: handleHeaderAction,
        onRowAction
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/storage-pool/${row.id}`,
              class: "table-link"
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(row.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(row.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/storage-pool/${row.id}`,
                class: "table-link"
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(row.name), 1)
                ]),
                _: 2
              }, 1032, ["to"])
            ];
          }
        }),
        "cell-type": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(row.type)}</span>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(row.type), 1)
            ];
          }
        }),
        "cell-node": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(row.node)}</span>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(row.node), 1)
            ];
          }
        }),
        "cell-size": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.size)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.size), 1)
            ];
          }
        }),
        "cell-used": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.used)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.used), 1)
            ];
          }
        }),
        "cell-usage": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(row.usage)}</span>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(row.usage), 1)
            ];
          }
        }),
        "row-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/storage-pool/${row.id}`,
                class: "action-item"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` 詳細 `);
                  } else {
                    return [
                      createTextVNode(" 詳細 ")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button type="button" class="action-item"${_scopeId}> 編集 </button><button type="button" class="action-item action-item-danger"${_scopeId}> 削除 </button>`);
          } else {
            return [
              row ? (openBlock(), createBlock(_component_NuxtLink, {
                key: 0,
                to: `/storage-pool/${row.id}`,
                class: "action-item"
              }, {
                default: withCtx(() => [
                  createTextVNode(" 詳細 ")
                ]),
                _: 1
              }, 8, ["to"])) : createCommentVNode("", true),
              createVNode("button", {
                type: "button",
                class: "action-item",
                onClick: withModifiers(($event) => row && onRowAction({ action: "edit", row }), ["stop", "prevent"])
              }, " 編集 ", 8, ["onClick"]),
              createVNode("button", {
                type: "button",
                class: "action-item action-item-danger",
                onClick: withModifiers(($event) => row && onRowAction({ action: "delete", row }), ["stop", "prevent"])
              }, " 削除 ", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(MoStorageAdd, {
        show: unref(activeModal) === unref(ADD_STORAGE_ACTION2),
        onClose: unref(closeModal),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(MoStorageEdit, {
        show: unref(activeModal) === unref(EDIT_STORAGE_ACTION2),
        data: unref(targetForEditing)?.originalData,
        onClose: unref(closeModal),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(__nuxt_component_2, {
        show: unref(activeModal) === unref(DELETE_STORAGE_ACTION2),
        message: unref(deleteMessage),
        "is-loading": unref(isDeleting),
        onClose: unref(cancelAction),
        onConfirm: unref(handleDelete)
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/storage-pool/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CI76N9fn.mjs.map
