/**
 * NotFound Page
 * Real 404 for unmatched URLs — replaces the old silent fallback to the
 * login screen (SEO-SPEC.md §3.3 / F2).
 */

import { Link } from 'react-router-dom';
import Seo from '@/seo/Seo';

export default function NotFound() {
  return (
    <div className="legal-page">
      <Seo
        title="Page Not Found | Human First AI"
        description="The page you're looking for doesn't exist or may have moved."
        path="/404"
        noindex
      />
      <div className="legal-container">
        <header className="legal-header">
          <Link to="/" className="legal-logo">
            Human First AI
          </Link>
          <h1 className="legal-title">Page not found</h1>
          <p className="legal-meta">
            The page you're looking for doesn't exist or may have moved.
          </p>
        </header>

        <div className="legal-content">
          <p>
            <Link to="/">Go back to the homepage</Link>, or{' '}
            <a href="mailto:policy@brainbank.world">contact us</a> if you followed a link
            that shouldn't be broken.
          </p>
        </div>
      </div>
    </div>
  );
}
