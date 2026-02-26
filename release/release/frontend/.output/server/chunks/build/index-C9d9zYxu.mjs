import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { a as getVmStatusDisplay, c as calculateTotalStorage } from './status-BiUv1ciD.mjs';
import { f as formatDateTime } from './date-D5dH0cF_.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createBlock, createCommentVNode, createVNode, openBlock, withModifiers, toDisplayString, Fragment, renderList, ref, watch, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderStyle, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { a as MACHINE, V as VM_ACTION_SUCCESS, c as VM_ACTION_CONFIRMATION } from './fetch-kOzZWayB.mjs';
import { e as clampPercent, c as convertByteToUnit, u as useToast } from './server.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
import { c as createPolling } from './polling-9ov9NMoc.mjs';
import { u as usePageActions, _ as __nuxt_component_0, a as __nuxt_component_2, b as useModal } from './usePageActions-DcbNcI3A.mjs';
import { u as useApiClient } from './useResourceClient-CRkQUuKV.mjs';
import { M as MoVirtualMachineCreate } from './MoVirtualMachineCreate-EwEz0Xgv.mjs';
import { M as MoVirtualMachineEdit } from './MoVirtualMachineEdit-FYCnnHIz.mjs';
import { C as ConfirmationModal } from './ConfirmationModal-DY_3GDmV.mjs';
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
import './Section-B8lyqO8a.mjs';
import './StorageConfigTable-BkExsU01.mjs';
import './DropZone-DuFc6jYt.mjs';
import './useModalAction-CCl6IdMe.mjs';
import './useResourceCreate-C_T3ufwz.mjs';
import './useResourceUpdater-D_YM1lnm.mjs';

