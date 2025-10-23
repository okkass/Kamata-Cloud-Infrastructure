export default defineEventHandler(() => {
  const middlewares: Array<MiddleWareDTO> = [
    {
      id: "02a0c981-d96a-40e7-acf2-3345ed41a055",
      name: "Nginx",
    },
    {
      id: "b1a1c981-d96a-40e7-acf2-3345ed41a056",
      name: "Apache",
    },
    {
      id: "c2a0c981-d96a-40e7-acf2-3345ed41a057",
      name: "Mysql",
    },
  ];
  return middlewares;
});
