/**
 * Generates robots.txt, sitemap.xml, and llms.txt into dist/ from the same
 * route manifest (src/seo/routes.js) used for the prerender pass, so these
 * three files can't drift from what's actually indexable (SEO-SPEC.md §3.2,
 * §6.5, §2.5).
 *
 * Runs after prerender, as part of `npm run build`.
 */

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SITE_URL, publicRoutes, sitemapRoutes, canonicalUrl, alternatesFor } from '../src/seo/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'OAI-SearchBot', 'CCBot'];

function buildRobotsTxt() {
  const allowLines = publicRoutes.map((r) => `Allow: ${r.path}`).join('\n');

  return `# robots.txt for Human First AI - Eve
# ${SITE_URL}

User-agent: *

# Public pages — allow crawling (some are noindex via on-page meta tag —
# see sitemap.xml for the actual index-worthy subset)
${allowLines}

# Authenticated app routes — block indexing
Disallow: /dashboard
Disallow: /coach
Disallow: /learning
Disallow: /circles
Disallow: /progress
Disallow: /profile
Disallow: /feedback
Disallow: /admin
Disallow: /checkin
Disallow: /hub

# Transactional auth pages — no value for indexing
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email

# API endpoints
Disallow: /api/

${AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function buildSitemapXml() {
  const urls = sitemapRoutes
    .map((r) => {
      // Pages with a translated counterpart (currently just "home") get
      // reciprocal hreflang alternates + x-default, per SEO-SPEC.md §7.
      // Legal pages have no sv counterpart, so alternatesFor returns a
      // single-key object and no hreflang block is emitted for them.
      const alts = alternatesFor(r.id);
      const altLocales = Object.keys(alts);
      const hreflang =
        altLocales.length > 1
          ? altLocales
              .map((loc) => `    <xhtml:link rel="alternate" hreflang="${loc}" href="${canonicalUrl(alts[loc])}" />`)
              .join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl(alts.en)}" />\n`
          : '';

      return `  <url>
    <loc>${canonicalUrl(r.path)}</loc>
${hreflang}    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function buildLlmsTxt() {
  // English-only on purpose (SEO-SPEC.md §7 scope note) — this isn't a
  // locale-sensitive discovery mechanism the way hreflang is.
  const indexed = publicRoutes.filter((r) => !r.noindex && r.locale === 'en');
  const links = indexed
    .map((r) => `- [${r.path === '/' ? 'Home' : r.title.split('|')[0].trim()}](${canonicalUrl(r.path)}): ${r.description}`)
    .join('\n');

  return `# Human First AI

> Eve is an AI-powered leadership coach that helps fast-growing companies keep
> their leadership teams aligned so they can execute AI transformation with
> speed and confidence.

Human First AI is built by BrainBank (Singapore) and Human First AI AB (Sweden),
combining AI technology with organizational psychology and burnout science.

## Core pages
${links}

## Contact
- Book a demo via the site's "Book a Demo" call to action.
`;
}

async function main() {
  await writeFile(join(distDir, 'robots.txt'), buildRobotsTxt(), 'utf-8');
  await writeFile(join(distDir, 'sitemap.xml'), buildSitemapXml(), 'utf-8');
  await writeFile(join(distDir, 'llms.txt'), buildLlmsTxt(), 'utf-8');
  console.log('Generated dist/robots.txt, dist/sitemap.xml, dist/llms.txt from src/seo/routes.js');
}

main().catch((err) => {
  console.error('SEO file generation failed:', err);
  process.exit(1);
});
