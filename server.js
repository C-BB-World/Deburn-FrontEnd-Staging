import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { publicRoutes } from './src/seo/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 3000;

// Authenticated / client-side-only app routes (not prerendered — served
// with the SPA shell so client-side routing and hard refreshes still work).
// Anything that's neither this nor a public route below is a real 404
// (SEO-SPEC.md §3.3 — no more silent fallback to the login screen).
const APP_ROUTE_PREFIXES = [
  '/dashboard',
  '/coach',
  '/learning',
  '/circles',
  '/progress',
  '/profile',
  '/feedback',
  '/admin',
  '/checkin',
  '/hub',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

function isAppRoute(path) {
  return APP_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

const publicPaths = new Set(publicRoutes.map((r) => r.path));

function publicRouteFile(path) {
  return path === '/' ? join(distDir, 'index.html') : join(distDir, path.slice(1), 'index.html');
}

const shellFile = join(distDir, 'index.html');

// Serve built assets directly. `index: false` disables express.static's own
// directory-index resolution, and `redirect: false` disables its separate
// 301-to-trailing-slash behavior for bare directory requests (e.g.
// /register -> /register/) — that fires purely because dist/register/ is a
// directory, independent of `index`. The routes below serve prerendered
// public pages and the SPA shell explicitly instead, so canonical URLs stay
// exactly what §2.4 requires, with no extra redirect hop.
app.use(
  express.static(distDir, {
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.xml')) res.setHeader('Content-Type', 'application/xml');
      if (filePath.endsWith('.txt')) res.setHeader('Content-Type', 'text/plain');
    },
  })
);

app.get('*', (req, res) => {
  const path = req.path === '/' ? '/' : req.path.replace(/\/+$/, '');

  if (publicPaths.has(path)) {
    const file = publicRouteFile(path);
    // Falls back to the SPA shell if the build wasn't prerendered (e.g. a
    // bare `vite build` without `node scripts/prerender.js`) rather than
    // 404ing a route that legitimately exists.
    return res.sendFile(existsSync(file) ? file : shellFile);
  }

  if (isAppRoute(path)) {
    return res.sendFile(shellFile);
  }

  res.status(404).sendFile(shellFile);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
