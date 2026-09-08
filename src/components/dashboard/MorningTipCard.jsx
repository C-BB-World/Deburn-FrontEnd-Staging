/**
 * MorningTipCard
 * Small dismissible card cycling through a fixed set of Limitless Group
 * tip messages, one per day. Dismissal only hides it for the current day.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DISMISSED_KEY_PREFIX = 'morning_tip_dismissed_';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function MorningTipCard() {
  const { t } = useTranslation('dashboard');
  const todayKey = getTodayKey();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY_PREFIX + todayKey) === 'true'
  );

  const messages = t('morningTip.messages', { returnObjects: true });
  if (dismissed || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  const dayOfMonth = new Date().getDate();
  const message = messages[dayOfMonth % messages.length];

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY_PREFIX + todayKey, 'true');
    setDismissed(true);
  }

  return (
    <div className="morning-tip-card">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="morning-tip-icon">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
      </svg>
      <div className="morning-tip-content">
        <p className="morning-tip-label">{t('morningTip.label', 'Morning tip from Limitless Group')}</p>
        <p className="morning-tip-text">{message}</p>
      </div>
      <button
        className="morning-tip-dismiss"
        onClick={handleDismiss}
        aria-label={t('morningTip.dismiss', 'Dismiss')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
