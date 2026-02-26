import * as z from 'zod';

const isValidNetworkAddress = (cidr) => {
  const [ip, prefixStr] = cidr.split("/");
  if (!ip || !prefixStr) return false;
  const prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;
  const ipParts = ip.split(".").map(Number);
  if (ipParts.length !== 4 || ipParts.some((p) => isNaN(p) || p < 0 || p > 255))
    return false;
  const ipInt = ipParts[0] << 24 | ipParts[1] << 16 | ipParts[2] << 8 | ipParts[3];
  const mask = prefix === 0 ? 0 : 4294967295 << 32 - prefix >>> 0;
  return (ipInt & mask) >>> 0 === ipInt >>> 0;
};
const SubnetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "サブネット名は必須です。"),
  cidr: z.cidrv4("有効なCIDR形式である必要があります。").refine((cidr) => isValidNetworkAddress(cidr), {
    message: "ネットワークアドレスが無効です。ホスト部は0である必要があります。"
  })
});
const VirtualNetworkBaseSchema = z.object({
  name: z.string().min(1, "ネットワーク名は必須です。"),
  cidr: z.cidrv4("有効なCIDR形式である必要があります。").refine((cidr) => isValidNetworkAddress(cidr), {
    message: "ネットワークアドレスが無効です。ホスト部は0である必要があります。"
  })
});
const VirtualNetworkCreateSchema = VirtualNetworkBaseSchema;
const VirtualNetworkCreateFullSchema = VirtualNetworkCreateSchema.extend(
  {
    initialSubnets: z.array(SubnetSchema)
  }
);
const VirtualNetworkEditSchema = VirtualNetworkBaseSchema.extend({
  subnets: z.array(SubnetSchema)
});

export { VirtualNetworkCreateFullSchema as V, VirtualNetworkEditSchema as a };
//# sourceMappingURL=virtual-network-9nD05ROF.mjs.map
