/**
 * Landing Page
 * Public marketing page for Human First AI
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { get, post } from '@/utils/api';

export default function Landing() {
  const { t } = useTranslation('landing');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [testimonials, setTestimonials] = useState([]);
  const [formState, setFormState] = useState('idle'); // idle | sending | success | error
  const [formError, setFormError] = useState('');

  const demoRef = useRef(null);
  const animateObserver = useRef(null);

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Scroll animations via IntersectionObserver
  useEffect(() => {
    animateObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('l-visible');
            animateObserver.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.l-animate').forEach((el) => {
      animateObserver.current.observe(el);
    });

    return () => animateObserver.current?.disconnect();
  }, []);

  // Load testimonials
  const loadTestimonials = useCallback(async (lang) => {
    try {
      const res = await get(`/api/public/testimonials?lang=${lang}`);
      setTestimonials(res.data || []);
    } catch {
      setTestimonials([]);
    }
  }, []);

  useEffect(() => {
    loadTestimonials('en');
  }, [loadTestimonials]);

  // Scroll to demo form
  const scrollToDemo = () => {
    if (demoRef.current) {
      const navH = 64;
      const top = demoRef.current.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Smooth scroll for anchor links
  const scrollToId = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const navH = 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Contact form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormState('sending');

    const form = e.target;
    const name = form.elements.name.value.trim();
    const company = form.elements.company.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    try {
      const res = await post('/api/public/contact', { name, company, email, message });
      if (res.success) {
        setFormState('success');
      } else {
        setFormError(res.error?.message || t('form.error.generic'));
        setFormState('error');
      }
    } catch {
      setFormError(t('form.error.generic'));
      setFormState('error');
    }
  };

  // Don't render while checking auth
  if (isLoading) return null;

  return (
    <div className="landing-root">
      {/* NAV */}
      <nav className="l-nav" role="navigation" aria-label="Main navigation">
        <div className="l-nav-inner">
          <Link className="l-nav-brand" to="/">
            <span className="l-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 278 158" width="32" height="18">
                <path fill="#753BBD" d="M12.639,77.323c12.452-33.853,53.886-43.488,80.864-19.829,19.622,19.312,39.244,38.625,58.866,57.937,9.32,8.872,16.628,16.73,29.123,21.378,39.945,14.858,82.961-13.511,83.652-56.078-11.821,33.739-53.214,43.813-80.244,20.758-23.03-22.617-46.06-45.234-69.091-67.851-11.908-10.519-27.744-16.555-43.685-16.111-31.539.879-59.623,27.843-59.486,59.796Z" />
                <path fill="#753BBD" d="M166.526,74.583l14.502-14.502c8.59-8.124,17.793-14.071,32.169-9.804,25.266,7.499,28.731,46.079-.155,55.923,15.695,1.997,29.688-3.967,38.573-14.087,3.216-3.9,6.064-8.381,7.83-13.424h0c3.491-10.119,2.947-21.923-3.338-33.524-10.682-19.716-33.116-29.96-54.994-28.659-18.98,1.129-31.365,9.334-43.08,20.57l-.026-.026-14.716,14.716,23.234,22.818Z" />
                <path fill="#753BBD" d="M111.237,83.82l-3.034,3.035c-12.902,12.229-22.875,27.331-43.617,21.175-25.266-7.499-28.731-46.079.155-55.923-14.728-1.874-27.956,3.263-36.873,12.264-3.976,4.244-7.351,9.315-9.479,15.103h0c-3.547,10.152-3.028,22.012,3.287,33.668,10.682,19.716,33.116,29.96,54.994,28.659,20.489-1.219,33.295-10.682,45.867-23.304l.039.039,11.872-11.872-23.209-22.843Z" />
              </svg>
            </span>
            <span className="l-logo-text" dangerouslySetInnerHTML={{ __html: t('nav.brand') }} />
          </Link>
          <div className="l-nav-actions">
            <Link to="/login" className="l-btn-ghost">{t('nav.login')}</Link>
            <button className="l-btn-primary" onClick={scrollToDemo}>{t('nav.demo')}</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="l-hero" id="l-hero">
        <div className="l-hero-bg" role="presentation" aria-hidden="true" />
        <div className="l-hero-content l-container">
          <p className="l-hero-eyebrow l-animate">{t('hero.eyebrow')}</p>
          <h1 className="l-hero-headline l-animate">{t('hero.headline')}</h1>
          <p className="l-hero-sub l-animate l-animate-delay-1">{t('hero.sub')}</p>
          <p className="l-hero-body l-animate l-animate-delay-2">{t('hero.body')}</p>
          <p className="l-hero-body l-animate l-animate-delay-2">{t('hero.body2')}</p>
        </div>
      </section>

      {/* OUR POINT OF VIEW */}
      <section className="l-problem" id="l-pov">
        <div className="l-container">
          <p className="l-insight-eyebrow l-animate">{t('pov.eyebrow')}</p>
          <h2 className="l-section-headline l-animate l-animate-delay-1">{t('pov.headline')}</h2>
          <p className="l-eve-body l-animate l-animate-delay-2">{t('pov.body1')}</p>
          <p className="l-eve-body l-animate l-animate-delay-2">{t('pov.body2')}</p>
          <p className="l-eve-body l-animate l-animate-delay-3">{t('pov.body3')}</p>

          <p className="l-stats-note l-animate l-animate-delay-3">{t('pov.statsNote')}</p>

          <div className="l-stat-grid l-animate l-animate-delay-3">
            <div className="l-stat-card l-stat-card-sage">
              <div className="l-stat-number">{t('story.stat1.number')}</div>
              <p className="l-stat-label">{t('story.stat1.label')}</p>
            </div>
            <div className="l-stat-card l-stat-card-ember">
              <div className="l-stat-number">{t('story.stat2.number')}</div>
              <p className="l-stat-label">{t('story.stat2.label')}</p>
            </div>
            <div className="l-stat-card l-stat-card-forest">
              <div className="l-stat-number">{t('story.stat3.number')}</div>
              <p className="l-stat-label">{t('story.stat3.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE RESILIENCE AUDIT */}
      <section className="l-audit" id="l-audit">
        <div className="l-audit-inner l-container">
          <p className="l-audit-eyebrow l-animate">{t('audit.eyebrow')}</p>
          <h2
            className="l-audit-headline l-animate l-animate-delay-1"
            dangerouslySetInnerHTML={{ __html: t('audit.headline') }}
          />
          <p className="l-audit-body l-animate l-animate-delay-2">{t('audit.body1')}</p>
          <p className="l-audit-body l-animate l-animate-delay-2">{t('audit.body2')}</p>

          <div className="l-audit-who l-animate l-animate-delay-3">
            <span className="l-audit-who-label">{t('audit.whoBox.label')}</span>
            <span className="l-audit-who-body">{t('audit.whoBox.body')}</span>
          </div>

          <div className="l-audit-stats l-animate l-animate-delay-3">
            <div>
              <p className="l-audit-stat-label">{t('audit.stat1.label')}</p>
              <p className="l-audit-stat-value">{t('audit.stat1.number')}</p>
            </div>
            <div>
              <p className="l-audit-stat-label">{t('audit.stat2.label')}</p>
              <p className="l-audit-stat-value">{t('audit.stat2.number')}</p>
            </div>
            <div>
              <p className="l-audit-stat-label">{t('audit.stat3.label')}</p>
              <p className="l-audit-stat-value">{t('audit.stat3.number')}</p>
            </div>
            <div>
              <p className="l-audit-stat-label">{t('audit.stat4.label')}</p>
              <p className="l-audit-stat-value">{t('audit.stat4.number')}</p>
            </div>
          </div>

          <button className="l-btn-ember l-animate l-animate-delay-4" onClick={(e) => scrollToId(e, 'l-demo')}>
            {t('audit.cta')}
          </button>
        </div>
      </section>

      {/* THE PRODUCT */}
      <section className="l-pillars" id="l-product">
        <div className="l-pillars-inner l-container">
          <div className="l-pillars-header l-animate">
            <h2 className="l-section-headline l-section-headline-center">{t('product.headline')}</h2>
          </div>
          <div className="l-pillars-grid">
            <div className="l-pillar-card l-animate l-animate-delay-1">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar1.title')}</h3>
              <p className="l-pillar-body">{t('pillar1.body')}</p>
            </div>
            <div className="l-pillar-card l-animate l-animate-delay-2">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar2.title')}</h3>
              <p className="l-pillar-body">{t('pillar2.body')}</p>
            </div>
            <div className="l-pillar-card l-animate l-animate-delay-3">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar3.title')}</h3>
              <p className="l-pillar-body">{t('pillar3.body')}</p>
            </div>
            <div className="l-pillar-card l-animate l-animate-delay-4">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                <circle cx="5" cy="12" r="2.5" />
                <circle cx="19" cy="12" r="2.5" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar4.title')}</h3>
              <p className="l-pillar-body">{t('pillar4.body')}</p>
            </div>
          </div>

          <hr className="l-pillars-divider l-animate l-animate-delay-4" />

          <div className="l-pillars-grid l-pillars-grid--single">
            <div className="l-pillar-card l-animate l-animate-delay-4">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="2" y1="20" x2="22" y2="20" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar5.title')}</h3>
              <p className="l-pillar-body">{t('pillar5.body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT COMPOUNDS */}
      <section className="l-how" id="l-compounds">
        <div className="l-how-inner l-container">
          <div className="l-how-header l-animate">
            <h2 className="l-section-headline l-section-headline-center">{t('compounds.headline')}</h2>
          </div>
          <div className="l-steps-grid">
            <div className="l-step l-animate l-animate-delay-1">
              <div className="l-step-number" aria-hidden="true">1</div>
              <h3 className="l-step-title">{t('step1.title')}</h3>
              <p className="l-step-body">{t('step1.body')}</p>
            </div>
            <div className="l-step l-animate l-animate-delay-2">
              <div className="l-step-number" aria-hidden="true">2</div>
              <h3 className="l-step-title">{t('step2.title')}</h3>
              <p className="l-step-body">{t('step2.body')}</p>
            </div>
            <div className="l-step l-animate l-animate-delay-3">
              <div className="l-step-number" aria-hidden="true">3</div>
              <h3 className="l-step-title">{t('step3.title')}</h3>
              <p className="l-step-body">{t('step3.body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="l-comparison" id="l-comparison">
        <div className="l-container">
          <h2 className="l-comparison-headline l-animate">{t('compare.headline')}</h2>
          <div className="l-comparison-wrap l-animate l-animate-delay-1">
            <table className="l-comparison-table">
              <thead>
                <tr>
                  <th className="l-cmp-col-feature">{t('compare.col_feature')}</th>
                  <th className="l-cmp-col-hfai">{t('compare.col_hfai')}</th>
                  <th>{t('compare.col_lms')}</th>
                  <th>{t('compare.col_coaching')}</th>
                  <th>{t('compare.col_manager')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'compare.row1', hfai: 'yes', lms: 'no',  coaching: 'no',                                   manager: ['partial', 'compare.note_inconsistent'] },
                  { label: 'compare.row2', hfai: 'yes', lms: 'no',  coaching: ['partial', 'compare.note_scheduled'],  manager: 'no' },
                  { label: 'compare.row3', hfai: 'yes', lms: 'yes', coaching: 'no',                                   manager: ['partial', 'compare.note_bandwidth'] },
                  { label: 'compare.row4', hfai: 'yes', lms: 'no',  coaching: 'no',                                   manager: 'no' },
                  { label: 'compare.row5', hfai: 'yes', lms: 'no',  coaching: 'no',                                   manager: 'no' },
                  { label: 'compare.row6', hfai: 'yes', lms: 'no',  coaching: 'no',                                   manager: ['partial', 'compare.note_notices'] },
                  { label: 'compare.row7', hfai: 'yes', lms: 'yes', coaching: 'no',                                   manager: ['partial', 'compare.note_time'] },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="l-cmp-col-feature">{t(row.label)}</td>
                    <td className="l-cmp-col-hfai"><CmpCell val={row.hfai} t={t} /></td>
                    <td><CmpCell val={row.lms} t={t} /></td>
                    <td><CmpCell val={row.coaching} t={t} /></td>
                    <td><CmpCell val={row.manager} t={t} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="l-testimonials" id="l-testimonials">
        <div className="l-testimonials-inner l-container">
          <div className="l-testimonials-header l-animate">
            <h2 className="l-section-headline l-section-headline-center">{t('testimonials.headline')}</h2>
            <p className="l-pillars-sub">{t('testimonials.sub')}</p>
          </div>
          <div className="l-testimonials-grid">
            {(() => {
              const localeItems = t('testimonials.items', { returnObjects: true }) || [];
              const displayItems = testimonials.length > 0 ? testimonials : localeItems;
              return displayItems.length > 0 ? (
                displayItems.map((item, i) => (
                  <div className="l-testimonial-card l-animate l-visible" key={i}>
                    <p className="l-testimonial-quote">{item.content}</p>
                    <p className="l-testimonial-attribution">{item.attribution}</p>
                  </div>
                ))
              ) : (
                <p className="l-testimonials-empty">{t('testimonials.empty')}</p>
              );
            })()}
          </div>
        </div>
      </section>

      {/* DEMO / CONTACT FORM */}
      <section className="l-demo" id="l-demo" ref={demoRef}>
        <div className="l-demo-inner l-container">
          <h2 className="l-demo-headline l-animate">{t('demo.headline')}</h2>
          <p className="l-demo-sub l-animate l-animate-delay-1">{t('demo.sub')}</p>

          {formState === 'success' ? (
            <div className="l-form-success" role="status">
              <div className="l-form-success-icon" aria-hidden="true">&#10003;</div>
              <p className="l-form-success-title">{t('form.success.title')}</p>
              <p className="l-form-success-body">{t('form.success.body')}</p>
            </div>
          ) : (
            <form className="l-contact-form l-animate l-animate-delay-3" onSubmit={handleSubmit} noValidate>
              <div className="l-form-row">
                <input className="l-input" type="text" name="name" maxLength={100} required placeholder={t('form.name')} />
                <input className="l-input" type="text" name="company" maxLength={200} required placeholder={t('form.company')} />
              </div>
              <input className="l-input" type="email" name="email" required placeholder={t('form.email')} />
              <textarea className="l-input l-textarea" name="message" maxLength={3000} placeholder={t('form.message')} />
              {formError && <p className="l-form-error" role="alert">{formError}</p>}
              <div className="l-form-submit">
                <button className="l-btn-ember" type="submit" disabled={formState === 'sending'}>
                  {formState === 'sending' ? t('form.sending') : t('form.submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer" role="contentinfo">
        <div className="l-footer-inner l-container">
          <span className="l-footer-brand">
            Resilience Code Plus+ &middot; Powered by{' '}
            <a href="https://brainbank.world" target="_blank" rel="noopener noreferrer" className="l-footer-brand-link">
              Brainbank.world
            </a>
          </span>
          <nav className="l-footer-links" aria-label="Footer navigation">
            <Link className="l-footer-link" to="/privacy-policy">{t('footer.privacy')}</Link>
            <Link className="l-footer-link" to="/terms-of-service">{t('footer.terms')}</Link>
          </nav>
          <div className="l-footer-right">
            <Link to="/login" className="l-footer-link">{t('footer.login')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Comparison table cell — renders yes / no / partial+note
 */
function CmpCell({ val, t }) {
  if (val === 'yes') return <span className="l-cmp-yes" aria-label="Yes">✓</span>;
  if (val === 'no')  return <span className="l-cmp-no"  aria-label="No">✗</span>;
  if (Array.isArray(val)) {
    return (
      <span className="l-cmp-partial">
        <span aria-label="Partial">⚠</span>
        <span className="l-cmp-note">{t(val[1])}</span>
      </span>
    );
  }
  return null;
}
