import { MiddlewareResponse } from "@app/shared/types";

let middlewares: Array<MiddlewareResponse>;

const initMiddlewares = (): Array<MiddlewareResponse> => {
  return [
    {
      id: "8b37a135-d3ce-47a4-a030-b9ba880bb89d",
      name: "nginx",
    },
    {
      id: "0af4f00e-40be-4c9c-b8e5-6b6de2c4958f",
      name: "apache",
    },
  ];
};

const list = (): Array<MiddlewareResponse> => {
  if (!middlewares) {
    middlewares = initMiddlewares();
  }
  return middlewares;
};

export const MiddlewareRepository = {
  list,
};

export default MiddlewareRepository;
