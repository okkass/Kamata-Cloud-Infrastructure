import { ref, defineComponent, shallowRef, useSlots, computed, watch, mergeProps, withCtx, createVNode, toDisplayString, createBlock, openBlock, markRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderSlot, ssrRenderList, ssrRenderComponent, ssrRenderTeleport, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast, f as useNuxtApp, _ as _export_sfc } from './server.mjs';
import { _ as _sfc_main$3 } from './BaseModal-XreF1fHA.mjs';

const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, _attrs))}><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/icon/kebabMenu.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]), { __name: "IconKebabMenu" });
const activeModal = ref(null);
const baseModalTitle = ref("");
const baseModalContent = shallowRef(null);
function useModal() {
  const openModal = (modalName, options) => {
    baseModalTitle.value = "";
    baseModalContent.value = null;
    if (options?.title) {
      baseModalTitle.value = options.title;
    }
    if (options?.component) {
      baseModalContent.value = markRaw(options.component);
    }
    activeModal.value = modalName;
  };
  const closeModal = () => {
    activeModal.value = null;
    baseModalTitle.value = "";
    baseModalContent.value = null;
  };
  return {
    // State
    activeModal,
    baseModalTitle,
    baseModalContent,
    // Methods
    openModal,
    closeModal
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "DashboardLayout",
  __ssrInlineRender: true,
  props: {
    title: { type: String, default: "ダッシュボード" },
    columns: { type: Array, required: true },
    rows: { type: Array, required: true },
    // ✨ RowData[] を T[] に変更
    rowKey: { type: String, default: "id" },
    headerButtons: { type: Array, default: () => [] }
  },
  emits: ["header-action", "row-action"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const openKey = ref(null);
    const menuPos = ref({ top: 0, left: 0 });
    const { activeModal: activeModal2 } = useModal();
    const slots = useSlots();
    const hasRowActions = computed(() => !!slots["row-actions"]);
    const getKeyForRow = (row, index) => {
      const recordRow = row;
      return props.rowKey && recordRow[props.rowKey] ? recordRow[props.rowKey] : index;
    };
    const closeMenu = () => {
      openKey.value = null;
    };
    watch(activeModal2, (newVal) => {
      if (newVal !== null) {
        closeMenu();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_IconKebabMenu = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-3 text-slate-900 font-sans bg-white" }, _attrs))}><div class="flex-shrink-0 flex items-center justify-between gap-2 flex-wrap mb-4"><h1 class="m-0 text-[26px] font-extrabold tracking-[0.02em]">${ssrInterpolate(__props.title)}</h1><div class="flex gap-2">`);
      ssrRenderSlot(_ctx.$slots, "header-actions", {}, () => {
        _push(`<!--[-->`);
        ssrRenderList(__props.headerButtons, (btn, i) => {
          _push(`<button class="btn btn-primary">${ssrInterpolate(btn.label)}</button>`);
        });
        _push(`<!--]-->`);
      }, _push, _parent);
      _push(`</div></div><div class="overflow-x-auto"><table class="w-full table-auto border border-slate-200 rounded-lg shadow-md bg-white min-w-[1200px]"><thead><tr class="table-header"><!--[-->`);
      ssrRenderList(__props.columns, (c) => {
        _push(`<th class="table-header-cell text-left">${ssrInterpolate(c.label)}</th>`);
      });
      _push(`<!--]-->`);
      if (hasRowActions.value) {
        _push(`<th class="table-header-cell text-center sticky right-0 z-10 bg-gray-100"></th>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tr></thead><tbody><!--[-->`);
      ssrRenderList(__props.rows, (row, rIdx) => {
        _push(`<tr class="table-row"><!--[-->`);
        ssrRenderList(__props.columns, (c) => {
          _push(`<td class="table-cell">`);
          ssrRenderSlot(_ctx.$slots, `cell-${c.key}`, { row }, () => {
            _push(`${ssrInterpolate(row[c.key])}`);
          }, _push, _parent);
          _push(`</td>`);
        });
        _push(`<!--]-->`);
        if (hasRowActions.value) {
          _push(`<td class="table-cell text-center sticky right-0 bg-white z-10"><button type="button" class="menu-trigger rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"><span class="sr-only">操作メニューを開く</span>`);
          _push(ssrRenderComponent(_component_IconKebabMenu, null, null, _parent));
          _push(`</button></td>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tr>`);
      });
      _push(`<!--]--></tbody></table></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (openKey.value !== null) {
          _push2(`<div class="dl-menu-floating fixed -translate-x-1/2 bg-white border border-slate-300 shadow-xl rounded-xl min-w-[180px] max-h-[50vh] overflow-y-auto z-[4000]" style="${ssrRenderStyle({ top: `${menuPos.value.top}px`, left: `${menuPos.value.left}px` })}">`);
          ssrRenderSlot(_ctx.$slots, "row-actions", {
            row: (() => {
              const openRow = __props.rows.find((r, i) => getKeyForRow(r, i) === openKey.value);
              return openRow;
            })(),
            emit: (action) => {
              const openRow = __props.rows.find((r, i) => getKeyForRow(r, i) === openKey.value);
              if (openRow) {
                emit("row-action", { action, row: openRow });
              }
            }
          }, null, _push2, _parent);
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DashboardLayout.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$1, { __name: "DashboardLayout" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoDeleteConfirm",
  __ssrInlineRender: true,
  props: {
    /** モーダルの表示/非表示を制御します */
    show: { type: Boolean, required: true },
    /** モーダル内に表示する確認メッセージです */
    message: { type: String, required: true },
    /** 削除処理中のローディング状態を示します */
    isLoading: { type: Boolean, default: false }
  },
  emits: ["close", "confirm"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$3;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "確認",
        size: "sm",
        onClose: ($event) => _ctx.$emit("close")
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-6 text-center"${_scopeId}><p class="text-base text-gray-700"${_scopeId}>${ssrInterpolate(__props.message)}</p><div class="flex justify-center gap-4"${_scopeId}><button type="button" class="btn btn-back"${_scopeId}> キャンセル </button><button type="button" class="btn btn-danger"${ssrIncludeBooleanAttr(__props.isLoading) ? " disabled" : ""}${_scopeId}>`);
            if (__props.isLoading) {
              _push2(`<span${_scopeId}>削除中...</span>`);
            } else {
              _push2(`<span${_scopeId}>削除する</span>`);
            }
            _push2(`</button></div></div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-6 text-center" }, [
                createVNode("p", { class: "text-base text-gray-700" }, toDisplayString(__props.message), 1),
                createVNode("div", { class: "flex justify-center gap-4" }, [
                  createVNode("button", {
                    type: "button",
                    class: "btn btn-back",
                    onClick: ($event) => _ctx.$emit("close")
                  }, " キャンセル ", 8, ["onClick"]),
                  createVNode("button", {
                    type: "button",
                    class: "btn btn-danger",
                    disabled: __props.isLoading,
                    onClick: ($event) => _ctx.$emit("confirm")
                  }, [
                    __props.isLoading ? (openBlock(), createBlock("span", { key: 0 }, "削除中...")) : (openBlock(), createBlock("span", { key: 1 }, "削除する"))
                  ], 8, ["disabled", "onClick"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoDeleteConfirm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main, { __name: "MoDeleteConfirm" });
const useResourceDelete = (resourceName) => {
  const isLoading = ref(false);
  const executeDelete = async (id) => {
    if (isLoading.value) {
      console.warn("Delete operation is already in progress.");
      return {
        success: false,
        error: {
          type: "conflict",
          message: "処理が重複しています。",
          statusCode: 409
        }
      };
    }
    isLoading.value = true;
    try {
      await useNuxtApp().$apiFetch(`${resourceName}/${id}`, {
        method: "DELETE"
        // 注: 認証ヘッダーなどは$fetchのグローバル設定(plugins/api.tsなど)で行うのが望ましい
      });
      return { success: true };
    } catch (err) {
      let statusCode = 500;
      if (typeof err === "object" && err !== null && "statusCode" in err && typeof err.statusCode === "number") {
        statusCode = err.statusCode || 500;
      }
      switch (statusCode) {
        case 403:
          return {
            success: false,
            error: {
              type: "permission",
              message: "この操作を実行する権限がありません。",
              statusCode
            }
          };
        case 404:
          return {
            success: false,
            error: {
              type: "notFound",
              message: "削除対象のデータが見つかりませんでした。",
              statusCode
            }
          };
        default:
          return {
            success: false,
            error: {
              type: "unknown",
              message: `サーバーエラーが発生しました。(Code: ${statusCode})`,
              statusCode
            }
          };
      }
    } finally {
      isLoading.value = false;
    }
  };
  return {
    executeDelete,
    isDeleting: isLoading
    // isDeletingからisLoadingに名前を変更
  };
};
const usePageActions = (options) => {
  const { resourceName, refresh } = options;
  const { activeModal: activeModal2, openModal, closeModal } = useModal();
  const { addToast } = useToast();
  const { executeDelete, isDeleting } = useResourceDelete(resourceName);
  const targetForDeletion = ref(null);
  const targetForEditing = ref(null);
  const resetActionTargets = () => {
    closeModal();
    targetForDeletion.value = null;
    targetForEditing.value = null;
  };
  const handleRowAction = ({ action, row }) => {
    if (action === "delete") {
      targetForDeletion.value = row;
      openModal(`delete-${resourceName}`);
    }
    if (action === "edit") {
      targetForEditing.value = row;
      openModal(`edit-${resourceName}`);
    }
  };
  const handleDelete = async () => {
    if (!targetForDeletion.value) return;
    const result = await executeDelete(targetForDeletion.value.id);
    if (result.success) {
      addToast({
        message: `'${targetForDeletion.value.name}' を削除しました。`,
        type: "success"
      });
      await refresh();
    } else {
      addToast({
        message: `'${targetForDeletion.value.name}' の削除に失敗しました。`,
        type: "error",
        details: result.error?.message
      });
    }
    resetActionTargets();
  };
  const handleSuccess = async () => {
    resetActionTargets();
    await refresh();
  };
  const cancelAction = () => {
    resetActionTargets();
  };
  return {
    // State
    activeModal: activeModal2,
    openModal,
    closeModal,
    targetForDeletion,
    targetForEditing,
    isDeleting,
    // Handlers
    handleRowAction,
    handleDelete,
    handleSuccess,
    cancelAction
  };
};

export { __nuxt_component_0 as _, __nuxt_component_2 as a, useModal as b, usePageActions as u };
//# sourceMappingURL=usePageActions-DcbNcI3A.mjs.map
