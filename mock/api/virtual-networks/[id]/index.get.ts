import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  if (!validate(id)) {
    createError({ statusCode: 400, message: "Invalid UUID format" });
  }
  const mock: Array<VirtualNetworkDTO> = [
    {
      id: "9653a4bb-3c60-4950-abf0-2702023696c2",
      name: "vpc-1",
      cidr: "10.0.0.0/16",
      createdAt: new Date().toISOString(),
      subnets: [
        {
          id: "effdf1f8-3be5-4cae-819a-5832fc053b1b",
          name: "subnet-1",
          cidr: "10.0.0.0/24",
          possibleExternalConnection: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "6146ccd7-ddf8-42c3-9edf-66ce6f7a2c4b",
          name: "subnet-2",
          cidr: "10.0.0.1/24",
          possibleExternalConnection: false,
          createdAt: new Date().toISOString(),
        },
      ],
      inboundTraffic: 125500.0, // in bps
      outboundTraffic: 98000.0, // in bps
    },
    {
      id: "f29a1d76-f506-4a3b-bb3b-7acf35d1c2cd",
      name: "vpc-2",
      cidr: "10.0.0.0/16",
      createdAt: new Date().toISOString(),
      subnets: [
        {
          id: "84d6e21a-8e71-4efc-88ad-5d425f3646c9",
          name: "subnet-1",
          cidr: "10.0.0.0/24",
          possibleExternalConnection: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "56c483f3-1817-4656-bc5f-f0836af0e796",
          name: "subnet-2",
          cidr: "10.0.0.1/24",
          possibleExternalConnection: false,
          createdAt: new Date().toISOString(),
        },
      ],
      inboundTraffic: 125500.0, // in bps
      outboundTraffic: 98000.0, // in bps
    },
  ];
  const vpc = mock.find((p) => p.id === id);
  if (!vpc) {
    createError({ statusCode: 404, message: "Storage pool not found" });
  }
  return vpc;
});
