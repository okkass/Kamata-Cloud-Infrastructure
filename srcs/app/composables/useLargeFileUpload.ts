import { ref } from "vue";
import { useToast } from "~/composables/useToast";

export const useLargeFileUpload = () => {
  const isUploading = ref(false);
  const progress = ref(0);

  // useToastから必要な関数を取得
  const { addToast, updateToast, removeToast } = useToast();

  // トーストIDを保持する変数
  let toastId: string | null = null;

  // XHRオブジェクト
  let xhr: XMLHttpRequest | null = null;

  /**
   * ファイルアップロードを実行する
   */
  const uploadFile = (url: string, formData: FormData): Promise<any> => {
    const runtimeconfig = useRuntimeConfig();
    return new Promise((resolve, reject) => {
      if (isUploading.value) return;

      isUploading.value = true;
      progress.value = 0;

      // ★ 1. アップロード開始時にトーストを表示し、IDを保持
      // duration: 0 にして自動で消えないようにする
      toastId = addToast({
        message: "ファイルをアップロード中...",
        type: "info",
        progress: 0,
        duration: 0,
      });

      xhr = new XMLHttpRequest();

      // --- 2. 進捗イベント ---
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          progress.value = percent;

          // ★ トーストの進捗バーを更新
          if (toastId) {
            updateToast(toastId, {
              progress: percent,
              message: `アップロード中... (${percent}%)`,
            });
          }
        }
      });

      // --- 3. 完了時の処理 ---
      xhr.addEventListener("load", () => {
        isUploading.value = false;

        if (xhr && xhr.status >= 200 && xhr.status < 300) {
          // ★ 成功トーストに更新
          if (toastId) {
            updateToast(toastId, {
              type: "success",
              message: "アップロードが完了しました！",
              progress: undefined, // プログレスバーを消す
            });
            // 3秒後に消す
            setTimeout(() => {
              if (toastId) removeToast(toastId);
              toastId = null;
            }, 3000);
          }

          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr?.responseText);
          }
        } else {
          // 失敗時
          handleError(new Error(xhr?.statusText || "Upload failed"));
        }
      });

      // --- 4. エラー・中断時の共通処理 ---
      const handleError = (error: Error) => {
        isUploading.value = false;
        // ★ エラートーストに更新
        if (toastId) {
          updateToast(toastId, {
            type: "error",
            message: "アップロードに失敗しました。",
            details: error.message,
            progress: undefined,
          });
          // 5秒後に消す
          setTimeout(() => {
            if (toastId) removeToast(toastId);
            toastId = null;
          }, 5000);
        }
        reject(error);
      };

      xhr.addEventListener("error", () =>
        handleError(new Error("Network error"))
      );
      xhr.addEventListener("abort", () => handleError(new Error("Aborted")));

      // --- 5. 送信 ---
      const baseUrl = runtimeconfig.public.apiBaseUrl || "";
      const fullUrl = baseUrl
        ? `${baseUrl.replace(/\/$/, "")}/api${
            url.startsWith("/") ? url : `/${url}`
          }`
        : url;
      xhr.open("POST", fullUrl);
      xhr.setRequestHeader("Authorization", "Bearer mock-token"); // ハードコードなので、いずれ本物のトークンに置き換える必要があります

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

      // ★ キャンセル時はトーストを更新して消す
      if (toastId) {
        updateToast(toastId, {
          type: "info",
          message: "アップロードを中止しました。",
          progress: undefined,
        });
        setTimeout(() => {
          if (toastId) removeToast(toastId);
          toastId = null;
        }, 3000);
      }
    }
  };

  return {
    uploadFile,
    cancelUpload,
    isUploading,
    progress,
  };
};
