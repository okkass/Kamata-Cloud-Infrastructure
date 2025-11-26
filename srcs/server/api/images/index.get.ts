import { ImageResponse } from "~~/shared/types";

export default defineEventHandler((event) => {
  const images: Array<ImageResponse> = [
    {
      id: "057a9f47-380e-43fe-b3c4-22a46cd97220",
      name: "Ubuntu 22.04",
      description: "Setumei",
      createdAt: new Date().toISOString(),
      size: 19190 * 1024 * 1024, // 19190MB(19.19GB)をバイトで表現
    },
    {
      id: "da4d9350-30f2-4280-82ce-0e5547209c1d",
      name: "Debian bookwarm",
      description: "Setumei",
      createdAt: new Date().toISOString(),
      size: 45450 * 1024 * 1024, // 45450MB(45.45GB)をバイトで表現
    },
  ];
  return images;
});
