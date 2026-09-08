import { Router } from 'express';
import { successResponse, requireAuth } from '../helpers.js';

const router = Router();

router.post('/assessment/initial', (req, res) => {
  const user = requireAuth(req);
  user.hasCompletedAssessment = true;
  res.json(successResponse({ hasCompletedAssessment: true }));
});

export default router;
