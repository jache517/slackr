import "server-only";

const GITHUB_API_VERSION = "2022-11-28";

export function buildGithubApiHeaders(): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    "User-Agent": "Slackr",
  };
}

export function isGithubRateLimited(response: Response) {
  return (
    response.status === 429 ||
    response.headers.get("x-ratelimit-remaining") === "0"
  );
}
