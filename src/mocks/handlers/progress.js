import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, guard, jsonBody, notFound } from '../helpers.js';

export const progressHandlers = [
  http.get('/api/reflection', async ({ request }) => {
    requireAuth(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const limit = parseInt(url.searchParams.get('limit'), 10) || 10;
    const sorted = [...data.reflections].reverse();
    const start = (page - 1) * limit;
    const items = sorted.slice(start, start + limit);
    return successResponse({ reflections: items, total: sorted.length, hasMore: start + limit < sorted.length });
  }),

  http.patch(
    '/api/reflection/:id',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const entry = data.reflections.find((r) => r.id === params.id);
      if (!entry) throw notFound('Reflection not found');
      Object.assign(entry, await jsonBody(request));
      return successResponse(entry);
    })
  ),

  http.get('/api/progress/stats', async ({ request }) => {
    requireAuth(request);
    return successResponse({
      streak: Math.min(data.checkinHistory.length, 30),
      checkins: data.checkinHistory.length,
      lessons: 8,
      sessions: 23,
    });
  }),

  http.get('/api/progress/insights', async ({ request }) => {
    requireAuth(request);
    return successResponse({
      insights: [
        {
          title: 'Thursday Stress Pattern',
          titleSv: 'Torsdagens stressmönster',
          description: 'Your stress tends to spike on Thursdays. Consider blocking 30 minutes before your afternoon meetings for preparation.',
          descriptionSv: 'Din stress tenderar att toppa på torsdagar. Överväg att blockera 30 minuter före dina eftermiddagsmöten för förberedelse.',
        },
        {
          title: 'Morning Energy Peak',
          titleSv: 'Morgonens energitopp',
          description: 'You report highest energy levels between 9-11am. Schedule your most demanding tasks during this window.',
          descriptionSv: 'Du rapporterar högst energinivåer mellan 9-11. Schemalägg dina mest krävande uppgifter under detta fönster.',
        },
      ],
    });
  }),
];
