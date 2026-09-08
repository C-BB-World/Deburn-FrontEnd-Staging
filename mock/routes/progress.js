import { Router } from 'express';
import * as state from '../state.js';
import { successResponse, requireAuth, notFound } from '../helpers.js';

const router = Router();

router.get('/reflection', (req, res) => {
  requireAuth(req);
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sorted = [...state.reflections].reverse();
  const start = (page - 1) * limit;
  const items = sorted.slice(start, start + limit);
  res.json(successResponse({ reflections: items, total: sorted.length, hasMore: start + limit < sorted.length }));
});

router.patch('/reflection/:id', (req, res) => {
  requireAuth(req);
  const entry = state.reflections.find((r) => r.id === req.params.id);
  if (!entry) throw notFound('Reflection not found');
  Object.assign(entry, req.body || {});
  res.json(successResponse(entry));
});

router.get('/progress/stats', (req, res) => {
  requireAuth(req);
  res.json(
    successResponse({
      streak: Math.min(state.checkinHistory.length, 30),
      checkins: state.checkinHistory.length,
      lessons: 8,
      sessions: 23,
    })
  );
});

router.get('/progress/insights', (req, res) => {
  requireAuth(req);
  res.json(
    successResponse({
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
    })
  );
});

export default router;
