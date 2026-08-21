import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  data: T;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export type ApiSuccessStatus = 200 | 201;
export type ApiErrorStatus =
  | 400
  | 401
  | 403
  | 404
  | 409
  | 429
  | 500
  | 502
  | 503;

export function successResponse<T>(data: T, status: ApiSuccessStatus = 200) {
  return NextResponse.json<ApiSuccess<T>>({ data }, { status });
}

export function noContentResponse() {
  return new Response(null, { status: 204 });
}

export function errorResponse(
  code: string,
  message: string,
  status: ApiErrorStatus,
  fields?: Record<string, string>,
) {
  const error = fields
    ? { code, message, fields }
    : { code, message };

  return NextResponse.json<ApiError>({ error }, { status });
}
