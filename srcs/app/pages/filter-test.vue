<script setup lang="ts">
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";

// ==========================================
// 1. データの取得と初期化
// ==========================================
const vmId = "vm-12345";

// サーバーから「正」となる元データを取得
// ※ originalVm は比較基準として使うため、直接編集しません
const { data: originalVm, refresh } = await useFetch<any>(
  `/api/test/vms/${vmId}`
);

// フォーム入力用のリアクティブなコピーを作成
// ユーザーはこの editedVm を操作します
// (structuredClone または JSON.parse/stringify でディープコピーを作成)
const editedVm = reactive(structuredClone(originalVm.value));

// ==========================================
// 2. 差分検知の設定 (ResourceConfig)
// ==========================================
// ここで「どのデータが変更されたら、どのAPIを叩くか」を定義します。
// この設定オブジェクトを書き換えるだけで、別のリソースにも対応可能です。
const vmConfig: ResourceConfig = {
  // [Base] 基本情報の更新設定 (PATCH /vms/:id)
  // ------------------------------------------------
  base: {
    endpoint: `/api/test/vms/${vmId}`,
    // ここに指定したキーのみ変更を監視します
    fields: ["name", "cpuCore", "memorySize"],
  },

  // [Collections] 配列データの操作設定 (POST/PATCH/DELETE)
  // ------------------------------------------------
  collections: {
    // ① ネットワークインターフェース (NIC) の設定
    // editedVm.attachedNics と API の対応関係
    attachedNics: {
      endpoint: `/api/test/vms/${vmId}/attached-nics`,
      idKey: "id", // ユニークIDのキー名 (通常は 'id' や 'uuid')
      newIdPrefix: "new-", // 新規作成時の仮IDプレフィックス (保存時に除外される)
      fields: ["name", "ipAddress"], // 更新(PATCH)を監視するキー
    },

    // ② ストレージの設定
    // editedVm.attachedStorages と API の対応関係
    attachedStorages: {
      endpoint: `/api/test/vms/${vmId}/attached-storages`,
      idKey: "id",
      newIdPrefix: "new-",
      fields: ["name", "size"],
    },
  },
};

// ==========================================
// 3. 汎用コンポーザブルの呼び出し
// ==========================================
// useResourceUpdater に「元データ」「編集データ」「設定」を渡すと、
// 差分計算やAPI通信のロジックをすべて代行してくれます。
const {
  save, // 変更を保存する関数 (Promise<boolean>)
  reset, // 変更を破棄して元に戻す関数
  isDirty, // 変更があるかどうかのフラグ (保存ボタンの活性制御用)
  isSaving, // 保存処理中かどうかのフラグ (ローディング表示用)
  errorMessage, // 保存エラー時のメッセージ
  dirtyState, // 【デバッグ用】 現在検知されている差分の中身
} = useResourceUpdater(originalVm, editedVm, vmConfig);

// ==========================================
// 4. UIイベントハンドラ
// ==========================================

/**
 * 保存ボタン押下時の処理
 */
const saveChanges = async () => {
  // コンポーザブルの save() を呼ぶだけで、
  // 必要な API (PATCH/POST/DELETE) が並列で実行されます。
  const success = await save();

  if (success) {
    // 成功時のUIフィードバック
    useToast().addToast({
      type: "success",
      message: "仮想マシンの変更を保存しました。",
    });

    // 元データを最新化するために再取得(モーダルの場合はなくてもOK)
    await refresh();

    // refresh後、editedVmを再生成する処理が必要な場合もありますが、
    // useResourceUpdaterのreset()ロジックなどを活用して最新化します。
    // (簡易実装として、ここではリロード相当の挙動を想定)
    Object.assign(editedVm, structuredClone(originalVm.value));
  }
};

/**
 * NIC追加ボタン押下時の処理
 */
const addNic = () => {
  editedVm.attachedNics.push({
    // 新規追加アイテムには、configで設定した prefix ("new-") を付けたIDを振る
    id: `new-${Date.now()}`,
    name: "",
    ipAddress: "",
  });
};

/**
 * ストレージ追加ボタン押下時の処理
 */
const addStorage = () => {
  editedVm.attachedStorages.push({
    id: `new-${Date.now()}`,
    name: "",
    size: 0,
  });
};
</script>

<template>
  <div class="p-4 space-y-6">
    <h2 class="text-xl font-bold">仮想マシン編集</h2>

    <section class="space-y-2">
      <div>
        <label class="block font-medium">名前:</label>
        <input v-model="editedVm.name" class="border p-1" />
      </div>
      <div>
        <label class="block font-medium">CPUコア数:</label>
        <input
          type="number"
          v-model.number="editedVm.cpuCore"
          class="border p-1"
        />
      </div>
      <div>
        <label class="block font-medium">メモリサイズ (MB):</label>
        <input
          type="number"
          v-model.number="editedVm.memorySize"
          class="border p-1"
        />
      </div>
    </section>

    <hr />

    <section>
      <h3 class="text-lg font-semibold mb-2">アタッチドNIC</h3>
      <div
        v-for="(nic, index) in editedVm.attachedNics"
        :key="nic.id"
        class="flex items-center gap-2 mb-2"
      >
        <label>
          名: <input v-model="nic.name" class="border p-1 w-32" />
        </label>
        <label>
          IP: <input v-model="nic.ipAddress" class="border p-1 w-40" />
        </label>
        <button
          @click="editedVm.attachedNics.splice(index, 1)"
          class="text-red-500 text-sm"
        >
          削除
        </button>
      </div>
      <button @click="addNic" class="text-blue-600 text-sm underline">
        + NIC追加
      </button>
    </section>

    <hr />

    <section>
      <h3 class="text-lg font-semibold mb-2">アタッチドストレージ</h3>
      <div
        v-for="(storage, index) in editedVm.attachedStorages"
        :key="storage.id"
        class="flex items-center gap-2 mb-2"
      >
        <label>
          名: <input v-model="storage.name" class="border p-1 w-32" />
        </label>
        <label>
          サイズ(GB):
          <input
            type="number"
            v-model.number="storage.size"
            class="border p-1 w-20"
          />
        </label>
        <button
          @click="editedVm.attachedStorages.splice(index, 1)"
          class="text-red-500 text-sm"
        >
          削除
        </button>
      </div>
      <button @click="addStorage" class="text-blue-600 text-sm underline">
        + ストレージ追加
      </button>
    </section>

    <hr />

    <div class="flex gap-4 mt-4">
      <button
        @click="saveChanges"
        :disabled="!isDirty || isSaving"
        class="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {{ isSaving ? "保存中..." : "保存" }}
      </button>

      <button
        @click="reset"
        :disabled="!isDirty || isSaving"
        class="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
      >
        リセット
      </button>
    </div>

    <div class="mt-8 p-4 bg-gray-100 rounded text-xs">
      <h3 class="font-bold">🔍 デバッグ情報 (Dirty State)</h3>
      <pre>{{ dirtyState }}</pre>
      <div v-if="errorMessage" class="text-red-600 font-bold mt-2">
        エラー: {{ errorMessage }}
      </div>
    </div>
  </div>
</template>
