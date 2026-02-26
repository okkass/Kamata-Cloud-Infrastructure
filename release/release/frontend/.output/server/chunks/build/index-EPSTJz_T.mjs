import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { _ as __nuxt_component_3 } from './MoSecurityGroupCreate-DETdv46_.mjs';
import { _ as __nuxt_component_4 } from './MoSecurityGroupEdit-DSXzzQ8a.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createVNode, withModifiers, toDisplayString, createBlock, createCommentVNode, openBlock, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { g as SECURITY_GROUP } from './fetch-kOzZWayB.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
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
import './Section-B8lyqO8a.mjs';
import './SubmitButton-BLZt3uil.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceCreate-C_T3ufwz.mjs';
import './RuleTable-DJ0ZiAQN.mjs';
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
import './asyncData-BDnIU8Sz.mjs';
import 'perfect-debounce';
import './useModalAction-CCl6IdMe.mjs';
import './Textarea-BGnieQ5E.mjs';
import './useResourceUpdater-D_YM1lnm.mjs';
import './useResourceClient-CRkQUuKV.mjs';

const addSecurityGroupAction = `add-${SECURITY_GROUP.name}`;
const editSecurityGroupAction = `edit-${SECURITY_GROUP.name}`;
const deleteSecurityGroupAction = `delete-${SECURITY_GROUP.name}`;
function useSecurityDashboard() {
  const { fetchUser, isAdmin, isSecurityGroupAdmin } = useUserPermission();
  void fetchUser();
  const isManager = computed(
    () => isAdmin.value === true || isSecurityGroupAdmin.value === true
  );
  const queryOptions = computed(() => {
    return isManager.value ? { scope: "all" } : void 0;
  });
  const { data: rawGroups, refresh: refreshGroupList } = useResourceList(SECURITY_GROUP.name, queryOptions);
  createPolling(async () => {
    await refreshGroupList();
  }, 3e3);
  const columns = [
    { key: "name", label: "グループ名", align: "left" },
    { key: "ownerName", label: "所有者", align: "left" },
    { key: "description", label: "説明", align: "left" },
    { key: "rulesText", label: "イン/アウト ルール数", align: "center" },
    { key: "createdAt", label: "作成日時", align: "left" }
  ];
  const headerButtons = [{ label: "セキュリティグループ追加", action: "add" }];
  const formatGroup = (g) => {
    const inboundRuleCount = g.rules?.filter((r) => r.ruleType === "inbound").length ?? 0;
    const outboundRuleCount = g.rules?.filter((r) => r.ruleType === "outbound").length ?? 0;
    const summary = `${inboundRuleCount} / ${outboundRuleCount}`;
    return {
      ...g,
      inboundRuleCount,
      outboundRuleCount,
      ruleSummary: summary,
      rulesText: summary,
      ownerName: g.owner?.name ?? "",
      createdAt: formatDateTime(g.createdAt),
      originalData: g
    };
  };
  const groups = computed(
    () => (rawGroups.value ?? []).map(formatGroup)
  );
  return {
    columns,
    groups,
    isManager,
    headerButtons,
    refreshGroupList,
    ADD_SECURITY_GROUP_ACTION: addSecurityGroupAction,
    EDIT_SECURITY_GROUP_ACTION: editSecurityGroupAction,
    DELETE_SECURITY_GROUP_ACTION: deleteSecurityGroupAction
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { columns, groups, isManager, headerButtons, refreshGroupList } = useSecurityDashboard();
    const {
      activeModal,
      openModal,
      closeModal,
      targetForDeletion,
      targetForEditing,
      // targetForEditingを受け取る
      isDeleting,
      handleRowAction,
      handleDelete,
      handleSuccess,
      cancelAction
    } = usePageActions({
      resourceName: SECURITY_GROUP.name,
      refresh: async () => {
        await refreshGroupList();
      }
      // refresh関数を渡す
    });
    const addSecurityGroupAction2 = `create-${SECURITY_GROUP.name}`;
    const editSecurityGroupAction2 = `edit-${SECURITY_GROUP.name}`;
    const deleteSecurityGroupAction2 = `delete-${SECURITY_GROUP.name}`;
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当に「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardLayout = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_MoDeleteConfirm = __nuxt_component_2;
      const _component_MoSecurityGroupCreate = __nuxt_component_3;
      const _component_MoSecurityGroupEdit = __nuxt_component_4;
      _push(`<!--[--><div>`);
      _push(ssrRenderComponent(_component_DashboardLayout, {
        title: unref(isManager) ? "セキュリティグループ（全ユーザーの情報）" : "セキュリティグループ（自分のリソース）",
        columns: unref(columns),
        rows: unref(groups) || [],
        rowKey: "id",
        headerButtons: unref(headerButtons),
        onHeaderAction: () => unref(openModal)(addSecurityGroupAction2)
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(`<div${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/security-group/${row.id}`,
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
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              row ? (openBlock(), createBlock("div", { key: 0 }, [
                createVNode(_component_NuxtLink, {
                  to: `/security-group/${row.id}`,
                  class: "table-link"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(row.name), 1)
                  ]),
                  _: 2
                }, 1032, ["to"])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        "row-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/security-group/${row?.id}`,
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
            _push2(`<button type="button" class="action-item"${_scopeId}> 編集 </button><button type="button" class="action-item action-item-danger"${_scopeId}> 削除 </button>`);
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/security-group/${row?.id}`,
                class: "action-item"
              }, {
                default: withCtx(() => [
                  createTextVNode(" 詳細 ")
                ]),
                _: 1
              }, 8, ["to"]),
              createVNode("button", {
                type: "button",
                class: "action-item",
                onClick: withModifiers(($event) => row && unref(handleRowAction)({ action: "edit", row }), ["stop", "prevent"])
              }, " 編集 ", 8, ["onClick"]),
              createVNode("button", {
                type: "button",
                class: "action-item action-item-danger",
                onClick: withModifiers(($event) => row && unref(handleRowAction)({ action: "delete", row }), ["stop", "prevent"])
              }, " 削除 ", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_MoDeleteConfirm, {
        show: unref(activeModal) === deleteSecurityGroupAction2,
        message: unref(deleteMessage),
        "is-loading": unref(isDeleting),
        onClose: unref(cancelAction),
        onConfirm: unref(handleDelete)
      }, null, _parent));
      _push(ssrRenderComponent(_component_MoSecurityGroupCreate, {
        show: unref(activeModal) === addSecurityGroupAction2,
        onClose: unref(closeModal),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(_component_MoSecurityGroupEdit, {
        show: unref(activeModal) === editSecurityGroupAction2,
        data: unref(targetForEditing)?.originalData ?? null,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/security-group/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-EPSTJz_T.mjs.map
