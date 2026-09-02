/**
 * Build-time guardrail (SEO-SPEC.md §2.5): fails the build if any two
 * prerendered public routes share a title, share a description, emit a
 * canonical that isn't their own URL, or don't have exactly one <h1>.
 *
 * This is what stops the original bug (every route serving the same title/
 * description/canonical) from silently reappearing — it's invisible in
 * local dev, where you only ever look at one route at a time.
 *
 * Runs after prerender + generate-seo-files, as part of `npm run build`.
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { publicRoutes, canonicalUrl } from '../src/seo/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

function extract(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

async function main() {
  const errors = [];
  const seenTitles = new Map();
  const seenDescriptions = new Map();

  for (const route of publicRoutes) {
    const file = route.path === '/' ? join(distDir, 'index.html') : join(distDir, route.path.slice(1), 'index.html');
    let html;
    try {
      html = await readFile(file, 'utf-8');
    } catch {
      errors.push(`${route.path}: prerendered file missing (${file}) — run \`node scripts/prerender.js\` first`);
      continue;
    }

    const title = extract(html, /<title>([^<]*)<\/title>/);
    const canonical = extract(html, /rel="canonical" href="([^"]*)"/);
    const h1Count = (html.match(/<h1[\s>]/g) || []).length;
    const description = extract(html, /<meta name="description" content="([^"]*)"/);

    if (!title) errors.push(`${route.path}: no <title> found`);
    else if (seenTitles.has(title)) errors.push(`${route.path}: title duplicates ${seenTitles.get(title)} ("${title}")`);
    else seenTitles.set(title, route.path);

    if (!description) errors.push(`${route.path}: no meta description found`);
    else if (seenDescriptions.has(description))
      errors.push(`${route.path}: description duplicates ${seenDescriptions.get(description)}`);
    else seenDescriptions.set(description, route.path);

    const expectedCanonical = canonicalUrl(route.path);
    if (canonical !== expectedCanonical) {
      errors.push(`${route.path}: canonical is "${canonical}", expected "${expectedCanonical}"`);
    }

    if (h1Count !== 1) {
      errors.push(`${route.path}: found ${h1Count} <h1> elements, expected exactly 1`);
    }
  }

  if (errors.length) {
    console.error('SEO uniqueness check FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }

  console.log(`SEO uniqueness check passed for ${publicRoutes.length} routes.`);
}

main();
