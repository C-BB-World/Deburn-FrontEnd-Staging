/**
 * App Component
 * Main application entry point with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Layout, AuthLayout, HubLayout, LangLayout } from '@/components/layout';
import { LoadingOverlay } from '@/components/ui';

// Import i18n configuration
import '@/utils/i18n';

// Pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Checkin from '@/pages/Checkin';
import Coach from '@/pages/Coach';
import Learning from '@/pages/Learning';
import Circles from '@/pages/Circles';
import CirclesAdmin from '@/pages/CirclesAdmin';
import Progress from '@/pages/Progress';
import Profile from '@/pages/Profile';
import Feedback from '@/pages/Feedback';
import Admin from '@/pages/Admin';
import Hub from '@/pages/Hub';

// Auth pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';

// Legal pages
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsOfService from '@/pages/legal/TermsOfService';
import CookiePolicy from '@/pages/legal/CookiePolicy';

// Error pages
import NotFound from '@/pages/NotFound';

/**
 * Protected Route - Requires authentication
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Public Route - Redirects to dashboard if already authenticated
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay fullScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * App Routes
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Landing page (en) - redirects to dashboard if authenticated */}
      <Route element={<LangLayout lang="en" />}>
        <Route path="/" element={<Landing />} />
      </Route>

      {/* Landing page (sv) — SEO-SPEC.md §7 */}
      <Route element={<LangLayout lang="sv" />}>
        <Route path="/sv" element={<Landing />} />
      </Route>

      {/* Auth routes (en) */}
      <Route element={<LangLayout lang="en" />}>
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>
      </Route>

      {/* Auth routes (sv) — /sv/login and /sv/register only, SEO-SPEC.md §7 */}
      <Route element={<LangLayout lang="sv" />}>
        <Route element={<AuthLayout />}>
          <Route
            path="/sv/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/sv/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Route>
      </Route>

      {/* Legal routes (public, en-only — see SEO-SPEC.md §7 scope note) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />

      {/* Hub admin - DISABLED: route commented out, /hub will 404 to dashboard */}
      {/* <Route element={<HubLayout />}>
        <Route path="/hub" element={<Hub />} />
      </Route> */}

      {/* Check-in (fullscreen, no sidebar) */}
      <Route
        path="/checkin"
        element={
          <ProtectedRoute>
            <Checkin />
          </ProtectedRoute>
        }
      />

      {/* Protected app routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/circles" element={<Circles />} />
        <Route path="/circles/admin" element={<CirclesAdmin />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* Catch all - real 404, not a login-screen fallback (SEO-SPEC.md §3.3) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
