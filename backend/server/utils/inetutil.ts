export type Inet4 = {
  address: string; // ドット10進表現
  addressInt: number; // 32ビット整数表現
  prefixLength: number; // プレフィックス長 0~32
};

// innerがouterに含まれているかを判定する
// 例 10.0.1.0/24は10,0.0.0/16に含まれるが
// 10.1.0.0/24は10.0.0.0/16に含まれない
export const isCidrInCidr = (inner: Inet4, outer: Inet4): boolean => {
  if (inner.prefixLength < outer.prefixLength) {
    return false;
  }
  const mask =
    outer.prefixLength === 0 ? 0 : ~((1 << (32 - outer.prefixLength)) - 1);
  return (inner.addressInt & mask) === (outer.addressInt & mask);
};

// Inet4配列の中に、重複したCIDRがあるかを判定する
export const hasOverlappingCidrs = (cidrs: Inet4[]): boolean => {
  for (let i = 0; i < cidrs.length; i++) {
    for (let j = i + 1; j < cidrs.length; j++) {
      if (i === j) continue;
      if (
        isCidrInCidr(cidrs[i], cidrs[j]) ||
        isCidrInCidr(cidrs[j], cidrs[i])
      ) {
        return true;
      }
    }
  }
  return false;
};

// CIDR文字列をパースしてInet4オブジェクトを返す
// 不正な場合はnullを返す
export const parseCidr = (cidr: string): Inet4 | null => {
  const parts = cidr.split("/");
  if (parts.length !== 2) {
    return null;
  }

  const address = parts[0];
  const prefixLength = parseInt(parts[1], 10);
  if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    return null;
  }

  const octets = address.split(".");
  if (octets.length !== 4) {
    return null;
  }

  const addressInt = octets.reduce((acc, octet) => {
    const byte = parseInt(octet, 10);
    if (isNaN(byte) || byte < 0 || byte > 255) {
      throw new Error("Invalid IP address");
    }
    return (acc << 8) | byte;
  }, 0);

  return {
    address,
    addressInt,
    prefixLength,
  };
};
