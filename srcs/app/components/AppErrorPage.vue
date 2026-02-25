<!-- 
  カスタムエラーページ本体。コードやメッセージを受け取り、白背景カードで案内と戻る/ホーム動線を提供する。

  使用場面：
  - 詳細ページでリソースが見つからない（404）場合
  - サーバーエラーが発生した場合（500等）
  - useResourceErrorGuard経由でエラーが発生した場合

  注意：
  - データ取得時のエラーはこのページを使わずにトースト通知を表示してください
  - useResourceFetchHandler を使用してください
-->
<template>
  <div class="error-wrap">
    <div class="error-container">
      <div class="error-icon-wrap">
        <div class="error-icon">⚠️</div>
      </div>

      <h1 class="error-title">
        {{ titleText }}
      </h1>

      <p class="error-description">
        {{ subText }}
      </p>

      <div class="error-details" v-if="showDetails && codeText">
        <span class="detail-badge">エラーコード: {{ codeText }}</span>
      </div>

      <div class="error-actions">
        <button class="btn btn-secondary" type="button" @click="goBackSafe">
          <span class="btn-icon">← </span>前に戻る
        </button>
        <button class="btn btn-primary" type="button" @click="goTop">
          <span class="btn-icon">🏠 </span>ホームに戻る
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  code?: number | string;
  title?: string;
  message?: string;
  from?: string;
  showDetails?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  showDetails: true,
});

const router = useRouter();

const codeText = computed(() => (props.code ?? "UNKNOWN").toString());
const fromText = computed(() => props.from ?? "");

const titleText = computed(() => {
  if (props.title) return props.title;
  const c = Number(props.code);
  if (c === 404) return "ページが見つかりません";
  if (c === 403) return "アクセスできません";
  return "エラーが発生しました";
});

const subText = computed(() => {
  if (props.message) return props.message;
  const c = Number(props.code);
  if (c === 404) return "URLが存在しない、または削除された可能性があります。";
  return "前の画面に戻るか、トップに戻ってください。";
});

function goTop() {
  // クライアント側で直接遷移（エラー状態は自動でクリア）
  if (process.client) {
    window.location.href = "/";
  }
}

function goBackSafe() {
  if (!process.client) return;

  // ブラウザ履歴があるなら戻す
  if (window.history && window.history.length > 2) {
    window.history.back();
  } else {
    // 戻れない場合はトップへ
    window.location.href = "/";
  }
}
</script>

<style scoped>
.error-wrap {
  min-height: calc(100vh - 0px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #ffffff;
}

.error-container {
  width: min(500px, 100%);
  text-align: center;
  background: #ffffff;
  padding: 48px 32px;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon-wrap {
  margin-bottom: 24px;
}

.error-icon {
  font-size: 64px;
  display: inline-block;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-title {
  margin: 0 0 16px;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2937;
}

.error-description {
  margin: 0 0 24px;
  font-size: 16px;
  color: #4b5563;
  line-height: 1.6;
}

.error-details {
  margin: 24px 0;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border-left: 3px solid rgba(59, 130, 246, 0.5);
}

.detail-badge {
  display: inline-block;
  font-size: 14px;
  color: #3b82f6;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-icon {
  font-size: 16px;
}

.btn-secondary {
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-2px);
}

.btn-secondary:active {
  transform: translateY(0);
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
  border: 1px solid #3b82f6;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .error-title {
    font-size: 24px;
  }

  .error-icon {
    font-size: 48px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
