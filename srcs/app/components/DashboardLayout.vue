<script>
export default {
  name: "DashboardLayout",
  props: {
    title: { type: String, default: "ダッシュボード" },
    columns: { type: Array, required: true }, // [{ key, label }]
    rows: { type: Array, required: true }, // [{ ... }]
    rowKey: { type: String, default: "" },
    headerButtons: { type: Array, default: () => [] }, // [{label, action}]
    rowActions: { type: Array, default: () => [] },   // [{label, action}]
    valueClassMap: { type: Object, default: () => ({}) }, // 状態の色付け用
  },
  emits: ["header-action", "row-action"],
  data() {
    return {
      openKey: null,
      menuPos: { top: 0, left: 0 },
    };
  },
  computed: {
    hasRowActions() {
      return !!this.$slots["row-actions"] || (this.rowActions && this.rowActions.length > 0);
    },
  },
  methods: {
    keyOf(row, idx) {
      return this.rowKey ? row[this.rowKey] : idx;
    },
    onHeaderClick(btn) {
      this.$emit("header-action", btn.action);
    },
    // ▼ トグル（2回押したら閉じる）
    openMenu(evt, row, idx) {
      const k = this.keyOf(row, idx);
      if (this.openKey === k) {
        this.openKey = null;
        return;
      }
      const rect = evt.currentTarget.getBoundingClientRect();
      this.menuPos = { top: rect.bottom + 8, left: rect.left + rect.width / 2 };
      this.openKey = k;
    },
    onRowAction(row, action) {
      this.openKey = null;
      this.$emit("row-action", { action, row });
    },
    // 値 → Tailwind クラス
    cellClass(key, value) {
      const manual = this.valueClassMap?.[key];
      if (manual && manual[value]) return manual[value];

      if (key === "status") {
        if (value === "稼働中") return "text-emerald-600 font-extrabold text-[18px]";
        if (value === "停止中") return "text-red-600 font-extrabold text-[18px]";
      }
      if (value === "—" || value === "-") {
        return "text-slate-500 font-bold tracking-wider";
      }
      return "";
    },
    handleDocClick(e) {
      if (e.target.closest(".dl-menu-floating") || e.target.closest(".menu-trigger")) return;
      this.openKey = null;
    },
    handleEsc(e) {
      if (e.key === "Escape") this.openKey = null;
    },
  },
  mounted() {
    document.addEventListener("click", this.handleDocClick);
    window.addEventListener("keydown", this.handleEsc);
    window.addEventListener("scroll", () => (this.openKey = null), { passive: true });
    window.addEventListener("resize", () => (this.openKey = null));
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleDocClick);
    window.removeEventListener("keydown", this.handleEsc);
  },
};
</script>

<template>
  <div class="p-6 bg-[#f0f2f5] text-slate-900 font-sans">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 flex-wrap mb-4">
      <h1 class="m-0 text-[26px] font-extrabold tracking-[0.02em]">
        {{ title }}
      </h1>

      <div class="flex gap-2">
        <slot name="header-actions" :emit="(a) => $emit('header-action', a)">
          <button
            v-for="(b, i) in headerButtons"
            :key="i"
            @click.stop="onHeaderClick(b)"
            class="inline-flex items-center justify-center font-bold transition 
                   rounded-xl px-6 py-2.5 text-white text-[16px] 
                   bg-[#3c7eec] border border-[#2f5cad] 
                   hover:bg-[#336ed4] focus:outline-none 
                   focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            {{ b.label }}
          </button>
        </slot>
      </div>
    </div>

    <!-- Table -->
    <table class="w-full table-auto border border-slate-200 rounded-[14px] shadow-md bg-white">
      <thead>
        <tr class="bg-[#e6ebf1] border-b border-[#d0d7de]">
          <th
            v-for="c in columns"
            :key="c.key"
            class="text-left font-extrabold text-[18px] px-5 py-3 whitespace-nowrap"
          >
            {{ c.label }}
          </th>
          <th v-if="hasRowActions" class="text-center font-extrabold text-[18px] px-5 py-3 whitespace-nowrap">
            操作
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(row, rIdx) in rows"
          :key="keyOf(row, rIdx)"
          class="border-b border-[#e9edf2] last:border-b-[#e9edf2]"
        >
          <td
            v-for="c in columns"
            :key="c.key"
            :class="[
              'px-6 py-4 align-middle text-[18px] whitespace-nowrap overflow-hidden text-ellipsis',
              cellClass(c.key, row[c.key]),
            ]"
          >
            <slot :name="`cell-${c.key}`" :row="row">
              {{ row[c.key] }}
            </slot>
          </td>

          <td v-if="hasRowActions" class="px-6 py-4 text-center">
            <button
              class="menu-trigger inline-flex items-center justify-center font-bold text-[14px] rounded-xl 
                     px-4 py-2 text-white border transition 
                     bg-[#7fb2e1] border-[#5b8eb8] hover:bg-[#6aa3d8] 
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
              @click.stop="openMenu($event, row, rIdx)"
            >
              操作 ▼
            </button>

            <!-- Teleport dropdown -->
            <teleport to="body">
              <div
                v-if="openKey === keyOf(row, rIdx)"
                class="dl-menu-floating fixed -translate-x-1/2 bg-white border border-slate-300 
                       shadow-xl rounded-xl min-w-[180px] max-h-[50vh] overflow-y-auto z-[4000]"
                :style="{ top: menuPos.top + 'px', left: menuPos.left + 'px' }"
                @click.stop
              >
                <slot
                  name="row-actions"
                  :row="row"
                  :emit="(action) => onRowAction(row, action)"
                >
                  <a
                    v-for="(a, i) in rowActions"
                    :key="i"
                    href="#"
                    @click.prevent="onRowAction(row, a.action)"
                    class="block px-4 py-3 text-[15px] font-semibold text-slate-900 
                           hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
                  >
                    {{ a.label }}
                  </a>
                </slot>
              </div>
            </teleport>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
