import { Router } from 'express';
import { successResponse, requireHubAdmin } from '../helpers.js';

const router = Router();

router.get('/admin/stats', (req, res) => {
  requireHubAdmin(req);
  res.json(
    successResponse({
      totalUsers: 150,
      activeUsers: 87,
      totalCheckins: 4523,
      totalSessions: 892,
    })
  );
});

export default router;
