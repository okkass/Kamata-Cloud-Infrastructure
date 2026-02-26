import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { M as MoAddNodeToCluster } from './MoAddNode-DQSVdGQo.mjs';
import { g as getNodeStatusDisplay, f as formatAsPercent } from './status-BiUv1ciD.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createBlock, createCommentVNode, openBlock, createVNode, withModifiers, toDisplayString, ref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './server.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { N as NODE } from './fetch-kOzZWayB.mjs';
import { u as useResourceUpdate } from './useResourceEdit-BDkGI_Ar.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import './BaseModal-XreF1fHA.mjs';
import './cross-BwfcbiN4.mjs';
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
import './BaseAlert-BSViR_4S.mjs';
import './SubmitButton-BLZt3uil.mjs';
import './useResourceCreate-C_T3ufwz.mjs';
import 'vee-validate';
import './Input-jfnKbGQs.mjs';
import 'vue-router';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';

const addNodeAction = `add-${NODE.name}`;
const deleteNodeAction = `delete-${NODE.name}`;
function useNodeManagement() {
  const { addToast } = useToast();
  const { data: rawNodes, refresh: refreshNodeList } = useResourceList(NODE.name);
  const { executeUpdate: updateNode } = useResourceUpdate(NODE.name);
  const columns = ref([
    { key: "name", label: "ノード名", align: "left" },
    { key: "ip", label: "IPアドレス", align: "left" },
    { key: "status", label: "状態", align: "center" },
    { key: "cpu", label: "CPU", align: "right" },
    { key: "mem", label: "メモリ", align: "right" },
    { key: "storage", label: "ストレージ", align: "right" },
    { key: "createdAt", label: "作成日時", align: "left" }
  ]);
  const headerButtons = ref([{ label: "ノード追加", action: "add" }]);
  const switchingNodeId = ref(null);
  const { lastUpdatedTime } = createPolling(refreshNodeList);
  const displayNodes = computed(
    () => (rawNodes.value ?? []).map((node) => ({
      id: node.id,
      name: node.name,
      ip: node.ipAddress,
      status: node.status,
      cpu: formatAsPercent(node.cpuUtilization),
      mem: formatAsPercent(node.memoryUtilization),
      storage: formatAsPercent(node.storageUtilization),
      isMgmt: Boolean(node.isAdmin),
      createdAt: formatDateTime(node.createdAt)
    }))
  );
  async function handleSetAsManagementNode(targetId) {
    if (switchingNodeId.value) return;
    switchingNodeId.value = targetId;
    try {
      const currentAdminNode = (rawNodes.value ?? []).find((n) => n.isAdmin);
      if (currentAdminNode && currentAdminNode.id !== targetId) {
        const unsetResult = await updateNode(currentAdminNode.id, {
          isAdmin: false
        });
        if (!unsetResult.success) {
          addToast({
            type: "error",
            message: "既存管理ノードの解除に失敗しました。",
            details: unsetResult.error?.message
          });
          return;
        }
      }
      const setResult = await updateNode(targetId, { isAdmin: true });
      if (setResult.success) {
        addToast({ type: "success", message: "管理ノードを切り替えました。" });
        await refreshNodeList();
      } else {
        addToast({
          type: "error",
          message: "管理ノードの設定に失敗しました。",
          details: setResult.error?.message
        });
      }
    } finally {
      switchingNodeId.value = null;
    }
  }
  return {
    columns,
    displayNodes,
    headerButtons,
    switchingNodeId,
    handleSetAsManagementNode,
    refreshNodeList,
    lastUpdatedTime,
    ADD_NODE_ACTION: addNodeAction,
    DELETE_NODE_ACTION: deleteNodeAction
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      columns,
      displayNodes,
      headerButtons,
      switchingNodeId,
      handleSetAsManagementNode,
      refreshNodeList,
      ADD_NODE_ACTION,
      DELETE_NODE_ACTION
    } = useNodeManagement();
    const {
      activeModal,
      openModal,
      closeModal,
      targetForDeletion,
      isDeleting,
      handleRowAction,
      handleDelete,
      handleSuccess,
      cancelAction
    } = usePageActions({
      resourceName: NODE.name,
      refresh: refreshNodeList
    });
    const handleDashboardHeaderAction = (action) => {
      if (action === "add") {
        openModal(ADD_NODE_ACTION);
      }
    };
    const onRowAction = ({ action, row }) => {
      if (action === "set-mgmt") {
        handleSetAsManagementNode(row.id);
      } else {
        handleRowAction({ action, row });
      }
    };
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当にノード「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardLayout = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_MoDeleteConfirm = __nuxt_component_2;
      const _component_MoAddNode = MoAddNodeToCluster;
      _push(`<!--[--><div>`);
      _push(ssrRenderComponent(_component_DashboardLayout, {
        title: "ノード",
        columns: unref(columns),
        rows: unref(displayNodes),
        rowKey: "id",
        headerButtons: unref(headerButtons),
        onHeaderAction: handleDashboardHeaderAction,
        onRowAction
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(`<div${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/node/${row.id}`,
                class: "table-link"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(row.name)} `);
                    if (row.isMgmt) {
                      _push3(`<span class="cell-note"${_scopeId2}>（管理ノード）</span>`);
                    } else {
                      _push3(`<!---->`);
                    }
                  } else {
                    return [
                      createTextVNode(toDisplayString(row.name) + " ", 1),
                      row.isMgmt ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "cell-note"
                      }, "（管理ノード）")) : createCommentVNode("", true)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              row ? (openBlock(), createBlock("div", { key: 0 }, [
                createVNode(_component_NuxtLink, {
                  to: `/node/${row.id}`,
                  class: "table-link"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(row.name) + " ", 1),
                    row.isMgmt ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "cell-note"
                    }, "（管理ノード）")) : createCommentVNode("", true)
                  ]),
                  _: 2
                }, 1032, ["to"])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        "cell-ip": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(`<span class="cell-mono"${_scopeId}>${ssrInterpolate(row.ip)}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              row ? (openBlock(), createBlock("span", {
                key: 0,
                class: "cell-mono"
              }, toDisplayString(row.ip), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        "cell-status": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(`<span class="${ssrRenderClass([("getNodeStatusDisplay" in _ctx ? _ctx.getNodeStatusDisplay : unref(getNodeStatusDisplay))(row.status).class, "table-status"])}"${_scopeId}>${ssrInterpolate(("getNodeStatusDisplay" in _ctx ? _ctx.getNodeStatusDisplay : unref(getNodeStatusDisplay))(row.status).text)}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              row ? (openBlock(), createBlock("span", {
                key: 0,
                class: ["table-status", ("getNodeStatusDisplay" in _ctx ? _ctx.getNodeStatusDisplay : unref(getNodeStatusDisplay))(row.status).class]
              }, toDisplayString(("getNodeStatusDisplay" in _ctx ? _ctx.getNodeStatusDisplay : unref(getNodeStatusDisplay))(row.status).text), 3)) : createCommentVNode("", true)
            ];
          }
        }),
        "row-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(`<div${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/node/${row.id}`,
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
              _push2(`<button type="button" class="${ssrRenderClass([{
                "opacity-50 cursor-not-allowed": row.isMgmt || unref(switchingNodeId) === row.id
              }, "action-item"])}"${ssrIncludeBooleanAttr(row.isMgmt || unref(switchingNodeId) === row.id) ? " disabled" : ""}${_scopeId}> 管理ノードに設定 </button><button type="button" class="${ssrRenderClass([{ "opacity-50 cursor-not-allowed": row.isMgmt }, "action-item action-item-danger"])}"${ssrIncludeBooleanAttr(row.isMgmt) ? " disabled" : ""}${_scopeId}> 削除 </button></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              row ? (openBlock(), createBlock("div", { key: 0 }, [
                createVNode(_component_NuxtLink, {
                  to: `/node/${row.id}`,
                  class: "action-item"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" 詳細 ")
                  ]),
                  _: 1
                }, 8, ["to"]),
                createVNode("button", {
                  type: "button",
                  class: ["action-item", {
                    "opacity-50 cursor-not-allowed": row.isMgmt || unref(switchingNodeId) === row.id
                  }],
                  disabled: row.isMgmt || unref(switchingNodeId) === row.id,
                  onClick: withModifiers(($event) => onRowAction({ action: "set-mgmt", row }), ["stop", "prevent"])
                }, " 管理ノードに設定 ", 10, ["disabled", "onClick"]),
                createVNode("button", {
                  type: "button",
                  class: ["action-item action-item-danger", { "opacity-50 cursor-not-allowed": row.isMgmt }],
                  disabled: row.isMgmt,
                  onClick: withModifiers(($event) => onRowAction({ action: "delete", row }), ["stop", "prevent"])
                }, " 削除 ", 10, ["disabled", "onClick"])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_MoDeleteConfirm, {
        show: unref(activeModal) === unref(DELETE_NODE_ACTION),
        message: unref(deleteMessage),
        "is-loading": unref(isDeleting),
        onClose: unref(cancelAction),
        onConfirm: unref(handleDelete)
      }, null, _parent));
      _push(ssrRenderComponent(_component_MoAddNode, {
        show: unref(activeModal) === unref(ADD_NODE_ACTION),
        onClose: unref(closeModal),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/node/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-vfWxMXgl.mjs.map
