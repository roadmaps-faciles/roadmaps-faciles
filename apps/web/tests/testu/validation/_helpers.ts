import { type ZodType } from "zod";

export function expectZodSuccess<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Expected Zod success but got errors: ${JSON.stringify(result.error.issues, null, 2)}`);
  }
  return result.data;
}

export function expectZodFailure(schema: ZodType, data: unknown, expectedMessage?: string) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
  if (!result.success && expectedMessage) {
    const messages = result.error.issues.map(i => i.message);
    expect(messages).toContain(expectedMessage);
  }
  return result;
}
