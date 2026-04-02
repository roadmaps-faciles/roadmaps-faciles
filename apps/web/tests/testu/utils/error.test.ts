import {
  AppError,
  clientParseError,
  IllogicalError,
  illogical,
  JsonifiedError,
  NotImplementError,
  notImplemented,
  UnexpectedError,
  UnexpectedMailerError,
  UnexpectedRepositoryError,
  UnexpectedSessionError,
} from "@/utils/error";

describe("error class hierarchy", () => {
  it("AppError extends Error", () => {
    const err = new AppError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("AppError");
    expect(err.message).toBe("test");
    expect(err.source).toBeDefined();
  });

  it("IllogicalError extends AppError", () => {
    const err = new IllogicalError("illogical");
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(IllogicalError);
    expect(err.name).toBe("IllogicalError");
  });

  it("UnexpectedError extends AppError", () => {
    const err = new UnexpectedError("unexpected");
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("UnexpectedError");
  });

  it("UnexpectedRepositoryError extends UnexpectedError", () => {
    const err = new UnexpectedRepositoryError("repo error");
    expect(err).toBeInstanceOf(UnexpectedError);
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("UnexpectedRepositoryError");
  });

  it("UnexpectedMailerError extends UnexpectedError", () => {
    const err = new UnexpectedMailerError("mailer error");
    expect(err).toBeInstanceOf(UnexpectedError);
    expect(err.name).toBe("UnexpectedMailerError");
  });

  it("UnexpectedSessionError extends UnexpectedError", () => {
    const err = new UnexpectedSessionError("session error");
    expect(err).toBeInstanceOf(UnexpectedError);
    expect(err.name).toBe("UnexpectedSessionError");
  });

  it("NotImplementError extends AppError", () => {
    const err = new NotImplementError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.name).toBe("NotImplementError");
  });
});

describe("JsonifiedError", () => {
  it("serializes the original error", () => {
    const original = new Error("original message");
    const jsonified = new JsonifiedError(original);
    expect(jsonified).toBeInstanceOf(AppError);
    expect(jsonified.original).toBe(original);

    const parsed = JSON.parse(jsonified.message);
    expect(parsed.message).toBe("original message");
  });
});

describe("notImplemented", () => {
  it("throws NotImplementError", () => {
    expect(() => notImplemented()).toThrow(NotImplementError);
  });
});

describe("illogical", () => {
  it("throws IllogicalError with message", () => {
    expect(() => illogical("should not happen")).toThrow(IllogicalError);
    expect(() => illogical("should not happen")).toThrow("should not happen");
  });
});

describe("clientParseError", () => {
  it("parses a valid JSON AppError message", () => {
    const source = new AppError("test");
    const jsonError = new Error(JSON.stringify({ source: source.source, name: "AppError", message: "test parsed" }));
    const parsed = clientParseError(jsonError);
    expect(parsed).toBeInstanceOf(AppError);
    expect(parsed.message).toBe("test parsed");
  });

  it("returns original error for invalid JSON", () => {
    const error = new Error("not json");
    const result = clientParseError(error);
    expect(result).toBe(error);
  });

  it("returns original error for unknown error name", () => {
    const source = new AppError("test");
    const jsonError = new Error(JSON.stringify({ source: source.source, name: "UnknownError", message: "unknown" }));
    const result = clientParseError(jsonError);
    expect(result).toBe(jsonError);
  });
});
