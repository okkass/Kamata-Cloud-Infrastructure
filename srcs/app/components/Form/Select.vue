<template>
  <div class="relative w-full">
    <label v-if="label" :for="name" class="form-label-sm">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>

    <div v-if="pending" class="text-loading">
      {{ label }}一覧を読み込み中...
    </div>

    <div v-else-if="error" class="text-error">
      {{ label }}一覧の取得に失敗しました。
    </div>

    <div v-else ref="dropdownRef">
      <!-- トリガーボタン -->
      <button
        :id="name"
        ref="buttonRef"
        type="button"
        @click="toggleDropdown"
        :disabled="disabled"
        :class="buttonClasses"
      >
        <span class="truncate">
          {{ selectedLabel || placeholder }}
        </span>
        <Icon name="heroicons:chevron-down-20-solid" :class="chevronClasses" />
      </button>

      <Teleport to="body">
        <div
          ref="dropdownContentRef"
          v-if="isOpen"
          :class="dropdownContainerClasses"
          :style="dropdownPositionStyle"
        >
          <!-- ヘッダー（複数カラムがある場合） -->
          <div
            v-if="hasMultipleColumns"
            :class="dropdownHeaderClasses"
            :style="{ gridTemplateColumns: gridTemplateColumns }"
          >
            <div v-for="column in columns" :key="column">
              {{ column }}
            </div>
          </div>

          <!-- オプション一覧 -->
          <div>
            <!-- Placeholder オプション -->
            <button
              v-if="placeholderValue !== undefined"
              @click="selectOption(placeholderValue)"
              type="button"
              :class="getOptionButtonClasses(model === placeholderValue, true)"
            >
              <span>{{ placeholder }}</span>
              <Icon
                v-if="model === placeholderValue"
                name="heroicons:check-20-solid"
                class="w-5 h-5 text-blue-600"
              />
            </button>

            <!-- 通常のオプション一覧 -->
            <button
              v-for="(option, index) in options"
              :key="getOptionValue(option)"
              @click="selectOption(getOptionValue(option), option)"
              type="button"
              :class="
                getOptionButtonClasses(
                  model === getOptionValue(option),
                  index < (options?.length ?? 1) - 1
                )
              "
            >
              <!-- シンプル表示（スロットなし） -->
              <div
                v-if="!$slots.option"
                class="flex items-center justify-between w-full pointer-events-none"
              >
                <span>{{ getOptionLabel(option) }}</span>
                <Icon
                  v-if="model === getOptionValue(option)"
                  name="heroicons:check-20-solid"
                  class="w-5 h-5 text-blue-600"
                />
              </div>

              <!-- カスタム表示（スロット使用） -->
              <div v-else class="w-full pointer-events-none">
                <slot
                  name="option"
                  :option="option"
                  :isSelected="model === getOptionValue(option)"
                />
              </div>
            </button>
          </div>
        </div>
      </Teleport>

      <!-- エラーメッセージ -->
      <p v-if="errorMessage" class="text-error text-sm mt-1">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * リッチ Select フォームコンポーネント
 * =================================================================================
 *
 * Tailwind CSS を使用したカスタムドロップダウンメニューコンポーネント。
 *
 * 特徴:
 * - テーブル風レイアウト対応（複数カラム表示可能）
 * - カスタムスロット対応（リッチなオプション表示が可能）
 * - 動的位置計算（画面の隙間に応じて上下に自動配置）
 * - レスポンシブ高さ調整（項目数に応じて高さを最適化）
 * - Teleport による z-index 管理（モーダルの上に表示確保）
 *
 * 使用例:
 * ```vue
 * <FormSelect
 *   :options="items"
 *   :columns="['名前', '容量']"
 *   grid-template-columns="2fr 1fr"
 *   v-model="selectedId"
 * >
 *   <template #option="{ option }">
 *     <div class="grid gap-4">
 *       <span>{{ option.name }}</span>
 *       <span>{{ option.capacity }}</span>
 *     </div>
 *   </template>
 * </FormSelect>
 * ```
 * =================================================================================
 */
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({
  inheritAttrs: false,
});

/**
 * ==============================================================================
 * Constants - マジックナンバーを一元管理
 * ==============================================================================
 */
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
  Z_INDEX: 9999,
} as const;

