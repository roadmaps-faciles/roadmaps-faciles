import { isDatabaseUnavailableError } from "@/utils/dbError";
import { DatabaseUnavailableError, JsonifiedError } from "@/utils/error";

describe("isDatabaseUnavailableError", () => {
  it("matches by error name (PrismaClientInitializationError)", () => {
    const err = new Error("boom");
    err.name = "PrismaClientInitializationError";
    expect(isDatabaseUnavailableError(err)).toBe(true);
  });

  it("matches by error name (PrismaClientRustPanicError)", () => {
    const err = new Error("rust panic");
    err.name = "PrismaClientRustPanicError";
    expect(isDatabaseUnavailableError(err)).toBe(true);
  });

  it("matches DatabaseUnavailableError instances", () => {
    const err = new DatabaseUnavailableError("db down");
    expect(isDatabaseUnavailableError(err)).toBe(true);
  });

  it("matches by message: Can't reach database server", () => {
    const err = new Error("Can't reach database server at `localhost:5432`");
    expect(isDatabaseUnavailableError(err)).toBe(true);
  });

  it("matches by message: ECONNREFUSED", () => {
    const err = new Error("connect ECONNREFUSED 127.0.0.1:5432");
    expect(isDatabaseUnavailableError(err)).toBe(true);
  });

  it("matches by Prisma code P1001 in message", () => {
    const err = new Error("Error P1001: server is unreachable");
    expect(isDatabaseUnavailableError(err)).toBe(true);
  });

  it("matches connection terminated unexpectedly", () => {
    const err = new Error("connection terminated unexpectedly");
    expect(isDatabaseUnavailableError(err)).toBe(true);
  });

  it("does NOT match a random Error", () => {
    const err = new Error("something else went wrong");
    expect(isDatabaseUnavailableError(err)).toBe(false);
  });

  it("does NOT match a validation error", () => {
    const err = new Error("field 'email' is required");
    err.name = "ValidationError";
    expect(isDatabaseUnavailableError(err)).toBe(false);
  });
});

describe("DatabaseUnavailableError", () => {
  it("extends Error and carries the expected name", () => {
    const err = new DatabaseUnavailableError("db down");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DatabaseUnavailableError);
    expect(err.name).toBe("DatabaseUnavailableError");
    expect(err.message).toBe("db down");
  });

  it("survives JsonifiedError round-trip via name", () => {
    const original = new DatabaseUnavailableError("Can't reach database server");
    const jsonified = new JsonifiedError(original);
    expect(jsonified.name).toBe("DatabaseUnavailableError");
    const parsed = JSON.parse(jsonified.message);
    expect(parsed.name).toBe("DatabaseUnavailableError");
    expect(parsed.message).toBe("Can't reach database server");
  });
});
