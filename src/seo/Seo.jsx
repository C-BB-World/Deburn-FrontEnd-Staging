/**
 * Seo — per-page head tags.
 *
 * Contract (SEO-SPEC.md §2.5): every public page renders this once with a
 * unique title/description and its own `path`. Canonical/og:url are always
 * derived from `path`, never passed in directly, so a route can't
 * accidentally emit someone else's canonical.
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
}) {
  const url = canonicalUrl(path);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
      <link rel="canonical" href={url} />

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
