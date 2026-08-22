import "server-only";

import { isCalendarDate } from "@/lib/projects/project-validation";

export type ReportPeriod = {
  from: string;
  to: string;
};

export type ReportPeriodValidation =
  | { ok: true; period: ReportPeriod }
  | {
      ok: false;
      fields: Record<string, string>;
    };

function utcDateString(now: Date) {
  return now.toISOString().slice(0, 10);
}

function dateFromTimestamp(timestamp: string) {
  return timestamp.slice(0, 10);
}

export function resolveReportPeriod(
  searchParams: URLSearchParams,
  projectCreatedAt: string,
  projectDeadline: string,
  now = new Date(),
): ReportPeriodValidation {
  const keys = [...new Set([...searchParams.keys()])];
  const unknownKey = keys.find((key) => key !== "from" && key !== "to");

  if (unknownKey) {
    return {
      ok: false,
      fields: { [unknownKey]: "Unknown query field" },
    };
  }

  const fromValues = searchParams.getAll("from");
  const toValues = searchParams.getAll("to");

  if (fromValues.length > 1 || toValues.length > 1) {
    return {
      ok: false,
      fields: {
        ...(fromValues.length > 1 ? { from: "Only one from value is allowed" } : {}),
        ...(toValues.length > 1 ? { to: "Only one to value is allowed" } : {}),
      },
    };
  }

  const from = fromValues[0];
  const to = toValues[0];

  if (from === undefined && to === undefined) {
    const defaultFrom = dateFromTimestamp(projectCreatedAt);
    const defaultTo = [projectDeadline, utcDateString(now)].sort()[0];

    if (defaultFrom > defaultTo) {
      return {
        ok: false,
        fields: {
          from: "The default monitoring period starts after its end date",
          to: "The default monitoring period starts after its end date",
        },
      };
    }

    return { ok: true, period: { from: defaultFrom, to: defaultTo } };
  }

  if (from === undefined || to === undefined) {
    return {
      ok: false,
      fields: {
        ...(from === undefined ? { from: "Both from and to are required" } : {}),
        ...(to === undefined ? { to: "Both from and to are required" } : {}),
      },
    };
  }

  const fields: Record<string, string> = {};

  if (!isCalendarDate(from)) {
    fields.from = "from must be a valid YYYY-MM-DD date";
  }

  if (!isCalendarDate(to)) {
    fields.to = "to must be a valid YYYY-MM-DD date";
  }

  if (Object.keys(fields).length > 0) {
    return { ok: false, fields };
  }

  if (from > to) {
    return {
      ok: false,
      fields: { from: "from must be on or before to" },
    };
  }

  return { ok: true, period: { from, to } };
}

export function isTimestampInPeriod(timestamp: string, period: ReportPeriod) {
  const date = dateFromTimestamp(timestamp);
  return date >= period.from && date <= period.to;
}
