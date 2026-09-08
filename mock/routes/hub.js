import { Router } from 'express';
import multer from 'multer';
import * as state from '../state.js';
import { successResponse, requireHubAdmin, notFound } from '../helpers.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Hub admins -------------------------------------------------------

router.get('/hub/admins', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse({ admins: state.hubAdmins }));
});

router.post('/hub/admins', (req, res) => {
  requireHubAdmin(req);
  const { email } = req.body || {};
  state.hubAdmins.push({ id: `adm_${state.hex(4)}`, email, addedBy: 'admin@example.com', addedAt: state.nowIso() });
  res.json(successResponse(null));
});

router.delete('/hub/admins/:email', (req, res) => {
  requireHubAdmin(req);
  const idx = state.hubAdmins.findIndex((a) => a.email === req.params.email);
  if (idx !== -1) state.hubAdmins.splice(idx, 1);
  res.json(successResponse(null));
});

// --- Organizations ------------------------------------------------------

router.get('/hub/organizations', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse({ organizations: state.organizations }));
});

router.post('/hub/organizations', (req, res) => {
  requireHubAdmin(req);
  const { name, domain } = req.body || {};
  const organization = { id: `org_${state.hex(4)}`, name, domain: domain || null, memberCount: 0, status: 'active' };
  state.organizations.push(organization);
  res.json(successResponse({ organization }));
});

router.get('/hub/org-admins', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse({ admins: state.orgAdmins }));
});

router.post('/hub/org-admins', (req, res) => {
  requireHubAdmin(req);
  const { email, organizationId } = req.body || {};
  const org = state.organizations.find((o) => o.id === organizationId);
  let admin = state.orgAdmins.find((a) => a.email === email);
  if (!admin) {
    admin = { email, name: email.split('@')[0], organizations: [] };
    state.orgAdmins.push(admin);
  }
  admin.organizations.push({ id: organizationId, name: org?.name || organizationId, membershipId: `mem_${state.hex(4)}` });
  res.json(successResponse(null));
});

router.delete('/hub/org-admins/:membershipId', (req, res) => {
  requireHubAdmin(req);
  for (const admin of state.orgAdmins) {
    admin.organizations = admin.organizations.filter((o) => o.membershipId !== req.params.membershipId);
  }
  res.json(successResponse(null));
});

// --- Coach settings / prompts / config -----------------------------------

router.get('/hub/settings/coach', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse({ dailyExchangeLimit: state.coachDailyExchangeLimit }));
});

router.put('/hub/settings/coach', (req, res) => {
  requireHubAdmin(req);
  const { dailyExchangeLimit } = req.body || {};
  if (typeof dailyExchangeLimit === 'number') state.setCoachDailyExchangeLimit(dailyExchangeLimit);
  res.json(successResponse({ dailyExchangeLimit: state.coachDailyExchangeLimit }));
});

router.get('/hub/coach/prompts', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse({ prompts: state.coachPrompts }));
});

router.put('/hub/coach/prompts/:language/:promptName', (req, res) => {
  requireHubAdmin(req);
  const { language, promptName } = req.params;
  if (!state.coachPrompts[language]) state.coachPrompts[language] = {};
  state.coachPrompts[language][promptName] = req.body?.content ?? '';
  res.json(successResponse(null));
});

router.get('/hub/coach/exercises', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse({ exercises: state.coachExercises }));
});

router.put('/hub/coach/exercises', (req, res) => {
  requireHubAdmin(req);
  const exercises = req.body?.exercises;
  if (Array.isArray(exercises)) {
    state.coachExercises.length = 0;
    state.coachExercises.push(...exercises);
  }
  res.json(successResponse(null));
});

router.get('/hub/coach/config', (req, res) => {
  requireHubAdmin(req);
  res.json(
    successResponse({
      model: 'claude-sonnet-4-5-20250929',
      maxTokens: 1024,
      temperature: 0.7,
      methodology: { primary: 'EMCC', ethical: 'ICF', frameworks: ['SDT', 'JD-R', 'CBC', 'ACT', 'Positive Psychology'] },
      topics: ['delegation', 'stress', 'team_dynamics', 'communication', 'leadership'],
    })
  );
});

// --- Content library ------------------------------------------------------

