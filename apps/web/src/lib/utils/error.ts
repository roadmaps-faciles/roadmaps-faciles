import { config } from "@/config";

const SOURCE = `${config.brand.name}.${config.appVersionCommit}`;

export function clientParseError(error: Error): AppError | Error {
  try {
    const json = JSON.parse(error.message) as JsonifiedError;
    if (json.source === SOURCE && json.name in ERROR_MAP) {
      const ErrorClass = ERROR_MAP[json.name];
      const parsedError = new ErrorClass(json.message);
      parsedError.stack = json.stack;
      return parsedError;
    }
    return error;
  } catch {
    return error;
  }
}

export class AppError extends Error {
  public readonly source = SOURCE;
  public readonly name: string = "AppError";
}

export class IllogicalError extends AppError {
  public readonly name: string = "IllogicalError";
}

export class UnexpectedError extends AppError {
  public readonly name: string = "UnexpectedError";
}

export class UnexpectedRepositoryError extends UnexpectedError {
  public readonly name: string = "UnexpectedRepositoryError";
}

export class UnexpectedMailerError extends UnexpectedError {
  public readonly name: string = "UnexpectedMailerError";
}

export class UnexpectedSessionError extends UnexpectedError {
  public readonly name: string = "UnexpectedSessionError";
}

export class NotImplementError extends AppError {
  public readonly name: string = "NotImplementError";
}

export class JsonifiedError<T extends Error = Error> extends AppError {
  public readonly name: string = "JsonifiedError";
  constructor(public readonly original: T) {
    super(JSON.stringify(original, Object.getOwnPropertyNames(original)));
    this.name = original.name;
    this.stack = original.stack;
  }
}

const ERROR_MAP: Record<string, typeof AppError> = {
  AppError,
  IllogicalError,
  UnexpectedError,
  UnexpectedRepositoryError,
  UnexpectedMailerError,
  UnexpectedSessionError,
  NotImplementError,
};

export const notImplemented = () => {
  throw new NotImplementError();
};

export const illogical = (message: string) => {
  throw new IllogicalError(message);
};
