import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, guard, notFound } from '../helpers.js';

export const notificationsHandlers = [
  http.get('/api/notifications', async ({ request }) => {
    requireAuth(request);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit'), 10) || 20;
    const offset = parseInt(url.searchParams.get('offset'), 10) || 0;
    const unreadOnly = url.searchParams.get('unread_only') === 'true';
    const source = unreadOnly ? data.notifications.filter((n) => !n.read) : data.notifications;
    const page = source.slice(offset, offset + limit);
    return successResponse({ notifications: page, total: source.length, hasMore: offset + limit < source.length });
  }),

  http.get('/api/notifications/count', async ({ request }) => {
    requireAuth(request);
    const unread = data.notifications.filter((n) => !n.read).length;
    return successResponse({ unread });
  }),

  http.post(
    '/api/notifications/:id/read',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const notification = data.notifications.find((n) => n.id === params.id);
      if (!notification) throw notFound('Notification not found');
      notification.read = true;
      notification.readAt = data.nowIso();
      return successResponse({ message: 'Notification marked as read' });
    })
  ),

  http.post('/api/notifications/read-all', async ({ request }) => {
    requireAuth(request);
    const now = data.nowIso();
    let count = 0;
    for (const n of data.notifications) {
      if (!n.read) {
        n.read = true;
        n.readAt = now;
        count += 1;
      }
    }
    return successResponse({ message: 'All notifications marked as read', count });
  }),
];
