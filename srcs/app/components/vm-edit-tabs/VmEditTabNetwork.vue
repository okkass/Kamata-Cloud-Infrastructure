<template>
  <div class="p-6 h-full overflow-y-auto">
    <div class="max-w-4xl space-y-8">
      <section>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-5 text-gray-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            ネットワークインターフェース
          </h3>
          <button
            type="button"
            @click="addInterface"
            class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path
                d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
              />
            </svg>
            インターフェース追加
          </button>
        </div>

        <div class="border rounded-md overflow-hidden bg-white shadow-sm">
          <div
            class="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            <div class="col-span-5">接続ネットワーク</div>
            <div class="col-span-6">IPアドレス (任意)</div>
            <div class="col-span-1 text-center">削除</div>
          </div>

          <div
            v-if="
              !model.networkInterfaces || model.networkInterfaces.length === 0
            "
            class="p-6 text-center text-gray-400 text-sm"
          >
            インターフェースが設定されていません。
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="(iface, index) in model.networkInterfaces"
              :key="index"
              class="grid grid-cols-12 gap-4 px-4 py-3 items-start"
            >
              <div class="col-span-5">
                <FormSelect
                  :name="`network-${index}`"
                  v-model="iface.networkId"
                  :options="networkOptions"
                  placeholder="ネットワークを選択"
                  required
                  class="w-full"
                />
              </div>

              <div class="col-span-6">
                <FormInput
                  :name="`ip-${index}`"
                  v-model="iface.ipAddress"
                  placeholder="自動割り当て (例: 192.168.1.10)"
                  class="w-full"
                />
              </div>

              <div class="col-span-1 flex justify-center mt-2">
                <button
                  type="button"
                  @click="removeInterface(index)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                  title="削除"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 001.5.06l.3-7.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr class="border-gray-200" />

      <section>
        <h3
          class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5 text-gray-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
            />
          </svg>
          セキュリティグループ
        </h3>

        <div
          class="flex gap-2 mb-4 items-end bg-gray-50 p-3 rounded border border-gray-100"
        >
          <div class="flex-1">
            <FormSelect
              name="sg-select"
              label="セキュリティグループを追加"
              v-model="selectedSgId"
              :options="availableSecurityGroups"
              placeholder="グループを選択してください"
              class="w-full"
            />
          </div>
          <button
            type="button"
            @click="addSecurityGroup"
            :disabled="!selectedSgId"
            class="btn btn-secondary h-[42px] px-4"
          >
            追加
          </button>
        </div>

        <div class="border rounded-md overflow-hidden bg-white shadow-sm">
          <div
            v-if="!model.securityGroups || model.securityGroups.length === 0"
            class="p-6 text-center text-gray-400 text-sm"
          >
            セキュリティグループが割り当てられていません。
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="(sg, index) in model.securityGroups"
              :key="sg.id || index"
              class="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="bg-blue-100 text-blue-600 p-1.5 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 2a.75.75 0 01.75.75v12.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V2.75A.75.75 0 0110 2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ sg.name || "Unknown Group" }}
                  </div>
                  <div class="text-xs text-gray-500 font-mono">{{ sg.id }}</div>
                </div>
              </div>

              <button
                type="button"
                @click="removeSecurityGroup(index)"
                class="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="解除"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import FormSelect from "~/components/Form/Select.vue";
import FormInput from "~/components/Form/Input.vue";

// 親コンポーネントからのモデルバインディング
const model = defineModel<any>({ required: true });

// ----------------------------------------------------------------------------
// マスターデータ (実際にはAPIから取得)
// ----------------------------------------------------------------------------
const networkOptions = ref<any[]>([]);
const allSecurityGroups = ref<any[]>([]);

onMounted(async () => {
  try {
    // TODO: 実際のAPIエンドポイントに合わせて実装してください
    // const [nets, sgs] = await Promise.all([
    //   $fetch('/api/networks'),
    //   $fetch('/api/security-groups')
    // ]);

    // 仮のモックデータ
    networkOptions.value = [
      { id: "net-default", name: "Default Network (192.168.1.0/24)" },
      { id: "net-dmz", name: "DMZ Network (10.0.0.0/24)" },
    ];

    allSecurityGroups.value = [
      { id: "sg-web", name: "Web Server (HTTP/HTTPS)" },
      { id: "sg-db", name: "Database (PostgreSQL)" },
      { id: "sg-ssh", name: "Maintenance (SSH)" },
      { id: "sg-internal", name: "Internal Only" },
    ];
  } catch (e) {
    console.error("Failed to load master data", e);
  }
});

// ----------------------------------------------------------------------------
// Network Interfaces Logic
// ----------------------------------------------------------------------------

const addInterface = () => {
  if (!model.value.networkInterfaces) {
    model.value.networkInterfaces = [];
  }

  model.value.networkInterfaces.push({
    // 新規作成時はIDなしか、一時IDを付与するかはAPI仕様によります
    networkId: "",
    ipAddress: "",
  });
};

const removeInterface = (index: number) => {
  model.value.networkInterfaces.splice(index, 1);
};

// ----------------------------------------------------------------------------
// Security Groups Logic
// ----------------------------------------------------------------------------

const selectedSgId = ref<string>("");

// 追加可能なSGリスト（既に割り当て済みのものは除外）
const availableSecurityGroups = computed(() => {
  const currentIds = new Set(
    (model.value.securityGroups || []).map((sg: any) => sg.id)
  );
  return allSecurityGroups.value.filter((sg) => !currentIds.has(sg.id));
});

const addSecurityGroup = () => {
  if (!selectedSgId.value) return;

  const sgToAdd = allSecurityGroups.value.find(
    (sg) => sg.id === selectedSgId.value
  );
  if (sgToAdd) {
    if (!model.value.securityGroups) {
      model.value.securityGroups = [];
    }
    // Bulk更新のため、リストにオブジェクトごと追加します
    model.value.securityGroups.push({ ...sgToAdd });
    selectedSgId.value = ""; // 選択リセット
  }
};

const removeSecurityGroup = (index: number) => {
  model.value.securityGroups.splice(index, 1);
};
</script>
