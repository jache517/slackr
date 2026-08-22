import "server-only";

import { z } from "zod";

import { EnvironmentConfigurationError } from "@/lib/env";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalText = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().url().optional(),
);

const optionalPositiveInteger = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (trimmed === "") {
        return undefined;
      }

      return Number(trimmed);
    }

    return value;
  },
  z.number().int().positive().optional(),
);

const serverEnvSchema = z.object({
  APP_URL: optionalUrl,
  SUPABASE_SECRET_KEY: optionalText,
  GITHUB_CLIENT_ID: optionalText,
  GITHUB_CLIENT_SECRET: optionalText,
  GOOGLE_CLIENT_ID: optionalText,
  GOOGLE_CLIENT_SECRET: optionalText,
  AI_REPORT_PROVIDER: z.enum(["none", "openai"]).default("none"),
  OPENAI_API_KEY: optionalText,
  OPENAI_MODEL: optionalText,
  OPENAI_TIMEOUT_MS: optionalPositiveInteger,
  OPENAI_MAX_OUTPUT_TOKENS: optionalPositiveInteger,
});

export function getOptionalServerEnv() {
  const result = serverEnvSchema.safeParse({
    APP_URL: process.env.APP_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    AI_REPORT_PROVIDER: process.env.AI_REPORT_PROVIDER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_TIMEOUT_MS: process.env.OPENAI_TIMEOUT_MS,
    OPENAI_MAX_OUTPUT_TOKENS: process.env.OPENAI_MAX_OUTPUT_TOKENS,
  });

  if (!result.success) {
    throw new EnvironmentConfigurationError(
      result.error.issues.map((issue) => String(issue.path[0] ?? "unknown")),
    );
  }

  return result.data;
}

export function getAiReportConfig() {
  const env = getOptionalServerEnv();

  if (env.AI_REPORT_PROVIDER === "none") {
    return { provider: "none" as const };
  }

  if (!env.OPENAI_API_KEY) {
    throw new EnvironmentConfigurationError(["OPENAI_API_KEY"]);
  }

  return {
    provider: "openai" as const,
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL ?? "gpt-5.6-terra",
    timeoutMs: env.OPENAI_TIMEOUT_MS ?? 20_000,
    maxOutputTokens: env.OPENAI_MAX_OUTPUT_TOKENS ?? 2_200,
  };
}

const GOOGLE_CALLBACK_PATH = "/api/integrations/google/callback";

export function getGoogleOAuthConfig() {
  const env = getOptionalServerEnv();

  if (!env.APP_URL || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new EnvironmentConfigurationError([
      ...(!env.APP_URL ? ["APP_URL"] : []),
      ...(!env.GOOGLE_CLIENT_ID ? ["GOOGLE_CLIENT_ID"] : []),
      ...(!env.GOOGLE_CLIENT_SECRET ? ["GOOGLE_CLIENT_SECRET"] : []),
    ]);
  }

  const appUrl = new URL(env.APP_URL);

  if (
    appUrl.username ||
    appUrl.password ||
    appUrl.search ||
    appUrl.hash ||
    (appUrl.pathname !== "" && appUrl.pathname !== "/") ||
    (appUrl.protocol !== "https:" &&
      !(appUrl.protocol === "http:" && appUrl.hostname === "localhost"))
  ) {
    throw new EnvironmentConfigurationError(["APP_URL"]);
  }

  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${appUrl.origin}${GOOGLE_CALLBACK_PATH}`,
  };
}
