import { Router } from 'express';
import authRoutes from './routes/auth.js';
import checkinRoutes from './routes/checkin.js';
import assessmentRoutes from './routes/assessment.js';
import circlesRoutes from './routes/circles.js';
import circlesAdminRoutes from './routes/circlesAdmin.js';
import coachRoutes from './routes/coach.js';
import dashboardRoutes from './routes/dashboard.js';
import learningRoutes from './routes/learning.js';
import profileRoutes from './routes/profile.js';
import progressRoutes from './routes/progress.js';
import feedbackRoutes from './routes/feedback.js';
import adminRoutes from './routes/admin.js';
import hubRoutes from './routes/hub.js';
import notificationsRoutes from './routes/notifications.js';
import landingRoutes from './routes/landing.js';
import { errorHandler, asyncHandler } from './helpers.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'deburn-frontend-mock-api', mock: true, timestamp: new Date().toISOString() });
});

router.use(authRoutes);
router.use(checkinRoutes);
router.use(assessmentRoutes);
router.use(circlesRoutes);
router.use(circlesAdminRoutes);
router.use(coachRoutes);
router.use(dashboardRoutes);
router.use(learningRoutes);
router.use(profileRoutes);
router.use(progressRoutes);
router.use(feedbackRoutes);
router.use(adminRoutes);
router.use(hubRoutes);
router.use(notificationsRoutes);
router.use(landingRoutes);

router.use(errorHandler);

export default router;
export { asyncHandler };
