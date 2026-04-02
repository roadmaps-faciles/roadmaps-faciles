"use server";

import { ESPACE_MEMBRE_PROVIDER_ID } from "@incubateur-ademe/next-auth-espace-membre-provider";
import { EspaceMembreClientMemberNotFoundError } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";
import { AuthError } from "next-auth";
import { redirect, unstable_rethrow as rethrow } from "next/navigation";

import { signIn } from "@/lib/next-auth/auth";
import { isRedirectError, type NextError } from "@/utils/next";

export async function loginAction(identifier: string, loginWithEmail: boolean): Promise<void> {
  try {
    await signIn(loginWithEmail ? "nodemailer" : ESPACE_MEMBRE_PROVIDER_ID, {
      email: identifier,
      redirectTo: "/",
    });
  } catch (error) {
    if (isRedirectError(error as NextError)) rethrow(error);
    if (error instanceof AuthError) {
      if (error.cause?.err instanceof EspaceMembreClientMemberNotFoundError)
        redirect("/login/error?error=AccessDenied");
      redirect(`/login/error?error=${error.type}`);
    }
    redirect("/error");
  }
}
