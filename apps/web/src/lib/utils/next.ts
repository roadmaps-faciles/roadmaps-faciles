import { notFound, redirect, unauthorized } from "next/navigation";
import { type NextRequest, type NextResponse } from "next/server";
import { type ReactElement } from "react";
import { z } from "zod";

import { type ClearObject, type EmptyObject, type Nothing } from "./types";

type PropValueAsString<T, TPropName extends string, WithPartial extends boolean = true> = [T] extends [
  infer R extends string,
]
  ? "" extends R
    ? EmptyObject
    : {
        [P in TPropName]: Promise<
          WithPartial extends true ? Partial<Record<R, string | string[]>> : Record<R, string | string[]>
        >;
      }
  : never;

type PropValueAsObject<T, TPropName extends string, WithPartial extends boolean = true> = T extends z.ZodType
  ? never
  : T extends object
    ? {
        [P in TPropName]: Promise<WithPartial extends true ? Partial<T> : T>;
      }
    : never;

type PropValueAsZod<T, TPropName extends string> = T extends z.ZodType
  ? {
      [P in `${TPropName}Error`]?: z.core.$ZodErrorTree<z.core.output<T>>;
    } & {
      [P in TPropName]: Promise<ClearObject<z.infer<T>>>;
    }
  : never;

export type NextServerPageProps<
  Params extends object | string | z.ZodType = string,
  SearchParams extends object | string | z.ZodType = never,
> = (
  | PropValueAsObject<Params, "params", false>
  | PropValueAsString<Params, "params", false>
  | PropValueAsZod<Params, "params">
) &
  (
    | PropValueAsObject<SearchParams, "searchParams">
    | PropValueAsString<SearchParams, "searchParams">
    | PropValueAsZod<SearchParams, "searchParams">
  );

interface ValidationOptionsWithNotFound {
  notFound: true;
  redirect?: never;
}
interface ValidationOptionsWithRedirect {
  notFound?: never;
  redirect: Parameters<typeof redirect>;
}
export type ValidationOptions = ValidationOptionsWithNotFound | ValidationOptionsWithRedirect;

type ZodNextPage<
  Params extends object | string | z.ZodType = string,
  SearchParams extends object | string | z.ZodType = never,
> = (props: NextServerPageProps<Params, SearchParams>) => Promise<ReactElement> | ReactElement;

export const withValidation =
  <Params extends z.ZodType, SearchParams extends z.ZodType, TPage extends ZodNextPage<Params, SearchParams>>(config: {
    options?: ValidationOptions;
    paramsSchema?: Params;
    searchParamsSchema?: SearchParams;
    wrapper?: (
      page: (props: EmptyObject) => Promise<ReactElement> | ReactElement,
    ) => (props: unknown) => Promise<ReactElement> | ReactElement;
  }) =>
  (page: TPage): (() => ReactElement) =>
  // @ts-expect-error - This is a hack to make the types work
  async (props: NextServerPageProps<Params, SearchParams>) => {
    const { paramsSchema, searchParamsSchema, options, wrapper } = config;
    const newProps = { ...props } as PropValueAsZod<Params, "params"> & PropValueAsZod<SearchParams, "searchParams">;
    if (paramsSchema) {
      const parseResult = await paramsSchema.safeParseAsync(await newProps.params);
      if (!parseResult.success) {
        if (options?.notFound) {
          unauthorized();
          // notFound();
        }
        if (options?.redirect) {
          redirect(...options.redirect);
        }

        newProps.paramsError = z.treeifyError(parseResult.error);
      } else {
        newProps.params = Promise.resolve(parseResult.data) as never;
      }
    }

    if (searchParamsSchema) {
      const parseResult = await searchParamsSchema.safeParseAsync(await newProps.searchParams);
      if (!parseResult.success) {
        if (options?.notFound) {
          notFound();
        }
        if (options?.redirect) {
          redirect(...options.redirect);
        }

        newProps.searchParamsError = z.treeifyError(parseResult.error);
      } else {
        newProps.searchParams = Promise.resolve(parseResult.data) as never;
      }
    }

    return wrapper?.(wrapperProps => page({ ...wrapperProps, ...newProps })) ?? page(newProps);
  };

// Agrégateur de params depuis un chemin littéral Next.js
type PathParams<S extends string> =
  // Catch-all obligatoire: [...param]
  S extends `${infer Head}[...${infer P}]${infer Tail}`
    ? { [K in P]: string[] } & PathParams<Head> & PathParams<Tail>
    : // Catch-all optionnel: [[...param]]
      S extends `${infer Head}[[...${infer P}]]${infer Tail}`
      ? { [K in P]?: string[] } & PathParams<Head> & PathParams<Tail>
      : // Param optionnel: [param?]
        S extends `${infer Head}[${infer P}?]${infer Tail}`
        ? { [K in P]?: string } & PathParams<Head> & PathParams<Tail>
        : // Param simple: [param]
          S extends `${infer Head}[${infer P}]${infer Tail}`
          ? { [K in P]: string } & PathParams<Head> & PathParams<Tail>
          : // Rien de dynamique dans ce morceau
            EmptyObject;

/**
 * @deprecated Use Nextjs {@link RouteContext} when possible (enable "typed routes" in config)
 */
export type NextRouteHandler<TParams extends string = string> = (
  req: NextRequest,
  context: {
    params: Promise<ClearObject<PathParams<TParams>>>;
  },
) => NextResponse | Promise<NextResponse | Response> | Response;

/**
 * Wrap Next.js server action response to avoid bubbling up errors
 */
export type ServerActionResponse<TData = void, TError = string> =
  | { error: TError; ok: false }
  | ({
      ok: true;
    } & (TData extends Nothing ? EmptyObject : { data: TData }));

/**
 * Wrap Next.js form action response to avoid bubbling up errors
 */
export type FormActionResponse<TData = void, TError = string> = { data?: TData; errors?: TError };

const REDIRECT_ERROR_CODE = "NEXT_REDIRECT";
export interface NextError extends Error {
  digest?: string;
}
enum RedirectStatusCode {
  SeeOther = 303,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
}
export function isRedirectError(error: NextError): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error) || typeof error.digest !== "string") {
    return false;
  }
  const digest = error.digest.split(";");
  const [errorCode, type] = digest;
  const destination = digest.slice(2, -2).join(";");
  const status = digest.at(-2);
  const statusCode = Number(status);
  return (
    errorCode === REDIRECT_ERROR_CODE &&
    (type === "replace" || type === "push") &&
    typeof destination === "string" &&
    !isNaN(statusCode) &&
    statusCode in RedirectStatusCode
  );
}
