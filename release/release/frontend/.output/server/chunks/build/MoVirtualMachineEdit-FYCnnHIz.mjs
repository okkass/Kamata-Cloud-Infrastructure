import { _ as _sfc_main$4 } from './BaseModal-XreF1fHA.mjs';
import { defineComponent, computed, watch, mergeProps, withCtx, unref, isRef, createBlock, openBlock, createCommentVNode, createVNode, toDisplayString, Fragment, renderList, withDirectives, vShow, ref, mergeModels, useModel, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderAttrs } from 'vue/server-renderer';
import { u as useToast, q as convertUnitToByte, c as convertByteToUnit } from './server.mjs';
import { u as useResourceUpdater } from './useResourceUpdater-D_YM1lnm.mjs';
import { F as FormInput } from './Input-jfnKbGQs.mjs';
import { S as StorageConfigTable } from './StorageConfigTable-BkExsU01.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
import { F as FormSelect } from './Select-Cb_WFau-.mjs';

const useVirtualMachineEditForm = () => {
  const { addToast } = useToast();
  const activeTab = ref("general");
  const {
    editedData,
    // これを各タブの v-model に渡します
    isSaving,
    init,
    save: saveResource,
    // 名前重複回避のためエイリアス
    isDirty
  } = useResourceUpdater();
  const updaterError = ref(null);
  const validationErrors = computed(() => {
    const errors = {
      storages: {},
      networkInterfaces: {}
    };
    const data = editedData.value;
    if (!data) return errors;
    if (!data.name || !data.name.trim()) errors.name = "名前は必須です。";
    if (!data.cpuCore || data.cpuCore < 1)
      errors.cpuCore = "1以上の値を指定してください。";
    if (!data.memorySize || data.memorySize < 1)
      errors.memorySize = "1以上の値を指定してください。";
    if (!data.securityGroups || data.securityGroups.length === 0) {
      errors.securityGroups = "セキュリティグループは1つ以上必須です。";
    }
    if (data.storages) {
      data.storages.forEach((s, index) => {
        const storageErrors = {};
        if (!s.name || !s.name.trim()) storageErrors.name = "名前は必須です。";
        if (!s.size || s.size <= 0)
          storageErrors.size = "正の数値を指定してください。";
        if (!s.poolId) storageErrors.poolId = "プールを選択してください。";
        if (Object.keys(storageErrors).length > 0) {
          errors.storages[index] = storageErrors;
        }
      });
    }
    if (data.networkInterfaces) {
      data.networkInterfaces.forEach((nic, index) => {
        const nicErrors = {};
        if (!nic.networkId)
          nicErrors.networkId = "ネットワークを選択してください。";
        if (!nic.subnetId)
          nicErrors.subnetId = "サブネットを選択してください。";
        if (Object.keys(nicErrors).length > 0) {
          errors.networkInterfaces[index] = nicErrors;
        }
      });
    }
    return errors;
  });
  const isValid = computed(() => {
    const e = validationErrors.value;
    if (e.name || e.cpuCore || e.memorySize || e.securityGroups) return false;
    if (Object.keys(e.storages).length > 0) return false;
    if (Object.keys(e.networkInterfaces).length > 0) return false;
    return true;
  });
  const canSave = computed(() => isDirty.value && isValid.value);
  const initializeForm = (data) => {
    const formattedData = {
      ...data,
      memorySize: convertByteToUnit(data.memorySize, "MB"),
      storages: data.storages?.map((storage) => ({
        ...storage,
        size: convertByteToUnit(storage.size, "GB"),
        poolId: storage.pool?.id
      })),
      networkInterfaces: data.networkInterfaces?.map(
        (iface) => ({
          ...iface,
          subnetId: iface.subnet?.id,
          networkId: iface.subnet?.parent?.id
        })
      )
    };
    const id = data.id;
    const config = {
      base: {
        // Base情報の PATCH 先: /api/virtual-machines/{id}
        endpoint: `virtual-machines/${id}`,
        fields: ["name", "description", "cpuCore", "memorySize"]
      },
      collections: {
        storages: {
          endpoint: "",
          // bulk使用時は未使用
          // Bulk送信先: /api/virtual-machines/${id}/storages/bulk
          bulkEndpoint: `virtual-machines/${id}/storages/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          // UI側で新規作成時に "new-xxx" というIDを振る必要があります
          fields: ["name", "size", "poolId", "type"],
          bulkKeys: { add: "add", update: "patch", delete: "remove" }
        },
        networkInterfaces: {
          endpoint: "",
          bulkEndpoint: `virtual-machines/${id}/network-interfaces/bulk`,
          idKey: "id",
          // ネットワークIF自体がIDを持つ前提
          newIdPrefix: "new-",
          fields: ["subnetId"],
          bulkKeys: { add: "add", update: "patch", delete: "remove" }
        },
        securityGroups: {
          endpoint: "",
          bulkEndpoint: `virtual-machines/${id}/security-groups/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: [],
          // SGはIDの紐付けのみなのでフィールド監視は不要
          bulkKeys: { add: "add", delete: "remove" },
          isAttachable: true
        }
      }
    };
    init(formattedData, config);
    updaterError.value = null;
    activeTab.value = "general";
  };
  const save = async (emit) => {
    if (!editedData.value) return;
    if (!isDirty.value) {
      addToast({ type: "warning", message: "変更がありません。" });
      return;
    }
    if (!isValid.value) {
      addToast({ type: "error", message: "入力内容に不備があります。" });
      return;
    }
    isSaving.value = true;
    updaterError.value = null;
    let currentMemoryMB = 0;
    let currentStoragesGB = [];
    try {
      currentMemoryMB = editedData.value.memorySize;
      editedData.value.memorySize = convertUnitToByte(currentMemoryMB, "MB");
      if (editedData.value.storages) {
        currentStoragesGB = JSON.parse(
          JSON.stringify(editedData.value.storages)
        );
        editedData.value.storages = editedData.value.storages.map(
          (storage) => {
            if (String(storage.id).startsWith("new-")) {
              return {
                ...storage,
                size: convertUnitToByte(storage.size, "GB")
              };
            }
            return storage;
          }
        );
      }
      const success = await saveResource();
      editedData.value.memorySize = currentMemoryMB;
      if (editedData.value.storages && currentStoragesGB.length > 0) {
        editedData.value.storages = currentStoragesGB;
      }
      if (success) {
        addToast({ type: "success", message: "保存しました。" });
        emit("success");
        emit("close");
      } else {
        updaterError.value = "保存に失敗しました。";
        addToast({ type: "error", message: "保存に失敗しました。" });
      }
    } catch (err) {
      console.error(err);
      updaterError.value = "予期せぬエラーが発生しました。";
      addToast({ type: "error", message: "予期せぬエラーが発生しました。" });
      if (currentMemoryMB) editedData.value.memorySize = currentMemoryMB;
      if (currentStoragesGB.length > 0 && editedData.value && editedData.value.storages) {
        editedData.value.storages = currentStoragesGB;
      }
    } finally {
      isSaving.value = false;
    }
  };
  return {
    activeTab,
    editedData,
    isSaving,
    isDirty,
    isValid,
    validationErrors,
    canSave,
    // UI側でボタンのdisabled制御に使用
    updaterError,
    initializeForm,
    save
  };
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "VmEditTabGeneral",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    errors: {}
  }, {
    "modelValue": { required: true },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6" }, _attrs))}><div class="max-w-xl">`);
      _push(ssrRenderComponent(FormInput, {
        label: "名前",
        name: "name",
        modelValue: model.value.name,
        "onUpdate:modelValue": ($event) => model.value.name = $event,
        error: __props.errors?.name,
        placeholder: "例: web-server-01",
        required: "",
        class: "w-full"
      }, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-edit-tabs/VmEditTabGeneral.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const TabGeneral = Object.assign(_sfc_main$3, { __name: "VmEditTabsVmEditTabGeneral" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "VmEditTabConfig",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    errors: {}
  }, {
    "modelValue": { required: true },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const { data: poolData, pending } = useResourceList("storage-pools");
    const storagePools = computed(() => poolData.value || []);
    const handleAddStorage = () => {
      if (!model.value.storages) {
        model.value.storages = [];
      }
      const defaultPoolId = storagePools.value[0]?.id ?? "";
      model.value.storages.push({
        // 一時ID ("new-")
        id: `new-${Date.now()}`,
        name: `disk-${model.value.storages.length + 1}`,
        size: 20,
        poolId: defaultPoolId,
        type: "data"
      });
    };
    const handleRemoveStorage = (index) => {
      model.value.storages.splice(index, 1);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 h-full overflow-y-auto" }, _attrs))}><div class="max-w-4xl space-y-8"><section><h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"></path></svg> コンピュート設定 </h3><div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">`);
      _push(ssrRenderComponent(FormInput, {
        label: "CPUコア数",
        name: "cpuCore",
        type: "number",
        modelValue: model.value.cpuCore,
        "onUpdate:modelValue": ($event) => model.value.cpuCore = $event,
        modelModifiers: { number: true },
        error: __props.errors?.cpuCore,
        min: 1,
        required: "",
        placeholder: "例: 2"
      }, {
        suffix: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="ml-2 text-gray-500 text-sm"${_scopeId}>Core</span>`);
          } else {
            return [
              createVNode("span", { class: "ml-2 text-gray-500 text-sm" }, "Core")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(FormInput, {
        label: "メモリサイズ",
        name: "memorySize",
        type: "number",
        modelValue: model.value.memorySize,
        "onUpdate:modelValue": ($event) => model.value.memorySize = $event,
        modelModifiers: { number: true },
        error: __props.errors?.memorySize,
        min: 1,
        required: "",
        placeholder: "例: 4096"
      }, {
        suffix: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="ml-2 text-gray-500 text-sm"${_scopeId}>MB</span>`);
          } else {
            return [
              createVNode("span", { class: "ml-2 text-gray-500 text-sm" }, "MB")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section><hr class="border-gray-200"><section><h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"></path></svg> ストレージ構成 </h3>`);
      if (unref(pending)) {
        _push(`<div class="text-sm text-gray-500 mb-2"> ストレージプール情報を取得中... </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(StorageConfigTable, {
        storages: model.value.storages,
        "storage-pools": storagePools.value,
        errors: __props.errors?.storages,
        onAdd: handleAddStorage,
        onRemove: handleRemoveStorage
      }, null, _parent));
      _push(`</section></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-edit-tabs/VmEditTabConfig.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const TabConfig = Object.assign(_sfc_main$2, { __name: "VmEditTabsVmEditTabConfig" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "VmEditTabNetwork",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    errors: {}
  }, {
    "modelValue": { required: true },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const {
      data: networkMaster,
      pending: networksPending,
      error: networksError
    } = useResourceList("virtual-networks");
    const { data: securityGroupMaster, error: sgError } = useResourceList("security-groups");
    const networkOptions = computed(() => {
      return (networkMaster.value || []).map((net) => ({
        id: net.id,
        name: `${net.name} (${net.cidr})`
      }));
    });
    const getSubnetOptions = (networkId) => {
      if (!networkId) return [];
      const network = networkMaster.value?.find((n) => n.id === networkId);
      if (!network || !network.subnets) return [];
      return network.subnets.map((subnet) => ({
        id: subnet.id,
        name: `${subnet.name} (${subnet.cidr})`
      }));
    };
    const selectedSgId = ref("");
    const availableSgOptions = computed(() => {
      const currentIds = new Set(
        (model.value?.securityGroups || []).map(
          (sg) => sg.id
        )
      );
      return (securityGroupMaster.value || []).filter((sg) => !currentIds.has(sg.id)).map((sg) => ({
        id: sg.id,
        name: sg.name
      }));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 h-full overflow-y-auto" }, _attrs))}><div class="max-w-4xl space-y-8"><section><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-medium text-gray-900 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"></path></svg> ネットワークインターフェース </h3><button type="button" class="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"> + インターフェース追加 </button></div>`);
      if (unref(networksPending)) {
        _push(`<div class="text-sm text-gray-500 mb-2"> ネットワーク情報を取得中... </div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(networksError)) {
        _push(`<div class="text-sm text-red-500 mb-2"> ネットワーク情報の取得に失敗しました。 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-4"><!--[-->`);
      ssrRenderList(model.value.networkInterfaces, (iface, index) => {
        _push(`<div class="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group"><div class="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">`);
        _push(ssrRenderComponent(FormSelect, {
          label: "接続ネットワーク",
          name: `net-id-${index}`,
          modelValue: iface.networkId,
          "onUpdate:modelValue": [($event) => iface.networkId = $event, ($event) => iface.subnetId = ""],
          options: networkOptions.value,
          errorMessage: __props.errors?.networkInterfaces?.[index]?.networkId,
          placeholder: "ネットワークを選択"
        }, null, _parent));
        _push(ssrRenderComponent(FormSelect, {
          label: "サブネット",
          name: `subnet-id-${index}`,
          modelValue: iface.subnetId,
          "onUpdate:modelValue": ($event) => iface.subnetId = $event,
          options: getSubnetOptions(iface.networkId),
          errorMessage: __props.errors?.networkInterfaces?.[index]?.subnetId,
          placeholder: "サブネットを選択",
          disabled: !iface.networkId
        }, null, _parent));
        _push(ssrRenderComponent(FormInput, {
          label: "IPアドレス",
          name: `ip-${index}`,
          modelValue: iface.ipAddress,
          "onUpdate:modelValue": ($event) => iface.ipAddress = $event,
          placeholder: "自動割り当て",
          readonly: "",
          class: "bg-gray-200 text-gray-500 cursor-not-allowed"
        }, null, _parent));
        _push(`</div><button type="button" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition-colors" title="削除"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path></svg></button></div>`);
      });
      _push(`<!--]-->`);
      if (!model.value.networkInterfaces || model.value.networkInterfaces.length === 0) {
        _push(`<div class="text-center text-gray-400 py-8 border-2 border-dashed rounded-lg"> インターフェースがありません </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><hr class="border-gray-200"><section><h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"></path></svg> セキュリティグループ </h3>`);
      if (unref(sgError)) {
        _push(`<div class="text-sm text-red-500 mb-2"> セキュリティグループ情報の取得に失敗しました。 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-2 mb-4">`);
      _push(ssrRenderComponent(FormSelect, {
        name: "sg-select",
        modelValue: selectedSgId.value,
        "onUpdate:modelValue": ($event) => selectedSgId.value = $event,
        options: availableSgOptions.value,
        placeholder: "セキュリティグループを追加...",
        class: "w-64"
      }, null, _parent));
      _push(`<button type="button"${ssrIncludeBooleanAttr(!selectedSgId.value) ? " disabled" : ""} class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> 追加 </button></div><div class="flex flex-wrap gap-2"><!--[-->`);
      ssrRenderList(model.value.securityGroups, (sg, index) => {
        _push(`<div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">${ssrInterpolate(sg.name)} <button type="button" class="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-800 transition-colors"><span class="sr-only">削除</span><svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
      });
      _push(`<!--]-->`);
      if (!model.value.securityGroups || model.value.securityGroups.length === 0) {
        _push(`<div class="text-sm text-gray-400 py-1"> 割り当てなし </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.errors?.securityGroups) {
        _push(`<div class="text-sm text-red-500 mt-1">${ssrInterpolate(__props.errors.securityGroups)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/vm-edit-tabs/VmEditTabNetwork.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const TabNetwork = Object.assign(_sfc_main$1, { __name: "VmEditTabsVmEditTabNetwork" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MoVirtualMachineEdit",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean, required: true },
    vmData: {
      type: Object,
      default: null
    }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const tabs = [
      { id: "general", label: "一般" },
      { id: "config", label: "コンピュート・ストレージ" },
      { id: "network", label: "ネットワーク" }
    ];
    const {
      activeTab,
      editedData,
      isSaving,
      updaterError,
      initializeForm,
      save,
      validationErrors,
      canSave
    } = useVirtualMachineEditForm();
    const currentTabIndex = computed(
      () => tabs.findIndex((t) => t.id === activeTab.value)
    );
    const isFirstTab = computed(() => currentTabIndex.value === 0);
    const isLastTab = computed(() => currentTabIndex.value === tabs.length - 1);
    const prevTab = () => {
      if (!isFirstTab.value) {
        const prev = tabs[currentTabIndex.value - 1];
        if (prev) {
          activeTab.value = prev.id;
        }
      }
    };
    const nextTab = () => {
      if (!isLastTab.value) {
        const next = tabs[currentTabIndex.value + 1];
        if (next) {
          activeTab.value = next.id;
        }
      }
    };
    watch(
      () => props.show,
      (open) => {
        if (open && props.vmData) {
          console.log("初期化を開始します:", props.vmData);
          initializeForm(props.vmData);
        }
      }
    );
    const submitForm = () => {
      save(emit);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseModal = _sfc_main$4;
      _push(ssrRenderComponent(_component_BaseModal, mergeProps({
        show: __props.show,
        title: "仮想マシン編集",
        onClose: ($event) => _ctx.$emit("close"),
        size: "xl"
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="modal-footer flex justify-between w-full"${_scopeId}><div${_scopeId}></div><div class="flex gap-2"${_scopeId}><button type="button" class="btn btn-secondary"${ssrIncludeBooleanAttr(isFirstTab.value || unref(isSaving)) ? " disabled" : ""}${_scopeId}> 戻る </button>`);
            if (!isLastTab.value) {
              _push2(`<button type="button" class="btn btn-primary"${ssrIncludeBooleanAttr(unref(isSaving)) ? " disabled" : ""}${_scopeId}> 次へ </button>`);
            } else {
              _push2(`<button type="button" class="btn btn-primary"${ssrIncludeBooleanAttr(!unref(canSave)) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(isSaving) ? "保存中..." : "保存")}</button>`);
            }
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "modal-footer flex justify-between w-full" }, [
                createVNode("div"),
                createVNode("div", { class: "flex gap-2" }, [
                  createVNode("button", {
                    type: "button",
                    onClick: prevTab,
                    class: "btn btn-secondary",
                    disabled: isFirstTab.value || unref(isSaving)
                  }, " 戻る ", 8, ["disabled"]),
                  !isLastTab.value ? (openBlock(), createBlock("button", {
                    key: 0,
                    type: "button",
                    onClick: nextTab,
                    class: "btn btn-primary",
                    disabled: unref(isSaving)
                  }, " 次へ ", 8, ["disabled"])) : (openBlock(), createBlock("button", {
                    key: 1,
                    type: "button",
                    onClick: submitForm,
                    class: "btn btn-primary",
                    disabled: !unref(canSave)
                  }, toDisplayString(unref(isSaving) ? "保存中..." : "保存"), 9, ["disabled"]))
                ])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!unref(editedData)) {
              _push2(`<div class="p-12 text-center text-gray-500"${_scopeId}> 読み込み中... </div>`);
            } else {
              _push2(`<div class="flex flex-col h-full"${_scopeId}>`);
              if (unref(updaterError)) {
                _push2(`<div class="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm"${_scopeId}>${ssrInterpolate(unref(updaterError))}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="flex border-b mb-6"${_scopeId}><!--[-->`);
              ssrRenderList(tabs, (tab) => {
                _push2(`<button type="button" class="${ssrRenderClass([
                  unref(activeTab) === tab.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200"
                ])}"${_scopeId}>${ssrInterpolate(tab.label)}</button>`);
              });
              _push2(`<!--]--></div><div class="flex-1 overflow-y-auto px-1"${_scopeId}>`);
              if (unref(editedData)) {
                _push2(ssrRenderComponent(TabGeneral, {
                  style: unref(activeTab) === "general" ? null : { display: "none" },
                  modelValue: unref(editedData),
                  "onUpdate:modelValue": ($event) => isRef(editedData) ? editedData.value = $event : null,
                  errors: unref(validationErrors)
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(editedData)) {
                _push2(ssrRenderComponent(TabConfig, {
                  style: unref(activeTab) === "config" ? null : { display: "none" },
                  modelValue: unref(editedData),
                  "onUpdate:modelValue": ($event) => isRef(editedData) ? editedData.value = $event : null,
                  errors: unref(validationErrors)
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(editedData)) {
                _push2(ssrRenderComponent(TabNetwork, {
                  style: unref(activeTab) === "network" ? null : { display: "none" },
                  modelValue: unref(editedData),
                  "onUpdate:modelValue": ($event) => isRef(editedData) ? editedData.value = $event : null,
                  errors: unref(validationErrors)
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            }
          } else {
            return [
              !unref(editedData) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "p-12 text-center text-gray-500"
              }, " 読み込み中... ")) : (openBlock(), createBlock("div", {
                key: 1,
                class: "flex flex-col h-full"
              }, [
                unref(updaterError) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "mb-4 bg-red-50 text-red-600 p-3 rounded text-sm"
                }, toDisplayString(unref(updaterError)), 1)) : createCommentVNode("", true),
                createVNode("div", { class: "flex border-b mb-6" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(tabs, (tab) => {
                    return createVNode("button", {
                      key: tab.id,
                      type: "button",
                      onClick: ($event) => activeTab.value = tab.id,
                      class: [
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200",
                        unref(activeTab) === tab.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      ]
                    }, toDisplayString(tab.label), 11, ["onClick"]);
                  }), 64))
                ]),
                createVNode("div", { class: "flex-1 overflow-y-auto px-1" }, [
                  unref(editedData) ? withDirectives((openBlock(), createBlock(TabGeneral, {
                    key: 0,
                    modelValue: unref(editedData),
                    "onUpdate:modelValue": ($event) => isRef(editedData) ? editedData.value = $event : null,
                    errors: unref(validationErrors)
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "errors"])), [
                    [vShow, unref(activeTab) === "general"]
                  ]) : createCommentVNode("", true),
                  unref(editedData) ? withDirectives((openBlock(), createBlock(TabConfig, {
                    key: 1,
                    modelValue: unref(editedData),
                    "onUpdate:modelValue": ($event) => isRef(editedData) ? editedData.value = $event : null,
                    errors: unref(validationErrors)
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "errors"])), [
                    [vShow, unref(activeTab) === "config"]
                  ]) : createCommentVNode("", true),
                  unref(editedData) ? withDirectives((openBlock(), createBlock(TabNetwork, {
                    key: 2,
                    modelValue: unref(editedData),
                    "onUpdate:modelValue": ($event) => isRef(editedData) ? editedData.value = $event : null,
                    errors: unref(validationErrors)
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "errors"])), [
                    [vShow, unref(activeTab) === "network"]
                  ]) : createCommentVNode("", true)
                ])
              ]))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MoVirtualMachineEdit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MoVirtualMachineEdit = Object.assign(_sfc_main, { __name: "MoVirtualMachineEdit" });

export { MoVirtualMachineEdit as M };
//# sourceMappingURL=MoVirtualMachineEdit-FYCnnHIz.mjs.map
