import "server-only";

import { z } from "zod";

import { buildGithubApiHeaders, isGithubRateLimited } from "@/lib/integrations/github/github-api";
import type { GithubRepositoryReference } from "@/lib/sources/source-validation";

const GITHUB_COMMITS_TIMEOUT_MS = 10000;
const GITHUB_COMMITS_PAGE_SIZE = 100;
const GITHUB_COMMITS_MAX_PAGES = 20;

const providerStringSchema = z.string().refine((value) => value.trim().length > 0, {
  message: "Required",
});

const commitAuthorSchema = z.object({
  name: providerStringSchema,
  email: providerStringSchema,
  date: z.string().datetime({ offset: true }),
});

const commitLoginSchema = z
  .object({
    login: providerStringSchema,
  })
  .nullable();

const commitSchema = z.object({
  sha: providerStringSchema,
  commit: z.object({
    message: providerStringSchema,
    author: commitAuthorSchema,
  }),
  author: commitLoginSchema,
});

const commitsPageSchema = z.array(commitSchema);

export type GithubCommit = {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authoredAt: string;
  authorLogin: string | null;
};

export type GithubCommitPageResult =
  | {
      ok: true;
      commits: GithubCommit[];
      reachedEnd: boolean;
    }
  | {
      ok: false;
      reason: "rate_limited" | "provider_error" | "malformed_payload";
    };

export type GithubCommitsWindow = {
  since: string;
  until: string;
};

export async function fetchGithubCommitPage(
  reference: GithubRepositoryReference,
  window: GithubCommitsWindow,
  page: number,
): Promise<GithubCommitPageResult> {
  if (page < 1 || page > GITHUB_COMMITS_MAX_PAGES) {
    return { ok: false, reason: "provider_error" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_COMMITS_TIMEOUT_MS);

  try {
    const url = new URL(
      `https://api.github.com/repos/${encodeURIComponent(reference.owner)}/${encodeURIComponent(reference.repository)}/commits`,
    );

    url.searchParams.set("since", window.since);
    url.searchParams.set("until", window.until);
    url.searchParams.set("per_page", String(GITHUB_COMMITS_PAGE_SIZE));
    url.searchParams.set("page", String(page));

    const response = await fetch(url, {
      headers: buildGithubApiHeaders(),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      if (isGithubRateLimited(response)) {
        return { ok: false, reason: "rate_limited" };
      }

      return { ok: false, reason: "provider_error" };
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      return { ok: false, reason: "malformed_payload" };
    }

    const parsed = commitsPageSchema.safeParse(payload);

    if (!parsed.success) {
      return { ok: false, reason: "malformed_payload" };
    }

    return {
      ok: true,
      commits: parsed.data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        authorName: commit.commit.author.name,
        authorEmail: commit.commit.author.email,
        authoredAt: commit.commit.author.date,
        authorLogin: commit.author?.login ?? null,
      })),
      reachedEnd: parsed.data.length < GITHUB_COMMITS_PAGE_SIZE,
    };
  } catch {
    return { ok: false, reason: "provider_error" };
  } finally {
    clearTimeout(timeout);
  }
}
