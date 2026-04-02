import "server-only";

import { type Locale } from "@/utils/i18n";

type MessageRecord = Record<string, Record<string, string> | string>;

const loadMessages = async (locale: Locale): Promise<MessageRecord> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- dynamic JSON import
  return (await import(`../../messages/${locale}.json`)).default as MessageRecord;
};

const getNestedValue = (obj: MessageRecord, path: string): string => {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested JSON traversal
  let current: any = obj;
  for (const part of parts) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- nested JSON traversal
    current = current?.[part];
  }
  return (current as string) ?? path;
};

export const getEmailTranslations = async <K extends string>(
  locale: Locale,
  namespace: string,
  keys: K[],
): Promise<Record<K, string>> => {
  const messages = await loadMessages(locale);
  const result = {} as Record<K, string>;
  for (const key of keys) {
    result[key] = getNestedValue(messages, `${namespace}.${key}`);
  }
  return result;
};

export const interpolate = (template: string, params: Record<string, string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
};
