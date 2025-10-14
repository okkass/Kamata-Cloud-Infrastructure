<template>
  <div class="section-form">
    <h3 class="section-title mb-4">{{ title }}</h3>

    <table class="w-full">
      <thead class="text-xs text-gray-600 text-left">
        <tr>
          <th class="pb-2 w-[25%]">ルール名</th>
          <th class="pb-2 w-[18%]">プロトコル</th>
          <th class="pb-2 w-[18%]">ポート番号</th>
          <th class="pb-2 w-[39%]">送信元IP</th>
          <th class="pb-2 w-12"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(rule, index) in rules"
          :key="rule.key"
          class="border-t border-gray-200"
        >
          <td class="py-2 align-top">
            <input
              type="text"
              v-model="rule.value.name"
              class="form-input"
              :class="{
                'form-border-error':
                  errors[`${fieldNamePrefix}[${index}].name`],
              }"
              placeholder="例: allow-http"
            />
            <p
              v-if="errors[`${fieldNamePrefix}[${index}].name`]"
              class="text-error mt-1"
            >
              {{ errors[`${fieldNamePrefix}[${index}].name`] }}
            </p>
          </td>

          <td class="py-2 align-top">
            <select v-model="rule.value.protocol" class="form-input">
              <option>TCP</option>
              <option>UDP</option>
              <option>ICMP</option>
              <option>Any</option>
            </select>
          </td>

          <td class="py-2 align-top">
            <input
              type="text"
              v-model="rule.value.port"
              class="form-input"
              :class="{
                'form-border-error':
                  errors[`${fieldNamePrefix}[${index}].port`],
              }"
              placeholder="例: 80"
              :disabled="
                rule.value.protocol === 'Any' || rule.value.protocol === 'ICMP'
              "
            />
            <p
              v-if="errors[`${fieldNamePrefix}[${index}].port`]"
              class="text-error mt-1"
            >
              {{ errors[`${fieldNamePrefix}[${index}].port`] }}
            </p>
          </td>

          <td class="py-2 align-top">
            <input
              type="text"
              v-model="rule.value.targetIp"
              class="form-input"
              :class="{
                'form-border-error':
                  errors[`${fieldNamePrefix}[${index}].targetIp`],
              }"
              placeholder="例: 0.0.0.0/0"
            />
            <p
              v-if="errors[`${fieldNamePrefix}[${index}].targetIp`]"
              class="text-error mt-1"
            >
              {{ errors[`${fieldNamePrefix}[${index}].targetIp`] }}
            </p>
          </td>

          <td class="py-2 text-center align-middle">
            <button
              type="button"
              @click="$emit('delete-rule', index)"
              class="btn-cross-delete text-xl font-bold"
            >
              &times;
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4">
      <button
        type="button"
        @click="$emit('add-rule')"
        class="btn btn-add text-sm"
      >
        + ルールを追加
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * セキュリティグループルールテーブル (RuleTable.vue)
 * ---------------------------------------------------------------------------------
 * このコンポーネントは、セキュリティグループのルール（インバウンド/アウトバウンド）を
 * 一覧表示し、編集するためのUI部品です。
 * =================================================================================
 */

defineProps({
  title: String,
  rules: Array,
  errors: Object,
  fieldNamePrefix: String,
});

defineEmits(["add-rule", "delete-rule"]);
</script>
