import { errorResponse, successResponse } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import {
  getMemberContexts,
  insertMemberContextRow,
} from "@/lib/activity/activity-repository";
import {
  createMemberContextSchema,
  memberContextQuerySchema,
} from "@/lib/context/context-validation";
import { mapMemberContext } from "@/lib/context/context-mapper";
import { validateProjectId } from "@/lib/projects/project-validation";

type ContextRouteContext = {
  params: Promise<{ projectId: string }>;
};

function invalidProjectIdResponse() {
  return errorResponse(
    "VALIDATION_ERROR",
    "Project ID is invalid",
    400,
    { projectId: "Project ID must be a valid UUID" },
  );
}

function projectNotFoundResponse() {
  return errorResponse("PROJECT_NOT_FOUND", "Project not found", 404);
}

function memberNotFoundResponse() {
  return errorResponse("MEMBER_NOT_FOUND", "Member not found", 404);
}

function internalErrorResponse() {
  return errorResponse(
    "INTERNAL_ERROR",
    "The request could not be completed",
    500,
  );
}

export async function GET(request: Request, context: ContextRouteContext) {
  try {
    const auth = await requireUser();

    if (!auth.ok) {
      return auth.response;
    }

    const { projectId } = await context.params;

    if (!validateProjectId(projectId).success) {
      return invalidProjectIdResponse();
    }

    const access = await requireProjectAccess(
      auth.supabase,
      auth.user,
      projectId,
    );

    if (!access.ok) {
      return access.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    const query = memberContextQuerySchema.safeParse({
      memberId: new URL(request.url).searchParams.get("memberId") ?? undefined,
    });

    if (!query.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Request query is invalid",
        400,
        { memberId: "Member ID must be a valid UUID" },
      );
    }

    if (query.data.memberId) {
      const memberFilter = await auth.supabase
        .from("members")
        .select("id")
        .eq("id", query.data.memberId)
        .eq("project_id", projectId)
        .maybeSingle();

      if (memberFilter.error) {
        return internalErrorResponse();
      }

      if (!memberFilter.data) {
        return memberNotFoundResponse();
      }
    }

    const scope = await getMemberContexts(
      auth.supabase,
      projectId,
      query.data.memberId,
    );

    if (!scope.ok) {
      return scope.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    return successResponse(scope.contexts.map(mapMemberContext));
  } catch {
    return internalErrorResponse();
  }
}

export async function POST(request: Request, context: ContextRouteContext) {
  try {
    const auth = await requireUser();

    if (!auth.ok) {
      return auth.response;
    }

    const { projectId } = await context.params;

    if (!validateProjectId(projectId).success) {
      return invalidProjectIdResponse();
    }

    const access = await requireProjectAccess(
      auth.supabase,
      auth.user,
      projectId,
    );

    if (!access.ok) {
      return access.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    const body = await parseJsonBody(request, createMemberContextSchema);

    if (!body.ok) {
      return body.response;
    }

    const memberExists = await auth.supabase
      .from("members")
      .select("id, project_id")
      .eq("id", body.data.memberId)
      .eq("project_id", projectId)
      .maybeSingle();

    if (memberExists.error) {
      return internalErrorResponse();
    }

    if (!memberExists.data) {
      return memberNotFoundResponse();
    }

    const inserted = await insertMemberContextRow(auth.supabase, {
      project_id: projectId,
      member_id: body.data.memberId,
      context_text: body.data.contextText,
      submitted_by_user_id: auth.user.id,
      submission_type: "project_owner_recorded",
    });

    if (!inserted.ok) {
      return internalErrorResponse();
    }

    return successResponse(mapMemberContext(inserted.context), 201);
  } catch {
    return internalErrorResponse();
  }
}
