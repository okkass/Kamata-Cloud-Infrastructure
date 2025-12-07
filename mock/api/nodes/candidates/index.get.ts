export default defineEventHandler((event) => {
  const candidates: Array<NodeCandidateDTO> = [
    {
      name: "Node 3",
      ipAddress: "10.10.10.100",
    },
    {
      name: "Node 4",
      ipAddress: "10.10.10.101",
    },
  ];
  return candidates;
});
