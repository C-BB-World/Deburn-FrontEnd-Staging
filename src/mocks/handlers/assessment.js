import { http } from 'msw';
import { successResponse, requireAuth } from '../helpers.js';

export const assessmentHandlers = [
  http.post('/api/assessment/initial', async ({ request }) => {
    const user = requireAuth(request);
    user.hasCompletedAssessment = true;
    return successResponse({ hasCompletedAssessment: true });
  }),
];
