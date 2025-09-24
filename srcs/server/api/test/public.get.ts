// /api/public へのGETリクエストを処理
export default defineEventHandler(() => {
  return {
    message: 'これは誰でもアクセスできる公開データです。',
    timestamp: new Date().toISOString(),
  };
});