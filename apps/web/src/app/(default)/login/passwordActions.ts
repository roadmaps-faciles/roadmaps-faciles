"use server";

import { AuthError } from "next-auth";
import { unstable_rethrow as rethrow } from "next/navigation";

import { signIn } from "@/lib/next-auth/auth";
import { isRedirectError, type NextError, type ServerActionResponse } from "@/utils/next";

export async function passwordLoginAction(email: string, password: string): Promise<ServerActionResponse> {
  try {
    await signIn("password", {
      email,
      password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (isRedirectError(error as NextError)) rethrow(error);
    if (error instanceof AuthError) {
      const cause = error.cause?.err;
      if (cause instanceof Error && cause.message === "EMAIL_NOT_VERIFIED") {
        return { ok: false, error: "EMAIL_NOT_VERIFIED" };
      }
      return { ok: false, error: error.type };
    }
    return { ok: false, error: "CredentialsSignin" };
  }
}
