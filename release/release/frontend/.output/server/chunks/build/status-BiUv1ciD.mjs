import { c as convertByteToUnit } from './server.mjs';

const VmStatusMap = {
  running: {
    text: "稼働中",
    class: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
  },
  stopped: {
    text: "停止中",
    class: "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
  },
  error: {
    text: "エラー",
    class: "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
  },
  default: {
    text: "不明",
    class: "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
  }
};
const NodeStatusMap = {
  active: {
    text: "稼働中",
    class: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
  },
  inactive: {
    text: "停止中",
    class: "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
  },
  default: {
    text: "不明",
    class: "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
  }
};
const getVmStatusDisplay = (status) => {
  return VmStatusMap[status] || VmStatusMap.default;
};
const getNodeStatusDisplay = (status) => {
  return NodeStatusMap[status] || NodeStatusMap.default;
};
const calculateTotalStorage = (storages) => {
  if (!storages || storages.length === 0) {
    return 0;
  }
  const totalBytes = storages.reduce((sum, s) => sum + (s.size ?? 0), 0);
  return convertByteToUnit(totalBytes, "GB");
};
const formatAsPercent = (value) => {
  return typeof value === "number" && isFinite(value) ? `${Math.round(value * 100)}%` : "—";
};

export { getVmStatusDisplay as a, calculateTotalStorage as c, formatAsPercent as f, getNodeStatusDisplay as g };
//# sourceMappingURL=status-BiUv1ciD.mjs.map
