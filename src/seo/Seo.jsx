/**
 * Seo — per-page head tags.
 *
 * Contract (SEO-SPEC.md §2.5): every public page renders this once with a
 * unique title/description and its own `path`. Canonical/og:url are always
 * derived from `path`, never passed in directly, so a route can't
 * accidentally emit someone else's canonical.
 *
 * `lang`/`alternates` are for i18n (§7): `lang` sets <html lang> via
 * Helmet's htmlAttributes (applied by direct DOM mutation, which is why it
 * survives into the prerendered static HTML too — see routes.js). Note
 * this does NOT switch the rendered UI language itself; that's LangLayout's
 * job. `alternates` is the `{ en: '/path', sv: '/sv/path' }` shape from
 * routes.js's `alternatesFor()` — omit it on pages with no translated
 * counterpart (the 3 legal pages) and no hreflang tags are emitted.
 */

import { Helmet } from 'react-helmet-async';
import { canonicalUrl } from './routes';

export default function Seo({
  title,
  description,
  path,
  ogImage = '/images/landing/hero.jpg',
  noindex = false,
  jsonLd = [],
  lang = 'en',
  alternates,
}) {
  const url = canonicalUrl(path);

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
      <link rel="canonical" href={url} />

      {alternates?.en && <link rel="alternate" hrefLang="en" href={canonicalUrl(alternates.en)} />}
      {alternates?.sv && <link rel="alternate" hrefLang="sv" href={canonicalUrl(alternates.sv)} />}
      {alternates?.en && <link rel="alternate" hrefLang="x-default" href={canonicalUrl(alternates.en)} />}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Human First AI" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
