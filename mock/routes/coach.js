import { Router } from 'express';
import multer from 'multer';
import * as state from '../state.js';
import { successResponse, requireAuth, notFound, asyncHandler } from '../helpers.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const SILENT_MP3 = Buffer.from([0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.post(
  '/coach/chat',
  asyncHandler(async (req, res) => {
  requireAuth(req);
  const { message = '', language = 'en' } = req.body || {};
  let conversationId = req.body?.conversationId;
  const lang = language === 'sv' ? 'sv' : 'en';

  if (!conversationId || !state.conversations.has(conversationId)) {
    conversationId = `conv_${state.hex(8)}`;
    state.conversations.set(conversationId, {
      id: conversationId,
      title: message.slice(0, 50).trim() || 'New conversation',
      status: 'active',
      createdAt: state.nowIso(),
      lastMessageAt: state.nowIso(),
      messages: [],
    });
  }

  const conv = state.conversations.get(conversationId);
  conv.messages.push({ role: 'user', content: message });

  const responseText =
    lang === 'sv'
      ? 'Det är en utmärkt fråga om ledarskap. Att utveckla ditt team kräver både tålamod och strategi. Låt mig dela några tankar som kan hjälpa dig. Först, överväg att ha regelbundna en-till-en-samtal med varje teammedlem. Detta bygger förtroende och ger dig insikt i deras utmaningar.'
      : "That's an excellent question about leadership. Developing your team requires both patience and strategy. Let me share some thoughts that might help you. First, consider having regular one-on-one conversations with each team member. This builds trust and gives you insight into their challenges.";

  conv.messages.push({ role: 'assistant', content: responseText, actions: [] });
  conv.lastMessageAt = state.nowIso();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  send({ type: 'metadata', content: { conversationId } });
  await sleep(50);

  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ');
    send({ type: 'text', content: i > 0 ? ` ${chunk}` : chunk });
    await sleep(50);
  }

  send({
    type: 'actions',
    content: [
      { type: 'exercise', id: 'breathing', label: lang === 'sv' ? 'Prova en lugnande övning' : 'Try a Calming Exercise' },
      { type: 'module', id: 'delegation', label: lang === 'sv' ? 'Lär dig: Delegera rätt' : 'Learn: Delegation Done Right', duration: '5 min' },
    ],
  });
  await sleep(50);

  send({ type: 'quickReplies', content: state.MOCK_QUICK_REPLIES[lang] });
  await sleep(50);

  send({ type: 'metadata', content: { conversationId, topics: ['leadership', 'team_dynamics'] } });
  res.write('data: [DONE]\n\n');
  res.end();
  })
);

function summarize(conv) {
  return {
    id: conv.id,
    conversationId: conv.id,
    title: conv.title,
    messageCount: conv.messages.length,
    topics: [],
    status: conv.status,
    lastMessageAt: conv.lastMessageAt,
    createdAt: conv.createdAt,
  };
}

router.get('/coach/conversations/list', (req, res) => {
  requireAuth(req);
  const skip = parseInt(req.query.skip, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 20;
  const all = [...state.conversations.values()].sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
  const page = all.slice(skip, skip + limit);
  res.json({ conversations: page.map(summarize), total: all.length, hasMore: skip + limit < all.length });
});

router.get('/coach/conversations/:conversationId', (req, res) => {
  requireAuth(req);
  const conv = state.conversations.get(req.params.conversationId);
  if (!conv) throw notFound('Conversation not found');
  res.json(
    successResponse({
      conversation: { id: conv.id, title: conv.title, status: conv.status, createdAt: conv.createdAt, lastMessageAt: conv.lastMessageAt },
      messages: conv.messages.map((m) => ({ role: m.role, content: m.content, actions: m.actions || [] })),
    })
  );
});

router.delete('/coach/conversations/:conversationId', (req, res) => {
  requireAuth(req);
  state.conversations.delete(req.params.conversationId);
  res.json(successResponse({ deleted: true }));
});

router.patch('/coach/conversations/:conversationId', (req, res) => {
  requireAuth(req);
  const conv = state.conversations.get(req.params.conversationId);
  if (!conv) throw notFound('Conversation not found');
  conv.title = (req.body?.title || '').trim() || conv.title;
  res.json(successResponse({ id: conv.id, title: conv.title }));
});

router.post('/coach/voice', (req, res) => {
  requireAuth(req);
  res.set({ 'Content-Type': 'audio/mpeg', 'Content-Disposition': 'inline; filename=speech.mp3' });
  res.send(SILENT_MP3);
});

router.post('/coach/transcribe', upload.single('audio'), (req, res) => {
  requireAuth(req);
  res.json(successResponse({ text: "That's an excellent question about leadership." }));
});

router.post('/coach/conversations/translate', (req, res) => {
  requireAuth(req);
  const { targetLanguage } = req.body || {};
  const base = [
    { role: 'user', content: 'I want to work on my leadership skills' },
    { role: 'assistant', content: "That's a wonderful goal! Leadership is a journey of continuous growth." },
  ];
  const translatedMessages = base.map((msg, i) => {
    let content = msg.content;
    if (targetLanguage === 'sv') {
      content = msg.role === 'user' ? 'Jag vill jobba på mitt ledarskap' : 'Det är ett fantastiskt mål! Ledarskap är en resa av ständig utveckling.';
    }
    return { index: i, content, alreadyInTargetLanguage: false, fromCache: i === 0, newlyTranslated: i === 1 };
  });
  res.json({
    translatedMessages,
    totalMessages: base.length,
    startIndex: 0,
    endIndex: base.length,
    newlyTranslated: 1,
    fromCache: 1,
  });
});

export default router;
