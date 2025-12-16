import { validate } from "uuid";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id || !validate(id)) {
    createError({ statusCode: 400, message: "Invalid or missing ID" });
  }
  const mock: Array<SecurityGroupDTO> = [
    {
      id: "399f4fd6-8335-46f7-bd80-4e53eb0fbe9b",
      name: "default",
      description: "Default security group",
      rules: [
        {
          id: "11365b65-bea5-4d02-b7d0-1057fded5b81",
          name: "Allow HTTP",
          ruleType: "inbound",
          port: 80,
          protocol: "tcp",
          targetIp: "0.0.0.0/0",
          action: "allow",
          createdAt: new Date().toISOString(),
        },
        {
          id: "6ae22fa7-bc84-4b14-ac67-ff45fa1fd846",
          name: "Allow all",
          ruleType: "outbound",
          protocol: "any",
          port: null,
          targetIp: "0.0.0.0/0",
          action: "allow",
          createdAt: new Date().toISOString(),
        },
        {
          id: "rgsedfg-1234-5678-9101-abcdefghijklm",
          name: "Allow HTTP",
          ruleType: "inbound",
          port: 80,
          protocol: "tcp",
          targetIp: "0.0.0.0/0",
          action: "allow",
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: "5381dc40-e9ec-4e77-b738-3447d1e8212f",
      name: "ssh-only",
      description: "Allow only SSH",
      rules: [
        {
          id: "91c0bbce-ba6e-45ae-854b-944e5d64887f",
          name: "Allow ssh",
          ruleType: "inbound",
          port: 22,
          protocol: "tcp",
          targetIp: "0.0.0.0/0",
          action: "allow",
          createdAt: new Date().toISOString(),
        },
        {
          id: "5b133f69-15af-457a-8121-e9b2253bf883",
          name: "Allow all",
          ruleType: "outbound",
          protocol: "any",
          port: null,
          targetIp: "0.0.0.0/0",
          action: "allow",
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  const securityGroup: SecurityGroupDTO | undefined = mock.find(
    (sg) => sg.id === id
  );
  if (!securityGroup) {
    createError({ statusCode: 404, message: "Security group not found" });
  }
  return securityGroup;
});
