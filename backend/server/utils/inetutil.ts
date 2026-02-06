export type Inet4 = {
  address: string; // ドット10進表現
  network: string; // ネットワークアドレスのドット10進表現
  addressInt: number; // 32ビット整数表現
  netmaskInt: number; // ネットマスクの32ビット整数表現
  brdcastInt: number; // ブロードキャストアドレスの32ビット整数表現
  networkInt: number; // ネットワークアドレスの32ビット整数表現
  prefixLength: number; // プレフィックス長 0~32
};

// CIDR表記のIPv4アドレスを解析してInet4オブジェクトを返す関数
// 不正値に対してはErrorをスローする
export const parseCidr4 = (cidr: string): Inet4 => {
  // /で分割
  const parts = cidr.split("/");
  // 部分が2つでない場合は不正
  if (parts.length !== 2) {
    throw new Error(`Invalid CIDR notation: ${cidr}`);
  }

  const address = parts[0];
  const prefixLength = Number(parts[1]);

  // プレフィックス長が0~32の範囲外なら不正
  if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    throw new Error(`Invalid prefix length: ${parts[1]}`);
  }

  // IPv4アドレスを32ビット整数に変換
  const addressArr = address.split(".").map((octet) => Number(octet));
  if (
    addressArr.length !== 4 ||
    addressArr.some(
      (octet) =>
        isNaN(octet) || octet < 0 || octet > 255 || !Number.isInteger(octet),
    )
  ) {
    throw new Error(`Invalid IPv4 address: ${address}`);
  }
  const addressInt =
    ((addressArr[0] << 24) |
      (addressArr[1] << 16) |
      (addressArr[2] << 8) |
      addressArr[3]) >>>
    0;

  // ネットマスクの32ビット整数表現を計算
  const netmaskInt = prefixLength === 0 ? 0 : (~0 << (32 - prefixLength)) >>> 0;

  // ブロードキャストアドレスの32ビット整数表現を計算
  const brdcastInt = (addressInt | ~netmaskInt) >>> 0;

  const networkInt = (addressInt & netmaskInt) >>> 0;

  // ネットワークアドレスのドット10進表現を計算
  const network = [
    (networkInt >>> 24) & 0xff,
    (networkInt >>> 16) & 0xff,
    (networkInt >>> 8) & 0xff,
    networkInt & 0xff,
  ].join(".");

  return {
    address,
    addressInt,
    netmaskInt,
    brdcastInt,
    networkInt,
    network,
    prefixLength,
  };
};

// 2つのCIDRに重複範囲があるかどうかを判定する関数
export const hasOverlappingCidrs = (cidr1: Inet4, cidr2: Inet4): boolean => {
  return !(
    cidr1.brdcastInt < cidr2.networkInt || cidr2.brdcastInt < cidr1.networkInt
  );
};

// cidrChildがcidrParentの範囲に完全に含まれているかどうかを判定する関数
export const isCidrInCidr = (cidrChild: Inet4, cidrParent: Inet4): boolean => {
  return (
    cidrParent.networkInt <= cidrChild.networkInt &&
    cidrChild.brdcastInt <= cidrParent.brdcastInt
  );
};
