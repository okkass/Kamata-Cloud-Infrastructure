export const useUser = () => {
  // NuxtのuseStateを使い、ユーザー情報をアプリ全体で共有・保持する
  const user = useState<Record<string, any> | null>("user", () => null);

  // isAdminの状態を算出プロパティとして定義
  const isAdmin = computed(() => {
    // ユーザー情報がなければfalse
    if (!user.value) return false;

    // isAdminプロパティがtrueかどうかを安全にチェック
    return user.value.isAdmin === true;
  });

  // ユーザー情報を取得する非同期関数
  const fetchUser = async () => {
    // 既にユーザー情報があれば再取得しない
    if (user.value !== null) return;

    try {
      const { data } = await useFetch("users/me", {
        $fetch: useNuxtApp().$apiFetch,
      });
      user.value = data.value as Record<string, any>;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      user.value = null; // エラー時はnullに設定
    }
  };

  return {
    user,
    isAdmin,
    fetchUser,
  };
};
