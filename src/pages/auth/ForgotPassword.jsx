/**
 * Forgot Password Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/features/auth/authApi';

export default function ForgotPassword() {
  const { t, i18n } = useTranslation('auth');

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authApi.forgotPassword(email, i18n.language);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || t('errors.resetFailed', 'Failed to send reset link'));
      }
    } catch (err) {
      setError(t('errors.network', 'Network error. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="screen auth-screen active">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 278 158" width="32" height="18">
                <path fill="#753BBD" d="M12.639,77.323c12.452-33.853,53.886-43.488,80.864-19.829,19.622,19.312,39.244,38.625,58.866,57.937,9.32,8.872,16.628,16.73,29.123,21.378,39.945,14.858,82.961-13.511,83.652-56.078-11.821,33.739-53.214,43.813-80.244,20.758-23.03-22.617-46.06-45.234-69.091-67.851-11.908-10.519-27.744-16.555-43.685-16.111-31.539.879-59.623,27.843-59.486,59.796Z" />
                <path fill="#753BBD" d="M166.526,74.583l14.502-14.502c8.59-8.124,17.793-14.071,32.169-9.804,25.266,7.499,28.731,46.079-.155,55.923,15.695,1.997,29.688-3.967,38.573-14.087,3.216-3.9,6.064-8.381,7.83-13.424h0c3.491-10.119,2.947-21.923-3.338-33.524-10.682-19.716-33.116-29.96-54.994-28.659-18.98,1.129-31.365,9.334-43.08,20.57l-.026-.026-14.716,14.716,23.234,22.818Z" />
                <path fill="#753BBD" d="M111.237,83.82l-3.034,3.035c-12.902,12.229-22.875,27.331-43.617,21.175-25.266-7.499-28.731-46.079.155-55.923-14.728-1.874-27.956,3.263-36.873,12.264-3.976,4.244-7.351,9.315-9.479,15.103h0c-3.547,10.152-3.028,22.012,3.287,33.668,10.682,19.716,33.116,29.96,54.994,28.659,20.489-1.219,33.295-10.682,45.867-23.304l.039.039,11.872-11.872-23.209-22.843Z" />
              </svg>
            </span>
            <span className="auth-logo-text">Limitless Resilience Code</span>
          </div>
          <h1 className="auth-title">{t('forgotPassword.title', 'Reset your password')}</h1>
          <p className="auth-subtitle">{t('forgotPassword.subtitle', "Enter your email and we'll send you a reset link")}</p>
        </div>

        <div className="auth-form">
          {success && (
            <div className="auth-alert success visible">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{t('forgotPassword.success', "If this email is registered, we've sent password reset instructions.")}</span>
            </div>
          )}

          {error && (
            <div className="auth-alert error visible">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  {t('forgotPassword.email', 'Email address')}
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  name="email"
                  className="form-input"
                  placeholder={t('forgotPassword.emailPlaceholder', 'you@company.com')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary form-submit"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading', 'Loading...') : t('forgotPassword.submit', 'Send reset link')}
              </button>
            </form>
          )}

          <div className="form-footer">
            <Link to="/login" className="form-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              {t('forgotPassword.backToLogin', 'Back to sign in')}
            </Link>
          </div>
        </div>

        <div className="auth-powered-by">
          Powered by{' '}
          <a href="https://www.human-firstai.com" target="_blank" rel="noopener noreferrer">
            Human First AI
          </a>
        </div>
      </div>
    </div>
  );
}
