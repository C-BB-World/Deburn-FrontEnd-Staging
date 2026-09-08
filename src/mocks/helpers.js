import { HttpResponse } from 'msw';
import * as data from './data.js';

export function successResponse(payload) {
  return HttpResponse.json({ success: true, data: payload });
}

export class ApiError extends Error {
  constructor(message, { status = 400, code = 'ERROR', fields = null } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function notFound(message) {
  return new ApiError(message, { status: 404, code: 'NOT_FOUND' });
}

/**
 * Wraps an MSW handler so a thrown ApiError becomes a proper JSON error
 * response instead of crashing the service worker's fetch handling.
 */
export function guard(fn) {
  return async (info) => {
    try {
      return await fn(info);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 500;
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: err instanceof ApiError ? err.code : 'INTERNAL_ERROR',
            message: err.message || 'Something went wrong',
            fields: err instanceof ApiError ? err.fields : null,
          },
        },
        { status }
      );
    }
  };
}

/**
 * Lenient by design (matches the original mock): never 401s, always
 * resolves to a user so the app keeps working without a real login.
 */
export function requireAuth(request) {
  const header = request.headers.get('authorization');
  if (header) {
    const token = header.replace('Bearer ', '');
    const user = data.tokens.get(token);
    if (user) return user;
  }
  return data.MOCK_USER;
}

export function requireHubAdmin() {
  return data.MOCK_ADMIN_USER;
}

export async function jsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
