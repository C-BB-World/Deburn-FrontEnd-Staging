/**
 * Cookie Policy Page
 */

import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        {/* Header */}
        <header className="legal-header">
          <Link to="/" className="legal-logo">
            <span className="legal-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 278 158" width="28" height="16">
                <path fill="#753BBD" d="M12.639,77.323c12.452-33.853,53.886-43.488,80.864-19.829,19.622,19.312,39.244,38.625,58.866,57.937,9.32,8.872,16.628,16.73,29.123,21.378,39.945,14.858,82.961-13.511,83.652-56.078-11.821,33.739-53.214,43.813-80.244,20.758-23.03-22.617-46.06-45.234-69.091-67.851-11.908-10.519-27.744-16.555-43.685-16.111-31.539.879-59.623,27.843-59.486,59.796Z" />
                <path fill="#753BBD" d="M166.526,74.583l14.502-14.502c8.59-8.124,17.793-14.071,32.169-9.804,25.266,7.499,28.731,46.079-.155,55.923,15.695,1.997,29.688-3.967,38.573-14.087,3.216-3.9,6.064-8.381,7.83-13.424h0c3.491-10.119,2.947-21.923-3.338-33.524-10.682-19.716-33.116-29.96-54.994-28.659-18.98,1.129-31.365,9.334-43.08,20.57l-.026-.026-14.716,14.716,23.234,22.818Z" />
                <path fill="#753BBD" d="M111.237,83.82l-3.034,3.035c-12.902,12.229-22.875,27.331-43.617,21.175-25.266-7.499-28.731-46.079.155-55.923-14.728-1.874-27.956,3.263-36.873,12.264-3.976,4.244-7.351,9.315-9.479,15.103h0c-3.547,10.152-3.028,22.012,3.287,33.668,10.682,19.716,33.116,29.96,54.994,28.659,20.489-1.219,33.295-10.682,45.867-23.304l.039.039,11.872-11.872-23.209-22.843Z" />
              </svg>
            </span>
            Limitless Resilience Code
          </Link>
          <h1 className="legal-title">Cookie Policy</h1>
          <p className="legal-meta">Last updated: January 2025</p>
        </header>

        {/* Content */}
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your experience.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Cookies</h2>
            <p>Human First AI uses cookies for the following purposes:</p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management.
            </p>

            <h3>Preference Cookies</h3>
            <p>
              These cookies remember your settings and preferences, such as your language preference and theme settings, to provide a more personalized experience.
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              We use analytics cookies to understand how users interact with our service, which helps us improve the user experience. These cookies collect anonymous, aggregated data.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Cookies We Use</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>session_id</td>
                  <td>Authentication and session management</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>language</td>
                  <td>Store language preference</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>consent</td>
                  <td>Remember cookie consent choice</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="legal-section">
            <h2>4. Managing Cookies</h2>
            <p>You can control and manage cookies in several ways:</p>
            <ul>
              <li>Through your browser settings - most browsers allow you to refuse or delete cookies</li>
              <li>Through our cookie consent banner when you first visit the site</li>
              <li>By contacting us to request your preferences be updated</li>
            </ul>
            <p>
              Please note that disabling certain cookies may affect the functionality of our service.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Third-Party Cookies</h2>
            <p>
              We may use third-party services that set their own cookies, such as analytics providers. These third parties have their own privacy policies governing the use of such cookies.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@eve.app">privacy@eve.app</a>
            </p>
          </section>
        </div>

        {/* Back Link */}
        <Link to="/" className="legal-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Human First AI
        </Link>
      </div>
    </div>
  );
}
