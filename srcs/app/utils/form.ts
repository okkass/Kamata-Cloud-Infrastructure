/**
 * オブジェクトをFormDataに変換する型安全なヘルパー関数
 * @param data - 送信したいデータオブジェクト (undefined/null は無視されます)
 */
export const toFormData = <T extends Record<string, any>>(
  data: T
): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    // 値がない場合はスキップ
    if (value === undefined || value === null) return;

    // File または Blob の場合
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    }
    // 配列の場合 (必要なら)
    else if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, String(v)));
    }
    // その他のプリミティブ値 (string, number, boolean)
    else {
      formData.append(key, String(value));
    }
  });

  return formData;
};
