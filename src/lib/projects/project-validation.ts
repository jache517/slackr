import "server-only";

import { z } from "zod";

import { strictJsonObject } from "@/lib/api/validation";

const PROJECT_NAME_MAX_LENGTH = 120;
const PROJECT_TEXT_MAX_LENGTH = 80;

const projectNameSchema = z
  .string()
  .trim()
  .min(1, "Project name is required")
  .max(
    PROJECT_NAME_MAX_LENGTH,
    `Project name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer`,
  );

const courseSchema = z
  .string()
  .trim()
  .min(1, "Course is required")
  .max(
    PROJECT_TEXT_MAX_LENGTH,
    `Course must be ${PROJECT_TEXT_MAX_LENGTH} characters or fewer`,
  );

const groupNameSchema = z
  .string()
  .trim()
  .min(1, "Group name is required")
  .max(
    PROJECT_TEXT_MAX_LENGTH,
    `Group name must be ${PROJECT_TEXT_MAX_LENGTH} characters or fewer`,
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
  name: projectNameSchema,
  course: courseSchema,
  groupName: groupNameSchema,
  deadline: deadlineSchema,
};

export const createProjectSchema = strictJsonObject(projectFields);

export const updateProjectSchema = strictJsonObject({
  name: projectNameSchema.optional(),
  course: courseSchema.optional(),
  groupName: groupNameSchema.optional(),
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
