import "server-only";

export const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/drive.activity.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
] as const;

const GOOGLE_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";

export function buildGoogleAuthorizationUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_OAUTH_SCOPES.join(" "));
  url.searchParams.set("state", input.state);
  url.searchParams.set("access_type", "offline");

  return url.toString();
}
