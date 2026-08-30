export type TSuccessResponse<T extends object = object> = {
  data: T;
};

export type TErrorResponse<T extends object = object> = {
  title: string;
  status: number;
  detail: string;
  errors: T;
};
