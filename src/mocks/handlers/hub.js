import { http } from 'msw';
import * as data from '../data.js';
import { successResponse, requireHubAdmin, guard, jsonBody, notFound } from '../helpers.js';

export const hubHandlers = [
  // --- Hub admins ---------------------------------------------------------

  http.get('/api/hub/admins', async () => {
    requireHubAdmin();
    return successResponse({ admins: data.hubAdmins });
  }),

  http.post('/api/hub/admins', async ({ request }) => {
    requireHubAdmin();
    const { email } = await jsonBody(request);
    data.hubAdmins.push({ id: `adm_${data.hex(4)}`, email, addedBy: 'admin@example.com', addedAt: data.nowIso() });
    return successResponse(null);
  }),

  http.delete('/api/hub/admins/:email', async ({ params }) => {
    requireHubAdmin();
    const idx = data.hubAdmins.findIndex((a) => a.email === params.email);
    if (idx !== -1) data.hubAdmins.splice(idx, 1);
    return successResponse(null);
  }),

  // --- Organizations --------------------------------------------------------

  http.get('/api/hub/organizations', async () => {
    requireHubAdmin();
    return successResponse({ organizations: data.organizations });
  }),

  http.post('/api/hub/organizations', async ({ request }) => {
    requireHubAdmin();
    const { name, domain } = await jsonBody(request);
    const organization = { id: `org_${data.hex(4)}`, name, domain: domain || null, memberCount: 0, status: 'active' };
    data.organizations.push(organization);
    return successResponse({ organization });
  }),

  http.get('/api/hub/org-admins', async () => {
    requireHubAdmin();
    return successResponse({ admins: data.orgAdmins });
  }),

  http.post('/api/hub/org-admins', async ({ request }) => {
    requireHubAdmin();
    const { email, organizationId } = await jsonBody(request);
    const org = data.organizations.find((o) => o.id === organizationId);
    let admin = data.orgAdmins.find((a) => a.email === email);
    if (!admin) {
      admin = { email, name: email.split('@')[0], organizations: [] };
      data.orgAdmins.push(admin);
    }
    admin.organizations.push({ id: organizationId, name: org?.name || organizationId, membershipId: `mem_${data.hex(4)}` });
    return successResponse(null);
  }),

  http.delete('/api/hub/org-admins/:membershipId', async ({ params }) => {
    requireHubAdmin();
    for (const admin of data.orgAdmins) {
      admin.organizations = admin.organizations.filter((o) => o.membershipId !== params.membershipId);
    }
    return successResponse(null);
  }),

  // --- Coach settings / prompts / config -----------------------------------

  http.get('/api/hub/settings/coach', async () => {
    requireHubAdmin();
    return successResponse({ dailyExchangeLimit: data.coachDailyExchangeLimit });
  }),

  http.put('/api/hub/settings/coach', async ({ request }) => {
    requireHubAdmin();
    const { dailyExchangeLimit } = await jsonBody(request);
    if (typeof dailyExchangeLimit === 'number') data.setCoachDailyExchangeLimit(dailyExchangeLimit);
    return successResponse({ dailyExchangeLimit: data.coachDailyExchangeLimit });
  }),

  http.get('/api/hub/coach/prompts', async () => {
    requireHubAdmin();
    return successResponse({ prompts: data.coachPrompts });
  }),

  http.put('/api/hub/coach/prompts/:language/:promptName', async ({ request, params }) => {
    requireHubAdmin();
    const { language, promptName } = params;
    if (!data.coachPrompts[language]) data.coachPrompts[language] = {};
    const { content } = await jsonBody(request);
    data.coachPrompts[language][promptName] = content ?? '';
    return successResponse(null);
  }),

  http.get('/api/hub/coach/exercises', async () => {
    requireHubAdmin();
    return successResponse({ exercises: data.coachExercises });
  }),

  http.put('/api/hub/coach/exercises', async ({ request }) => {
    requireHubAdmin();
    const { exercises } = await jsonBody(request);
    if (Array.isArray(exercises)) {
      data.coachExercises.length = 0;
      data.coachExercises.push(...exercises);
    }
    return successResponse(null);
  }),

  http.get('/api/hub/coach/config', async () => {
    requireHubAdmin();
    return successResponse({
      model: 'claude-sonnet-4-5-20250929',
      maxTokens: 1024,
      temperature: 0.7,
      methodology: { primary: 'EMCC', ethical: 'ICF', frameworks: ['SDT', 'JD-R', 'CBC', 'ACT', 'Positive Psychology'] },
      topics: ['delegation', 'stress', 'team_dynamics', 'communication', 'leadership'],
    });
  }),

  // --- Content library ------------------------------------------------------

  http.get('/api/hub/content', async ({ request }) => {
    requireHubAdmin();
    const url = new URL(request.url);
    let items = data.MOCK_CONTENT_ITEMS;
    const contentType = url.searchParams.get('contentType');
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    if (contentType) items = items.filter((i) => i.contentType === contentType);
    if (status) items = items.filter((i) => i.status === status);
    if (category) items = items.filter((i) => i.category === category);
    return successResponse({ items });
  }),

  http.get(
    '/api/hub/content/:id',
    guard(async ({ params }) => {
      requireHubAdmin();
      const item = data.MOCK_CONTENT_ITEMS.find((i) => i.id === params.id);
      if (!item) throw notFound('Content not found');
      return successResponse(item);
    })
  ),

  http.post('/api/hub/content', async ({ request }) => {
    requireHubAdmin();
    const body = await jsonBody(request);
    const item = { id: `cnt_${data.hex(4)}`, status: 'draft', coachPriority: 0, coachEnabled: true, hasContent: true, ...body };
    data.MOCK_CONTENT_ITEMS.push(item);
    return successResponse({ id: item.id, title: item.titleEn, status: item.status });
  }),

  http.put(
    '/api/hub/content/:id',
    guard(async ({ request, params }) => {
      requireHubAdmin();
      const item = data.MOCK_CONTENT_ITEMS.find((i) => i.id === params.id);
      if (!item) throw notFound('Content not found');
      Object.assign(item, await jsonBody(request));
      return successResponse({ id: item.id, title: item.titleEn, status: item.status });
    })
  ),

  http.delete('/api/hub/content/:id', async ({ params }) => {
    requireHubAdmin();
    const idx = data.MOCK_CONTENT_ITEMS.findIndex((i) => i.id === params.id);
    if (idx !== -1) data.MOCK_CONTENT_ITEMS.splice(idx, 1);
    return successResponse(null);
  }),

  http.post('/api/hub/content/:contentId/audio/:lang', async ({ params }) => {
    requireHubAdmin();
    const { contentId, lang } = params;
    return successResponse({ audioUrl: `/audio/${contentId}-${lang}.mp3` });
  }),

  http.delete('/api/hub/content/:contentId/audio/:lang', async () => {
    requireHubAdmin();
    return successResponse(null);
  }),

  // --- Compliance -------------------------------------------------------

  http.get('/api/hub/compliance/stats', async () => {
    requireHubAdmin();
    return successResponse({
      totalUsers: 150,
      pendingDeletions: data.pendingDeletions.length,
      auditLogCount: 4523,
      activeSessions: data.tokens.size,
    });
  }),

  http.get('/api/hub/compliance/user/:email', async ({ params }) => {
    requireHubAdmin();
    return successResponse({
      id: 'usr_mock123',
      email: params.email,
      organization: 'Acme Corp',
      status: 'active',
      createdAt: data.daysAgo(600),
      lastLoginAt: data.daysAgo(1),
      sessionCount: 45,
      checkInCount: data.checkinHistory.length,
      consents: {
        termsOfService: { accepted: true, acceptedAt: data.daysAgo(600) },
        privacyPolicy: { accepted: true, acceptedAt: data.daysAgo(600) },
      },
    });
  }),

  http.post('/api/hub/compliance/export/:userId', async ({ params }) => {
    requireHubAdmin();
    return successResponse({
      user: { id: params.userId, email: 'user@example.com' },
      checkins: data.checkinHistory.slice(-5),
      conversations: [...data.conversations.values()].map((c) => ({ id: c.id, messageCount: c.messages.length })),
      exportedAt: data.nowIso(),
    });
  }),

  http.post('/api/hub/compliance/delete/:userId', async () => {
    requireHubAdmin();
    return successResponse({ message: 'Account scheduled for deletion' });
  }),

  http.get('/api/hub/compliance/pending-deletions', async () => {
    requireHubAdmin();
    return successResponse({ pendingDeletions: data.pendingDeletions });
  }),

  http.post('/api/hub/compliance/cleanup-sessions', async () => {
    requireHubAdmin();
    const cleanedCount = data.tokens.size;
    data.tokens.clear();
    return successResponse({ cleanedCount });
  }),

  http.get('/api/hub/compliance/security-config', async () => {
    requireHubAdmin();
    return successResponse({
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordMinLength: 12,
      requireMFA: false,
      allowedDomains: ['*'],
      rateLimits: { login: '10/minute', api: '100/minute' },
    });
  }),
];
