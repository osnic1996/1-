import {
  GRAPH_BASE_URL,
  OAUTH_DIALOG_URL,
  OAUTH_SCOPES,
  metaConfig,
} from "./config";

export function redirectUri(): string {
  return `${metaConfig.appUrl}/api/auth/meta/callback`;
}

export function buildLoginUrl(state: string): string {
  const u = new URL(`${OAUTH_DIALOG_URL}/${metaConfig.graphVersion}/dialog/oauth`);
  u.searchParams.set("client_id", metaConfig.appId);
  u.searchParams.set("redirect_uri", redirectUri());
  u.searchParams.set("scope", OAUTH_SCOPES);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("state", state);
  return u.toString();
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

async function graphOAuthGet(params: Record<string, string>): Promise<TokenResponse> {
  const u = new URL(`${GRAPH_BASE_URL}/${metaConfig.graphVersion}/oauth/access_token`);
  for (const [key, value] of Object.entries(params)) u.searchParams.set(key, value);
  const res = await fetch(u.toString());
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error?.message || "Meta OAuth token exchange failed");
  }
  return body as TokenResponse;
}

export function exchangeCodeForToken(code: string) {
  return graphOAuthGet({
    client_id: metaConfig.appId,
    client_secret: metaConfig.appSecret,
    redirect_uri: redirectUri(),
    code,
  });
}

// Exchanges a short-lived user token (~1-2h) for a long-lived one (~60 days).
export function exchangeForLongLivedToken(shortLivedToken: string) {
  return graphOAuthGet({
    grant_type: "fb_exchange_token",
    client_id: metaConfig.appId,
    client_secret: metaConfig.appSecret,
    fb_exchange_token: shortLivedToken,
  });
}
