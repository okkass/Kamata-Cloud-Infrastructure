import { defineComponent, withAsyncContext, computed, mergeProps, createVNode, resolveDynamicComponent, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderVNode, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { _ as __nuxt_component_0$1 } from './nuxt-link-JOJF6QkV.mjs';
import { u as useUserPermission } from './useUserPermission-CgOheY55.mjs';
import { c as convertByteToUnit } from './server.mjs';
import { D as DISABLE_ROUNDING } from './fetch-kOzZWayB.mjs';
import { _ as __nuxt_component_0$2 } from './asyncData-BDnIU8Sz.mjs';
import { u as useResourceList } from './useResourceList-BY3jHLdB.mjs';
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
import 'perfect-debounce';

const useQuickLinks = () => {
  const permissions = useUserPermission();
  const quickLinkDefinitions = [
    {
      text: "仮想マシン管理",
      href: "/machine",
      shouldDisplay: () => true
    },
    {
      text: "仮想ネットワーク管理",
      href: "/network",
      shouldDisplay: () => true
    },
    {
      text: "セキュリティグループ",
      href: "/security-group",
      shouldDisplay: () => true
    }
  ];
  const getQuickLinks = computed(() => {
    return quickLinkDefinitions.filter((item) => item.shouldDisplay(permissions)).map((item) => ({
      text: item.text,
      href: item.href
    }));
  });
  return {
    getQuickLinks
  };
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "QuickLink",
  __ssrInlineRender: true,
  setup(__props) {
    const { getQuickLinks } = useQuickLinks();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "summary-progress-card h-full flex flex-col" }, _attrs))}><h2 class="summary-section-title flex-shrink-0">クイックリンク</h2><nav class="flex-grow overflow-y-auto mt-4 space-y-2"><!--[-->`);
      ssrRenderList(unref(getQuickLinks), (link) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: link.href,
          to: link.href,
          class: "quick-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(link.text)}`);
            } else {
              return [
                createTextVNode(toDisplayString(link.text), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav></aside>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Summary/QuickLink.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$6, { __name: "SummaryQuickLink" });
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "NodeInfoCard",
  __ssrInlineRender: true,
  props: {
    node: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "summary-progress-card",
        style: { "height": "330px" }
      }, _attrs))}><h3 class="summary-progress-title">ノード情報</h3><div class="space-y-3 pt-4 text-sm"><div class="flex justify-between"><span class="text-gray-500">ノード名:</span><span class="font-semibold">${ssrInterpolate(__props.node.name)}</span></div><div class="flex justify-between"><span class="text-gray-500">ID:</span><span class="font-mono text-xs">${ssrInterpolate(__props.node.id)}</span></div><hr class="my-2 pt-2"><div class="flex justify-between"><span class="text-gray-500">合計 CPU:</span><span class="font-semibold">${ssrInterpolate(__props.node.totalCpu)} Cores</span></div><div class="flex justify-between"><span class="text-gray-500">合計 メモリ:</span><span class="font-semibold">${ssrInterpolate((__props.node.totalMemory / 1024 ** 3).toFixed(0))} GB </span></div></div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Summary/NodeInfoCard.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$5, { __name: "SummaryNodeInfoCard" });
