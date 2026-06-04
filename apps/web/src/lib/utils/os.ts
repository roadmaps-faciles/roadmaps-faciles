import { defined } from "./types";

export const sleep = (milliseconds: number) => new Promise<void>(resolve => setTimeout(resolve, milliseconds));

type DefaultEnsureEnvVar = <T extends primitive | primitive[]>(
  envVar: string | undefined,
  transformerOrDefaultValue?: ((envVar: string) => T) | T,
  defaultValue?: T,
) => string | T;

/**
 * Avoid having "bad" literals as defined type. (e.g. `""` instead of `string`)
 */
type RemoveUselessLiterals<T> = T extends "" ? string : T extends boolean ? boolean : T extends number ? number : T;

type EnsureEnvVar = {
  (envVar: string | undefined): asserts envVar is string;
  <T>(envVar: string | undefined, defaultValue: T): RemoveUselessLiterals<T>;
  <T>(envVar: string | undefined, transformer: (envVar: string) => T): RemoveUselessLiterals<T>;
  <T>(envVar: string | undefined, transformer: (envVar: string) => T, defaultValue: T): RemoveUselessLiterals<T>;
};
type primitive = boolean | number | string;

const ensureEnvVar_: DefaultEnsureEnvVar = (envVar, transformerOrDefaultValue, defaultValue) => {
  const defaultValueToTest = typeof transformerOrDefaultValue !== "function" ? transformerOrDefaultValue : defaultValue;
  if (typeof envVar === "undefined" && typeof defaultValueToTest === "undefined") {
    throw new Error(`Some env var are not found.`, { cause: { envVar, transformerOrDefaultValue, defaultValue } });
  }

  if (typeof envVar === "undefined" && typeof defaultValue !== "undefined") return defaultValue;

  if (typeof transformerOrDefaultValue === "function") {
    return transformerOrDefaultValue(envVar!) ?? envVar ?? defaultValue;
  }

  return envVar ?? transformerOrDefaultValue!;
};
// Cast required to expose the overloaded `EnsureEnvVar` signature to downstream consumers
// (config.ts narrows transformer return types). typescript-eslint flags this as a false positive.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const ensureEnvVar = ensureEnvVar_ as EnsureEnvVar;

const ensureApiEnvVar_: DefaultEnsureEnvVar = (key, transformerOrDefaultValue, defaultValue) => {
  if (typeof window === "undefined") {
    return ensureEnvVar_(key, transformerOrDefaultValue, defaultValue);
  }
  const defaultValueToTest = typeof transformerOrDefaultValue !== "function" ? transformerOrDefaultValue : defaultValue;
  return defined(defaultValueToTest);
};
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const ensureApiEnvVar = ensureApiEnvVar_ as EnsureEnvVar;
