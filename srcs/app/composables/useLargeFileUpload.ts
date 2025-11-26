import { ref } from "vue";
export const useLargeFileUpload = () => {
  const isUploading = ref(false);
  const progress = ref(0); // 0 〜 100 の進捗率
  const { addToast } = useToast();
  
  // 途中キャンセルのためのコントローラー
  let xhr: XMLHttpRequest | null = null;

  /**
   * ファイルアップロードを実行する
   * @param url - APIのエンドポイント
   * @param formData - 送信するFormData
   */
  const uploadFile = (url: string, formData: FormData): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (isUploading.value) return;

      isUploading.value = true;
      progress.value = 0;

      xhr = new XMLHttpRequest();

      // 1. 進捗イベントの監視
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          // パーセンテージを計算
          progress.value = Math.round((event.loaded / event.total) * 100);
        }
      });

      // 2. 完了時の処理
      xhr.addEventListener("load", () => {
        isUploading.value = false;
        if (xhr && xhr.status >= 200 && xhr.status < 300) {
          // レスポンスをJSONとしてパース
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr?.responseText);
          }
        } else {
          reject(new Error(xhr?.statusText || "Upload failed"));
        }
      });

      // 3. エラー時の処理
      xhr.addEventListener("error", () => {
        isUploading.value = false;
        reject(new Error("Network error"));
      });

      // 4. キャンセル時の処理
      xhr.addEventListener("abort", () => {
        isUploading.value = false;
        reject(new Error("Aborted"));
      });

      // 5. リクエスト設定
      xhr.open("POST", url);
      
      // ★重要: 必要なら認証トークンなどをヘッダーに追加してください
      // const token = useCookie('auth_token');
      // if (token.value) xhr.setRequestHeader("Authorization", `Bearer ${token.value}`);

      // 6. 送信 (FormDataをそのまま送ると自動で Content-Type: multipart/form-data になる)
      xhr.send(formData);
    });
  };

  /**
   * アップロードを中止する
   */
  const cancelUpload = () => {
    if (xhr) {
      xhr.abort();
      xhr = null;
      isUploading.value = false;
      addToast({ message: "アップロードを中止しました。", type: "info" });
    }
  };

  return {
    uploadFile,
    cancelUpload,
    isUploading,
    progress, // これをプログレスバーにバインドする
  };
};