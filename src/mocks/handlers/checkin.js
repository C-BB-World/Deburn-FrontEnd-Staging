import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, jsonBody } from '../helpers.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const checkinHandlers = [
  http.post('/api/checkin', async ({ request }) => {
    requireAuth(request);
    const { mood, physicalEnergy, mentalEnergy, stress } = await jsonBody(request);

    data.checkinHistory.push({ date: data.nowIso(), mood, physicalEnergy, mentalEnergy, stress });
    if (data.checkinHistory.length > 90) data.checkinHistory.shift();

    return successResponse({
      streak: Math.min(data.checkinHistory.length, 30),
      insight: pick(data.MOCK_CHECKIN_INSIGHTS.en),
      insightSv: pick(data.MOCK_CHECKIN_INSIGHTS.sv),
      tip: pick(data.MOCK_CHECKIN_TIPS.en),
      tipSv: pick(data.MOCK_CHECKIN_TIPS.sv),
    });
  }),

  http.get('/api/checkin/trends', async ({ request }) => {
    requireAuth(request);
    const url = new URL(request.url);
    const period = Math.min(parseInt(url.searchParams.get('period'), 10) || 7, 90);
    const window = data.checkinHistory.slice(-period);

    const moodValues = window.map((d) => d.mood ?? 3);
    const energyValues = window.map((d) => d.physicalEnergy ?? d.mentalEnergy ?? 6);
    const stressValues = window.map((d) => d.stress ?? 4);

    const pctChange = (values) => {
      if (values.length < 2) return 0;
      const first = values[0] || 1;
      const last = values[values.length - 1];
      return Math.round(((last - first) / first) * 100);
    };

    return successResponse({
      dataPoints: window.length,
      moodValues,
      moodChange: pctChange(moodValues),
      energyValues,
      energyChange: pctChange(energyValues),
      stressValues,
      stressChange: pctChange(stressValues),
    });
  }),

  http.get('/api/reflection/prompt', async ({ request }) => {
    requireAuth(request);
    return successResponse({ prompt: pick(data.MOCK_REFLECTION_PROMPTS) });
  }),

  http.post('/api/reflection', async ({ request }) => {
    requireAuth(request);
    const { reflection = null, gratitude = null, keyFocus = null } = await jsonBody(request);
    const entry = { id: `refl_${data.hex(4)}`, reflection, gratitude, keyFocus, createdAt: data.nowIso() };
    data.reflections.push(entry);
    return successResponse({ saved: true, id: entry.id });
  }),
];
