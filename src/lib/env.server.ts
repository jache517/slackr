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

const serverEnvSchema = z.object({
  APP_URL: optionalUrl,
  SUPABASE_SECRET_KEY: optionalText,
  GITHUB_CLIENT_ID: optionalText,
  GITHUB_CLIENT_SECRET: optionalText,
  GOOGLE_CLIENT_ID: optionalText,
  GOOGLE_CLIENT_SECRET: optionalText,
});

export function getOptionalServerEnv() {
  const result = serverEnvSchema.safeParse({
    APP_URL: process.env.APP_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  });

  if (!result.success) {
    throw new EnvironmentConfigurationError(
      result.error.issues.map((issue) => String(issue.path[0] ?? "unknown")),
    );
  }

  return result.data;
}
