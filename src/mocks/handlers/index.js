import { authHandlers } from './auth.js';
import { checkinHandlers } from './checkin.js';
import { assessmentHandlers } from './assessment.js';
import { circlesHandlers } from './circles.js';
import { circlesAdminHandlers } from './circlesAdmin.js';
import { coachHandlers } from './coach.js';
import { dashboardHandlers } from './dashboard.js';
import { learningHandlers } from './learning.js';
import { profileHandlers } from './profile.js';
import { progressHandlers } from './progress.js';
import { feedbackHandlers } from './feedback.js';
import { adminHandlers } from './admin.js';
import { hubHandlers } from './hub.js';
import { notificationsHandlers } from './notifications.js';
import { landingHandlers } from './landing.js';

export const handlers = [
  ...authHandlers,
  ...checkinHandlers,
  ...assessmentHandlers,
  ...circlesHandlers,
  ...circlesAdminHandlers,
  ...coachHandlers,
  ...dashboardHandlers,
  ...learningHandlers,
  ...profileHandlers,
  ...progressHandlers,
  ...feedbackHandlers,
  ...adminHandlers,
  ...hubHandlers,
  ...notificationsHandlers,
  ...landingHandlers,
];
