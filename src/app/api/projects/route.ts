import { errorResponse, successResponse } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireUser } from "@/lib/auth/require-user";
import {
  createProject,
  listProjects,
} from "@/lib/projects/project-repository";
import { createProjectSchema } from "@/lib/projects/project-validation";

function internalErrorResponse() {
  return errorResponse(
    "INTERNAL_ERROR",
    "The request could not be completed",
    500,
  );
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser();

    if (!auth.ok) {
      return auth.response;
    }

    const body = await parseJsonBody(request, createProjectSchema);

    if (!body.ok) {
      return body.response;
    }

    const result = await createProject(auth.supabase, auth.user.id, body.data);

    if (!result.ok) {
      return internalErrorResponse();
    }

    return successResponse(result.project, 201);
  } catch {
    return internalErrorResponse();
  }
}

export async function GET() {
  try {
    const auth = await requireUser();

    if (!auth.ok) {
      return auth.response;
    }

    const result = await listProjects(auth.supabase, auth.user.id);

    if (!result.ok) {
      return internalErrorResponse();
    }

    return successResponse(result.projects);
  } catch {
    return internalErrorResponse();
  }
}
