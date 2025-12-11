/**
 * =================================================================================
 * バックアップ検証ロジック (useBackupValidator.ts)
 * ---------------------------------------------------------------------------------
 * バックアップデータが復元可能な状態かどうかなどの判定ロジックを提供します。
 * =================================================================================
 */

// 型定義は自動インポート前提 (BackupResponse)

export function useBackupValidator() {
  /**
   * バックアップが復元可能か（復元先情報を持っているか）を判定する
   * @param backup 判定対象のバックアップデータ
   * @returns 復元可能な場合は true
   */
  const isRestorable = (backup: BackupResponse | null | undefined): boolean => {
    if (!backup) return false;

    // バックエンドの仕様: targetVirtualMachine と targetStorage が必須
    return !!backup.targetVirtualMachine && !!backup.targetStorage;
  };

  return {
    isRestorable,
  };
}
