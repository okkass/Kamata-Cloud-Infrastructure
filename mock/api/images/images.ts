import type { ImageResponse } from "~/types/api-types";

export const images: Array<ImageResponse> = [
  {
    id: "10e18237-1623-4fec-87e7-c856ea0c3acf",
    name: "Ubuntu-22.04",
    description: "Ubuntu 22.04 LTS",
    createdAt: "2023-01-15T10:00:00Z",
    size: 2048 * 1024 * 1024, // 2 GB
    nodeId: "79903dbb-fc17-4a82-8ac1-e8e444883493",
  },
  {
    id: "7d9a6dad-ad3a-4cad-90fc-10aa6039bc85",
    name: "Ubuntu-24.04",
    description: "Ubuntu 24.04 LTS",
    createdAt: "2023-01-15T10:00:00Z",
    size: 4096 * 1024 * 1024, // 4 GB
    nodeId: "79903dbb-fc17-4a82-8ac1-e8e444883493",
  },
  {
    id: "082317da-c0cd-4201-924e-6e5043ce7669",
    name: "Debian-12",
    description: "Debian 12",
    createdAt: "2023-01-15T10:00:00Z",
    size: 4096 * 1024 * 1024, // 4 GB
    nodeId: "79903dbb-fc17-4a82-8ac1-e8e444883493",
  },
];
