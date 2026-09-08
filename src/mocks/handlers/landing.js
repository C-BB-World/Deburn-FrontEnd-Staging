import { http } from 'msw';
import * as data from '../data.js';
import { successResponse } from '../helpers.js';

export const landingHandlers = [
  http.get('/api/public/testimonials', async ({ request }) => {
    const lang = new URL(request.url).searchParams.get('lang') === 'sv' ? 'sv' : 'en';
    return successResponse({ testimonials: data.testimonials[lang] });
  }),

  http.post('/api/public/contact', async () => successResponse({ message: 'Thanks for reaching out — we will be in touch shortly.' })),
];
