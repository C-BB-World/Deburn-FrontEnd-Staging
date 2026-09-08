import { Router } from 'express';
import * as state from '../state.js';
import { successResponse, requireAuth, notFound } from '../helpers.js';

const router = Router();
const SILENT_MP3 = Buffer.from([0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

router.get('/learning/content', (req, res) => {
  requireAuth(req);
  let items = state.MOCK_CONTENT_ITEMS;
  if (req.query.contentType) items = items.filter((i) => i.contentType === req.query.contentType);
  if (req.query.category) items = items.filter((i) => i.category === req.query.category);
  res.json(successResponse({ items }));
});

router.get('/learning/bookmarks', (req, res) => {
  requireAuth(req);
  const items = state.MOCK_CONTENT_ITEMS.filter((i) => state.bookmarks.has(i.id));
  res.json(successResponse({ items }));
});

router.post('/learning/content/:id/bookmark', (req, res) => {
  requireAuth(req);
  state.bookmarks.add(req.params.id);
  res.json(successResponse({ bookmarked: true }));
});

router.delete('/learning/content/:id/bookmark', (req, res) => {
  requireAuth(req);
  state.bookmarks.delete(req.params.id);
  res.json(successResponse({ bookmarked: false }));
});

router.get('/learning/content/:id', (req, res) => {
  requireAuth(req);
  const item = state.MOCK_CONTENT_ITEMS.find((i) => i.id === req.params.id);
  if (!item) throw notFound('Content not found');
  res.json(successResponse({ item }));
});

router.get('/learning/content/:id/audio/:lang', (req, res) => {
  requireAuth(req);
  res.set('Content-Type', 'audio/mpeg');
  res.send(SILENT_MP3);
});

router.get('/article-image/:id/:lang', (req, res) => {
  res.redirect(302, `https://placehold.co/800x450/png?text=${encodeURIComponent(req.params.id)}`);
});

export default router;
