/**
 * Public route manifest — single source of truth for SEO metadata.
 *
 * This file is imported both by the React app (to render <Seo> tags and
 * wire up routes) and by plain Node build scripts (prerender, sitemap/
 * robots/llms.txt generation, uniqueness checks). Keep it framework-
 * agnostic: no JSX, no `@/` alias imports, no browser-only globals — Node
 * must be able to import it directly.
 *
 * Pages are defined once, locale-agnostic, with per-locale copy nested
 * under `i18n`. A page only gets a `/sv/...` route if it has an `sv` key
 * in `i18n` — the 3 legal pages don't (no Swedish translation exists for
 * their body content yet — see SEO-SPEC.md §7 scope note), so they stay
 * English-only. Adding a route here is the only step needed for it to
 * show up in the sitemap, the prerender pass, and the uniqueness check.
 * It still needs a matching <Route> in App.jsx and a page component with
 * a <Seo> tag.
 */

export const SITE_URL = 'https://www.human-firstai.com';

export const locales = {
  en: { prefix: '', htmlLang: 'en' },
  sv: { prefix: '/sv', htmlLang: 'sv' },
};

// noindex: true -> not in sitemap.xml, on-page <meta name="robots" content="noindex, follow">.
// Still `Allow`ed in robots.txt so crawlers can fetch the page and see the noindex tag.
export const pages = [
  {
    id: 'home',
    segment: '',
    changefreq: 'weekly',
    priority: 1.0,
    noindex: false,
    i18n: {
      en: {
        title: 'Eve – AI Leadership Coaching | Human First AI',
        description:
          'Eve is your AI leadership coach: daily check-ins, real-time coaching, and micro-learning that help fast-growing companies execute AI transformation.',
      },
      sv: {
        title: 'Eve – AI-ledarskapscoaching | Human First AI',
        description:
          'Eve är din AI-ledarskapscoach: dagliga incheckningar, coaching i realtid och mikrokurser som hjälper snabbväxande företag att genomföra AI-transformation.',
      },
    },
  },
  {
    id: 'register',
    segment: 'register',
    changefreq: 'monthly',
    priority: 0.8,
    noindex: true,
    i18n: {
      en: {
        title: 'Create Your Account | Human First AI',
        description:
          "Start your leadership development journey with Human First AI's AI coach Eve, daily check-ins, and micro-learning.",
      },
      sv: {
        title: 'Skapa ditt konto | Human First AI',
        description:
          'Börja din ledarskapsutvecklingsresa med Eve, AI-coachen från Human First AI — dagliga incheckningar och mikrokurser.',
      },
    },
  },
  {
    id: 'login',
    segment: 'login',
    changefreq: 'monthly',
    priority: 0.6,
    noindex: true,
    i18n: {
      en: {
        title: 'Log In | Human First AI',
        description:
          'Log in to your Human First AI account to continue your leadership development with Eve.',
      },
      sv: {
        title: 'Logga in | Human First AI',
        description:
          'Logga in på ditt Human First AI-konto för att fortsätta din ledarskapsresa med Eve.',
      },
    },
  },
  {
    id: 'privacy-policy',
    segment: 'privacy-policy',
    changefreq: 'yearly',
    priority: 0.3,
    noindex: false,
    i18n: {
      en: {
        title: 'Privacy Policy | Human First AI',
        description:
          "How Human First AI collects, uses and protects your data, including wellbeing data, under GDPR and Singapore's PDPA.",
      },
    },
  },
  {
    id: 'terms-of-service',
    segment: 'terms-of-service',
    changefreq: 'yearly',
    priority: 0.3,
    noindex: false,
    i18n: {
      en: {
        title: 'Terms of Service | Human First AI',
        description:
          "The terms governing use of Human First AI's Eve platform, including account, billing and acceptable use terms.",
      },
    },
  },
  {
    id: 'cookie-policy',
    segment: 'cookie-policy',
    changefreq: 'yearly',
    priority: 0.3,
    noindex: false,
    i18n: {
      en: {
        title: 'Cookie Policy | Human First AI',
        description:
          'How Human First AI uses cookies and similar technologies, and how to manage your preferences.',
      },
    },
  },
  // /about intentionally omitted — pending founder sign-off on content.
];

function pathFor(page, locale) {
  const { prefix } = locales[locale];
  if (!page.segment) {
    // home: "/" for en, "/sv/" for sv (trailing slash on both locale roots)
    return prefix ? `${prefix}/` : '/';
  }
  return `${prefix}/${page.segment}`;
}

/**
 * Flat list of every real route: one entry per (page × locale present in
 * that page's `i18n`). This is what drives React Router, the prerender
 * script, sitemap/robots generation, and the uniqueness check.
 */
export function buildRoutes() {
  const routes = [];
  for (const page of pages) {
    for (const locale of Object.keys(page.i18n)) {
      const copy = page.i18n[locale];
      routes.push({
        id: page.id,
        locale,
        htmlLang: locales[locale].htmlLang,
        path: pathFor(page, locale),
        title: copy.title,
        description: copy.description,
        changefreq: page.changefreq,
        priority: page.priority,
        noindex: page.noindex,
      });
    }
  }
  return routes;
}

export const publicRoutes = buildRoutes();

/**
 * { en: '/register', sv: '/sv/register' } for a page id — only includes
 * keys for locales that page actually has. Used for hreflang alternates
 * and for language-toggle buttons to navigate to the right URL.
 */
export function alternatesFor(pageId) {
  const page = pages.find((p) => p.id === pageId);
  if (!page) return {};
  const result = {};
  for (const locale of Object.keys(page.i18n)) {
    result[locale] = pathFor(page, locale);
  }
  return result;
}

/**
 * { title, description } for a page id in a given locale. Lets page
 * components pull their <Seo> copy from this single source of truth
 * instead of duplicating the strings inline (which is how title/
 * description drift from the manifest happens).
 */
export function copyFor(pageId, locale) {
  const page = pages.find((p) => p.id === pageId);
  return page?.i18n[locale];
}

export function canonicalUrl(path) {
  return `${SITE_URL}${path}`;
}

export function findRoute(path) {
  return publicRoutes.find((r) => r.path === path);
}

export const sitemapRoutes = publicRoutes.filter((r) => !r.noindex);