/**
 * ==============================================================================
 * Type Definitions
 * ==============================================================================
 */
interface Option {
  id?: string | number;
  name?: string;
  [key: string]: any;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

/**
 * ==============================================================================
 * v-model & Attributes
 * ==============================================================================
 */
const model = defineModel<string | number | null | undefined>();

/**
 * ==============================================================================
 * Props - コンポーネント プロパティ
 * ==============================================================================
 */
const props = withDefaults(
  defineProps<{
    /** ラベルテキスト */
    label?: string;
    /** フォーム要素の name 属性 */
    name: string;
    /** 読み込み中かどうか */
    pending?: boolean;
    /** エラーが発生しているかどうか */
    error?: any;
    /** ドロップダウンに表示するオプション一覧 */
    options?: Option[];
    /** プレースホルダーテキスト */
    placeholder?: string;
    /** エラーメッセージ テキスト */
    errorMessage?: string;
    /** 必須かどうか（ラベルに * マークを表示） */
    required?: boolean;
    /** プレースホルダーの値（選択値として使用可能） */
    placeholderValue?: string | null | undefined;
    /** 無効状態かどうか */
    disabled?: boolean;
    /** オプションのラベルを取得する方法（キー名 or 関数） */
    optionLabel?: string | ((option: Option) => string);
    /** オプションの値を取得する方法（キー名 or 関数） */
    optionValue?: string | ((option: Option) => string | number);
    /** テーブルのカラムヘッダー配列 */
    columns?: string[];
    /** Grid のテンプレートカラム（CSS値）*/
    gridTemplateColumns?: string;
    /** スタイルバリアント: "default" (角丸) | "sharp" (直角) */
    variant?: "default" | "sharp";
  }>(),
  {
    placeholder: "選択してください",
    variant: "default",
  }
);

/**
 * ==============================================================================
 * State
 * ==============================================================================
 */
const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);
const buttonRef = ref<HTMLButtonElement | null>(null);
const dropdownContentRef = ref<HTMLDivElement | null>(null);
const dropdownPosition = ref<DropdownPosition>({
  top: 0,
  left: 0,
  width: 0,
  maxHeight: 384,
});
const isPositioningAbove = ref(false);

/**
 * ==============================================================================
 * Lifecycle
 * ==============================================================================
 */
onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});

/**
 * ==============================================================================
 * Computed Properties
 * ==============================================================================
 */
const hasMultipleColumns = computed(
  () => props.columns && props.columns.length > 0
);

const hasOptions = computed(
  () =>
    !props.options ||
    (props.options.length === 0 && props.placeholderValue === undefined)
);

const selectedLabel = computed(() => {
  if (!model.value) return undefined;
  if (model.value === props.placeholderValue) return props.placeholder;

  const selected = props.options?.find(
    (opt) => getOptionValue(opt) === model.value
  );
  return selected ? getOptionLabel(selected) : undefined;
});

const buttonClasses = computed(() => [
  "w-full px-4 py-2.5 text-left border bg-white hover:bg-gray-50",
  "focus:outline-none focus:ring-2 transition duration-200",
  "flex justify-between items-center group rounded-lg",
  props.variant === "sharp"
    ? "border-gray-400 focus:ring-blue-600"
    : "border-gray-300 focus:ring-blue-500",
  props.disabled
    ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-100"
    : "",
  { "border-red-500 focus:ring-red-500": props.errorMessage },
]);

const chevronClasses = computed(() => [
  "w-5 h-5 text-gray-500 transition-transform duration-200",
  { "rotate-180": isOpen.value },
]);

const dropdownContainerClasses = computed(() => [
  `fixed bg-white border border-gray-300 rounded-lg shadow-lg`,
  `z-[${DROPDOWN_CONFIG.Z_INDEX}] overflow-y-auto`,
]);

const dropdownHeaderClasses = computed(() => [
  "sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200",
  "grid gap-4 text-sm font-semibold text-gray-700",
]);

const dropdownPositionStyle = computed(() => ({
  top: `${dropdownPosition.value.top}px`,
  left: `${dropdownPosition.value.left}px`,
  width: `${dropdownPosition.value.width}px`,
  minWidth: `${DROPDOWN_CONFIG.MIN_WIDTH}px`,
  maxHeight: `${dropdownPosition.value.maxHeight}px`,
}));