function useVMachineManagement() {
  const { fetchUser, isAdmin, isVirtualMachineAdmin } = useUserPermission();
  void fetchUser();
  const isManager = computed(
    () => isAdmin.value === true || isVirtualMachineAdmin.value === true
  );
  const queryOptions = computed(() => {
    return isManager.value ? { scope: "all" } : void 0;
  });
  const {
    data: virtualMachines,
    pending,
    refresh,
    error
  } = useResourceList(MACHINE.name, queryOptions);
  const { startPolling, stopPolling, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    }
  );
  const columns = [
    { key: "name", label: "仮想マシン名", align: "left" },
    { key: "ownerName", label: "所有者", align: "left" },
    { key: "status", label: "状態", align: "left" },
    {
      key: "instanceType",
      label: "スペック (CPU/メモリ)",
      align: "left"
    },
    { key: "storage", label: "ストレージ", align: "right" },
    { key: "node", label: "配置ノード", align: "left" },
    { key: "createdAt", label: "作成日時", align: "left" },
    { key: "cpu", label: "CPU使用率", align: "right" },
    { key: "memory", label: "メモリ使用率", align: "right" }
  ];
  const headerButtons = [{ label: "新規作成", action: "create" }];
  const CREATE_VIRTUAL_MACHINE_ACTION = `create-${MACHINE.name}`;
  const EDIT_VIRTUAL_MACHINE_ACTION = `edit-${MACHINE.name}`;
  const DELETE_VIRTUAL_MACHINE_ACTION = `delete-${MACHINE.name}`;
  const rows = computed(
    () => (virtualMachines.value ?? []).map((vm) => {
      const memoryMB = convertByteToUnit(vm.memorySize, "MB");
      const specText = vm.cpuCore !== void 0 && vm.memorySize !== void 0 ? `${vm.cpuCore} cores / ${memoryMB} MB` : "-";
      const cpuUsedCores = (vm.cpuUtilization ?? 0) * (vm.cpuCore ?? 0);
      const cpuUsageText = `${cpuUsedCores.toFixed(1)} Cores / ${vm.cpuCore ?? 0} Cores`;
      const cpuUtilizationPercent = Math.round((vm.cpuUtilization ?? 0) * 100);
      const memoryTotalMB = convertByteToUnit(vm.memorySize, "MB");
      const memoryUsedMB = (vm.memoryUtilization ?? 0) * memoryTotalMB;
      const memoryUsageText = `${memoryUsedMB.toFixed(
        1
      )} MB / ${memoryTotalMB} MB`;
      const memoryUtilizationPercent = Math.round(
        (vm.memoryUtilization ?? 0) * 100
      );
      return {
        ...vm,
        totalStorageGB: calculateTotalStorage(vm.storages),
        specText,
        cpuUsageText,
        cpuUtilizationPercent,
        memoryUsageText,
        memoryUtilizationPercent,
        ownerName: vm.owner?.name ?? "-"
      };
    })
  );
  return {
    columns,
    headerButtons,
    rows,
    isManager,
    pending,
    error,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    CREATE_VIRTUAL_MACHINE_ACTION,
    EDIT_VIRTUAL_MACHINE_ACTION,
    DELETE_VIRTUAL_MACHINE_ACTION
  };
}
function useVMBulkOperations() {
  const { addToast } = useToast();
  const apiClient = useApiClient();
  const { activeModal } = useModal();
  const selectedVmIds = ref([]);
  const showActionMenu = ref(false);
  const toggleVmSelection = (vmId) => {
    const index = selectedVmIds.value.indexOf(vmId);
    index > -1 ? selectedVmIds.value.splice(index, 1) : selectedVmIds.value.push(vmId);
  };
  const clearSelection = () => {
    selectedVmIds.value = [];
  };
  const toggleActionMenu = () => {
    showActionMenu.value = !showActionMenu.value;
  };
  const closeActionMenu = () => {
    showActionMenu.value = false;
  };
  watch(activeModal, (newVal) => {
    if (newVal !== null) {
      closeActionMenu();
    }
  });
  const confirmDialog = ref({
    show: false,
    title: "",
    message: "",
    confirmText: "確認",
    actionValue: "",
    vmId: ""
  });
  const alertDialog = ref({
    show: false,
    title: "",
    message: ""
  });
  const closeConfirmDialog = () => {
    Object.assign(confirmDialog.value, {
      show: false,
      actionValue: "",
      vmId: ""
    });
  };
  const closeAlertDialog = () => {
    alertDialog.value.show = false;
  };
  const showAlert = (title, message) => {
    Object.assign(alertDialog.value, { show: true, title, message });
  };
  const callVmAction = (vmId, actionValue) => apiClient.post(`${MACHINE.name}/${vmId}/${actionValue}`, {
    action: actionValue
  });
  const executeVmAction = async (vmId, actionValue) => {
    try {
      const res = await callVmAction(vmId, actionValue);
      addToast({
        message: VM_ACTION_SUCCESS[actionValue] ?? res.message,
        type: "success"
      });
      return true;
    } catch (e) {
      console.error("VM操作失敗:", actionValue, e);
      addToast({ message: "操作に失敗しました", type: "error" });
      return false;
    }
  };
  const executeBulkVmAction = async (vmIds, actionValue) => {
    const results = await Promise.allSettled(
      vmIds.map((vmId) => callVmAction(vmId, actionValue))
    );
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.length - successCount;
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("VM操作失敗:", vmIds[index], actionValue, result.reason);
      }
    });
    if (successCount > 0) {
      const message = VM_ACTION_SUCCESS[actionValue];
      addToast({
        message: `${successCount}台のVMを${message?.replace("VMを", "") ?? "操作しました"}`,
        type: "success"
      });
    }
    if (failCount > 0) {
      addToast({
        message: `${failCount}台のVMの操作に失敗しました`,
        type: "error"
      });
    }
    return { successCount, failCount };
  };
  const showBulkActionConfirm = (actionValue, vmNames, vmCount) => {
    const config = VM_ACTION_CONFIRMATION[actionValue];
    if (!config) return false;
    Object.assign(confirmDialog.value, {
      show: true,
      title: config.title,
      message: `以下の${vmCount}台の仮想マシンを${config.confirmText.replace(
        "する",
        ""
      )}します：

${vmNames.join("、")}

${config.message}`,
      confirmText: config.confirmText,
      actionValue,
      vmId: ""
    });
    return true;
  };
  return {
    selectedVmIds,
    showActionMenu,
    toggleVmSelection,
    clearSelection,
    toggleActionMenu,
    closeActionMenu,
    confirmDialog,
    alertDialog,
    confirmationConfig: VM_ACTION_CONFIRMATION,
    actionSuccessMessage: VM_ACTION_SUCCESS,
    closeConfirmDialog,
    closeAlertDialog,
    executeVmAction,
    executeBulkVmAction,
    showBulkActionConfirm,
    showAlert
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      columns: originalColumns,
      headerButtons,
      rows,
      isManager,
      refresh,
      CREATE_VIRTUAL_MACHINE_ACTION,
      EDIT_VIRTUAL_MACHINE_ACTION,
      DELETE_VIRTUAL_MACHINE_ACTION
    } = useVMachineManagement();
    const columns = [
      { key: "checkbox", label: "", align: "center" },
      ...originalColumns
    ];
    const {
      selectedVmIds,
      showActionMenu,
      toggleVmSelection,
      clearSelection,
      toggleActionMenu,
      closeActionMenu,
      confirmDialog,
      alertDialog,
      confirmationConfig,
      closeConfirmDialog,
      closeAlertDialog,
      executeVmAction,
      executeBulkVmAction,
      showBulkActionConfirm,
      showAlert
    } = useVMBulkOperations();
    const bulkActions = [
      { label: "起動", value: "start" },
      { label: "停止", value: "stop" },
      { label: "シャットダウン", value: "shutdown" },
      { label: "再起動", value: "reboot" },
      { label: "リセット", value: "reset" }
    ];
    const handleBulkActionClick = (action) => {
      if (selectedVmIds.value.length === 0) {
        showAlert("入力値が不足しています", "VMにチェックを入れてください");
        return;
      }
      closeActionMenu();
      handleBulkAction(action);
    };
    const handleBulkAction = (action) => {
      const selectedVms = rows.value.filter(
        (vm) => selectedVmIds.value.includes(vm.id)
      );
      const vmNames = selectedVms.map((vm) => vm.name);
      if (confirmationConfig[action]) {
        showBulkActionConfirm(action, vmNames, selectedVmIds.value.length);
        return;
      }
      executeBulkAction(action);
    };
    const executeConfirmedVmAction = async () => {
      const actionValue = confirmDialog.value.actionValue;
      const vmId = confirmDialog.value.vmId;
      closeConfirmDialog();
      if (!actionValue) return;
      if (!vmId && selectedVmIds.value.length > 0) {
        await executeBulkAction(actionValue);
        return;
      }
      if (vmId) {
        await executeVmAction(vmId, actionValue);
        await refresh();
      }
    };
    const executeBulkAction = async (actionValue) => {
      const vmIds = [...selectedVmIds.value];
      await executeBulkVmAction(vmIds, actionValue);
      clearSelection();
      await refresh();
    };
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
      resourceName: MACHINE.name,
      resourceLabel: MACHINE.label,
      refresh
    });
    function handleHeaderAction(action) {
      if (action === "create") {
        openModal(CREATE_VIRTUAL_MACHINE_ACTION);
      }
    }
    function onRowAction({
      action,
      row
    }) {
      handleRowAction({ action, row });
    }
    const deleteMessage = computed(() => {
      const name = targetForDeletion.value?.name ?? "";
      return `本当に「${name}」を削除しますか？`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(__nuxt_component_0, {
        title: unref(isManager) ? "仮想マシン（全ユーザーの情報）" : "仮想マシン（自分のリソース）",
        columns,
        rows: unref(rows),
        rowKey: "id",
        headerButtons: unref(headerButtons),
        key: unref(activeModal) || unref(confirmDialog).show ? "modal-open" : "modal-closed",
        onHeaderAction: handleHeaderAction,
        onRowAction
      }, {
        "header-actions": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex gap-2 items-center"${_scopeId}><button class="btn btn-primary"${_scopeId}> 新規作成 </button><div class="relative action-menu-container"${_scopeId}><button class="btn btn-sm btn-secondary flex items-center gap-2"${_scopeId}> 操作 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"${_scopeId}></path></svg></button>`);
            if (unref(showActionMenu)) {
              _push2(`<div class="absolute right-0 mt-2 w-48 bg-white border border-slate-300 rounded-lg shadow-xl z-50"${_scopeId}><!--[-->`);
              ssrRenderList(bulkActions, (action, index) => {
                _push2(`<div class="relative group"${_scopeId}><button class="${ssrRenderClass([{
                  "first:rounded-t-lg": index === 0,
                  "last:rounded-b-lg": index === bulkActions.length - 1
                }, "w-full px-4 py-2 text-left text-sm hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"])}"${ssrIncludeBooleanAttr(unref(selectedVmIds).length === 0) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(action.label)}</button>`);
                if (unref(selectedVmIds).length === 0) {
                  _push2(`<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50"${_scopeId}> VMにチェックを入れてください </div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex gap-2 items-center" }, [
                createVNode("button", {
                  class: "btn btn-primary",
                  onClick: ($event) => handleHeaderAction("create")
                }, " 新規作成 ", 8, ["onClick"]),
                createVNode("div", { class: "relative action-menu-container" }, [
                  createVNode("button", {
                    class: "btn btn-sm btn-secondary flex items-center gap-2",
                    onClick: unref(toggleActionMenu)
                  }, [
                    createTextVNode(" 操作 "),
                    (openBlock(), createBlock("svg", {
                      xmlns: "http://www.w3.org/2000/svg",
                      class: "h-4 w-4",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M19 9l-7 7-7-7"
                      })
                    ]))
                  ], 8, ["onClick"]),
                  unref(showActionMenu) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "absolute right-0 mt-2 w-48 bg-white border border-slate-300 rounded-lg shadow-xl z-50"
                  }, [
                    (openBlock(), createBlock(Fragment, null, renderList(bulkActions, (action, index) => {
                      return createVNode("div", {
                        key: action.value,
                        class: "relative group"
                      }, [
                        createVNode("button", {
                          class: ["w-full px-4 py-2 text-left text-sm hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white", {
                            "first:rounded-t-lg": index === 0,
                            "last:rounded-b-lg": index === bulkActions.length - 1
                          }],
                          disabled: unref(selectedVmIds).length === 0,
                          onClick: ($event) => handleBulkActionClick(action.value)
                        }, toDisplayString(action.label), 11, ["disabled", "onClick"]),
                        unref(selectedVmIds).length === 0 ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50"
                        }, " VMにチェックを入れてください ")) : createCommentVNode("", true)
                      ]);
                    }), 64))
                  ])) : createCommentVNode("", true)
                ])
              ])
            ];
          }
        }),
        "cell-checkbox": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<input type="checkbox"${ssrIncludeBooleanAttr(unref(selectedVmIds).includes(row.id)) ? " checked" : ""} class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"${_scopeId}>`);
          } else {
            return [
              createVNode("input", {
                type: "checkbox",
                checked: unref(selectedVmIds).includes(row.id),
                onChange: ($event) => unref(toggleVmSelection)(row.id),
                class: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              }, null, 40, ["checked", "onChange"])
            ];
          }
        }),
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/machine/${row.id}`,
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
                to: `/machine/${row.id}`,
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
        "cell-instanceType": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(row.specText)}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-sm" }, toDisplayString(row.specText), 1)
            ];
          }
        }),
        "cell-storage": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-sm"${_scopeId}>${ssrInterpolate(row.totalStorageGB)} GB </span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-sm" }, toDisplayString(row.totalStorageGB) + " GB ", 1)
            ];
          }
        }),
        "cell-node": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(row.node.name)}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-sm" }, toDisplayString(row.node.name), 1)
            ];
          }
        }),
        "cell-status": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="${ssrRenderClass([("getVmStatusDisplay" in _ctx ? _ctx.getVmStatusDisplay : unref(getVmStatusDisplay))(row.status).class, "table-status"])}"${_scopeId}>${ssrInterpolate(("getVmStatusDisplay" in _ctx ? _ctx.getVmStatusDisplay : unref(getVmStatusDisplay))(row.status).text)}</span>`);
          } else {
            return [
              createVNode("span", {
                class: ["table-status", ("getVmStatusDisplay" in _ctx ? _ctx.getVmStatusDisplay : unref(getVmStatusDisplay))(row.status).class]
              }, toDisplayString(("getVmStatusDisplay" in _ctx ? _ctx.getVmStatusDisplay : unref(getVmStatusDisplay))(row.status).text), 3)
            ];
          }
        }),
        "cell-createdAt": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-sm font-mono"${_scopeId}>${ssrInterpolate(("formatDateTime" in _ctx ? _ctx.formatDateTime : unref(formatDateTime))(row.createdAt))}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-sm font-mono" }, toDisplayString(("formatDateTime" in _ctx ? _ctx.formatDateTime : unref(formatDateTime))(row.createdAt)), 1)
            ];
          }
        }),
        "cell-cpu": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-1"${_scopeId}><div class="flex items-center justify-between text-xs"${_scopeId}><span class="font-mono"${_scopeId}>${ssrInterpolate(row.cpuUsageText)}</span><span class="text-slate-600"${_scopeId}>${ssrInterpolate(row.cpuUtilizationPercent)}%</span></div><div class="h-2 w-full rounded-full bg-slate-200"${_scopeId}><div class="h-full rounded-full bg-blue-500" style="${ssrRenderStyle({ width: `${unref(clampPercent)(row.cpuUtilizationPercent)}%` })}"${_scopeId}></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-1" }, [
                createVNode("div", { class: "flex items-center justify-between text-xs" }, [
                  createVNode("span", { class: "font-mono" }, toDisplayString(row.cpuUsageText), 1),
                  createVNode("span", { class: "text-slate-600" }, toDisplayString(row.cpuUtilizationPercent) + "%", 1)
                ]),
                createVNode("div", { class: "h-2 w-full rounded-full bg-slate-200" }, [
                  createVNode("div", {
                    class: "h-full rounded-full bg-blue-500",
                    style: { width: `${unref(clampPercent)(row.cpuUtilizationPercent)}%` }
                  }, null, 4)
                ])
              ])
            ];
          }
        }),
        "cell-memory": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-1"${_scopeId}><div class="flex items-center justify-between text-xs"${_scopeId}><span class="font-mono"${_scopeId}>${ssrInterpolate(row.memoryUsageText)}</span><span class="text-slate-600"${_scopeId}>${ssrInterpolate(row.memoryUtilizationPercent)}%</span></div><div class="h-2 w-full rounded-full bg-slate-200"${_scopeId}><div class="h-full rounded-full bg-blue-500" style="${ssrRenderStyle({ width: `${unref(clampPercent)(row.memoryUtilizationPercent)}%` })}"${_scopeId}></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-1" }, [
                createVNode("div", { class: "flex items-center justify-between text-xs" }, [
                  createVNode("span", { class: "font-mono" }, toDisplayString(row.memoryUsageText), 1),
                  createVNode("span", { class: "text-slate-600" }, toDisplayString(row.memoryUtilizationPercent) + "%", 1)
                ]),
                createVNode("div", { class: "h-2 w-full rounded-full bg-slate-200" }, [
                  createVNode("div", {
                    class: "h-full rounded-full bg-blue-500",
                    style: { width: `${unref(clampPercent)(row.memoryUtilizationPercent)}%` }
                  }, null, 4)
                ])
              ])
            ];
          }
        }),
        "row-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/machine/${row.id}`,
                class: "action-item first:border-t-0"
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
            _push2(`<button type="button" class="action-item"${_scopeId}> 編集 </button><button type="button" class="action-item action-item-danger"${ssrIncludeBooleanAttr(unref(isDeleting) && unref(targetForDeletion)?.id === row?.id) ? " disabled" : ""}${_scopeId}> 削除 </button>`);
          } else {
            return [
              row ? (openBlock(), createBlock(_component_NuxtLink, {
                key: 0,
                to: `/machine/${row.id}`,
                class: "action-item first:border-t-0"
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
                disabled: unref(isDeleting) && unref(targetForDeletion)?.id === row?.id,
                onClick: withModifiers(($event) => row && unref(handleRowAction)({ action: "delete", row }), ["stop", "prevent"])
              }, " 削除 ", 8, ["disabled", "onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(MoVirtualMachineCreate, {
        show: unref(activeModal) === unref(CREATE_VIRTUAL_MACHINE_ACTION),
        onClose: unref(cancelAction),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(MoVirtualMachineEdit, {
        show: unref(activeModal) === unref(EDIT_VIRTUAL_MACHINE_ACTION),
        vmData: unref(targetForEditing) ?? null,
        onClose: unref(cancelAction),
        onSuccess: unref(handleSuccess)
      }, null, _parent));
      _push(ssrRenderComponent(__nuxt_component_2, {
        show: unref(activeModal) === unref(DELETE_VIRTUAL_MACHINE_ACTION),
        "is-loading": unref(isDeleting),
        "resource-label": unref(MACHINE).label,
        "resource-name": unref(targetForDeletion)?.name,
        message: unref(deleteMessage),
        onClose: unref(cancelAction),
        onConfirm: unref(handleDelete)
      }, null, _parent));
      _push(ssrRenderComponent(ConfirmationModal, {
        show: unref(confirmDialog).show,
        title: unref(confirmDialog).title,
        message: unref(confirmDialog).message,
        "confirm-text": unref(confirmDialog).confirmText,
        onConfirm: executeConfirmedVmAction,
        onCancel: unref(closeConfirmDialog)
      }, null, _parent));
      _push(ssrRenderComponent(ConfirmationModal, {
        show: unref(alertDialog).show,
        title: unref(alertDialog).title,
        message: unref(alertDialog).message,
        "confirm-text": "了解",
        onConfirm: unref(closeAlertDialog),
        onCancel: unref(closeAlertDialog)
      }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/machine/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C9d9zYxu.mjs.map
