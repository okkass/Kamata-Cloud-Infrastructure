<template>
  <section class="space-y-4">
    <h2 class="text-lg font-semibold">基本情報</h2>

    <div class="detail-card">
      <div>
        <div class="detail-label">名前</div>
        <div class="detail-value">{{ image?.name || "-" }}</div>
      </div>

      <div>
        <div class="detail-label">説明</div>
        <div class="detail-value">{{ image?.description || "-" }}</div>
      </div>

      <div>
        <div class="detail-label">作成日時</div>
        <div class="detail-value">{{ formatDateTime(image?.createdAt) }}</div>
      </div>

      <div>
        <div class="detail-label">サイズ</div>
        <div class="detail-value">{{ toSize(image?.size ?? 0) }}</div>
      </div>

      <div>
        <div class="detail-label">ノード</div>
        <div class="detail-value">{{ image?.node?.name || "-" }}</div>
      </div>

      <div class="detail-card-section">
        <div class="detail-label">ID</div>
        <div class="detail-value">{{ image?.id || "-" }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  context?: ImageResponse | null;
}>();

const image = toRef(props, "context");

// 画面内で完結する最小の表示用型（nodeId / node 両対応）
type ImageNodeLike = {
  nodeId?: string;
  node?: { id: string; name?: string };
};

const nodeDisplay = computed(() => {
  const v = image.value as (ImageResponse & ImageNodeLike) | null | undefined;
  if (!v) return "-";

  // nodeId がある型
  if (typeof v.nodeId === "string" && v.nodeId) return v.nodeId;

  // node がある型
  const nid = v.node?.id;
  const nname = v.node?.name;
  if (nname && nid) return `${nname} (${nid})`;
  if (nid) return nid;

  return "-";
});
</script>
