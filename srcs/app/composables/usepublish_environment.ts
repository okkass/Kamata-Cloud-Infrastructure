import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

export const CWP_MANAGE_URL =
  process.env.CWP_MANAGE_URL ?? "https://example.com/wp-admin";

type RawPortfolio = {
  id: string;
  title: string;
  publishedAt?: string;
  status?: string;
  link?: string;
};

export type PortfolioRow = {
  id: string;
  title: string;
  publishedAt: string;
  status: string;
  link: string;
};

export function usePublishEnvironment() {
  const { data, pending, error, refresh } = useAsyncData<RawPortfolio[]>(
    "portfolio-list",
    () => $fetch<RawPortfolio[]>("/api/portfolio").catch(() => [])
  );

  const columns = [
    { key: "title", label: "記事タイトル", align: "left" as const },
    { key: "publishedAt", label: "公開日", align: "left" as const },
    { key: "status", label: "ステータス", align: "left" as const },
  ];

  const headerButtons = [
    {
      action: "open-wordpress",
      label: "WordPress 管理ページへ",
      variant: "primary",
    },
  ];

  const rows = computed<PortfolioRow[]>(() => {
    const raw = data.value ?? [
      {
        id: "1",
        title: "My Webアプリ開発記録",
        publishedAt: "2025-06-01T00:00:00Z",
        status: "公開中",
        link: "/",
      },
      {
        id: "2",
        title: "Linux構築チュートリアル",
        publishedAt: "2025-06-25T00:00:00Z",
        status: "非公開",
        link: "/",
      },
    ];
    return raw.map((r) => ({
      id: r.id,
      title: r.title,
      publishedAt: r.publishedAt ? formatDateTime(r.publishedAt) : "-",
      status: r.status ?? "非公開",
      link: r.link ?? "/",
    }));
  });

  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
  } as const;
}
