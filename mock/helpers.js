import { randomBytes } from 'crypto';
import * as state from './state.js';

export function generateToken() {
  return `mock_token_${randomBytes(16).toString('hex')}`;
}

export function successResponse(data) {
  return { success: true, data };
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
 * Lenient by design (matches the original Python mock): never 401s, always
 * resolves to a user so existing manual test flows keep working without a
 * real login. Logged-in sessions get their own scoped copy from `login()`.
 */
export function requireAuth(req) {
  const header = req.headers.authorization;
  if (header) {
    const token = header.replace('Bearer ', '');
    const user = state.tokens.get(token);
    if (user) return user;
  }
  return state.MOCK_USER;
}

export function requireHubAdmin() {
  return state.MOCK_ADMIN_USER;
}

/** Wraps an async Express handler so rejected promises reach the error middleware. */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);
  const status = err instanceof ApiError ? err.status : err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err instanceof ApiError ? err.code : err.code || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong',
      fields: err instanceof ApiError ? err.fields : null,
    },
  });
}
