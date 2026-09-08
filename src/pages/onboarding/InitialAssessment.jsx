/**
 * Initial Assessment Page
 * One-time Day 0 participation assessment shown before a user reaches the app.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { post } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { LikertScale } from '@/components/checkin/LikertScale';

export default function InitialAssessment() {
  const { t } = useTranslation(['assessment', 'common']);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [stress, setStress] = useState(null);
  const [presenteeism, setPresenteeism] = useState(null);
  const [absenteeism, setAbsenteeism] = useState('');
  const [turnoverIntention, setTurnoverIntention] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const frequencyLabels = [
    t('assessment:stress.never', 'Never'),
    t('assessment:stress.rarely', 'Rarely'),
    t('assessment:stress.sometimes', 'Sometimes'),
    t('assessment:stress.often', 'Often'),
    t('assessment:stress.almostAlways', 'Almost always'),
  ];

  const turnoverLabels = [
    t('assessment:turnoverIntention.never', 'Never'),
    t('assessment:turnoverIntention.rarely', 'Rarely'),
    t('assessment:turnoverIntention.sometimes', 'Sometimes'),
    t('assessment:turnoverIntention.often', 'Often'),
    t('assessment:turnoverIntention.veryOften', 'Very often'),
  ];

  const isValid =
    stress !== null &&
    presenteeism !== null &&
    turnoverIntention !== null &&
    absenteeism !== '' &&
    Number(absenteeism) >= 0;

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const response = await post('/api/assessment/initial', {
        stress,
        presenteeism,
        absenteeism: Number(absenteeism),
        turnoverIntention,
      });
      if (response.success) {
        updateUser({ hasCompletedAssessment: true });
        navigate('/dashboard', { replace: true });
      } else {
        setError(t('common:errors.generic', 'Something went wrong. Please try again.'));
      }
    } catch (err) {
      setError(t('common:errors.generic', 'Something went wrong. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="checkin-screen">
      <div className="checkin-container">
        <header className="checkin-header">
          <div className="header-spacer"></div>
          <h2 className="checkin-title">{t('assessment:title', 'Before you get started')}</h2>
          <div className="header-spacer"></div>
        </header>

        <div className="checkin-step active" data-step="1">
          <div className="step-content">
            <p className="reflection-subtitle">
              {t('assessment:subtitle', "A few quick questions to help us understand where you're starting from. This only appears once.")}
            </p>

            <LikertScale
              question={t('assessment:stress.question', 'In the last 12 months, how often have you experienced stress that affected your ability to work effectively?')}
              value={stress}
              onChange={setStress}
              labels={frequencyLabels}
            />

            <LikertScale
              question={t('assessment:presenteeism.question', 'In the last 12 months, how often have you gone to work despite feeling unwell or below your best, and worked at reduced effectiveness as a result?')}
              value={presenteeism}
              onChange={setPresenteeism}
              labels={frequencyLabels}
            />

            <div className="numeric-input-group">
              <h4 className="likert-label">
                {t('assessment:absenteeism.question', 'In the last 12 months, how many days of work have you missed due to stress, burnout, or mental health?')}
              </h4>
              <input
                type="number"
                min="0"
                className="numeric-input"
                value={absenteeism}
                onChange={(e) => setAbsenteeism(e.target.value)}
                placeholder={t('assessment:absenteeism.placeholder', 'Number of days')}
              />
            </div>

            <LikertScale
              question={t('assessment:turnoverIntention.question', 'In the last 12 months, how often have you thought about leaving your job because of stress or workload?')}
              value={turnoverIntention}
              onChange={setTurnoverIntention}
              labels={turnoverLabels}
            />

            {error && <p className="reflection-error">{error}</p>}
          </div>
        </div>

        <div className="checkin-nav">
          <div></div>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting
              ? t('common:loading', 'Loading...')
              : t('assessment:submit', 'Continue')}
          </button>
        </div>
      </div>
    </div>
  );
}
