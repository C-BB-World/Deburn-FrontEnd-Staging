import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth } from '../helpers.js';

export const dashboardHandlers = [
  http.get('/api/dashboard', async ({ request }) => {
    requireAuth(request);
    const latest = data.checkinHistory[data.checkinHistory.length - 1];
    const nextGroupMeeting = data.MOCK_CIRCLE_GROUPS.find((g) => g.nextMeeting)?.nextMeeting;

    return successResponse({
      todaysCheckin: latest
        ? { mood: latest.mood, physicalEnergy: latest.physicalEnergy, mentalEnergy: latest.mentalEnergy, sleep: 4, stress: latest.stress }
        : { mood: 4, physicalEnergy: 7, mentalEnergy: 6, sleep: 4, stress: 3 },
      streak: Math.min(data.checkinHistory.length, 30),
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
        totalModules: data.MOCK_CONTENT_ITEMS.length,
        progress: 0.357,
      },
      nextCircle: nextGroupMeeting
        ? {
            date: new Date(nextGroupMeeting.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
            dateSv: new Date(nextGroupMeeting.scheduledAt).toLocaleString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          }
        : null,
    });
  }),
];
