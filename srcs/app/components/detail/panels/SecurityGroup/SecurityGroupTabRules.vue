<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">ルール一覧</h2>

    <div class="rounded-lg border border-neutral-200 bg-white p-4 space-y-6">
      <!-- インバウンド -->
      <div>
        <h3 class="mb-2 text-sm font-semibold text-neutral-800">
          インバウンドルール
        </h3>

        <p v-if="inboundRules.length === 0" class="text-sm text-neutral-500">
          インバウンドルールは設定されていません。
        </p>

        <div v-else class="space-y-2">
          <article
            v-for="rule in inboundRules"
            :key="rule.id"
            class="rounded-lg border border-neutral-200 px-4 py-3 text-sm"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="font-medium text-neutral-900">
                {{ rule.name || "（名称未設定）" }}
              </p>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="actionClass(rule.action)"
              >
                {{ actionLabel(rule.action) }}
              </span>
            </div>

            <dl class="mt-2 grid gap-2 md:grid-cols-3">
              <div>
                <dt class="text-[11px] text-neutral-500">プロトコル</dt>
                <dd class="text-xs font-medium text-neutral-900">
                  {{ protocolLabel(rule.protocol) }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] text-neutral-500">ポート</dt>
                <dd class="text-xs font-medium text-neutral-900">
                  {{ portLabel(rule.port) }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] text-neutral-500">ターゲットIP</dt>
                <dd class="text-xs font-mono text-neutral-900">
                  {{ rule.targetIp }}
                </dd>
              </div>
            </dl>

            <p class="mt-2 text-[11px] text-neutral-500">
              作成日時：{{ formatDate(rule.createdAt) }}
            </p>
          </article>
        </div>
      </div>

      <!-- アウトバウンド -->
      <div class="pt-4 border-t border-neutral-200">
        <h3 class="mb-2 text-sm font-semibold text-neutral-800">
          アウトバウンドルール
        </h3>

        <p v-if="outboundRules.length === 0" class="text-sm text-neutral-500">
          アウトバウンドルールは設定されていません。
        </p>

        <div v-else class="space-y-2">
          <article
            v-for="rule in outboundRules"
            :key="rule.id"
            class="rounded-lg border border-neutral-200 px-4 py-3 text-sm"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="font-medium text-neutral-900">
                {{ rule.name || "（名称未設定）" }}
              </p>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="actionClass(rule.action)"
              >
                {{ actionLabel(rule.action) }}
              </span>
            </div>

            <dl class="mt-2 grid gap-2 md:grid-cols-3">
              <div>
                <dt class="text-[11px] text-neutral-500">プロトコル</dt>
                <dd class="text-xs font-medium text-neutral-900">
                  {{ protocolLabel(rule.protocol) }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] text-neutral-500">ポート</dt>
                <dd class="text-xs font-medium text-neutral-900">
                  {{ portLabel(rule.port) }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] text-neutral-500">ターゲットIP</dt>
                <dd class="text-xs font-mono text-neutral-900">
                  {{ rule.targetIp }}
                </dd>
              </div>
            </dl>

            <p class="mt-2 text-[11px] text-neutral-500">
              作成日時：{{ formatDate(rule.createdAt) }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

type SecurityRule = {
  id: string;
  name: string;
  ruleType: "inbound" | "outbound";
  port?: number | null;
  protocol: "tcp" | "udp" | "icmp" | "any";
  targetIp: string;
  action?: "allow" | "deny";
  createdAt: string;
};

type SecurityGroupResponse = {
  id: string;
  name: string;
  description?: string;
  rules: SecurityRule[];
  createdAt: string;
};

const props = defineProps<{
  context: SecurityGroupResponse;
}>();

const rules = computed(() => props.context.rules ?? []);

const inboundRules = computed(() =>
  rules.value.filter((r) => r.ruleType === "inbound")
);
const outboundRules = computed(() =>
  rules.value.filter((r) => r.ruleType === "outbound")
);

const protocolLabel = (p: SecurityRule["protocol"]) => {
  switch (p) {
    case "tcp":
      return "TCP";
    case "udp":
      return "UDP";
    case "icmp":
      return "ICMP";
    case "any":
      return "任意";
    default:
      return p;
  }
};

const portLabel = (port?: number | null) =>
  port == null ? "全ポート" : String(port);

const actionLabel = (a?: SecurityRule["action"]) =>
  a === "deny" ? "拒否" : "許可";

const actionClass = (a?: SecurityRule["action"]) =>
  a === "deny"
    ? "bg-rose-50 text-rose-700 border border-rose-200"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