router.get('/hub/content', (req, res) => {
  requireHubAdmin(req);
  let items = state.MOCK_CONTENT_ITEMS;
  if (req.query.contentType) items = items.filter((i) => i.contentType === req.query.contentType);
  if (req.query.status) items = items.filter((i) => i.status === req.query.status);
  if (req.query.category) items = items.filter((i) => i.category === req.query.category);
  res.json(successResponse({ items }));
});

router.get('/hub/content/:id', (req, res) => {
  requireHubAdmin(req);
  const item = state.MOCK_CONTENT_ITEMS.find((i) => i.id === req.params.id);
  if (!item) throw notFound('Content not found');
  res.json(successResponse(item));
});

router.post('/hub/content', (req, res) => {
  requireHubAdmin(req);
  const body = req.body || {};
  const item = {
    id: `cnt_${state.hex(4)}`,
    status: 'draft',
    coachPriority: 0,
    coachEnabled: true,
    hasContent: true,
    ...body,
  };
  state.MOCK_CONTENT_ITEMS.push(item);
  res.json(successResponse({ id: item.id, title: item.titleEn, status: item.status }));
});

router.put('/hub/content/:id', (req, res) => {
  requireHubAdmin(req);
  const item = state.MOCK_CONTENT_ITEMS.find((i) => i.id === req.params.id);
  if (!item) throw notFound('Content not found');
  Object.assign(item, req.body || {});
  res.json(successResponse({ id: item.id, title: item.titleEn, status: item.status }));
});

router.delete('/hub/content/:id', (req, res) => {
  requireHubAdmin(req);
  const idx = state.MOCK_CONTENT_ITEMS.findIndex((i) => i.id === req.params.id);
  if (idx !== -1) state.MOCK_CONTENT_ITEMS.splice(idx, 1);
  res.json(successResponse(null));
});

router.post('/hub/content/:contentId/audio/:lang', upload.single('file'), (req, res) => {
  requireHubAdmin(req);
  const { contentId, lang } = req.params;
  res.json(successResponse({ audioUrl: `/audio/${contentId}-${lang}.mp3` }));
});

router.delete('/hub/content/:contentId/audio/:lang', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse(null));
});

// --- Compliance -------------------------------------------------------

router.get('/hub/compliance/stats', (req, res) => {
  requireHubAdmin(req);
  res.json(
    successResponse({
      totalUsers: 150,
      pendingDeletions: state.pendingDeletions.length,
      auditLogCount: 4523,
      activeSessions: state.tokens.size,
    })
  );
});

router.get('/hub/compliance/user/:email', (req, res) => {
  requireHubAdmin(req);
  res.json(
    successResponse({
      id: 'usr_mock123',
      email: req.params.email,
      organization: 'Acme Corp',
      status: 'active',
      createdAt: state.daysAgo(600),
      lastLoginAt: state.daysAgo(1),
      sessionCount: 45,
      checkInCount: state.checkinHistory.length,
      consents: {
        termsOfService: { accepted: true, acceptedAt: state.daysAgo(600) },
        privacyPolicy: { accepted: true, acceptedAt: state.daysAgo(600) },
      },
    })
  );
});

router.post('/hub/compliance/export/:userId', (req, res) => {
  requireHubAdmin(req);
  res.json(
    successResponse({
      user: { id: req.params.userId, email: 'user@example.com' },
      checkins: state.checkinHistory.slice(-5),
      conversations: [...state.conversations.values()].map((c) => ({ id: c.id, messageCount: c.messages.length })),
      exportedAt: state.nowIso(),
    })
  );
});

router.post('/hub/compliance/delete/:userId', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse({ message: 'Account scheduled for deletion' }));
});

router.get('/hub/compliance/pending-deletions', (req, res) => {
  requireHubAdmin(req);
  res.json(successResponse({ pendingDeletions: state.pendingDeletions }));
});

router.post('/hub/compliance/cleanup-sessions', (req, res) => {
  requireHubAdmin(req);
  const cleanedCount = state.tokens.size;
  state.tokens.clear();
  res.json(successResponse({ cleanedCount }));
});

router.get('/hub/compliance/security-config', (req, res) => {
  requireHubAdmin(req);
  res.json(
    successResponse({
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordMinLength: 12,
      requireMFA: false,
      allowedDomains: ['*'],
      rateLimits: { login: '10/minute', api: '100/minute' },
    })
  );
});

export default router;