/**
 * ドロップダウンの表示位置と高さを計算（画面の隙間に応じて調整）
 *
 * このメソッドは以下の判定を行います：
 * 1. 下方に十分な空きがあるか
 * 2. 上方に十分な空きがあるか
 * 3. どちらが空きが大きいか
 *
 * 判定に基づいて最適な方向にドロップダウンを配置し、
 * 画面内に収まるように maxHeight を調整します。
 */
const calculateDropdownPosition = (): void => {
  if (!buttonRef.value) return;

  const rect = buttonRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // 下方向の空き
  const spaceBelow = viewportHeight - rect.bottom;
  // 上方向の空き
  const spaceAbove = rect.top;

  let top: number;
  let maxHeight: number;
  let positionAbove = false;

  // 下に十分な空きがある場合は下に開く
  if (spaceBelow >= DROPDOWN_CONFIG.MAX_HEIGHT + DROPDOWN_CONFIG.PADDING) {
    // ビューポート相対座標で計算（scrollY を加算しない）
    top = rect.bottom + DROPDOWN_CONFIG.PADDING;
    maxHeight = DROPDOWN_CONFIG.MAX_HEIGHT;
    positionAbove = false;
  }
  // 上に十分な空きがある場合は上に開く
  else if (spaceAbove >= DROPDOWN_CONFIG.MAX_HEIGHT + DROPDOWN_CONFIG.PADDING) {
    top = rect.top - DROPDOWN_CONFIG.MAX_HEIGHT - DROPDOWN_CONFIG.PADDING;
    maxHeight = DROPDOWN_CONFIG.MAX_HEIGHT;
    positionAbove = true;
  }
  // 下に開く（制限あり）
  else if (spaceBelow >= spaceAbove) {
    top = rect.bottom + DROPDOWN_CONFIG.PADDING;
    maxHeight = Math.max(
      DROPDOWN_CONFIG.MIN_HEIGHT,
      spaceBelow - DROPDOWN_CONFIG.PADDING
    );
    positionAbove = false;
  }
  // 上に開く（制限あり）
  else {
    const availableHeight = Math.max(
      DROPDOWN_CONFIG.MIN_HEIGHT,
      spaceAbove - DROPDOWN_CONFIG.PADDING
    );
    top = rect.top - availableHeight - DROPDOWN_CONFIG.PADDING;
    maxHeight = availableHeight;
    positionAbove = true;
  }

  // 画面外にはみ出さないように左右を調整
  let dropdownWidth = Math.max(rect.width, DROPDOWN_CONFIG.MIN_WIDTH);
  let left = rect.left;

  // 画面右側からはみ出す場合、左寄せに調整
  if (left + dropdownWidth > viewportWidth) {
    left = Math.max(
      DROPDOWN_CONFIG.PADDING,
      viewportWidth - dropdownWidth - DROPDOWN_CONFIG.PADDING
    );
  }
  // 画面左側からはみ出す場合、右寄せに調整
  if (left < DROPDOWN_CONFIG.PADDING) {
    left = DROPDOWN_CONFIG.PADDING;
    // それでも画面に収まらない場合は幅を縮小
    dropdownWidth = Math.max(
      DROPDOWN_CONFIG.MIN_WIDTH,
      viewportWidth - DROPDOWN_CONFIG.PADDING * 2
    );
  }

  dropdownPosition.value = {
    top,
    left,
    width: dropdownWidth,
    maxHeight,
  };
  isPositioningAbove.value = positionAbove;
};

/**
 * 上に出ている場合の位置調整
 *
 * 上に出すドロップダウンの場合、レンダリング直後の実際の高さを測定して、
 * 初期計算値とのズレを補正します。これにより、項目が少ないときの
 * 無駄な空白を排除できます。
 */
