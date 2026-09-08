import { Router } from 'express';
import * as state from '../state.js';
import { successResponse } from '../helpers.js';

const router = Router();

router.get('/public/testimonials', (req, res) => {
  const lang = req.query.lang === 'sv' ? 'sv' : 'en';
  res.json(successResponse({ testimonials: state.testimonials[lang] }));
});

router.post('/public/contact', (req, res) => {
  res.json(successResponse({ message: 'Thanks for reaching out — we will be in touch shortly.' }));
});

export default router;
