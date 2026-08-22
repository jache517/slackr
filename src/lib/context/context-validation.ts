import "server-only";

import { z } from "zod";

import { strictJsonObject } from "@/lib/api/validation";

const CONTEXT_TEXT_MAX_LENGTH = 4000;
const ROLE_TEXT_MAX_LENGTH = 120;

const contextTextSchema = z
  .string()
  .trim()
  .min(1, "Context text is required")
  .max(
    CONTEXT_TEXT_MAX_LENGTH,
    `Context text must be ${CONTEXT_TEXT_MAX_LENGTH} characters or fewer`,
  );

const roleTextSchema = z
  .string()
  .trim()
  .min(1, "Role text is required")
  .max(
    ROLE_TEXT_MAX_LENGTH,
    `Role text must be ${ROLE_TEXT_MAX_LENGTH} characters or fewer`,
  );

const optionalContextTextSchema = z.union([
  contextTextSchema,
  z.literal(null),
]);

export const createMemberContextSchema = strictJsonObject({
  memberId: z.uuid("Member ID must be a valid UUID"),
  contextText: contextTextSchema,
});

export const memberContextQuerySchema = strictJsonObject({
  memberId: z.uuid("Member ID must be a valid UUID").optional(),
});

export const updateMemberRoleContextSchema = strictJsonObject({
  primaryRole: roleTextSchema,
  additionalRoles: z.array(roleTextSchema),
  responsibilities: z.array(roleTextSchema),
  additionalContext: optionalContextTextSchema,
});

const memberContextIdSchema = z.uuid("Member context ID must be a valid UUID");

export type CreateMemberContextInput = z.output<
  typeof createMemberContextSchema
>;

export type UpdateMemberRoleContextInput = z.output<
  typeof updateMemberRoleContextSchema
>;

export function validateMemberContextId(memberContextId: string) {
  return memberContextIdSchema.safeParse(memberContextId);
}
