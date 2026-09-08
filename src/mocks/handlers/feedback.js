import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth } from '../helpers.js';

export const feedbackHandlers = [
  http.post('/api/feedback', async ({ request }) => {
    requireAuth(request);
    return successResponse({ id: `fb_${data.hex(8)}`, message: 'Feedback submitted successfully' });
  }),

  http.post('/api/feedback/learning', async ({ request }) => {
    requireAuth(request);
    return successResponse({ message: 'Rating submitted successfully' });
  }),
];
