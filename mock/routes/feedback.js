import { Router } from 'express';
import * as state from '../state.js';
import { successResponse, requireAuth } from '../helpers.js';

const router = Router();

router.post('/feedback', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ id: `fb_${state.hex(8)}`, message: 'Feedback submitted successfully' }));
});

router.post('/feedback/learning', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ message: 'Rating submitted successfully' }));
});

export default router;
