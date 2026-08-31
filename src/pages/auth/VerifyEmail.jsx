/**
 * Verify Email Page
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '@/utils/api';
import { authApi } from '@/features/auth/authApi';

function AuthLogo() {
  return (
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
  );
}

function AuthPoweredBy() {
  return (
    <div className="auth-powered-by">
      Powered by{' '}
      <a href="https://www.human-firstai.com" target="_blank" rel="noopener noreferrer">
        Human First AI
      </a>
    </div>
  );
}

export default function VerifyEmail() {
  const { t, i18n } = useTranslation('auth');
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('verifying'); // verifying, success, error, resent
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else if (!email) {
      setStatus('error');
      setError(t('verifyEmail.noToken', 'Invalid verification link'));
    }
  }, [token]);

  async function verifyToken() {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(data.error || t('verifyEmail.failed', 'Email verification failed'));
      }
    } catch (err) {
      setStatus('error');
      setError('Network error. Please try again.');
    }
  }

  async function resendVerification() {
    if (!email) return;

    setIsResending(true);
    try {
      const result = await authApi.resendVerification(email, i18n.language);
      if (result.success) {
        setStatus('resent');
      } else {
        setError(result.error || t('verifyEmail.resendFailed', 'Failed to resend verification email'));
      }
    } catch (err) {
      setError(t('errors.network', 'Network error. Please try again.'));
    } finally {
      setIsResending(false);
    }
  }

  // Verifying state
  if (status === 'verifying' && token) {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <AuthLogo />
          <div className="auth-message">
            <div className="auth-message-icon pending">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('verifyEmail.verifying', 'Verifying your email...')}</h2>
          </div>
          <AuthPoweredBy />
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <AuthLogo />
          <div className="auth-message">
            <div className="auth-message-icon success">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('verifyEmail.successTitle', 'Email verified!')}</h2>
            <p className="auth-message-text">
              {t('verifyEmail.successMessage', 'Your email has been verified. You can now sign in to your account.')}
            </p>
            <div className="auth-message-actions">
              <Link to="/login" className="btn btn-primary">
                {t('verifyEmail.signIn', 'Sign in')}
              </Link>
            </div>
          </div>
          <AuthPoweredBy />
        </div>
      </div>
    );
  }

  // Resent state
  if (status === 'resent') {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <AuthLogo />
          <div className="auth-message">
            <div className="auth-message-icon success">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('verifyEmail.resentTitle', 'Email sent!')}</h2>
            <p className="auth-message-text">
              {t('verifyEmail.resentMessage', 'A new verification link has been sent to your email address.')}
            </p>
            <div className="auth-message-actions">
              <Link to="/login" className="btn btn-secondary">
                {t('verifyEmail.backToLogin', 'Back to login')}
              </Link>
            </div>
          </div>
          <AuthPoweredBy />
        </div>
      </div>
    );
  }

  // Pending verification (no token, just email)
  if (!token && email) {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <AuthLogo />
          <div className="auth-message">
            <div className="auth-message-icon pending">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('verifyEmail.pendingTitle', 'Verify your email')}</h2>
            <p className="auth-message-text">
              {t('verifyEmail.pendingMessage', "We've sent a verification link to")}
            </p>
            <p className="auth-message-email">{email}</p>
            <div className="auth-message-actions">
              <button
                className="btn btn-secondary"
                onClick={resendVerification}
                disabled={isResending}
              >
                {isResending ? t('common.loading', 'Loading...') : t('verifyEmail.resend', 'Resend verification email')}
              </button>
              <Link to="/login" className="btn btn-ghost">
                {t('verifyEmail.backToLogin', 'Back to login')}
              </Link>
            </div>
          </div>
          <AuthPoweredBy />
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="screen auth-screen active">
      <div className="auth-container">
        <AuthLogo />
        <div className="auth-message">
          <div className="auth-message-icon error">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="auth-message-title">{t('verifyEmail.errorTitle', 'Verification failed')}</h2>
          <p className="auth-message-text">
            {error || t('verifyEmail.errorMessage', 'This verification link is invalid or has expired.')}
          </p>
          <div className="auth-message-actions">
            {email && (
              <button
                className="btn btn-primary"
                onClick={resendVerification}
                disabled={isResending}
              >
                {isResending ? t('common.loading', 'Loading...') : t('verifyEmail.resend', 'Resend verification email')}
              </button>
            )}
            <Link to="/login" className={`btn ${email ? 'btn-secondary' : 'btn-primary'}`}>
              {t('verifyEmail.backToLogin', 'Back to login')}
            </Link>
          </div>
        </div>
        <AuthPoweredBy />
      </div>
    </div>
  );
}
