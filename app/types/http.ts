export type TSuccessResponse<T = unknown> = {
  data: T;
};

export type TErrorResponse<T = unknown> = {
  title: string;
  status: number;
  detail: string;
  errors: T;
};
