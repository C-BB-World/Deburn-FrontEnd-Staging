/**
 * Shared JSON-LD structured data blocks.
 * Framework-agnostic (no JSX, no `@/` alias) so it stays importable from
 * Node build scripts if needed later.
 */

import { SITE_URL } from './routes';

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Human First AI',
  alternateName: 'Eve by Human First AI',
  url: SITE_URL,
  logo: `${SITE_URL}/eve-icon.svg`,
  description:
    'Human First AI builds AI-powered leadership coaching tools that help managers and teams grow through personalized micro-learning and actionable insights.',
  // sameAs: [] intentionally omitted — no real LinkedIn/social profile exists
  // yet to link to. Add real URLs here once they exist; do not fabricate.
};

export const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Eve',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description:
    'AI-powered leadership coaching platform that delivers personalized micro-learning, real-time feedback, and actionable insights for managers and teams.',
  featureList: [
    'AI leadership coaching',
    'Personalized micro-learning',
    'Real-time feedback',
    'Team building insights',
    'Leadership development plans',
  ],
  // Eve is sold via "Book a Demo" / "Book a pilot" — sales-assisted, not
  // self-serve or free. A $0 offer would misrepresent that to anything
  // reading this schema, so no `price` is asserted.
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/OnlineOnly',
    description: 'Pricing by consultation — book a demo or pilot.',
  },
};
