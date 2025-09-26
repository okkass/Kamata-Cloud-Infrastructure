export type DeleteResult = {
  success: boolean;
  error?: {
    type: "permission" | "notFound" | "unknown";
    message: string;
    statusCode: number;
  };
};
