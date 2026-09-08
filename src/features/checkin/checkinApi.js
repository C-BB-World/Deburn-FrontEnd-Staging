/**
 * Checkin API Client
 * Handles daily check-in and reflection API requests
 */

import { get, post } from '@/utils/api';

export const checkinApi = {
  /**
   * Fetch today's reflection prompt
   */
  getReflectionPrompt() {
    return get('/api/reflection/prompt');
  },

  /**
   * Submit a daily check-in
   */
  submit(payload) {
    return post('/api/checkin', payload);
  },

  /**
   * Submit reflection, gratitude, and key focus text
   */
  submitReflection(payload) {
    return post('/api/reflection', payload);
  },

  /**
   * Fetch mood/energy/stress trends
   * @param {number} period - number of days
   */
  getTrends(period = 7) {
    return get(`/api/checkin/trends?period=${period}`);
  },
};
