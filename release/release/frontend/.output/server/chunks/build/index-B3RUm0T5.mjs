import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2 } from './usePageActions-DcbNcI3A.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { M as MoImageAdd } from './MoImageAdd-BjI-okVc.mjs';
import { M as MoImageEdit } from './MoImageEdit-WbfvqdTK.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createVNode, withModifiers, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { I as IMAGE } from './fetch-kOzZWayB.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { t as toSize } from './server.mjs';
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
import './SubmitButton-BLZt3uil.mjs';
import 'vee-validate';
import '@vee-validate/zod';
import './image-SWhs2cAJ.mjs';
import 'zod';
import './useModalAction-CCl6IdMe.mjs';
import './errorHandler-Bj20B0ou.mjs';
import './Input-jfnKbGQs.mjs';
import './DropZone-DuFc6jYt.mjs';
import './useResourceEdit-BDkGI_Ar.mjs';
import './Textarea-BGnieQ5E.mjs';
import 'vue-router';

const RESOURCE_NAME = IMAGE.name;
const ADD_IMAGE_ACTION = `add-${RESOURCE_NAME}`;
const EDIT_IMAGE_ACTION = `edit-${RESOURCE_NAME}`;
const DELETE_IMAGE_ACTION = `delete-${RESOURCE_NAME}`;
function useImageManagement() {
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
    { key: "name", label: "イメージ名", align: "left" },
    { key: "size", label: "サイズ", align: "right" },
    { key: "createdAt", label: "登録日", align: "left" }
  ];
  const headerButtons = [{ action: "add", label: "イメージ追加" }];
  const images = computed(
    () => (rawList.value ?? []).map((image) => ({
      id: image.id,
      name: image.name,
      createdAt: formatDateTime(image.createdAt),
      size: toSize(image.size),
      originalData: image
    }))
  );
  return {
    pending,
    error,
    columns,
    images,
    headerButtons,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    ADD_IMAGE_ACTION,
    EDIT_IMAGE_ACTION,
    DELETE_IMAGE_ACTION
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      columns,
      images,
      headerButtons,
      refresh,
      ADD_IMAGE_ACTION: ADD_IMAGE_ACTION2,
      EDIT_IMAGE_ACTION: EDIT_IMAGE_ACTION2,
      DELETE_IMAGE_ACTION: DELETE_IMAGE_ACTION2
    } = useImageManagement();
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
      resourceName: IMAGE.name,
      refresh
    });
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当にイメージ「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardLayout = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_MoDeleteConfirm = __nuxt_component_2;
      const _component_MoImageAdd = MoImageAdd;
      const _component_MoImageEdit = MoImageEdit;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_DashboardLayout, {
        title: "仮想マシンイメージ",
        columns: unref(columns),
        rows: unref(images),
        rowKey: "id",
        headerButtons: unref(headerButtons),
        onHeaderAction: () => unref(openModal)(unref(ADD_IMAGE_ACTION2)),
        onRowAction: unref(handleRowAction)
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/image/${row.id}`,
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
                to: `/image/${row.id}`,
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
        "cell-size": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="cell-mono"${_scopeId}>${ssrInterpolate(row.size)}</span>`);
          } else {
            return [
              createVNode("span", { class: "cell-mono" }, toDisplayString(row.size), 1)
            ];
          }
        }),
        "cell-createdAt": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(row.createdAt)}</span>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(row.createdAt), 1)
            ];
          }
        }),
        "row-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/image/${row?.id}`,
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
            _push2(`<button type="button" class="action-item"${_scopeId}> 編集 </button><button type="button" class="action-item action-item-danger"${ssrIncludeBooleanAttr(unref(isDeleting) && unref(targetForDeletion)?.id === row?.id) ? " disabled" : ""}${_scopeId}> 削除 </button>`);
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/image/${row?.id}`,
                class: "action-item"
              }, {
                default: withCtx(() => [
                  createTextVNode("詳細")
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
                disabled: unref(isDeleting) && unref(targetForDeletion)?.id === row?.id,
                onClick: withModifiers(($event) => row && unref(handleRowAction)({ action: "delete", row }), ["stop", "prevent"])
              }, " 削除 ", 8, ["disabled", "onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_MoDeleteConfirm, {
        show: unref(activeModal) === unref(DELETE_IMAGE_ACTION2),
        message: unref(deleteMessage),
        "is-loading": unref(isDeleting),
        onClose: unref(cancelAction),
        onConfirm: unref(handleDelete)
      }, null, _parent));
      _push(ssrRenderComponent(_component_MoImageAdd, {
        show: unref(activeModal) === unref(ADD_IMAGE_ACTION2),
        onClose: unref(cancelAction),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(_component_MoImageEdit, {
        show: unref(activeModal) === unref(EDIT_IMAGE_ACTION2),
        data: unref(targetForEditing)?.originalData ?? void 0,
        onClose: unref(cancelAction),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/image/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B3RUm0T5.mjs.map