const alertThreshold = 90;
const warningThreshold = 75;
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ProgressBar",
  __ssrInlineRender: true,
  props: {
    title: {},
    usage: {},
    total: {},
    unit: {}
  },
  setup(__props) {
    const props = __props;
    const usageNum = computed(() => Number(props.usage));
    const totalNum = computed(() => Number(props.total));
    const percentage = computed(() => {
      if (totalNum.value === 0) return 0;
      return usageNum.value / totalNum.value * 100;
    });
    const percentageText = computed(() => `${percentage.value.toFixed(1)}%`);
    const usageText = computed(() => `${props.usage} ${props.unit}`);
    const totalText = computed(() => `${props.total} ${props.unit}`);
    const barColorClass = computed(() => {
      if (percentage.value > alertThreshold) return "progress-bar-danger";
      if (percentage.value > warningThreshold) return "progress-bar-warning";
      return "progress-bar-normal";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "summary-progress-card" }, _attrs))}><h3 class="summary-progress-title">${ssrInterpolate(__props.title)}</h3><div class="summary-progress-text"><span>${ssrInterpolate(usageText.value)} / ${ssrInterpolate(totalText.value)}</span><span>${ssrInterpolate(percentageText.value)}</span></div><div class="summary-progress-track"><div class="${ssrRenderClass([barColorClass.value, "summary-progress-bar"])}" style="${ssrRenderStyle({ width: percentage.value + "%" })}"></div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Summary/ProgressBar.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const SummaryProgressBar = Object.assign(_sfc_main$4, { __name: "SummaryProgressBar" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "TimeSeries",
  __ssrInlineRender: true,
  props: {
    title: {},
    options: {},
    series: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "summary-progress-card" }, _attrs))}><h3 class="summary-progress-title">${ssrInterpolate(__props.title)}</h3>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="chart-loading-state"${_scopeId}>グラフを読み込み中...</div>`);
          } else {
            return [
              createVNode("div", { class: "chart-loading-state" }, "グラフを読み込み中...")
            ];
          }
        })
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Summary/TimeSeries.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const SummaryTimeSeries = Object.assign(_sfc_main$3, { __name: "SummaryTimeSeries" });
const createChartOptions = (title, totalValue, unit) => {
  return {
    chart: { type: "area", zoom: { enabled: false }, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.7, opacityTo: 0.1 } },
    xaxis: { type: "datetime", labels: { format: "HH:mm" } },
    yaxis: {
      min: 0,
      max: 100,
      labels: { formatter: (value) => `${value.toFixed(1)}%` }
    },
    tooltip: {
      x: { format: "MM/dd HH:mm" },
      y: {
        formatter: (value) => {
          const actualValue = value / 100 * totalValue;
          const actualValueFormatted = unit === "Cores" ? actualValue.toFixed(1) : actualValue.toFixed(2);
          return `${actualValueFormatted} ${unit} (${value.toFixed(1)}%)`;
        },
        title: { formatter: () => title }
      }
    }
  };
};
const createNetworkChartOptions = () => {
  return {
    chart: { type: "area", zoom: { enabled: false }, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.7, opacityTo: 0.1 }
    },
    colors: ["#F59E0B", "#818CF8"],
    xaxis: { type: "datetime", labels: { format: "HH:mm" } },
    yaxis: {
      min: 0,
      // 最小値は0
      // maxは指定せず、自動スケールに任せる
      labels: { formatter: (value) => `${value.toFixed(0)} KB` }
      // 単位をKBと仮定
    },
    tooltip: {
      x: { format: "MM/dd HH:mm" },
      shared: true,
      // ★ IN/OUTを同時に表示する共有ツールチップ
      y: {
        formatter: (value) => {
          if (value === void 0) return "N/A";
          return `${value.toFixed(2)} KB`;
        }
      }
    },
    legend: {
      // 凡例 (IN / OUT) を表示
      position: "top",
      horizontalAlign: "left",
      offsetY: 0
    }
  };
};
function useSummary(isAdmin) {
  const apiParams = computed(() => ({
    admin: isAdmin.value ? "1" : "0",
    lazy: true,
    server: false
  }));
  const {
    data: summaryData,
    pending: summaryPending,
    error: summaryError,
    refresh: summaryRefresh
  } = useResourceList("summary/realtime", apiParams);
  const {
    data: historyData,
    pending: historyPending,
    error: historyError,
    refresh: historyRefresh
  } = useResourceList("summary/history", apiParams);
  const chartConfigData = computed(() => {
    if (!historyData.value || !historyData.value.data) return null;
    const formatForApex = (history, label, totalValue, unit) => {
      const series = [
        {
          name: label,
          data: history.map((item) => [item.timestamp, item.value * 100])
        }
      ];
      const options = createChartOptions(label, totalValue, unit);
      return { series, options };
    };
    const formatForNetwork = (inHistory, outHistory) => {
      const series = [
        {
          name: "IN",
          data: inHistory.map((item) => [item.timestamp, item.value])
        },
        {
          name: "OUT",
          data: outHistory.map((item) => [item.timestamp, item.value])
        }
      ];
      const options = createNetworkChartOptions();
      return { series, options };
    };
    if (isAdmin.value) {
      return {
        nodes: historyData.value.data.map((node) => ({
          ...node,
          cpuChart: formatForApex(
            node.cpuHistory,
            "CPU",
            node.totalCpu,
            "Cores"
          ),
          memChart: formatForApex(
            node.memHistory,
            "メモリ",
            convertByteToUnit(node.totalMemory, "GB", DISABLE_ROUNDING),
            "GB"
          ),
          networkChart: formatForNetwork(
            node.networkINHistory,
            node.networkOUTHistory
          )
        })),
        vms: null
      };
    } else {
      return {
        nodes: null,
        vms: historyData.value.data.map((vm) => ({
          ...vm,
          cpuChart: formatForApex(vm.cpuHistory, "CPU", vm.totalCpu, "Cores"),
          memChart: formatForApex(
            vm.memHistory,
            "メモリ",
            convertByteToUnit(vm.totalMemory, "GB", DISABLE_ROUNDING),
            "GB"
          )
        }))
      };
    }
  });
  return {
    summaryData,
    summaryPending,
    summaryError,
    historyData,
    historyPending,
    historyError,
    chartConfigData
  };
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Admin",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAdmin } = useUserPermission();
    const {
      summaryData,
      summaryPending,
      summaryError,
      historyPending,
      historyError,
      chartConfigData
    } = useSummary(isAdmin);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SummaryQuickLink = __nuxt_component_0;
      const _component_SummaryNodeInfoCard = __nuxt_component_1;
      _push(`<!--[--><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><section class="summary-section lg:col-span-1">`);
      _push(ssrRenderComponent(_component_SummaryQuickLink, null, null, _parent));
      _push(`</section>`);
      if (unref(summaryData) && unref(summaryData)[0]?.clusterSummary) {
        _push(`<section class="summary-section lg:col-span-1"><h2 class="summary-section-title">現在のリソース状況</h2><div class="summary-grid">`);
        _push(ssrRenderComponent(SummaryProgressBar, {
          title: "CPU 使用率",
          usage: unref(summaryData)[0].clusterSummary.usedCpu.toFixed(1),
          total: unref(summaryData)[0].clusterSummary.totalCpu,
          unit: "Cores"
        }, null, _parent));
        _push(ssrRenderComponent(SummaryProgressBar, {
          title: "メモリ使用率",
          usage: ("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(
            unref(summaryData)[0].clusterSummary.usedMemory,
            "GB",
            "DISABLE_ROUNDING" in _ctx ? _ctx.DISABLE_ROUNDING : unref(DISABLE_ROUNDING)
          ).toFixed(1),
          total: ("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(
            unref(summaryData)[0].clusterSummary.totalMemory,
            "GB",
            "DISABLE_ROUNDING" in _ctx ? _ctx.DISABLE_ROUNDING : unref(DISABLE_ROUNDING)
          ).toFixed(0),
          unit: "GB"
        }, null, _parent));
        _push(ssrRenderComponent(SummaryProgressBar, {
          title: "ストレージ使用率",
          usage: ("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(
            unref(summaryData)[0].clusterSummary.usedStorage,
            "GB",
            "DISABLE_ROUNDING" in _ctx ? _ctx.DISABLE_ROUNDING : unref(DISABLE_ROUNDING)
          ).toFixed(1),
          total: ("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(
            unref(summaryData)[0].clusterSummary.totalStorage,
            "GB",
            "DISABLE_ROUNDING" in _ctx ? _ctx.DISABLE_ROUNDING : unref(DISABLE_ROUNDING)
          ).toFixed(0),
          unit: "GB"
        }, null, _parent));
        _push(`</div></section>`);
      } else if (unref(summaryPending)) {
        _push(`<div class="loading-text"> リソース状況を読み込み中... </div>`);
      } else if (unref(summaryError)) {
        _push(`<div class="error-text"> リソース状況の読み込みに失敗しました。 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(chartConfigData)?.nodes) {
        _push(`<!--[-->`);
        ssrRenderList(unref(chartConfigData).nodes, (node) => {
          _push(`<section class="summary-timeseries-section"><h2 class="summary-section-title">${ssrInterpolate(node.name)}</h2><div class="summary-timeseries-grid">`);
          _push(ssrRenderComponent(_component_SummaryNodeInfoCard, { node }, null, _parent));
          _push(ssrRenderComponent(SummaryTimeSeries, {
            title: "ネットワーク使用率 (過去24時間)",
            options: node.networkChart.options,
            series: node.networkChart.series
          }, null, _parent));
          _push(ssrRenderComponent(SummaryTimeSeries, {
            title: "CPU使用率 (過去24時間)",
            options: node.cpuChart.options,
            series: node.cpuChart.series
          }, null, _parent));
          _push(ssrRenderComponent(SummaryTimeSeries, {
            title: "メモリ使用率 (過去24時間)",
            options: node.memChart.options,
            series: node.memChart.series
          }, null, _parent));
          _push(`</div></section>`);
        });
        _push(`<!--]-->`);
      } else if (unref(historyPending)) {
        _push(`<div class="loading-text"> グラフ履歴を読み込み中... </div>`);
      } else if (unref(historyError)) {
        _push(`<div class="error-text"> グラフ履歴の読み込みに失敗しました。 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Summary/Admin.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const SummaryAdmin = Object.assign(_sfc_main$2, { __name: "SummaryAdmin" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "User",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAdmin } = useUserPermission();
    const {
      summaryData,
      summaryPending,
      summaryError,
      historyPending,
      historyError,
      chartConfigData
    } = useSummary(isAdmin);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SummaryQuickLink = __nuxt_component_0;
      _push(`<!--[--><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><section class="summary-section lg:col-span-1">`);
      _push(ssrRenderComponent(_component_SummaryQuickLink, null, null, _parent));
      _push(`</section>`);
      if (unref(summaryData) && unref(summaryData)[0]) {
        _push(`<section class="summary-section lg:col-span-1"><h2 class="summary-section-title">あなたのリソース割り当て</h2><div class="summary-grid">`);
        _push(ssrRenderComponent(SummaryProgressBar, {
          title: "CPU 割り当て",
          usage: unref(summaryData)[0].clusterSummary.usedCpu.toFixed(1),
          total: unref(summaryData)[0].clusterSummary.totalCpu,
          unit: "Cores"
        }, null, _parent));
        _push(ssrRenderComponent(SummaryProgressBar, {
          title: "メモリ割り当て",
          usage: ("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(
            unref(summaryData)[0].clusterSummary.usedMemory,
            "GB",
            "DISABLE_ROUNDING" in _ctx ? _ctx.DISABLE_ROUNDING : unref(DISABLE_ROUNDING)
          ).toFixed(1),
          total: ("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(
            unref(summaryData)[0].clusterSummary.totalMemory,
            "GB",
            "DISABLE_ROUNDING" in _ctx ? _ctx.DISABLE_ROUNDING : unref(DISABLE_ROUNDING)
          ).toFixed(0),
          unit: "GB"
        }, null, _parent));
        _push(ssrRenderComponent(SummaryProgressBar, {
          title: "ストレージ割り当て",
          usage: ("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(
            unref(summaryData)[0].clusterSummary.usedStorage,
            "GB",
            "DISABLE_ROUNDING" in _ctx ? _ctx.DISABLE_ROUNDING : unref(DISABLE_ROUNDING)
          ).toFixed(1),
          total: ("convertByteToUnit" in _ctx ? _ctx.convertByteToUnit : unref(convertByteToUnit))(
            unref(summaryData)[0].clusterSummary.totalStorage,
            "GB",
            "DISABLE_ROUNDING" in _ctx ? _ctx.DISABLE_ROUNDING : unref(DISABLE_ROUNDING)
          ).toFixed(0),
          unit: "GB"
        }, null, _parent));
        _push(`</div></section>`);
      } else if (unref(summaryPending)) {
        _push(`<div class="loading-text"> リソース状況を読み込み中... </div>`);
      } else if (unref(summaryError)) {
        _push(`<div class="error-text"> リソース状況の読み込みに失敗しました。 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(chartConfigData)?.vms) {
        _push(`<!--[-->`);
        ssrRenderList(unref(chartConfigData).vms, (vm) => {
          _push(`<section class="summary-timeseries-section"><h2 class="summary-section-title">${ssrInterpolate(vm.name)}</h2><div class="summary-timeseries-grid">`);
          _push(ssrRenderComponent(SummaryTimeSeries, {
            title: "CPU使用率 (過去24時間)",
            options: vm.cpuChart.options,
            series: vm.cpuChart.series
          }, null, _parent));
          _push(ssrRenderComponent(SummaryTimeSeries, {
            title: "メモリ使用率 (過去24時間)",
            options: vm.memChart.options,
            series: vm.memChart.series
          }, null, _parent));
          _push(`</div></section>`);
        });
        _push(`<!--]-->`);
      } else if (unref(historyPending)) {
        _push(`<div class="loading-text"> グラフ履歴を読み込み中... </div>`);
      } else if (unref(historyError)) {
        _push(`<div class="error-text"> グラフ履歴の読み込みに失敗しました。 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Summary/User.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SummaryUser = Object.assign(_sfc_main$1, { __name: "SummaryUser" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { isAdmin, fetchUser } = useUserPermission();
    [__temp, __restore] = withAsyncContext(() => fetchUser()), await __temp, __restore();
    const summaryComponent = computed(() => {
      return isAdmin.value ? SummaryAdmin : SummaryUser;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6" }, _attrs))}>`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(summaryComponent)), null, null), _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-THWQc_BH.mjs.map
