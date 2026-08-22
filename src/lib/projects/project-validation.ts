import "server-only";

import { z } from "zod";

import { strictJsonObject } from "@/lib/api/validation";

const PROJECT_TITLE_MAX_LENGTH = 120;

const projectTitleSchema = z
  .string()
  .trim()
  .min(1, "Project title is required")
  .max(
    PROJECT_TITLE_MAX_LENGTH,
    `Project title must be ${PROJECT_TITLE_MAX_LENGTH} characters or fewer`,
  );

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day >= 1 && day <= daysInMonth[month - 1];
}

const deadlineSchema = z
  .string()
  .refine(isCalendarDate, "Deadline must be a valid YYYY-MM-DD date");

const projectFields = {
  title: projectTitleSchema,
  deadline: deadlineSchema,
};

export const createProjectSchema = strictJsonObject(projectFields);

export const updateProjectSchema = strictJsonObject({
  title: projectTitleSchema.optional(),
  deadline: deadlineSchema.optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one project field is required",
  path: ["_root"],
});

const projectIdSchema = z.uuid("Project ID must be a valid UUID");

export type CreateProjectInput = z.output<typeof createProjectSchema>;
export type UpdateProjectInput = z.output<typeof updateProjectSchema>;

export function validateProjectId(projectId: string) {
  return projectIdSchema.safeParse(projectId);
}
