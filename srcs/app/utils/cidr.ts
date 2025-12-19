/**
 * CIDR形式の文字列を受け取り、ネットワークアドレスとして妥当か（ホスト部が0か）を判定する
 * @param cidr - 例: "192.168.3.0/24"
 */
export const isValidNetworkAddress = (cidr: string): boolean => {
  const [ip, prefixStr] = cidr.split("/");

  if (!ip || !prefixStr) return false;

  const prefix = parseInt(prefixStr, 10);

  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  // IPを32ビットの数値に変換
  const ipParts = ip.split(".").map(Number);
  if (ipParts.length !== 4 || ipParts.some((p) => isNaN(p) || p < 0 || p > 255))
    return false;

  const ipInt =
    (ipParts[0]! << 24) | (ipParts[1]! << 16) | (ipParts[2]! << 8) | ipParts[3]!;

  // マスクを作成 (例: /24 なら 上位24ビットが1)
  // 注意: JSのビット演算は32ビット有符号整数として扱われるため >>> 0 で無符号化
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;

  // 「IPアドレス」と「マスク」をAND演算した結果が「元のIP」と同じなら、ホスト部は0
  return (ipInt & mask) >>> 0 === ipInt >>> 0;
};
