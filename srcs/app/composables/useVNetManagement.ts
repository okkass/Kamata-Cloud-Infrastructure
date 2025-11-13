// 仮想ネットワーク用の簡易 composable（ページ単体で動くように最小実装）
import { ref } from "vue";

type RawVNet = {
  id: string;
  name: string;
  cidr: string;
  // API では subnets が配列（オブジェクト配列）で返る想定
  subnets?: Array<Record<string, any>>;
  createdAt?: string; // ISO
  description?: string;
};

export type VNetRow = {
  id: string;
  name: string;
  cidr: string;
  subnets: number;
  createdAtText: string;
  description?: string;
};

const DEFAULT_MOCK: RawVNet[] = [
  {
    id: "vnet-1",
    name: "default-vnet",
    cidr: "10.0.0.0/16",
    subnets: [{ id: "s1" }, { id: "s2" }, { id: "s3" }],
    createdAt: new Date().toISOString(),
    description: "デフォルトの仮想ネットワーク（モック）",
  },
  {
    id: "vnet-2",
    name: "prod-vnet",
    cidr: "192.168.0.0/16",
    subnets: [{ id: "s1" }, { id: "s2" }],
    createdAt: new Date().toISOString(),
    description: "本番用（モック）",
  },
];

function formatDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* subnets が配列の場合は length、未定義や不正値は 0 を返す */
function parseSubnets(value: unknown): number {
  if (!value) return 0;
  if (Array.isArray(value)) return value.length;
  // もし API が古い形で数値文字列を返した場合も対応
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export function useVNetManagement() {
  const columns = ref([
    { key: "name", label: "仮想ネットワーク名", align: "left" as const },
    { key: "cidr", label: "アドレス範囲", align: "left" as const },
    { key: "subnets", label: "サブネット数", align: "right" as const },
    { key: "createdAtText", label: "作成日時", align: "left" as const },
  ]);

  const headerButtons = ref([
    { key: "create", label: "＋ 仮想ネットワーク作成", kind: "primary" },
  ]);

  const rows = ref<VNetRow[]>([]);

  async function refresh() {
    try {
      const fetchFn =
        (globalThis as any).$fetch ??
        (async (url: string) => {
          const r = await fetch(url);
          if (!r.ok) throw new Error("fetch failed");
          return r.json();
        });

      const raw: RawVNet[] = await fetchFn("/api/virtual-networks");
      rows.value = (raw || []).map((r) => ({
        id: String(r.id),
        name: String(r.name),
        cidr: String(r.cidr),
        subnets: parseSubnets(r.subnets),
        createdAtText: formatDateTime(String(r.createdAt)),
        description: r.description,
      }));
    } catch (e) {
      console.warn("useVNetManagement: fetch failed, using mock data", e);
      rows.value = DEFAULT_MOCK.map((r) => ({
        id: r.id,
        name: r.name,
        cidr: r.cidr,
        subnets: parseSubnets(r.subnets),
        createdAtText: formatDateTime(r.createdAt),
        description: r.description,
      }));
    }
  }

  // 初期ロード
  void refresh();

  return {
    columns,
    headerButtons,
    rows,
    refresh,
  };
}
