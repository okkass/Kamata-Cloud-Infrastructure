<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">ルール一覧</h2>

    <div class="detail-card space-y-6">
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
            class="rounded-lg border border-neutral-200 px-4 py-3 bg-white"
          >
            <div class="flex items-center justify-between gap-3 mb-2">
              <p class="detail-value">
                {{ rule.name || "（名称未設定）" }}
              </p>
              <span class="detail-pill" :class="actionClass(rule.action)">
                {{ actionLabel(rule.action) }}
              </span>
            </div>

            <dl class="grid gap-2 md:grid-cols-3">
              <div>
                <dt class="detail-label">プロトコル</dt>
                <dd class="detail-value text-xs">
                  {{ protocolLabel(rule.protocol) }}
                </dd>
              </div>
              <div>
                <dt class="detail-label">ポート</dt>
                <dd class="detail-value text-xs">
                  {{ portLabel(rule.port) }}
                </dd>
              </div>
              <div>
                <dt class="detail-label">ターゲットIP</dt>
                <dd class="detail-value text-xs font-mono">
                  {{ rule.targetIp }}
                </dd>
              </div>
            </dl>

            <p class="mt-2 text-[10px] text-neutral-400 text-right">
              {{ formatDateTime(rule.createdAt) }}
            </p>
          </article>
        </div>
      </div>

      <!-- アウトバウンド -->
      <div class="detail-card-section pt-4">
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
            class="rounded-lg border border-neutral-200 px-4 py-3 bg-white"
          >
            <div class="flex items-center justify-between gap-3 mb-2">
              <p class="detail-value">
                {{ rule.name || "（名称未設定）" }}
              </p>
              <span class="detail-pill" :class="actionClass(rule.action)">
                {{ actionLabel(rule.action) }}
              </span>
            </div>

            <dl class="grid gap-2 md:grid-cols-3">
              <div>
                <dt class="detail-label">プロトコル</dt>
                <dd class="detail-value text-xs">
                  {{ protocolLabel(rule.protocol) }}
                </dd>
              </div>
              <div>
                <dt class="detail-label">ポート</dt>
                <dd class="detail-value text-xs">
                  {{ portLabel(rule.port) }}
                </dd>
              </div>
              <div>
                <dt class="detail-label">ターゲットIP</dt>
                <dd class="detail-value text-xs font-mono">
                  {{ rule.targetIp }}
                </dd>
              </div>
            </dl>

            <p class="mt-2 text-[10px] text-neutral-400 text-right">
              {{ formatDateTime(rule.createdAt) }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateTime } from "@/utils/date";

type SecurityRule = SecurityGroupResponse["rules"][number];

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

const portLabel = (port: SecurityRule["port"]) =>
  port == null ? "全ポート" : String(port);

const actionLabel = (a: SecurityRule["action"] | undefined) =>
  a === "deny" ? "拒否" : "許可";

const actionClass = (a: SecurityRule["action"] | undefined) =>
  a === "deny" ? "bg-rose-50 text-rose-700 border-rose-200" : "detail-pill-yes";
</script>
