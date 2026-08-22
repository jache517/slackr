import { z } from "zod";

import { strictJsonObject } from "@/lib/api/validation";

const MAX_SOURCE_URL_LENGTH = 2048;
const GITHUB_OWNER_PATTERN = /^[A-Za-z0-9-]+$/;
const GITHUB_REPOSITORY_PATTERN = /^[A-Za-z0-9._-]+$/;
const GOOGLE_DOCUMENT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export type GithubRepositoryReference = {
  owner: string;
  repository: string;
  externalId: string;
  canonicalUrl: string;
};

export type GoogleDocumentReference = {
  documentId: string;
  canonicalUrl: string;
};

function isGithubHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host === "github.com" || host === "www.github.com";
}

export function canonicalizeGithubRepositoryUrl(
  value: string,
): GithubRepositoryReference | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    !isGithubHost(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash
  ) {
    return null;
  }

  let pathname = url.pathname;

  if (pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  if (pathname.endsWith(".git")) pathname = pathname.slice(0, -4);
  if (pathname.endsWith("/") || !pathname.startsWith("/")) return null;

  const segments = pathname.slice(1).split("/");
  const [owner, repository] = segments;

  if (
    segments.length !== 2 ||
    !owner ||
    !repository ||
    !GITHUB_OWNER_PATTERN.test(owner) ||
    !GITHUB_REPOSITORY_PATTERN.test(repository)
  ) {
    return null;
  }

  return {
    owner,
    repository,
    externalId: `${owner}/${repository}`.toLowerCase(),
    canonicalUrl: `https://github.com/${owner}/${repository}`,
  };
}

export function canonicalizeGoogleDocumentUrl(
  value: string,
): GoogleDocumentReference | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "docs.google.com" ||
    url.username ||
    url.password ||
    url.port
  ) {
    return null;
  }

  let pathname = url.pathname;

  if (pathname.endsWith("/")) pathname = pathname.slice(0, -1);

  const segments = pathname.split("/");
  const documentId = segments[3];
  const suffix = segments[4];

  if (
    (segments.length !== 4 && segments.length !== 5) ||
    segments[1] !== "document" ||
    segments[2] !== "d" ||
    !documentId ||
    !GOOGLE_DOCUMENT_ID_PATTERN.test(documentId) ||
    (suffix !== undefined &&
      suffix !== "edit" &&
      suffix !== "view" &&
      suffix !== "preview")
  ) {
    return null;
  }

  return {
    documentId,
    canonicalUrl: `https://docs.google.com/document/d/${documentId}`,
  };
}

const githubRepositoryUrlSchema = z
  .string()
  .trim()
  .min(1, "Repository URL is required")
  .max(MAX_SOURCE_URL_LENGTH, "Repository URL is too long")
  .superRefine((value, context) => {
    if (!canonicalizeGithubRepositoryUrl(value)) {
      context.addIssue({
        code: "custom",
        message: "Repository URL must be a public GitHub repository URL",
      });
    }
  });

const googleDocumentUrlSchema = z
  .string()
  .trim()
  .min(1, "Document URL is required")
  .max(MAX_SOURCE_URL_LENGTH, "Document URL is too long")
  .superRefine((value, context) => {
    if (!canonicalizeGoogleDocumentUrl(value)) {
      context.addIssue({
        code: "custom",
        message: "Document URL must be a Google Docs document URL",
      });
    }
  });

export const connectGithubSourceSchema = strictJsonObject({
  repositoryUrl: githubRepositoryUrlSchema,
});

export const connectGoogleDocsSourceSchema = strictJsonObject({
  documentUrl: googleDocumentUrlSchema,
});
