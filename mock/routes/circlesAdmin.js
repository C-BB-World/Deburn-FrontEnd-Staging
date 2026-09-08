import { Router } from 'express';
import * as state from '../state.js';
import { successResponse, requireAuth, notFound } from '../helpers.js';

const router = Router();

function findGroup(poolId, groupId) {
  const groups = state.poolGroups.get(poolId) || [];
  return groups.find((g) => g.id === groupId);
}

router.post('/circles/pools', (req, res) => {
  requireAuth(req);
  const { name, topic, description, organizationId, targetGroupSize = 5, cadence = 'bi-weekly' } = req.body || {};
  const pool = {
    id: `pool_${state.hex(4)}`,
    name,
    status: 'draft',
    topic: topic || null,
    description: description || null,
    organizationId: organizationId || null,
    targetGroupSize,
    cadence,
    stats: { invited: 0, accepted: 0, declined: 0 },
    invitationSettings: { expirationDays: 14 },
    createdAt: state.nowIso(),
    assignedAt: null,
  };
  state.pools.push(pool);
  state.poolGroups.set(pool.id, []);
  state.poolInvitations.set(pool.id, []);
  res.json(successResponse(pool));
});

router.get('/circles/pools', (req, res) => {
  requireAuth(req);
  const { status } = req.query;
  const pools = status ? state.pools.filter((p) => p.status === status) : state.pools;
  res.json(successResponse({ pools }));
});

router.get('/circles/pools/:poolId', (req, res) => {
  requireAuth(req);
  const pool = state.pools.find((p) => p.id === req.params.poolId);
  if (!pool) throw notFound('Pool not found');
  res.json(successResponse(pool));
});

router.post('/circles/pools/:poolId/invitations', (req, res) => {
  requireAuth(req);
  const { poolId } = req.params;
  const emails = req.body?.emails || [];
  const pool = state.pools.find((p) => p.id === poolId);
  const list = state.poolInvitations.get(poolId) || [];
  for (const email of emails) {
    list.push({
      id: `inv_${state.hex(4)}`,
      email,
      firstName: email.split('@')[0],
      lastName: '',
      status: 'pending',
      createdAt: state.nowIso(),
      expiresAt: state.daysFromNow(pool?.invitationSettings?.expirationDays ?? 14),
    });
  }
  state.poolInvitations.set(poolId, list);
  if (pool) pool.stats.invited += emails.length;
  res.json(successResponse({ sent: emails.length, failed: 0, duplicate: 0 }));
});

router.get('/circles/pools/:poolId/invitations', (req, res) => {
  requireAuth(req);
  const { poolId } = req.params;
  const { status } = req.query;
  let invitations = state.poolInvitations.get(poolId) || [];
  if (status) invitations = invitations.filter((i) => i.status === status);
  res.json(successResponse({ invitations }));
});

router.delete('/circles/invitations/:invitationId', (req, res) => {
  requireAuth(req);
  const { invitationId } = req.params;
  for (const list of state.poolInvitations.values()) {
    const idx = list.findIndex((i) => i.id === invitationId);
    if (idx !== -1) {
      list.splice(idx, 1);
      break;
    }
  }
  res.json(successResponse({ message: 'Invitation cancelled' }));
});

router.post('/circles/pools/:poolId/assign', (req, res) => {
  requireAuth(req);
  const { poolId } = req.params;
  const pool = state.pools.find((p) => p.id === poolId);
  const groups = [
    { id: `grp_${state.hex(4)}`, name: 'Group A', memberCount: 5, members: [], leaderId: null },
    { id: `grp_${state.hex(4)}`, name: 'Group B', memberCount: 5, members: [], leaderId: null },
    { id: `grp_${state.hex(4)}`, name: 'Group C', memberCount: 5, members: [], leaderId: null },
  ];
  state.poolGroups.set(poolId, groups);
  if (pool) pool.assignedAt = state.nowIso();
  res.json(successResponse({ groups: groups.map(({ id, name, memberCount }) => ({ id, name, memberCount })), totalMembers: 15 }));
});

router.get('/circles/pools/:poolId/groups', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ groups: state.poolGroups.get(req.params.poolId) || [] }));
});

router.post('/circles/pools/:poolId/groups', (req, res) => {
  requireAuth(req);
  const { poolId } = req.params;
  const { name } = req.body || {};
  const group = { id: `grp_${state.hex(4)}`, name: name || 'New Circle', memberCount: 0, members: [], leaderId: null };
  if (!state.poolGroups.has(poolId)) state.poolGroups.set(poolId, []);
  state.poolGroups.get(poolId).push(group);
  res.json(successResponse(group));
});

router.patch('/circles/pools/:poolId/groups/:groupId', (req, res) => {
  requireAuth(req);
  const group = findGroup(req.params.poolId, req.params.groupId);
  if (!group) throw notFound('Group not found');
  Object.assign(group, req.body || {});
  res.json(successResponse(group));
});

router.post('/circles/pools/:poolId/groups/:groupId/delete', (req, res) => {
  requireAuth(req);
  const { poolId, groupId } = req.params;
  const groups = state.poolGroups.get(poolId) || [];
  const idx = groups.findIndex((g) => g.id === groupId);
  const deletedGroup = idx !== -1 ? groups.splice(idx, 1)[0] : { id: groupId, name: 'Group', memberCount: 0 };
  res.json(successResponse({ message: 'Group deleted successfully', deletedGroup }));
});

router.post('/circles/pools/:poolId/groups/:groupId/add-member', (req, res) => {
  requireAuth(req);
  const group = findGroup(req.params.poolId, req.params.groupId);
  if (!group) throw notFound('Group not found');
  const member = { id: req.body?.memberId || `usr_${state.hex(3)}`, name: req.body?.name || 'Late Joiner' };
  group.members.push(member);
  group.memberCount = group.members.length;
  res.json(successResponse({ message: 'Member added successfully', group, addedMember: member }));
});

router.post('/circles/pools/:poolId/groups/:groupId/remove-member', (req, res) => {
  requireAuth(req);
  const group = findGroup(req.params.poolId, req.params.groupId);
  if (!group) throw notFound('Group not found');
  const memberId = req.body?.memberId;
  const idx = group.members.findIndex((m) => m.id === memberId);
  const removedMember = idx !== -1 ? group.members.splice(idx, 1)[0] : { id: memberId, name: 'Removed User' };
  group.memberCount = group.members.length;
  res.json(successResponse({ message: 'Member removed successfully', group, removedMember }));
});

router.post('/circles/pools/:poolId/groups/:groupId/move-member', (req, res) => {
  requireAuth(req);
  const { poolId } = req.params;
  const { memberId, targetGroupId } = req.body || {};
  const sourceGroup = findGroup(poolId, req.params.groupId);
  const targetGroup = findGroup(poolId, targetGroupId);
  if (!sourceGroup || !targetGroup) throw notFound('Group not found');

  const idx = sourceGroup.members.findIndex((m) => m.id === memberId);
  const member = idx !== -1 ? sourceGroup.members.splice(idx, 1)[0] : { id: memberId, name: 'Member' };
  targetGroup.members.push(member);
  sourceGroup.memberCount = sourceGroup.members.length;
  targetGroup.memberCount = targetGroup.members.length;

  res.json(successResponse({ message: 'Member moved successfully', sourceGroup, targetGroup }));
});

router.post('/circles/admin/diagnostic-email', (req, res) => {
  requireAuth(req);
  res.json(successResponse({ message: 'Diagnostic email sent' }));
});

export default router;
