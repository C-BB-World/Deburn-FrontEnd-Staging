/**
 * Sidebar Component
 * Main navigation sidebar
 */

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import limitlessIcon from '@/assets/images/brand/limitless-icon-white.png';

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
          <img className="logo-icon" src={limitlessIcon} width="24" height="24" alt="" />
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
