import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createBlock, createCommentVNode, createVNode, openBlock, withModifiers, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { b as NETWORK } from './fetch-kOzZWayB.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { M as MoVirtualNetworkCreate } from './MoVirtualNetworkCreate-CipS8Q50.mjs';
import { M as MoVirtualNetworkEdit } from './MoVirtualNetworkEdit-CbOw2k03.mjs';
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
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceCreate-C_T3ufwz.mjs';
import './useModalAction-CCl6IdMe.mjs';
import './virtual-network-9nD05ROF.mjs';
import 'zod';
import './Input-jfnKbGQs.mjs';
import './SubmitButton-BLZt3uil.mjs';
import './useResourceUpdater-D_YM1lnm.mjs';
import './useResourceClient-CRkQUuKV.mjs';

const RESOURCE_NAME = NETWORK.name;
const CREATE_VNET_ACTION = `create-${RESOURCE_NAME}`;
const EDIT_VNET_ACTION = `edit-${RESOURCE_NAME}`;
const DELETE_VNET_ACTION = `delete-${RESOURCE_NAME}`;
function useVNetManagement() {
  const { isNetworkAdmin, isAdmin } = useUserPermission();
  const tableTitle = computed(() => {
    return isNetworkAdmin.value || isAdmin.value ? "仮想ネットワーク（全ユーザー）" : "仮想ネットワーク";
  });
  const queryOptions = computed(() => {
    return isNetworkAdmin.value || isAdmin.value ? { scope: "all" } : void 0;
  });
  const {
    data: rawList,
    pending,
    refresh,
    error
  } = useResourceList(RESOURCE_NAME, queryOptions);
  const { startPolling, stopPolling, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    }
  );
  const columns = [
    { key: "name", label: "名前", align: "left" },
    { key: "cidr", label: "CIDR", align: "left" },
    { key: "subnets", label: "サブネット数", align: "right" },
    { key: "ownerName", label: "所有者", align: "left" },
    { key: "createdAtText", label: "作成日時", align: "left" }
  ];
  const headerButtons = [
    { action: "add", label: "仮想ネットワーク作成", primary: true }
  ];
  const rows = computed(
    () => (rawList.value ?? []).map((v) => ({
      id: v.id,
      name: v.name ?? "-",
      cidr: v.cidr ?? "-",
      subnets: Array.isArray(v.subnets) ? v.subnets.length : 0,
      ownerName: v.owner?.name ?? "-",
      createdAtText: v.createdAt ? formatDateTime(v.createdAt) : "-",
      originalData: v
    }))
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
    tableTitle,
    CREATE_VNET_ACTION,
    EDIT_VNET_ACTION,
    DELETE_VNET_ACTION
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
      tableTitle,
      refresh,
      CREATE_VNET_ACTION: CREATE_VNET_ACTION2
    } = useVNetManagement();
    const {
      activeModal,
      openModal,
      targetForDeletion,
      targetForEditing,
      isDeleting,
      handleRowAction,
      handleDelete,
      handleSuccess,
      cancelAction
    } = usePageActions({
      resourceName: NETWORK.name,
      resourceLabel: NETWORK.label,
      refresh
    });
    function handleHeaderAction(action) {
      if (action === "add") {
        openModal(CREATE_VNET_ACTION2);
      }
    }
    function onRowAction({ action, row }) {
      handleRowAction({ action, row });
    }
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当に「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<!--[--><div>`);
      _push(ssrRenderComponent(__nuxt_component_0, {
        title: unref(tableTitle),
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
              to: `/network/${row.id}`,
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
                to: `/network/${row.id}`,
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
        "cell-cidr": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.cidr)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.cidr), 1)
            ];
          }
        }),
        "cell-subnets": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.subnets)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.subnets), 1)
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
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/network/${row.id}`,
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
                to: `/network/${row.id}`,
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
      _push(`</div>`);
      _push(ssrRenderComponent(MoVirtualNetworkCreate, {
        show: unref(activeModal) === `create-${unref(NETWORK).name}`,
        onClose: unref(cancelAction),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(MoVirtualNetworkEdit, {
        show: unref(activeModal) === `edit-${unref(NETWORK).name}`,
        data: unref(targetForEditing)?.originalData,
        onClose: unref(cancelAction),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(__nuxt_component_2, {
        show: unref(activeModal) === `delete-${unref(NETWORK).name}`,
        "is-loading": unref(isDeleting),
        message: unref(deleteMessage),
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-qwCUYqN2.mjs.map
