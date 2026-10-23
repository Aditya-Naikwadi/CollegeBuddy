/**
 * API client module for College FAQ Chatbot.
 * Connects to FastAPI backend with automatic base URL resolution.
 */

const BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') 
  : '';

/**
 * Common request wrapper with JSON and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } catch (_) {
        // non-json response
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  /**
   * Health check to detect if server is running / cold-starting
   */
  async checkHealth() {
    return request('/api/health');
  },

  /**
   * Fetch available FAQ categories
   */
  async getCategories() {
    return request('/api/categories');
  },

  /**
   * Fetch all FAQs
   */
  async getFAQs() {
    return request('/api/faqs');
  },

  /**
   * Submit student chat query
   * @param {string} message - User question
   * @param {string|null} category - Optional category filter
   * @param {Array} history - Previous messages
   */
  async sendChat(message, category = null, history = []) {
    return request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        category: category || null,
        history,
      }),
    });
  },

  /**
   * Submit thumbs up/down user feedback
   * @param {number} logId - Query log ID
   * @param {boolean} helpful - True if helpful, False otherwise
   */
  async submitFeedback(logId, helpful) {
    return request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        log_id: logId,
        helpful,
      }),
    });
  },

  // ================= ADMIN APIS =================

  async getAdminUnanswered(token) {
    return request('/api/admin/unanswered', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async createFAQ(faqData, token) {
    return request('/api/admin/faqs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(faqData),
    });
  },

  async updateFAQ(faqId, faqData, token) {
    return request(`/api/admin/faqs/${faqId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(faqData),
    });
  },

  async deleteFAQ(faqId, token) {
    return request(`/api/admin/faqs/${faqId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async retrainIndex(token) {
    return request('/api/admin/retrain', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async uploadCSV(file, token) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${BASE_URL}/api/admin/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload CSV dataset.');
    }
    return response.json();
  },
};
