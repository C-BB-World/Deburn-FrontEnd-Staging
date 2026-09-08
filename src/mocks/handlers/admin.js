import { http } from 'msw';
import { successResponse, requireHubAdmin } from '../helpers.js';

export const adminHandlers = [
  http.get('/api/admin/stats', async () => {
    requireHubAdmin();
    return successResponse({
      totalUsers: 150,
      activeUsers: 87,
      totalCheckins: 4523,
      totalSessions: 892,
    });
  }),
];
