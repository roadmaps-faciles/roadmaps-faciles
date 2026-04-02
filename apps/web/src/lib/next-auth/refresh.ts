import "server-only";
import { type JWT } from "@auth/core/jwt";

import { config } from "@/config";

const PROVIDER_TOKEN_URLS: Record<string, string> = {
  github: "https://github.com/login/oauth/access_token",
  google: "https://oauth2.googleapis.com/token",
};

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  const provider = token.provider;
  if (!provider || !token.refreshToken) {
    return { ...token, error: "NoRefreshToken" };
  }

  const tokenUrl = PROVIDER_TOKEN_URLS[provider];
  if (!tokenUrl) {
    // ProConnect or unknown — no refresh support yet
    return { ...token, error: "UnsupportedProvider" };
  }

  const credentials = provider === "github" ? config.oauth.github : config.oauth.google;

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const data = (await response.json()) as {
      access_token?: string;
      error?: string;
      expires_in?: number;
      refresh_token?: string;
    };

    if (!response.ok || data.error) {
      return { ...token, error: "RefreshTokenError" };
    }

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + (data.expires_in ?? 3600) * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshTokenError" };
  }
}
