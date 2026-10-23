import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, ExternalLink, Tag } from 'lucide-react';
import { api } from '../api';

export default function FAQCatalogModal({ isOpen, onClose, onSelectQuestion }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!isOpen) return;
    const fetchFAQs = async () => {
      setLoading(true);
      try {
        const res = await api.getFAQs();
        setFaqs(res.faqs || []);
      } catch (err) {
        console.error("Failed to load FAQ catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', ...new Set(faqs.map(f => f.category))];

  const filtered = faqs.filter(faq => {
    const matchesCat = selectedCategory === 'All' || faq.category === selectedCategory;
    const qLower = search.toLowerCase();
    const matchesSearch = !search || 
      faq.question.toLowerCase().includes(qLower) ||
      faq.answer.toLowerCase().includes(qLower) ||
      (faq.keywords && faq.keywords.toLowerCase().includes(qLower));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Official FAQ Knowledge Base ({faqs.length} entries)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search verified questions, answers, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg transition ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-sm text-slate-400">Loading verified FAQs...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">No FAQs match your search criteria.</div>
          ) : (
            filtered.map(faq => (
              <div
                key={faq.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-brand-300 dark:hover:border-brand-700 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      ID #{faq.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {faq.category}
                    </span>
                  </div>
                  {onSelectQuestion && (
                    <button
                      onClick={() => {
                        onSelectQuestion(faq.question);
                        onClose();
                      }}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                    >
                      Ask this in chat →
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                  {faq.question}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>

                {faq.source_url && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-[11px] text-slate-400">
                    <ExternalLink className="h-3 w-3" />
                    <span>Source:</span>
                    <a
                      href={faq.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:underline truncate max-w-xs"
                    >
                      {faq.source_url}
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Close Catalog
          </button>
        </div>

      </div>
    </div>
  );
}
