/**
 * Login Page
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { circlesApi } from '@/features/circles/circlesApi';

export default function Login() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for invitation tokens from email links
  const inviteToken = searchParams.get('inviteToken');
  const declineToken = searchParams.get('declineToken');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        // Handle pending invitation accept/decline after login
        if (inviteToken) {
          try {
            await circlesApi.acceptInvitation(inviteToken);
            navigate('/circles');
          } catch (inviteErr) {
            console.error('Failed to accept invitation:', inviteErr);
            navigate('/circles?inviteError=true');
          }
        } else if (declineToken) {
          try {
            await circlesApi.declineInvitation(declineToken);
            navigate('/dashboard');
          } catch (declineErr) {
            console.error('Failed to decline invitation:', declineErr);
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || t('errors.loginFailed', 'Invalid email or password'));
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
          <h1 className="auth-title">{t('login.title', 'Welcome back')}</h1>
          <p className="auth-subtitle">{t('login.subtitle', 'Sign in to continue your leadership journey')}</p>
        </div>

        <div className="auth-form">
          {inviteToken && (
            <div className="auth-alert success visible">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>{t('login.invitePending', 'Sign in to accept your Think Tank invitation')}</span>
            </div>
          )}

          {error && (
            <div className="auth-alert error visible">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                {t('login.email', 'Email address')}
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                className="form-input"
                placeholder={t('login.emailPlaceholder', 'you@company.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="form-error" id="login-email-error"></span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                {t('login.password', 'Password')}
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  className="form-input"
                  placeholder={t('login.passwordPlaceholder', 'Enter your password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              <span className="form-error" id="login-password-error"></span>
            </div>

            <div className="form-row">
              <div className="checkbox-group" style={{ marginBottom: 0 }}>
                <input
                  type="checkbox"
                  id="login-remember"
                  name="rememberMe"
                  className="checkbox-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="checkbox-label" htmlFor="login-remember">
                  {t('login.rememberMe', 'Remember me')}
                </label>
              </div>
              <Link to="/forgot-password" className="form-link">
                {t('login.forgotPassword', 'Forgot password?')}
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary form-submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading', 'Loading...') : t('login.submit', 'Sign in')}
            </button>
          </form>

          <div className="form-footer">
            {t('login.noAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="form-link">
              {t('login.createAccount', 'Create account')}
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
