  /**
   * 日付文字列を指定された形式 'YYYY/MM/DD HH:mm' にフォーマットする
   * @param dateString - ISO 8601形式の日付文字列 (例: "2025-10-08T06:18:00.000Z")
   * @returns {string} - フォーマット後の文字列。無効な日付の場合は空文字を返す。
   */
  export const formatDateTime = (dateString: string | Date): string => {
    // 入力された文字列からDateオブジェクトを生成
    const date = new Date(dateString);

    // Dateオブジェクトが有効かどうかをチェック
    if (isNaN(date.getTime())) {
      console.error("Invalid date string provided:", dateString);
      return ""; // 無効な場合は空文字を返す
    }

    // 年、月、日、時、分をそれぞれ取得
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth()は0から始まるため+1する
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 各要素が1桁の場合に、先頭に0を付けるためのヘルパー関数
    const padZero = (num: number) => String(num).padStart(2, "0");

    // 指定された形式 'YYYY/MM/DD HH:mm' に組み立てて返す
    return `${year}/${padZero(month)}/${padZero(day)} ${padZero(
      hours
    )}:${padZero(minutes)}`;
  };
