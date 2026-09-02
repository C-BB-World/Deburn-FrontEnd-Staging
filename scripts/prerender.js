/**
 * Build-time prerender for the public marketing routes (SEO-SPEC.md §2).
 *
 * Runs after `vite build`. Boots the built `dist/` on a local port, drives a
 * real headless Chromium to each public route (so client-only libraries —
 * localStorage-backed i18n, IntersectionObserver, the auth check — all work
 * exactly as they do for a real visitor), waits for the page to settle
 * (including the testimonials fetch on the homepage), and writes the
 * resulting DOM to a static file so the *first* HTTP response for that
 * route already contains real title/description/canonical/JSON-LD/body
 * copy — no JavaScript execution required to see it.
 *
 * Requires the backend API (VITE_API_URL) to be reachable, since the
 * homepage's testimonials are fetched at runtime and we want them baked
 * into the static output too.
 */

import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { publicRoutes } from '../src/seo/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outFile = (path) =>
  path === '/' ? join(root, 'dist', 'index.html') : join(root, 'dist', path.slice(1), 'index.html');

async function main() {
  const server = await preview({ root, preview: { port: 4173, strictPort: false } });
  const port = server.config.preview.port;
  const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, '');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture every route into memory first, and only write to dist/ once
  // *all* routes have been rendered. Writing (e.g. overwriting dist/index.html
  // for "/") while the preview server is still serving other routes' SPA
  // fallback from that same file would leak one route's baked-in tags into
  // the next route's initial HTML.
  const captured = [];
  try {
    for (const route of publicRoutes) {
      const url = `${baseUrl}${route.path}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const html = await page.content();
      captured.push({ path: route.path, html });
      console.log(`captured ${route.path}`);
    }
  } finally {
    await browser.close();
    await server.close();
  }

  for (const { path, html } of captured) {
    const file = outFile(path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html, 'utf-8');
    console.log(`prerendered ${path} -> ${file.replace(root + '/', '')}`);
  }
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
