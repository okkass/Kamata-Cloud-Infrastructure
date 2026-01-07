<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Test User Permission Page</h1>
    <p>ユーザーパーミッションのテストページです。</p>
    <div>
      <p>ユーザーID: {{ user?.id }}</p>
      <p>管理者ですか？ {{ isAdmin }}</p>
      <p>イメージ管理者ですか？ {{ isImageAdmin }}</p>
      <p>インスタンスタイプ管理者ですか？ {{ isInstanceTypeAdmin }}</p>
      <p>ネットワーク管理者ですか？ {{ isNetworkAdmin }}</p>
      <p>ノード管理者ですか？ {{ isNodeAdmin }}</p>
      <p>セキュリティグループ管理者ですか？ {{ isSecurityGroupAdmin }}</p>
      <p>仮想マシン管理者ですか？ {{ isVirtualMachineAdmin }}</p>
    </div>
    <p>
      表示を切り替えるには、mock/server/api/users/me.get.tsを参照してください。
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ユーザーパーミッションテストページ (test-user-permission.vue)
 * =================================================================================
 */
import { useUserPermission } from "~/composables/useUserPermission";

const {
  user,
  isAdmin,
  isImageAdmin,
  isInstanceTypeAdmin,
  isNetworkAdmin,
  isNodeAdmin,
  isSecurityGroupAdmin,
  isVirtualMachineAdmin,
  fetchUser,
} = useUserPermission();

fetchUser();
</script>
