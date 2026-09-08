import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, guard, jsonBody, notFound } from '../helpers.js';

export const circlesHandlers = [
  http.get('/api/circles/my-groups', async ({ request }) => {
    requireAuth(request);
    const upcomingMeetings = data.MOCK_CIRCLE_GROUPS.filter((g) => g.nextMeeting).map((g) => ({
      id: g.nextMeeting.id,
      title: g.nextMeeting.title,
      groupName: g.name,
      date: g.nextMeeting.scheduledAt,
    }));
    return successResponse({ groups: data.MOCK_CIRCLE_GROUPS, upcomingMeetings });
  }),

  http.get('/api/circles/my-invitations', async ({ request }) => {
    requireAuth(request);
    return successResponse({ pending: data.pendingInvitations, accepted: [] });
  }),

  http.get('/api/circles/availability', async ({ request }) => {
    requireAuth(request);
    return successResponse({ slots: data.userAvailability });
  }),

  http.put('/api/circles/availability', async ({ request }) => {
    requireAuth(request);
    const { slots = [] } = await jsonBody(request);
    data.userAvailability.length = 0;
    data.userAvailability.push(...slots);
    return successResponse({ slots: data.userAvailability });
  }),

  http.get(
    '/api/circles/groups/:groupId',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const group = data.MOCK_CIRCLE_GROUPS.find((g) => g.id === params.groupId);
      if (!group) throw notFound('Group not found');
      return successResponse(group);
    })
  ),

  http.get('/api/circles/groups/:groupId/meetings', async ({ request, params }) => {
    requireAuth(request);
    return successResponse({ meetings: data.groupMeetings.get(params.groupId) || [] });
  }),

  http.get('/api/circles/groups/:groupId/common-availability', async ({ request }) => {
    requireAuth(request);
    const allMembers = ['Alice Chen', 'Bob Smith', 'Carol Davis', 'David Lee', 'Emma Wilson'];
    return successResponse({
      totalMembers: 5,
      members: allMembers,
      slots: [
        { day: 2, hour: 10, availableCount: 5, availableMembers: allMembers },
        { day: 2, hour: 14, availableCount: 4, availableMembers: allMembers.slice(0, 4) },
        { day: 4, hour: 10, availableCount: 5, availableMembers: allMembers },
        { day: 4, hour: 14, availableCount: 3, availableMembers: ['Alice Chen', 'Carol Davis', 'Emma Wilson'] },
        { day: 4, hour: 15, availableCount: 2, availableMembers: ['Bob Smith', 'Emma Wilson'] },
        { day: 5, hour: 9, availableCount: 4, availableMembers: ['Alice Chen', 'Bob Smith', 'David Lee', 'Emma Wilson'] },
      ],
    });
  }),

  http.post('/api/circles/groups/:groupId/meetings', async ({ request, params }) => {
    requireAuth(request);
    const { groupId } = params;
    const { title, scheduledAt } = await jsonBody(request);
    const meeting = {
      id: `mtg_${data.hex(4)}`,
      title,
      groupName: data.MOCK_CIRCLE_GROUPS.find((g) => g.id === groupId)?.name || 'Circle',
      date: scheduledAt,
      meetingLink: `https://meet.google.com/${data.hex(3)}-${data.hex(4)}-${data.hex(3)}`,
    };
    if (!data.groupMeetings.has(groupId)) data.groupMeetings.set(groupId, []);
    data.groupMeetings.get(groupId).push({ id: meeting.id, title, scheduledAt, status: 'scheduled' });
    return successResponse(meeting);
  }),

  http.get('/api/circles/groups/:groupId/messages', async ({ request, params }) => {
    requireAuth(request);
    return successResponse({ messages: data.groupMessages.get(params.groupId) || [] });
  }),

  http.post('/api/circles/groups/:groupId/messages', async ({ request, params }) => {
    requireAuth(request);
    const { groupId } = params;
    const { content } = await jsonBody(request);
    const newMsg = { id: `msg_${data.hex(4)}`, userId: 'usr_current', userName: 'You', content, createdAt: data.nowIso() };
    if (!data.groupMessages.has(groupId)) data.groupMessages.set(groupId, []);
    data.groupMessages.get(groupId).push(newMsg);
    return successResponse(newMsg);
  }),

  http.get(
    '/api/circles/invitations/:token',
    guard(async ({ params }) => {
      const invitation = data.pendingInvitations.find((i) => i.token === params.token);
      if (!invitation) throw notFound('Invitation not found or expired');
      return successResponse({ invitation, pool: { name: invitation.poolName } });
    })
  ),

  http.post('/api/circles/invitations/:token/accept', async ({ request }) => {
    requireAuth(request);
    return successResponse({ message: 'Invitation accepted' });
  }),

  http.post('/api/circles/invitations/:token/decline', async ({ request }) => {
    requireAuth(request);
    return successResponse({ message: 'Invitation declined' });
  }),

  http.post('/api/circles/meetings/:meetingId/cancel', async ({ request, params }) => {
    requireAuth(request);
    for (const meetings of data.groupMeetings.values()) {
      const m = meetings.find((mtg) => mtg.id === params.meetingId);
      if (m) m.status = 'cancelled';
    }
    return successResponse({ message: 'Meeting cancelled' });
  }),

  http.post('/api/circles/meetings/:meetingId/skip-occurrence', async ({ request }) => {
    requireAuth(request);
    return successResponse({ message: 'Occurrence skipped' });
  }),

  http.post('/api/circles/meetings/:meetingId/attendance', async ({ request }) => {
    requireAuth(request);
    return successResponse({ message: 'Attendance updated' });
  }),
];
