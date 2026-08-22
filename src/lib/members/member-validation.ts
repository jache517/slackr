import "server-only";

import { z } from "zod";

import { strictJsonObject } from "@/lib/api/validation";

const MEMBER_NAME_MAX_LENGTH = 120;
const EMAIL_MAX_LENGTH = 254;
const GITHUB_USERNAME_MAX_LENGTH = 39;
const GITHUB_USERNAME_PATTERN =
  /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/;

const memberNameSchema = z
  .string()
  .trim()
  .min(1, "Member name is required")
  .max(
    MEMBER_NAME_MAX_LENGTH,
    `Member name must be ${MEMBER_NAME_MAX_LENGTH} characters or fewer`,
  );

function normalizedEmailSchema(fieldLabel: string) {
  return z
    .string()
    .trim()
    .min(1, `${fieldLabel} cannot be empty`)
    .max(
      EMAIL_MAX_LENGTH,
      `${fieldLabel} must be ${EMAIL_MAX_LENGTH} characters or fewer`,
    )
    .email(`${fieldLabel} must be a valid email address`)
    .transform((value) => value.toLowerCase());
}

const emailSchema = normalizedEmailSchema("Email");
const googleEmailSchema = normalizedEmailSchema("Google email");
const githubUsernameSchema = z
  .string()
  .trim()
  .min(1, "GitHub username cannot be empty")
  .max(
    GITHUB_USERNAME_MAX_LENGTH,
    `GitHub username must be ${GITHUB_USERNAME_MAX_LENGTH} characters or fewer`,
  )
  .transform((value) => value.toLowerCase())
  .refine(
    (value) => GITHUB_USERNAME_PATTERN.test(value),
    "GitHub username must contain only letters, digits, or hyphens and cannot start or end with a hyphen",
  );

const memberIdentityFields = {
  email: emailSchema.nullable().optional(),
  githubUsername: githubUsernameSchema.nullable().optional(),
  googleEmail: googleEmailSchema.nullable().optional(),
};

export const createMemberSchema = strictJsonObject({
  name: memberNameSchema,
  ...memberIdentityFields,
});

export const updateMemberSchema = strictJsonObject({
  name: memberNameSchema.optional(),
  ...memberIdentityFields,
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one member field is required",
  path: ["_root"],
});

const memberIdSchema = z.uuid("Member ID must be a valid UUID");

export type CreateMemberInput = z.output<typeof createMemberSchema>;
export type UpdateMemberInput = z.output<typeof updateMemberSchema>;

export function validateMemberId(memberId: string) {
  return memberIdSchema.safeParse(memberId);
}
