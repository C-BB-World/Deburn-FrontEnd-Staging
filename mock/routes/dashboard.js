import { Router } from 'express';
import * as state from '../state.js';
import { successResponse, requireAuth } from '../helpers.js';

const router = Router();

router.get('/dashboard', (req, res) => {
  requireAuth(req);
  const latest = state.checkinHistory[state.checkinHistory.length - 1];
  const nextGroupMeeting = state.MOCK_CIRCLE_GROUPS.find((g) => g.nextMeeting)?.nextMeeting;

  res.json(
    successResponse({
      todaysCheckin: latest
        ? { mood: latest.mood, physicalEnergy: latest.physicalEnergy, mentalEnergy: latest.mentalEnergy, sleep: 4, stress: latest.stress }
        : { mood: 4, physicalEnergy: 7, mentalEnergy: 6, sleep: 4, stress: 3 },
      streak: Math.min(state.checkinHistory.length, 30),
      insightsCount: 3,
      todaysFocus: {
        module: {
          id: 'cnt_featured_1',
          contentType: 'audio_article',
          category: 'featured',
          titleEn: 'Leading Through Uncertainty',
          titleSv: 'Leda genom osäkerhet',
          lengthMinutes: 8,
        },
        currentIndex: 5,
        totalModules: state.MOCK_CONTENT_ITEMS.length,
        progress: 0.357,
      },
      nextCircle: nextGroupMeeting
        ? {
            date: new Date(nextGroupMeeting.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
            dateSv: new Date(nextGroupMeeting.scheduledAt).toLocaleString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          }
        : null,
    })
  );
});

export default router;
