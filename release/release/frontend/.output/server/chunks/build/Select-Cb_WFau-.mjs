import __nuxt_component_1 from './index-CICjSpIO.mjs';
import { defineComponent, mergeModels, useModel, ref, computed, watch, mergeProps, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderTeleport, ssrRenderStyle, ssrRenderList, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "Select",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    label: {},
    name: {},
    pending: { type: Boolean },
    error: {},
    options: {},
    placeholder: { default: "選択してください" },
    errorMessage: {},
    required: { type: Boolean },
    placeholderValue: {},
    disabled: { type: Boolean },
    optionLabel: {},
    optionValue: {},
    columns: {},
    gridTemplateColumns: {},
    variant: { default: "default" }
  }, {
    "modelValue": {},
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const DROPDOWN_CONFIG = {
      /** ドロップダウンとトリガーボタン間のパディング(px) */
      PADDING: 8,
      /** ドロップダウンの最小高さ(px) */
      MIN_HEIGHT: 150,
      /** ドロップダウンの最大高さ(px) */
      MAX_HEIGHT: 560,
      /** ドロップダウンの最小幅(px) */
      MIN_WIDTH: 400,
      /** z-index層の優先度 */
      Z_INDEX: 9999
    };
    const model = useModel(__props, "modelValue");
    const props = __props;
    const isOpen = ref(false);
    ref(null);
    const buttonRef = ref(null);
    const dropdownContentRef = ref(null);
    const dropdownPosition = ref({
      top: 0,
      left: 0,
      width: 0,
      maxHeight: 384
    });
    const isPositioningAbove = ref(false);
    const hasMultipleColumns = computed(
      () => props.columns && props.columns.length > 0
    );
    computed(
      () => !!props.options && (props.options.length > 0 || props.placeholderValue !== void 0)
    );
    const selectedLabel = computed(() => {
      if (!model.value) return void 0;
      if (model.value === props.placeholderValue) return props.placeholder;
      const selected = props.options?.find(
        (opt) => getOptionValue(opt) === model.value
      );
      return selected ? getOptionLabel(selected) : void 0;
    });
    const buttonClasses = computed(() => [
      "w-full px-4 py-2.5 text-left border bg-white hover:bg-gray-50",
      "focus:outline-none focus:ring-2 transition duration-200",
      "flex justify-between items-center group rounded-lg",
      props.variant === "sharp" ? "border-gray-400 focus:ring-blue-600" : "border-gray-300 focus:ring-blue-500",
      props.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-100" : "",
      { "border-red-500 focus:ring-red-500": props.errorMessage }
    ]);
    const chevronClasses = computed(() => [
      "w-5 h-5 text-gray-500 transition-transform duration-200",
      { "rotate-180": isOpen.value }
    ]);
    const dropdownContainerClasses = computed(() => [
      `fixed bg-white border border-gray-300 rounded-lg shadow-lg`,
      `z-[${DROPDOWN_CONFIG.Z_INDEX}] overflow-y-auto`
    ]);
    const dropdownHeaderClasses = computed(() => [
      "sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200",
      "grid gap-4 text-sm font-semibold text-gray-700"
    ]);
    const dropdownPositionStyle = computed(() => ({
      top: `${dropdownPosition.value.top}px`,
      left: `${dropdownPosition.value.left}px`,
      width: `${dropdownPosition.value.width}px`,
      minWidth: `${DROPDOWN_CONFIG.MIN_WIDTH}px`,
      maxHeight: `${dropdownPosition.value.maxHeight}px`
    }));
    const calculateDropdownPosition = () => {
      if (!buttonRef.value) return;
      const rect = buttonRef.value.getBoundingClientRect();
      const viewportHeight = (void 0).innerHeight;
      const viewportWidth = (void 0).innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      let top;
      let maxHeight;
      let positionAbove = false;
      if (spaceBelow >= DROPDOWN_CONFIG.MAX_HEIGHT + DROPDOWN_CONFIG.PADDING) {
        top = rect.bottom + DROPDOWN_CONFIG.PADDING;
        maxHeight = DROPDOWN_CONFIG.MAX_HEIGHT;
        positionAbove = false;
      } else if (spaceAbove >= DROPDOWN_CONFIG.MAX_HEIGHT + DROPDOWN_CONFIG.PADDING) {
        top = rect.top - DROPDOWN_CONFIG.MAX_HEIGHT - DROPDOWN_CONFIG.PADDING;
        maxHeight = DROPDOWN_CONFIG.MAX_HEIGHT;
        positionAbove = true;
      } else if (spaceBelow >= spaceAbove) {
        top = rect.bottom + DROPDOWN_CONFIG.PADDING;
        maxHeight = Math.max(
          DROPDOWN_CONFIG.MIN_HEIGHT,
          spaceBelow - DROPDOWN_CONFIG.PADDING
        );
        positionAbove = false;
      } else {
        const availableHeight = Math.max(
          DROPDOWN_CONFIG.MIN_HEIGHT,
          spaceAbove - DROPDOWN_CONFIG.PADDING
        );
        top = rect.top - availableHeight - DROPDOWN_CONFIG.PADDING;
        maxHeight = availableHeight;
        positionAbove = true;
      }
      let dropdownWidth = Math.max(rect.width, DROPDOWN_CONFIG.MIN_WIDTH);
      let left = rect.left;
      if (left + dropdownWidth > viewportWidth) {
        left = Math.max(
          DROPDOWN_CONFIG.PADDING,
          viewportWidth - dropdownWidth - DROPDOWN_CONFIG.PADDING
        );
      }
      if (left < DROPDOWN_CONFIG.PADDING) {
        left = DROPDOWN_CONFIG.PADDING;
        dropdownWidth = Math.max(
          DROPDOWN_CONFIG.MIN_WIDTH,
          viewportWidth - DROPDOWN_CONFIG.PADDING * 2
        );
      }
      dropdownPosition.value = {
        top,
        left,
        width: dropdownWidth,
        maxHeight
      };
      isPositioningAbove.value = positionAbove;
    };
    const adjustDropdownPositionForActualHeight = () => {
      if (!isPositioningAbove.value || !dropdownContentRef.value || !buttonRef.value) {
        return;
      }
      const rect = buttonRef.value.getBoundingClientRect();
      const actualHeight = dropdownContentRef.value.offsetHeight;
      const newTop = rect.top - actualHeight - DROPDOWN_CONFIG.PADDING;
      if (newTop < DROPDOWN_CONFIG.PADDING) {
        dropdownPosition.value.top = DROPDOWN_CONFIG.PADDING;
      } else {
        dropdownPosition.value.top = newTop;
      }
    };
    const recalculateDropdownPosition = async () => {
      calculateDropdownPosition();
      await nextTick();
      adjustDropdownPositionForActualHeight();
    };
    watch(isOpen, async (newVal) => {
      if (newVal) {
        await recalculateDropdownPosition();
        (void 0).addEventListener("resize", recalculateDropdownPosition);
      } else {
        (void 0).removeEventListener("resize", recalculateDropdownPosition);
      }
    });
    watch(
      () => isOpen.value,
      (newVal) => {
        if (newVal) {
          (void 0).addEventListener("scroll", recalculateDropdownPosition);
        } else {
          (void 0).removeEventListener("scroll", recalculateDropdownPosition);
        }
      }
    );
    const getOptionLabel = (option) => {
      if (!props.optionLabel) {
        return String(option.name ?? option.id ?? "");
      }
      if (typeof props.optionLabel === "function") {
        return props.optionLabel(option);
      }
      return String(
        option[props.optionLabel] ?? option.name ?? option.id ?? ""
      );
    };
    const getOptionValue = (option) => {
      if (!props.optionValue) {
        return option.id ?? "";
      }
      if (typeof props.optionValue === "function") {
        return props.optionValue(option);
      }
      return option[props.optionValue] ?? option.id ?? "";
    };
    const getOptionButtonClasses = (isSelected, hasBorder) => [
      "w-full px-4 py-3 text-left hover:bg-blue-50 transition",
      "duration-150 focus:outline-none focus:bg-blue-100",
      "text-sm flex items-center justify-between",
      isSelected ? "bg-blue-100" : "",
      hasBorder ? "border-b border-gray-200" : ""
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative w-full" }, _attrs))} data-v-fb4d7358>`);
      if (__props.label) {
        _push(`<label${ssrRenderAttr("for", __props.name)} class="form-label-sm" data-v-fb4d7358>${ssrInterpolate(__props.label)} `);
        if (__props.required) {
          _push(`<span class="required-asterisk" data-v-fb4d7358>*</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</label>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.pending) {
        _push(`<div class="text-loading" data-v-fb4d7358>${ssrInterpolate(__props.label)}一覧を読み込み中... </div>`);
      } else if (__props.error) {
        _push(`<div class="text-error" data-v-fb4d7358>${ssrInterpolate(__props.label)}一覧の取得に失敗しました。 </div>`);
      } else {
        _push(`<div data-v-fb4d7358><button${ssrRenderAttr("id", __props.name)} type="button"${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""} class="${ssrRenderClass(buttonClasses.value)}" data-v-fb4d7358><span class="truncate" data-v-fb4d7358>${ssrInterpolate(selectedLabel.value || __props.placeholder)}</span>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:chevron-down-20-solid",
          class: chevronClasses.value
        }, null, _parent));
        _push(`</button>`);
        ssrRenderTeleport(_push, (_push2) => {
          if (isOpen.value) {
            _push2(`<div class="${ssrRenderClass(dropdownContainerClasses.value)}" style="${ssrRenderStyle(dropdownPositionStyle.value)}" data-v-fb4d7358>`);
            if (hasMultipleColumns.value) {
              _push2(`<div class="${ssrRenderClass(dropdownHeaderClasses.value)}" style="${ssrRenderStyle({ gridTemplateColumns: __props.gridTemplateColumns })}" data-v-fb4d7358><!--[-->`);
              ssrRenderList(__props.columns, (column) => {
                _push2(`<div data-v-fb4d7358>${ssrInterpolate(column)}</div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div data-v-fb4d7358>`);
            if (__props.placeholderValue !== void 0) {
              _push2(`<button type="button" class="${ssrRenderClass(getOptionButtonClasses(model.value === __props.placeholderValue, true))}" data-v-fb4d7358><span data-v-fb4d7358>${ssrInterpolate(__props.placeholder)}</span>`);
              if (model.value === __props.placeholderValue) {
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "heroicons:check-20-solid",
                  class: "w-5 h-5 text-blue-600"
                }, null, _parent));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList(__props.options, (option, index) => {
              _push2(`<button type="button" class="${ssrRenderClass(
                getOptionButtonClasses(
                  model.value === getOptionValue(option),
                  index < (__props.options?.length ?? 1) - 1
                )
              )}" data-v-fb4d7358>`);
              if (!_ctx.$slots.option) {
                _push2(`<div class="flex items-center justify-between w-full pointer-events-none" data-v-fb4d7358><span data-v-fb4d7358>${ssrInterpolate(getOptionLabel(option))}</span>`);
                if (model.value === getOptionValue(option)) {
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: "heroicons:check-20-solid",
                    class: "w-5 h-5 text-blue-600"
                  }, null, _parent));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<div class="w-full pointer-events-none" data-v-fb4d7358>`);
                ssrRenderSlot(_ctx.$slots, "option", {
                  option,
                  isSelected: model.value === getOptionValue(option)
                }, null, _push2, _parent);
                _push2(`</div>`);
              }
              _push2(`</button>`);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        if (__props.errorMessage) {
          _push(`<p class="text-error text-sm mt-1" data-v-fb4d7358>${ssrInterpolate(__props.errorMessage)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Form/Select.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const FormSelect = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-fb4d7358"]]), { __name: "FormSelect" });

export { FormSelect as F };
//# sourceMappingURL=Select-Cb_WFau-.mjs.map
