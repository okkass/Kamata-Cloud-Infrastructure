/**
 * 日付文字列を指定された形式 'YYYY/MM/DD HH:mm' にフォーマットする
 * @param dateString - ISO 8601形式の日付文字列 (例: "2025-10-08T06:18:00.000Z")
 * @returns {string} - フォーマット後の文字列。無効な日付の場合は'—'を返す。
 */
export const formatDateTime = (
  dateString: string | Date | undefined | null
): string => {
  // ✨ 関数の冒頭で無効な値をチェック
  if (!dateString) {
    return "—"; // または空文字 ''
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.error("Invalid date string provided:", dateString);
    return "—"; // 無効な場合はハイフンを返す
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};
