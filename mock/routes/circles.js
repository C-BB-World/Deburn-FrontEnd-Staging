import { Router } from 'express';
import * as state from '../state.js';
import { successResponse, requireAuth, notFound } from '../helpers.js';

const router = Router();

router.get('/circles/my-groups', (req, res) => {
  requireAuth(req);
  const upcomingMeetings = state.MOCK_CIRCLE_GROUPS.filter((g) => g.nextMeeting).map((g) => ({
    id: g.nextMeeting.id,
    title: g.nextMeeting.title,
    groupName: g.name,
    date: g.nextMeeting.scheduledAt,
  }));
  res.json(successResponse({ groups: state.MOCK_CIRCLE_GROUPS, upcomingMeetings }));
});

router.get('/circles/my-invitations', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ pending: state.pendingInvitations, accepted: [] }));
});

router.get('/circles/availability', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ slots: state.userAvailability }));
});

router.put('/circles/availability', (req, res) => {
  requireAuth(req);
  const slots = req.body?.slots || [];
  state.userAvailability.length = 0;
  state.userAvailability.push(...slots);
  res.json(successResponse({ slots: state.userAvailability }));
});

router.get('/circles/groups/:groupId', (req, res) => {
  requireAuth(req);
  const group = state.MOCK_CIRCLE_GROUPS.find((g) => g.id === req.params.groupId);
  if (!group) throw notFound('Group not found');
  res.json(successResponse(group));
});

router.get('/circles/groups/:groupId/meetings', (req, res) => {
  requireAuth(req);
  const meetings = state.groupMeetings.get(req.params.groupId) || [];
  res.json(successResponse({ meetings }));
});

router.get('/circles/groups/:groupId/common-availability', (req, res) => {
  requireAuth(req);
  const allMembers = ['Alice Chen', 'Bob Smith', 'Carol Davis', 'David Lee', 'Emma Wilson'];
  res.json(
    successResponse({
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
    })
  );
});

router.post('/circles/groups/:groupId/meetings', (req, res) => {
  requireAuth(req);
  const { groupId } = req.params;
  const { title, scheduledAt } = req.body || {};
  const meeting = {
    id: `mtg_${state.hex(4)}`,
    title,
    groupName: state.MOCK_CIRCLE_GROUPS.find((g) => g.id === groupId)?.name || 'Circle',
    date: scheduledAt,
    meetingLink: `https://meet.google.com/${state.hex(3)}-${state.hex(4)}-${state.hex(3)}`,
  };
  if (!state.groupMeetings.has(groupId)) state.groupMeetings.set(groupId, []);
  state.groupMeetings.get(groupId).push({ id: meeting.id, title, scheduledAt, status: 'scheduled' });
  res.json(successResponse(meeting));
});

router.get('/circles/groups/:groupId/messages', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ messages: state.groupMessages.get(req.params.groupId) || [] }));
});

router.post('/circles/groups/:groupId/messages', (req, res) => {
  requireAuth(req);
  const { groupId } = req.params;
  const newMsg = {
    id: `msg_${state.hex(4)}`,
    userId: 'usr_current',
    userName: 'You',
    content: req.body?.content,
    createdAt: state.nowIso(),
  };
  if (!state.groupMessages.has(groupId)) state.groupMessages.set(groupId, []);
  state.groupMessages.get(groupId).push(newMsg);
  res.json(successResponse(newMsg));
});

router.get('/circles/invitations/:token', (req, res) => {
  const invitation = state.pendingInvitations.find((i) => i.token === req.params.token);
  if (!invitation) throw notFound('Invitation not found or expired');
  res.json(successResponse({ invitation, pool: { name: invitation.poolName } }));
});

router.post('/circles/invitations/:token/accept', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ message: 'Invitation accepted' }));
});

router.post('/circles/invitations/:token/decline', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ message: 'Invitation declined' }));
});

router.post('/circles/meetings/:meetingId/cancel', (req, res) => {
  requireAuth(req);
  for (const meetings of state.groupMeetings.values()) {
    const m = meetings.find((mtg) => mtg.id === req.params.meetingId);
    if (m) m.status = 'cancelled';
  }
  res.json(successResponse({ message: 'Meeting cancelled' }));
});

router.post('/circles/meetings/:meetingId/skip-occurrence', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ message: 'Occurrence skipped' }));
});

router.post('/circles/meetings/:meetingId/attendance', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ message: 'Attendance updated' }));
});

export default router;
