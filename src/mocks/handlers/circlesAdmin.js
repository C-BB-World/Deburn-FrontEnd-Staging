import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, guard, jsonBody, notFound } from '../helpers.js';

function findGroup(poolId, groupId) {
  const groups = data.poolGroups.get(poolId) || [];
  return groups.find((g) => g.id === groupId);
}

export const circlesAdminHandlers = [
  http.post('/api/circles/pools', async ({ request }) => {
    requireAuth(request);
    const { name, topic, description, organizationId, targetGroupSize = 5, cadence = 'bi-weekly' } = await jsonBody(request);
    const pool = {
      id: `pool_${data.hex(4)}`,
      name,
      status: 'draft',
      topic: topic || null,
      description: description || null,
      organizationId: organizationId || null,
      targetGroupSize,
      cadence,
      stats: { invited: 0, accepted: 0, declined: 0 },
      invitationSettings: { expirationDays: 14 },
      createdAt: data.nowIso(),
      assignedAt: null,
    };
    data.pools.push(pool);
    data.poolGroups.set(pool.id, []);
    data.poolInvitations.set(pool.id, []);
    return successResponse(pool);
  }),

  http.get('/api/circles/pools', async ({ request }) => {
    requireAuth(request);
    const status = new URL(request.url).searchParams.get('status');
    const pools = status ? data.pools.filter((p) => p.status === status) : data.pools;
    return successResponse({ pools });
  }),

  http.get(
    '/api/circles/pools/:poolId',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const pool = data.pools.find((p) => p.id === params.poolId);
      if (!pool) throw notFound('Pool not found');
      return successResponse(pool);
    })
  ),

  http.post('/api/circles/pools/:poolId/invitations', async ({ request, params }) => {
    requireAuth(request);
    const { poolId } = params;
    const { emails = [] } = await jsonBody(request);
    const pool = data.pools.find((p) => p.id === poolId);
    const list = data.poolInvitations.get(poolId) || [];
    for (const email of emails) {
      list.push({
        id: `inv_${data.hex(4)}`,
        email,
        firstName: email.split('@')[0],
        lastName: '',
        status: 'pending',
        createdAt: data.nowIso(),
        expiresAt: data.daysFromNow(pool?.invitationSettings?.expirationDays ?? 14),
      });
    }
    data.poolInvitations.set(poolId, list);
    if (pool) pool.stats.invited += emails.length;
    return successResponse({ sent: emails.length, failed: 0, duplicate: 0 });
  }),

  http.get('/api/circles/pools/:poolId/invitations', async ({ request, params }) => {
    requireAuth(request);
    const status = new URL(request.url).searchParams.get('status');
    let invitations = data.poolInvitations.get(params.poolId) || [];
    if (status) invitations = invitations.filter((i) => i.status === status);
    return successResponse({ invitations });
  }),

  http.delete('/api/circles/invitations/:invitationId', async ({ request, params }) => {
    requireAuth(request);
    for (const list of data.poolInvitations.values()) {
      const idx = list.findIndex((i) => i.id === params.invitationId);
      if (idx !== -1) {
        list.splice(idx, 1);
        break;
      }
    }
    return successResponse({ message: 'Invitation cancelled' });
  }),

  http.post('/api/circles/pools/:poolId/assign', async ({ request, params }) => {
    requireAuth(request);
    const { poolId } = params;
    const pool = data.pools.find((p) => p.id === poolId);
    const groups = [
      { id: `grp_${data.hex(4)}`, name: 'Group A', memberCount: 5, members: [], leaderId: null },
      { id: `grp_${data.hex(4)}`, name: 'Group B', memberCount: 5, members: [], leaderId: null },
      { id: `grp_${data.hex(4)}`, name: 'Group C', memberCount: 5, members: [], leaderId: null },
    ];
    data.poolGroups.set(poolId, groups);
    if (pool) pool.assignedAt = data.nowIso();
    return successResponse({ groups: groups.map(({ id, name, memberCount }) => ({ id, name, memberCount })), totalMembers: 15 });
  }),

  http.get('/api/circles/pools/:poolId/groups', async ({ request, params }) => {
    requireAuth(request);
    return successResponse({ groups: data.poolGroups.get(params.poolId) || [] });
  }),

  http.post('/api/circles/pools/:poolId/groups', async ({ request, params }) => {
    requireAuth(request);
    const { poolId } = params;
    const { name } = await jsonBody(request);
    const group = { id: `grp_${data.hex(4)}`, name: name || 'New Circle', memberCount: 0, members: [], leaderId: null };
    if (!data.poolGroups.has(poolId)) data.poolGroups.set(poolId, []);
    data.poolGroups.get(poolId).push(group);
    return successResponse(group);
  }),

  http.patch(
    '/api/circles/pools/:poolId/groups/:groupId',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const group = findGroup(params.poolId, params.groupId);
      if (!group) throw notFound('Group not found');
      Object.assign(group, await jsonBody(request));
      return successResponse(group);
    })
  ),

  http.post('/api/circles/pools/:poolId/groups/:groupId/delete', async ({ request, params }) => {
    requireAuth(request);
    const { poolId, groupId } = params;
    const groups = data.poolGroups.get(poolId) || [];
    const idx = groups.findIndex((g) => g.id === groupId);
    const deletedGroup = idx !== -1 ? groups.splice(idx, 1)[0] : { id: groupId, name: 'Group', memberCount: 0 };
    return successResponse({ message: 'Group deleted successfully', deletedGroup });
  }),

  http.post(
    '/api/circles/pools/:poolId/groups/:groupId/add-member',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const group = findGroup(params.poolId, params.groupId);
      if (!group) throw notFound('Group not found');
      const body = await jsonBody(request);
      const member = { id: body.memberId || `usr_${data.hex(3)}`, name: body.name || 'Late Joiner' };
      group.members.push(member);
      group.memberCount = group.members.length;
      return successResponse({ message: 'Member added successfully', group, addedMember: member });
    })
  ),

  http.post(
    '/api/circles/pools/:poolId/groups/:groupId/remove-member',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const group = findGroup(params.poolId, params.groupId);
      if (!group) throw notFound('Group not found');
      const { memberId } = await jsonBody(request);
      const idx = group.members.findIndex((m) => m.id === memberId);
      const removedMember = idx !== -1 ? group.members.splice(idx, 1)[0] : { id: memberId, name: 'Removed User' };
      group.memberCount = group.members.length;
      return successResponse({ message: 'Member removed successfully', group, removedMember });
    })
  ),

  http.post(
    '/api/circles/pools/:poolId/groups/:groupId/move-member',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const { poolId } = params;
      const { memberId, targetGroupId } = await jsonBody(request);
      const sourceGroup = findGroup(poolId, params.groupId);
      const targetGroup = findGroup(poolId, targetGroupId);
      if (!sourceGroup || !targetGroup) throw notFound('Group not found');

      const idx = sourceGroup.members.findIndex((m) => m.id === memberId);
      const member = idx !== -1 ? sourceGroup.members.splice(idx, 1)[0] : { id: memberId, name: 'Member' };
      targetGroup.members.push(member);
      sourceGroup.memberCount = sourceGroup.members.length;
      targetGroup.memberCount = targetGroup.members.length;

      return successResponse({ message: 'Member moved successfully', sourceGroup, targetGroup });
    })
  ),

  http.post('/api/circles/admin/diagnostic-email', async ({ request }) => {
    requireAuth(request);
    return successResponse({ message: 'Diagnostic email sent' });
  }),
];
