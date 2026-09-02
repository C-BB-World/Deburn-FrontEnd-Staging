/**
 * Public route manifest — single source of truth for SEO metadata.
 *
 * This file is imported both by the React app (to render <Seo> tags) and by
 * plain Node build scripts (prerender, sitemap/robots/llms.txt generation,
 * uniqueness checks). Keep it framework-agnostic: no JSX, no `@/` alias
 * imports, no browser-only globals — Node must be able to import it directly.
 *
 * Adding a route here is the only step needed for it to show up in the
 * sitemap, the prerender pass, and the uniqueness check. It still needs a
 * matching <Route> in App.jsx and a page component with a <Seo> tag.
 */

export const SITE_URL = 'https://www.human-firstai.com';

// noindex: true -> not in sitemap.xml, on-page <meta name="robots" content="noindex, follow">.
// Still `Allow`ed in robots.txt so crawlers can fetch the page and see the noindex tag.
export const publicRoutes = [
  {
    path: '/',
    title: 'Eve – AI Leadership Coaching | Human First AI',
    description:
      'Eve is your AI leadership coach: daily check-ins, real-time coaching, and micro-learning that help fast-growing companies execute AI transformation.',
    changefreq: 'weekly',
    priority: 1.0,
    noindex: false,
  },
  {
    path: '/register',
    title: 'Create Your Account | Human First AI',
    description:
      "Start your leadership development journey with Human First AI's AI coach Eve, daily check-ins, and micro-learning.",
    changefreq: 'monthly',
    priority: 0.8,
    noindex: true,
  },
  {
    path: '/login',
    title: 'Log In | Human First AI',
    description:
      'Log in to your Human First AI account to continue your leadership development with Eve.',
    changefreq: 'monthly',
    priority: 0.6,
    noindex: true,
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy | Human First AI',
    description:
      "How Human First AI collects, uses and protects your data, including wellbeing data, under GDPR and Singapore's PDPA.",
    changefreq: 'yearly',
    priority: 0.3,
    noindex: false,
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service | Human First AI',
    description:
      "The terms governing use of Human First AI's Eve platform, including account, billing and acceptable use terms.",
    changefreq: 'yearly',
    priority: 0.3,
    noindex: false,
  },
  {
    path: '/cookie-policy',
    title: 'Cookie Policy | Human First AI',
    description:
      'How Human First AI uses cookies and similar technologies, and how to manage your preferences.',
    changefreq: 'yearly',
    priority: 0.3,
    noindex: false,
  },
  // /about intentionally omitted — pending founder sign-off on content.
];

export function canonicalUrl(path) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export function findRoute(path) {
  return publicRoutes.find((r) => r.path === path);
}

export const sitemapRoutes = publicRoutes.filter((r) => !r.noindex);
