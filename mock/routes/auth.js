import { Router } from 'express';
import * as state from '../state.js';
import { generateToken, successResponse, requireAuth, ApiError } from '../helpers.js';

const router = Router();

router.post('/auth/register', (req, res) => {
  res.json(successResponse({ message: 'Registration successful. Please verify your email.' }));
});

router.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  const token = generateToken();
  const base = email && email.includes('admin') ? state.MOCK_ADMIN_USER : state.MOCK_USER;
  const userCopy = structuredClone(base);
  userCopy.email = email || base.email;
  state.tokens.set(token, userCopy);

  res.json(
    successResponse({
      user: {
        id: userCopy.id,
        email: userCopy.email,
        firstName: userCopy.firstName,
        lastName: userCopy.lastName,
        isAdmin: userCopy.isAdmin,
        hasCompletedAssessment: userCopy.hasCompletedAssessment,
      },
      token,
      expiresAt: state.daysFromNow(7),
    })
  );
});

router.post('/auth/logout', (req, res) => {
  const header = req.headers.authorization;
  if (header) {
    state.tokens.delete(header.replace('Bearer ', ''));
  }
  res.json(successResponse(null));
});

router.get('/auth/session', (req, res) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.json(successResponse({ user: null }));
  }
  const token = header.replace('Bearer ', '');
  const user = state.tokens.get(token);
  if (user) {
    return res.json(
      successResponse({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          hasCompletedAssessment: user.hasCompletedAssessment,
        },
      })
    );
  }
  res.json(successResponse({ user: state.MOCK_USER }));
});

router.post('/auth/forgot-password', (req, res) => {
  res.json(successResponse({ message: 'If an account with that email exists, a password reset link has been sent.' }));
});

router.post('/auth/reset-password', (req, res) => {
  const { token } = req.body || {};
  if (token === 'invalid') {
    throw new ApiError('Reset token is invalid', { status: 400, code: 'TOKEN_INVALID' });
  }
  res.json(successResponse(null));
});

router.post('/auth/verify-email', (req, res) => {
  const { token } = req.body || {};
  if (token === 'expired') {
    throw new ApiError('Token has expired', { status: 400, code: 'TOKEN_EXPIRED' });
  }
  res.json(successResponse(null));
});

router.post('/auth/resend-verification', (req, res) => {
  res.json(successResponse({ message: 'If an account with that email exists, a verification email has been sent.' }));
});

router.get('/auth/admin-status', (req, res) => {
  const user = requireAuth(req);
  res.json(
    successResponse({
      isAdmin: !!user.isAdmin,
      organizations: user.isAdmin ? [{ id: 'org_1', name: 'Acme Corporation', domain: 'acme.com' }] : [],
    })
  );
});

export default router;
