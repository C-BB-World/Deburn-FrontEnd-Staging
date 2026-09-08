import { Router } from 'express';
import * as state from '../state.js';
import { successResponse, requireAuth, notFound } from '../helpers.js';

const router = Router();

router.get('/notifications', (req, res) => {
  requireAuth(req);
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = parseInt(req.query.offset, 10) || 0;
  const unreadOnly = req.query.unread_only === 'true';
  const source = unreadOnly ? state.notifications.filter((n) => !n.read) : state.notifications;
  const page = source.slice(offset, offset + limit);
  res.json(successResponse({ notifications: page, total: source.length, hasMore: offset + limit < source.length }));
});

router.get('/notifications/count', (req, res) => {
  requireAuth(req);
  const unread = state.notifications.filter((n) => !n.read).length;
  res.json(successResponse({ unread }));
});

router.post('/notifications/:id/read', (req, res) => {
  requireAuth(req);
  const notification = state.notifications.find((n) => n.id === req.params.id);
  if (!notification) throw notFound('Notification not found');
  notification.read = true;
  notification.readAt = state.nowIso();
  res.json(successResponse({ message: 'Notification marked as read' }));
});

router.post('/notifications/read-all', (req, res) => {
  requireAuth(req);
  const now = state.nowIso();
  let count = 0;
  for (const n of state.notifications) {
    if (!n.read) {
      n.read = true;
      n.readAt = now;
      count += 1;
    }
  }
  res.json(successResponse({ message: 'All notifications marked as read', count }));
});

export default router;
