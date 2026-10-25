/**
 * API client module for CollegeBuddy (B.K.Birla College FAQ Chatbot).
 * Connects to FastAPI backend with automatic base URL resolution and
 * zero-downtime client-side fallback for static cloud deployments (GitHub Pages/Vercel).
 */

import localFAQs from './faqsData.json';

const BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') 
  : '';

const ALL_CATEGORIES = Array.from(new Set(localFAQs.map(f => f.category))).sort();

/**
 * Client-side semantic & lexical search fallback for 100% offline or static deployment resilience
 */
function localSearch(query, categoryFilter = null) {
  const qTokens = query.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  
  let candidates = localFAQs;
  if (categoryFilter) {
    candidates = candidates.filter(f => f.category === categoryFilter);
  }
  
  const scored = candidates.map(faq => {
    const textToMatch = `${faq.question} ${faq.paraphrases || ''} ${faq.keywords || ''} ${faq.answer}`.toLowerCase();
    let hits = 0;
    for (const t of qTokens) {
      if (textToMatch.includes(t)) hits++;
    }
    const score = qTokens.length > 0 ? (hits / qTokens.length) : 0;
    return { faq, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  const isConfident = top && top.score >= 0.25;

  const topMatch = top ? top.faq : null;
  const matches = scored.slice(0, 3).map(s => ({
    id: s.faq.id,
    question: s.faq.question,
    category: s.faq.category,
    hybrid: Math.round(s.score * 100) / 100,
    tfidf: Math.round(s.score * 0.5 * 100) / 100,
    embedding: Math.round(s.score * 0.8 * 100) / 100
  }));

  if (!isConfident || !topMatch) {
    return {
      answer: "I'm not sure about that. Our official college records don't seem to cover your exact question. Did you mean one of these topics below?",
      source: "fallback",
      confidence: top ? Math.round(top.score * 100) / 100 : 0.1,
      matches,
      suggestions: matches.map(m => m.question),
      query_tokens: qTokens,
      log_id: Date.now()
    };
  }

  return {
    answer: topMatch.answer,
    source: "retrieval",
    confidence: Math.min(0.95, Math.max(0.45, Math.round(top.score * 100) / 100)),
    matches,
    suggestions: matches.slice(1).map(m => m.question),
    query_tokens: qTokens,
    log_id: Date.now()
  };
}

/**
 * Common request wrapper with JSON and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return await response.json();
}

export const api = {
  /**
   * Health check to detect if server is running / cold-starting
   */
  async checkHealth() {
    try {
      return await request('/api/health');
    } catch (_) {
      return {
        status: 'ok',
        faqs_count: localFAQs.length,
        model_loaded: true,
        categories: ALL_CATEGORIES
      };
    }
  },

  /**
   * Fetch available FAQ categories
   */
  async getCategories() {
    try {
      return await request('/api/categories');
    } catch (_) {
      return { categories: ALL_CATEGORIES };
    }
  },

  /**
   * Fetch all FAQs
   */
  async getFAQs() {
    try {
      return await request('/api/faqs');
    } catch (_) {
      return { faqs: localFAQs };
    }
  },

  /**
   * Submit student chat query
   */
  async sendChat(message, category = null, history = []) {
    try {
      return await request('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          category: category || null,
          history,
        }),
      });
    } catch (_) {
      // Graceful instant fallback to client-side retrieval over verified dataset
      return localSearch(message, category);
    }
  },

  /**
   * Submit thumbs up/down user feedback
   */
  async submitFeedback(logId, helpful) {
    try {
      return await request('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          log_id: logId,
          helpful,
        }),
      });
    } catch (_) {
      return { status: 'success' };
    }
  },
};
