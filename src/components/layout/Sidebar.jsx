/**
 * Sidebar Component
 * Main navigation sidebar
 */

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: 'layout-dashboard', labelKey: 'common:nav.dashboard', label: 'Dashboard' },
  { key: 'checkin', path: '/checkin', icon: 'heart-pulse', labelKey: 'common:nav.checkin', label: 'Check-in' },
  { key: 'coach', path: '/coach', icon: 'message-circle', labelKey: 'common:nav.coach', label: 'Ask Eve' },
  { key: 'learning', path: '/learning', icon: 'book-open', labelKey: 'common:nav.learning', label: 'Micro-Courses' },
  { key: 'circles', path: '/circles', icon: 'users', labelKey: 'common:nav.circles', label: 'Think Tanks', end: true },
];

// SVG icons matching Lucide icons used in original
const icons = {
  'layout-dashboard': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  'heart-pulse': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
    </svg>
  ),
  'message-circle': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  'book-open': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  'users': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
};

export function Sidebar({ isOpen, onClose }) {
  const { t } = useTranslation();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <svg className="logo-icon" viewBox="0 0 278 158" width="32" height="18">
            <path fill="#753BBD" d="M12.639,77.323c12.452-33.853,53.886-43.488,80.864-19.829,19.622,19.312,39.244,38.625,58.866,57.937,9.32,8.872,16.628,16.73,29.123,21.378,39.945,14.858,82.961-13.511,83.652-56.078-11.821,33.739-53.214,43.813-80.244,20.758-23.03-22.617-46.06-45.234-69.091-67.851-11.908-10.519-27.744-16.555-43.685-16.111-31.539.879-59.623,27.843-59.486,59.796Z" />
            <path fill="#753BBD" d="M166.526,74.583l14.502-14.502c8.59-8.124,17.793-14.071,32.169-9.804,25.266,7.499,28.731,46.079-.155,55.923,15.695,1.997,29.688-3.967,38.573-14.087,3.216-3.9,6.064-8.381,7.83-13.424h0c3.491-10.119,2.947-21.923-3.338-33.524-10.682-19.716-33.116-29.96-54.994-28.659-18.98,1.129-31.365,9.334-43.08,20.57l-.026-.026-14.716,14.716,23.234,22.818Z" />
            <path fill="#753BBD" d="M111.237,83.82l-3.034,3.035c-12.902,12.229-22.875,27.331-43.617,21.175-25.266-7.499-28.731-46.079.155-55.923-14.728-1.874-27.956,3.263-36.873,12.264-3.976,4.244-7.351,9.315-9.479,15.103h0c-3.547,10.152-3.028,22.012,3.287,33.668,10.682,19.716,33.116,29.96,54.994,28.659,20.489-1.219,33.295-10.682,45.867-23.304l.039.039,11.872-11.872-23.209-22.843Z" />
          </svg>
          <span className="logo-text">LIMITLESS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            onClick={onClose}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {icons[item.icon]}
            <span>{t(item.labelKey, item.label)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
