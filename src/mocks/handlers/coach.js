import { http, HttpResponse } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, guard, jsonBody, notFound } from '../helpers.js';

const SILENT_MP3 = new Uint8Array([0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

export const coachHandlers = [
  http.post('/api/coach/chat', async ({ request }) => {
    requireAuth(request);
    const body = await jsonBody(request);
    const { message = '' } = body;
    let conversationId = body.conversationId;
    const lang = body.language === 'sv' ? 'sv' : 'en';

    if (!conversationId || !data.conversations.has(conversationId)) {
      conversationId = `conv_${data.hex(8)}`;
      data.conversations.set(conversationId, {
        id: conversationId,
        title: message.slice(0, 50).trim() || 'New conversation',
        status: 'active',
        createdAt: data.nowIso(),
        lastMessageAt: data.nowIso(),
        messages: [],
      });
    }

    const conv = data.conversations.get(conversationId);
    conv.messages.push({ role: 'user', content: message });

    const responseText =
      lang === 'sv'
        ? 'Det är en utmärkt fråga om ledarskap. Att utveckla ditt team kräver både tålamod och strategi. Låt mig dela några tankar som kan hjälpa dig. Först, överväg att ha regelbundna en-till-en-samtal med varje teammedlem. Detta bygger förtroende och ger dig insikt i deras utmaningar.'
        : "That's an excellent question about leadership. Developing your team requires both patience and strategy. Let me share some thoughts that might help you. First, consider having regular one-on-one conversations with each team member. This builds trust and gives you insight into their challenges.";

    conv.messages.push({ role: 'assistant', content: responseText, actions: [] });
    conv.lastMessageAt = data.nowIso();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

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

        send({ type: 'quickReplies', content: data.MOCK_QUICK_REPLIES[lang] });
        await sleep(50);

        send({ type: 'metadata', content: { conversationId, topics: ['leadership', 'team_dynamics'] } });
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }),

  http.get('/api/coach/conversations/list', async ({ request }) => {
    requireAuth(request);
    const url = new URL(request.url);
    const skip = parseInt(url.searchParams.get('skip'), 10) || 0;
    const limit = parseInt(url.searchParams.get('limit'), 10) || 20;
    const all = [...data.conversations.values()].sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
    const page = all.slice(skip, skip + limit);
    return HttpResponse.json({ conversations: page.map(summarize), total: all.length, hasMore: skip + limit < all.length });
  }),

  http.get(
    '/api/coach/conversations/:conversationId',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const conv = data.conversations.get(params.conversationId);
      if (!conv) throw notFound('Conversation not found');
      return successResponse({
        conversation: { id: conv.id, title: conv.title, status: conv.status, createdAt: conv.createdAt, lastMessageAt: conv.lastMessageAt },
        messages: conv.messages.map((m) => ({ role: m.role, content: m.content, actions: m.actions || [] })),
      });
    })
  ),

  http.delete('/api/coach/conversations/:conversationId', async ({ request, params }) => {
    requireAuth(request);
    data.conversations.delete(params.conversationId);
    return successResponse({ deleted: true });
  }),

  http.patch(
    '/api/coach/conversations/:conversationId',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const conv = data.conversations.get(params.conversationId);
      if (!conv) throw notFound('Conversation not found');
      const { title = '' } = await jsonBody(request);
      conv.title = title.trim() || conv.title;
      return successResponse({ id: conv.id, title: conv.title });
    })
  ),

  http.post('/api/coach/voice', async ({ request }) => {
    requireAuth(request);
    return new HttpResponse(SILENT_MP3, {
      headers: { 'Content-Type': 'audio/mpeg', 'Content-Disposition': 'inline; filename=speech.mp3' },
    });
  }),

  http.post('/api/coach/transcribe', async ({ request }) => {
    requireAuth(request);
    return successResponse({ text: "That's an excellent question about leadership." });
  }),

  http.post('/api/coach/conversations/translate', async ({ request }) => {
    requireAuth(request);
    const { targetLanguage } = await jsonBody(request);
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
    return HttpResponse.json({
      translatedMessages,
      totalMessages: base.length,
      startIndex: 0,
      endIndex: base.length,
      newlyTranslated: 1,
      fromCache: 1,
    });
  }),
];
