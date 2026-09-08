import { Router } from 'express';
import * as state from '../state.js';
import { successResponse, requireAuth } from '../helpers.js';

const router = Router();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

router.post('/checkin', (req, res) => {
  requireAuth(req);
  const { mood, physicalEnergy, mentalEnergy, stress } = req.body || {};

  state.checkinHistory.push({
    date: state.nowIso(),
    mood,
    physicalEnergy,
    mentalEnergy,
    stress,
  });
  if (state.checkinHistory.length > 90) state.checkinHistory.shift();

  res.json(
    successResponse({
      streak: Math.min(state.checkinHistory.length, 30),
      insight: pick(state.MOCK_CHECKIN_INSIGHTS.en),
      insightSv: pick(state.MOCK_CHECKIN_INSIGHTS.sv),
      tip: pick(state.MOCK_CHECKIN_TIPS.en),
      tipSv: pick(state.MOCK_CHECKIN_TIPS.sv),
    })
  );
});

router.get('/checkin/trends', (req, res) => {
  requireAuth(req);
  const period = Math.min(parseInt(req.query.period, 10) || 7, 90);
  const window = state.checkinHistory.slice(-period);

  const moodValues = window.map((d) => d.mood ?? 3);
  const energyValues = window.map((d) => d.physicalEnergy ?? d.mentalEnergy ?? 6);
  const stressValues = window.map((d) => d.stress ?? 4);

  const pctChange = (values) => {
    if (values.length < 2) return 0;
    const first = values[0] || 1;
    const last = values[values.length - 1];
    return Math.round(((last - first) / first) * 100);
  };

  res.json(
    successResponse({
      dataPoints: window.length,
      moodValues,
      moodChange: pctChange(moodValues),
      energyValues,
      energyChange: pctChange(energyValues),
      stressValues,
      stressChange: pctChange(stressValues),
    })
  );
});

router.get('/reflection/prompt', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ prompt: pick(state.MOCK_REFLECTION_PROMPTS) }));
});

router.post('/reflection', (req, res) => {
  requireAuth(req);
  const { reflection = null, gratitude = null, keyFocus = null } = req.body || {};
  const entry = { id: `refl_${state.hex(4)}`, reflection, gratitude, keyFocus, createdAt: state.nowIso() };
  state.reflections.push(entry);
  res.json(successResponse({ saved: true, id: entry.id }));
});

export default router;