const adjustDropdownPositionForActualHeight = (): void => {
  if (
    !isPositioningAbove.value ||
    !dropdownContentRef.value ||
    !buttonRef.value
  ) {
    return;
  }

  const rect = buttonRef.value.getBoundingClientRect();

  // ドロップダウンの実際の高さを取得
  const actualHeight = dropdownContentRef.value.offsetHeight;

  // 上に出ている場合、ボタン位置から実際の高さを引いた位置に調整
  const newTop = rect.top - actualHeight - DROPDOWN_CONFIG.PADDING;

  // 画面上部から padding だけ離す
  if (newTop < DROPDOWN_CONFIG.PADDING) {
    dropdownPosition.value.top = DROPDOWN_CONFIG.PADDING;
  } else {
    dropdownPosition.value.top = newTop;
  }
};

/**
 * ドロップダウン位置の完全再計算
 *
 * 位置計算 → DOM 描画待機 → 高さ測定・調整を一連で実行します。
 * リサイズやスクロール時に呼び出されます。
 */
const recalculateDropdownPosition = async (): Promise<void> => {
  calculateDropdownPosition();
  await nextTick();
  adjustDropdownPositionForActualHeight();
};

/**
 * isOpen が変更されたときに、ドロップダウンの位置を計算
 */
watch(isOpen, async (newVal) => {
  if (newVal) {
    await recalculateDropdownPosition();
    // ウィンドウのリサイズ時にも位置を更新（高さ調整を含む）
    window.addEventListener("resize", recalculateDropdownPosition);
  } else {
    window.removeEventListener("resize", recalculateDropdownPosition);
  }
});

/**
 * スクロール時にドロップダウンの位置を更新
 */
watch(
  () => isOpen.value,
  (newVal) => {
    if (newVal) {
      window.addEventListener("scroll", recalculateDropdownPosition);
    } else {
      window.removeEventListener("scroll", recalculateDropdownPosition);
    }
  }
);

/**
 * ==============================================================================
 * Methods - ハンドラーとユーティリティ関数
 * ==============================================================================
 */

/**
 * オプションのラベルを取得します
 * @param option - オプションオブジェクト
 * @returns ラベル文字列（optionLabel が string の場合はプロパティ値、
 *          function の場合は関数の戻り値）
 */
const getOptionLabel = (option: Option): string => {
  if (!props.optionLabel) {
    return String(option.name ?? option.id ?? "");
  }
  if (typeof props.optionLabel === "function") {
    return props.optionLabel(option);
  }
  return String(
    option[props.optionLabel as keyof Option] ?? option.name ?? option.id ?? ""
  );
};

/**
 * オプションの値を取得します
 * @param option - オプションオブジェクト
 * @returns 値（optionValue が string の場合はプロパティ値、
 *          function の場合は関数の戻り値）
 */
const getOptionValue = (option: Option): string | number => {
  if (!props.optionValue) {
    return option.id ?? "";
  }
  if (typeof props.optionValue === "function") {
    return props.optionValue(option);
  }
  return option[props.optionValue as keyof Option] ?? option.id ?? "";
};

/**
 * ドロップダウンの開閉をトグルします
 */
const toggleDropdown = (): void => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

/**
 * オプションを選択して、ドロップダウンを閉じます
 * @param value - 選択する値
 * @param _option - 選択されたオプションオブジェクト（スロット側で使用可能）
 */
const selectOption = (
  value: string | number | null | undefined,
  _option?: Option
): void => {
  model.value = value;
  isOpen.value = false;
};

/**
 * オプションボタンのクラスを生成します
 * @param isSelected - 選択状態かどうか
 * @param hasBorder - 下部ボーダーを表示するか
 * @returns Tailwind クラス配列
 */
const getOptionButtonClasses = (
  isSelected: boolean,
  hasBorder: boolean
): string[] => [
  "w-full px-4 py-3 text-left hover:bg-blue-50 transition",
  "duration-150 focus:outline-none focus:bg-blue-100",
  "text-sm flex items-center justify-between",
  isSelected ? "bg-blue-100" : "",
  hasBorder ? "border-b border-gray-200" : "",
];

/**
 * ドロップダウン外をクリックした際の処理
 * ドロップダウンを閉じます。
 * @param event - クリックイベント
 */
const handleDocumentClick = (event: MouseEvent): void => {
  if (!dropdownRef.value) return;

  const target = event.target as HTMLElement;
  if (dropdownRef.value.contains(target)) return;

  isOpen.value = false;
};
</script>

<style scoped>
/* スクロールバーのカスタマイズ */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
