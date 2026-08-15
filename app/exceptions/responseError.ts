export default class ResponseError<T extends object = object> extends Error {
  status: number;
  errors: T;

  constructor({
    status,
    errors,
    message,
  }: Readonly<{
    status: number;
    errors: T;
    message?: string;
  }>) {
    super(message);

    this.status = status;
    this.errors = errors;
  }
}
