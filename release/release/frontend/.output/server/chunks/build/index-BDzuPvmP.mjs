import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { M as MoUserAdd } from './MoUserAdd-P_a7-gDr.mjs';
import { M as MoUserEdit } from './MoUserEdit-CgkziSP5.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createBlock, createCommentVNode, openBlock, createVNode, withModifiers, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { c as convertByteToUnit } from './server.mjs';
import { U as USER } from './fetch-kOzZWayB.mjs';
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
import './SubmitButton-BLZt3uil.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceCreate-C_T3ufwz.mjs';
import './user-BB0TVvYL.mjs';
import 'zod';
import './useModalAction-CCl6IdMe.mjs';
import './Input-jfnKbGQs.mjs';
import './Section-B8lyqO8a.mjs';
import './useResourceEdit-BDkGI_Ar.mjs';
import 'vue-router';
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';

function formatResourceLimits(user) {
  const cpu = user.maxCpuCore != null ? `${user.maxCpuCore}` : "無制限";
  const memory = user.maxMemorySize != null && user.maxMemorySize > 0 ? `${convertByteToUnit(user.maxMemorySize, "GB")} GB` : "無制限";
  const storage = user.maxStorageSize != null && user.maxStorageSize > 0 ? `${convertByteToUnit(user.maxStorageSize, "GB")} GB` : "無制限";
  return `CPU: ${cpu}, メモリ: ${memory}, ストレージ: ${storage}`;
}
function useUserManagement() {
  const {
    data: rawList,
    pending,
    refresh,
    error
  } = useResourceList("users");
  const columns = [
    { key: "name", label: "アカウント名", align: "left" },
    { key: "email", label: "メールアドレス", align: "left" },
    { key: "limitsText", label: "最大リソース", align: "left" },
    { key: "lastLoginText", label: "最終ログイン", align: "left" }
  ];
  const headerButtons = [{ action: "add", label: "利用者追加" }];
  const rows = computed(
    () => (rawList.value ?? []).map((u) => ({
      id: u.id,
      name: u.name,
      // DTOの構造によっては u.accountName など
      email: u.email ?? "-",
      limitsText: formatResourceLimits(u),
      lastLoginText: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-",
      originalData: u
      // 元データを保持
    }))
  );
  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { columns, headerButtons, rows, refresh } = useUserManagement();
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
      resourceName: USER.name,
      refresh
    });
    const onHeaderAction = (action) => {
      if (action === "add") {
        openModal("add-users");
      }
    };
    const onRowAction = ({ action, row }) => {
      handleRowAction({ action, row });
    };
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当に利用者「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardLayout = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_MoUserAdd = MoUserAdd;
      const _component_MoUserEdit = MoUserEdit;
      const _component_MoDeleteConfirm = __nuxt_component_2;
      _push(`<!--[--><div>`);
      _push(ssrRenderComponent(_component_DashboardLayout, {
        title: "利用者管理",
        columns: unref(columns),
        rows: unref(rows),
        rowKey: "id",
        headerButtons: unref(headerButtons),
        onHeaderAction,
        onRowAction
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/user/${row.id}`,
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
                to: `/user/${row.id}`,
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
        "cell-email": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.email)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.email), 1)
            ];
          }
        }),
        "cell-limitsText": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-sm"${_scopeId}>${ssrInterpolate(row.limitsText)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-sm" }, toDisplayString(row.limitsText), 1)
            ];
          }
        }),
        "row-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(`<div${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/user/${row.id}`,
                class: "action-item"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`詳細`);
                  } else {
                    return [
                      createTextVNode("詳細")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`<button class="action-item"${_scopeId}> 編集 </button><button class="action-item action-item-danger"${_scopeId}> 削除 </button></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              row ? (openBlock(), createBlock("div", { key: 0 }, [
                createVNode(_component_NuxtLink, {
                  to: `/user/${row.id}`,
                  class: "action-item"
                }, {
                  default: withCtx(() => [
                    createTextVNode("詳細")
                  ]),
                  _: 1
                }, 8, ["to"]),
                createVNode("button", {
                  class: "action-item",
                  onClick: withModifiers(($event) => onRowAction({ action: "edit", row }), ["stop", "prevent"])
                }, " 編集 ", 8, ["onClick"]),
                createVNode("button", {
                  class: "action-item action-item-danger",
                  onClick: withModifiers(($event) => onRowAction({ action: "delete", row }), ["stop", "prevent"])
                }, " 削除 ", 8, ["onClick"])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_MoUserAdd, {
        show: unref(activeModal) === "add-users",
        onClose: unref(closeModal),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(_component_MoUserEdit, {
        show: unref(activeModal) === "edit-users",
        data: unref(targetForEditing)?.originalData,
        onClose: unref(closeModal),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(_component_MoDeleteConfirm, {
        show: unref(activeModal) === "delete-users",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/user/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BDzuPvmP.mjs.map
