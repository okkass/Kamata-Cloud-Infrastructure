import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createBlock, createCommentVNode, createVNode, openBlock, withModifiers, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { e as INSTANCE_TYPE } from './fetch-kOzZWayB.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { c as convertByteToUnit } from './server.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { M as MoInstanceTypeAdd } from './MoInstanceTypeAdd-joaO4O4s.mjs';
import { M as MoInstanceTypeEdit } from './MoInstanceTypeEdit-B3h2N012.mjs';
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
import './SubmitButton-BLZt3uil.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './useResourceCreate-C_T3ufwz.mjs';
import './instance-type-BB8zzCzi.mjs';
import 'zod';
import './useModalAction-CCl6IdMe.mjs';
import './Input-jfnKbGQs.mjs';
import './useResourceUpdater-D_YM1lnm.mjs';
import './useResourceClient-CRkQUuKV.mjs';

const RESOURCE_NAME = INSTANCE_TYPE.name;
const ADD_INSTANCE_TYPE_ACTION = `add-${RESOURCE_NAME}`;
const EDIT_INSTANCE_TYPE_ACTION = `edit-${RESOURCE_NAME}`;
const DELETE_INSTANCE_TYPE_ACTION = `delete-${RESOURCE_NAME}`;
function useInstanceTypeManagement() {
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
    { key: "name", label: "名前", align: "left" },
    { key: "vcpu", label: "vCPU", align: "right" },
    { key: "memorySize", label: "メモリ (MB)", align: "right" },
    { key: "createdAtText", label: "作成日時", align: "left" }
  ];
  const headerButtons = [{ action: "add", label: "追加" }];
  const rows = computed(
    () => (rawList.value ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      vcpu: r.cpuCore,
      memorySize: convertByteToUnit(r.memorySize, "MB"),
      createdAtText: formatDateTime(r.createdAt),
      originalData: r
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
    ADD_INSTANCE_TYPE_ACTION,
    EDIT_INSTANCE_TYPE_ACTION,
    DELETE_INSTANCE_TYPE_ACTION
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
      ADD_INSTANCE_TYPE_ACTION: ADD_INSTANCE_TYPE_ACTION2,
      EDIT_INSTANCE_TYPE_ACTION: EDIT_INSTANCE_TYPE_ACTION2,
      DELETE_INSTANCE_TYPE_ACTION: DELETE_INSTANCE_TYPE_ACTION2
    } = useInstanceTypeManagement();
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
      resourceName: INSTANCE_TYPE.name,
      resourceLabel: INSTANCE_TYPE.label,
      refresh
    });
    function handleHeaderAction(action) {
      if (action === "add") {
        openModal(ADD_INSTANCE_TYPE_ACTION2);
      }
    }
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当にインスタンスタイプ「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(__nuxt_component_0, {
        title: "インスタンスタイプ",
        columns: unref(columns),
        rows: unref(rows),
        rowKey: "id",
        headerButtons: unref(headerButtons),
        onHeaderAction: handleHeaderAction,
        onRowAction: unref(handleRowAction)
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/instance-type/${row.id}`,
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
                to: `/instance-type/${row.id}`,
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
        "cell-vcpu": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.vcpu)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.vcpu), 1)
            ];
          }
        }),
        "cell-memorySize": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono"${_scopeId}>${ssrInterpolate(row.memorySize)} MB</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono" }, toDisplayString(row.memorySize) + " MB", 1)
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
                to: `/instance-type/${row.id}`,
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
                to: `/instance-type/${row.id}`,
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
      _push(ssrRenderComponent(MoInstanceTypeAdd, {
        show: unref(activeModal) === unref(ADD_INSTANCE_TYPE_ACTION2),
        onClose: unref(cancelAction),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(MoInstanceTypeEdit, {
        show: unref(activeModal) === unref(EDIT_INSTANCE_TYPE_ACTION2),
        data: unref(targetForEditing)?.originalData ?? void 0,
        onClose: unref(cancelAction),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(__nuxt_component_2, {
        show: unref(activeModal) === unref(DELETE_INSTANCE_TYPE_ACTION2),
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/instance-type/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C3vmpDcU.mjs.map
