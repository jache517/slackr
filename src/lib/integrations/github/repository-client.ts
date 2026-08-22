import "server-only";

import { z } from "zod";

import type { GithubRepositoryReference } from "@/lib/sources/source-validation";

const GITHUB_API_TIMEOUT_MS = 5000;

const repositoryResponseSchema = z.object({
  full_name: z.string().trim().min(1),
  private: z.boolean(),
  visibility: z.literal("public"),
});

export type GithubRepositoryVerification =
  | {
      ok: true;
      externalId: string;
      displayName: string;
    }
  | {
      ok: false;
      reason: "not_accessible" | "rate_limited" | "provider_error";
    };

function isRateLimited(response: Response) {
  return (
    response.status === 429 ||
    response.headers.get("x-ratelimit-remaining") === "0"
  );
}

export async function verifyGithubRepository(
  reference: GithubRepositoryReference,
): Promise<GithubRepositoryVerification> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(reference.owner)}/${encodeURIComponent(reference.repository)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Slackr",
        },
        signal: controller.signal,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (isRateLimited(response)) return { ok: false, reason: "rate_limited" };
      if (response.status === 404 || response.status === 401 || response.status === 403) {
        return { ok: false, reason: "not_accessible" };
      }
      return { ok: false, reason: "provider_error" };
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      return { ok: false, reason: "provider_error" };
    }

    const parsed = repositoryResponseSchema.safeParse(payload);

    if (
      !parsed.success ||
      parsed.data.private ||
      parsed.data.visibility !== "public"
    ) {
      return { ok: false, reason: "provider_error" };
    }

    const providerExternalId = parsed.data.full_name.toLowerCase();

    if (providerExternalId !== reference.externalId) {
      return { ok: false, reason: "provider_error" };
    }

    return {
      ok: true,
      externalId: providerExternalId,
      displayName: parsed.data.full_name,
    };
  } catch {
    return { ok: false, reason: "provider_error" };
  } finally {
    clearTimeout(timeout);
  }
}
