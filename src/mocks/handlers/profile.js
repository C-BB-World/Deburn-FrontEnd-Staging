import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, jsonBody } from '../helpers.js';

export const profileHandlers = [
  http.put('/api/profile', async ({ request }) => {
    const user = requireAuth(request);
    const { firstName, lastName, organization, role, bio } = await jsonBody(request);
    return successResponse({
      user: {
        id: user.id,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: user.email,
        organization: organization || user.profile?.organization,
        role: role || user.profile?.jobTitle,
        bio: bio || 'Passionate about building great teams',
      },
    });
  }),

  http.post('/api/profile/avatar', async ({ request }) => {
    const user = requireAuth(request);
    return successResponse({ avatarUrl: `/uploads/avatars/${user.id}.jpg` });
  }),

  http.put('/api/profile/avatar', async ({ request }) => {
    requireAuth(request);
    return successResponse(null);
  }),

  http.delete('/api/conversations', async ({ request }) => {
    requireAuth(request);
    const count = data.conversations.size;
    data.conversations.clear();
    return successResponse({ deleted: true, deletedCount: count });
  }),
];
