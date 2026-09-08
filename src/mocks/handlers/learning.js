import { http, HttpResponse } from 'msw';
import * as data from '../data.js';
import { successResponse, requireAuth, guard, notFound } from '../helpers.js';

const SILENT_MP3 = new Uint8Array([0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

export const learningHandlers = [
  http.get('/api/learning/content', async ({ request }) => {
    requireAuth(request);
    const url = new URL(request.url);
    let items = data.MOCK_CONTENT_ITEMS;
    const contentType = url.searchParams.get('contentType');
    const category = url.searchParams.get('category');
    if (contentType) items = items.filter((i) => i.contentType === contentType);
    if (category) items = items.filter((i) => i.category === category);
    return successResponse({ items });
  }),

  http.get('/api/learning/bookmarks', async ({ request }) => {
    requireAuth(request);
    const items = data.MOCK_CONTENT_ITEMS.filter((i) => data.bookmarks.has(i.id));
    return successResponse({ items });
  }),

  http.post('/api/learning/content/:id/bookmark', async ({ request, params }) => {
    requireAuth(request);
    data.bookmarks.add(params.id);
    return successResponse({ bookmarked: true });
  }),

  http.delete('/api/learning/content/:id/bookmark', async ({ request, params }) => {
    requireAuth(request);
    data.bookmarks.delete(params.id);
    return successResponse({ bookmarked: false });
  }),

  http.get(
    '/api/learning/content/:id',
    guard(async ({ request, params }) => {
      requireAuth(request);
      const item = data.MOCK_CONTENT_ITEMS.find((i) => i.id === params.id);
      if (!item) throw notFound('Content not found');
      return successResponse({ item });
    })
  ),

  http.get('/api/learning/content/:id/audio/:lang', async ({ request }) => {
    requireAuth(request);
    return new HttpResponse(SILENT_MP3, { headers: { 'Content-Type': 'audio/mpeg' } });
  }),

  http.get('/api/article-image/:id/:lang', async ({ params }) => {
    return HttpResponse.redirect(`https://placehold.co/800x450/png?text=${encodeURIComponent(params.id)}`, 302);
  }),
];
