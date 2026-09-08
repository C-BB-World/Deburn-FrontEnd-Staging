import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, guard, jsonBody, ApiError } from '../helpers.js';

export const authHandlers = [
  http.post('/api/auth/register', async () => successResponse({ message: 'Registration successful. Please verify your email.' })),

  http.post(
    '/api/auth/login',
    guard(async ({ request }) => {
      const { email } = await jsonBody(request);
      const token = `mock_token_${data.hex(16)}`;
      const base = email && email.includes('admin') ? data.MOCK_ADMIN_USER : data.MOCK_USER;
      const userCopy = structuredClone(base);
      userCopy.email = email || base.email;
      data.tokens.set(token, userCopy);

      return successResponse({
        user: {
          id: userCopy.id,
          email: userCopy.email,
          firstName: userCopy.firstName,
          lastName: userCopy.lastName,
          isAdmin: userCopy.isAdmin,
          hasCompletedAssessment: userCopy.hasCompletedAssessment,
        },
        token,
        expiresAt: data.daysFromNow(7),
      });
    })
  ),

  http.post('/api/auth/logout', async ({ request }) => {
    const header = request.headers.get('authorization');
    if (header) data.tokens.delete(header.replace('Bearer ', ''));
    return successResponse(null);
  }),

  http.get('/api/auth/session', async ({ request }) => {
    const header = request.headers.get('authorization');
    if (!header) return successResponse({ user: null });
    const token = header.replace('Bearer ', '');
    const user = data.tokens.get(token);
    if (user) {
      return successResponse({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          hasCompletedAssessment: user.hasCompletedAssessment,
        },
      });
    }
    return successResponse({ user: data.MOCK_USER });
  }),

  http.post('/api/auth/forgot-password', async () =>
    successResponse({ message: 'If an account with that email exists, a password reset link has been sent.' })
  ),

  http.post(
    '/api/auth/reset-password',
    guard(async ({ request }) => {
      const { token } = await jsonBody(request);
      if (token === 'invalid') throw new ApiError('Reset token is invalid', { status: 400, code: 'TOKEN_INVALID' });
      return successResponse(null);
    })
  ),

  http.post(
    '/api/auth/verify-email',
    guard(async ({ request }) => {
      const { token } = await jsonBody(request);
      if (token === 'expired') throw new ApiError('Token has expired', { status: 400, code: 'TOKEN_EXPIRED' });
      return successResponse(null);
    })
  ),

  http.post('/api/auth/resend-verification', async () =>
    successResponse({ message: 'If an account with that email exists, a verification email has been sent.' })
  ),

  http.get('/api/auth/admin-status', async ({ request }) => {
    const user = requireAuth(request);
    return successResponse({
      isAdmin: !!user.isAdmin,
      organizations: user.isAdmin ? [{ id: 'org_1', name: 'Acme Corporation', domain: 'acme.com' }] : [],
    });
  }),
];
