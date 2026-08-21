import { z } from "zod";

import { errorResponse } from "@/lib/api/response";

export type JsonValidationResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      kind: "malformed_json" | "validation_error";
      response: ReturnType<typeof errorResponse>;
    };

export function strictJsonObject<const Shape extends z.ZodRawShape>(
  shape: Shape,
) {
  return z.strictObject(shape);
}

function toFieldErrors(issues: z.ZodError["issues"]) {
  const fields: Record<string, string> = {};

  for (const issue of issues) {
    if (issue.code === "unrecognized_keys") {
      for (const key of issue.keys) {
        fields[key] ??= "Unknown field";
      }
      continue;
    }

    const field = String(issue.path[0] ?? "_root");
    fields[field] ??= issue.message;
  }

  return fields;
}

export async function parseJsonBody<Shape extends z.ZodRawShape>(
  request: Request,
  schema: z.ZodObject<Shape>,
): Promise<JsonValidationResult<z.output<z.ZodObject<Shape>>>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      kind: "malformed_json",
      response: errorResponse(
        "MALFORMED_JSON",
        "Request body must be valid JSON",
        400,
      ),
    };
  }

  const result = schema.strict().safeParse(body);

  if (!result.success) {
    return {
      ok: false,
      kind: "validation_error",
      response: errorResponse(
        "VALIDATION_ERROR",
        "Request body is invalid",
        400,
        toFieldErrors(result.error.issues),
      ),
    };
  }

  return { ok: true, data: result.data };
}

// A non-business schema used to verify the shared strict-object behaviour.
export const validationExampleSchema = strictJsonObject({
  value: z.string().trim().min(1),
});
