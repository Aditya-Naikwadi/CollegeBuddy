import React, { useEffect } from 'react';
import { X, Sparkles, BookOpen, Layers, Cpu, ArrowRight } from 'lucide-react';

export default function ExplainPanel({ explainData, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!explainData) return null;

  const {
    query,
    source,
    confidence,
    matches = [],
    query_tokens = []
  } = explainData;

  const getSourceBadge = (src) => {
    switch (src) {
      case 'llm':
        return { label: 'Claude Grounded Synthesis', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'retrieval':
        return { label: 'Direct Hybrid Retrieval', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'fallback':
      default:
        return { label: 'Confidence Fallback (< 0.35)', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    }
  };

  const badge = getSourceBadge(source);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              How I Answered
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close explainability panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Query & Strategy overview */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                User Query
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                "{query}"
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                {badge.label}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                Confidence: {(confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Cleaned Query Tokens */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Cpu className="h-3.5 w-3.5 text-brand-500" />
              Preprocessed Semantic Tokens
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Pipeline: Lowercase → Strip Punctuation → Stopword Elimination → Suffix Stemming → Synonyms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {query_tokens && query_tokens.length > 0 ? (
                query_tokens.map((token, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-mono rounded-md"
                  >
                    {token}
                  </span>
                ))
              ) : (
                <span className="text-xs italic text-slate-400">No content tokens extracted</span>
              )}
            </div>
          </div>

          {/* Formula Callout */}
          <div className="p-3.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              Hybrid Fusion Formula:
            </div>
            <code className="block font-mono bg-white/80 dark:bg-slate-900/80 p-1.5 rounded border border-indigo-200/50 dark:border-indigo-800/50 text-[11px]">
              Hybrid Score = (0.4 × TF-IDF Cosine) + (0.6 × BGE-small Dense Cosine)
            </code>
          </div>

          {/* Top 3 Candidate FAQs Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
              <BookOpen className="h-3.5 w-3.5 text-brand-500" />
              Top Retrieved FAQ Candidates ({matches.length})
            </h3>

            <div className="space-y-4">
              {matches.map((item, idx) => {
                const isWinner = idx === 0 && confidence >= 0.35;
                const hybridPercent = Math.min(100, Math.round(item.hybrid * 100));
                const tfidfPercent = Math.min(100, Math.round(item.tfidf * 100));
                const densePercent = Math.min(100, Math.round(item.embedding * 100));

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition ${
                      isWinner
                        ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          isWinner 
                            ? 'bg-brand-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                        Hybrid: {(item.hybrid * 100).toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-3">
                      {item.question}
                    </p>

                    {/* Progress bars for scores */}
                    <div className="space-y-2 text-[11px] font-mono">
                      {/* Hybrid Score Bar */}
                      <div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-0.5">
                          <span>Combined Hybrid</span>
                          <span className="font-semibold">{item.hybrid.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-brand-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${hybridPercent}%` }} 
                          />
                        </div>
                      </div>

                      {/* Lexical TF-IDF Bar */}
                      <div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-0.5">
                          <span>TF-IDF (Lexical 0.4x)</span>
                          <span>{item.tfidf.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${tfidfPercent}%` }} 
                          />
                        </div>
                      </div>

                      {/* Dense Embedding Bar */}
                      <div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-0.5">
                          <span>Dense FastEmbed (0.6x)</span>
                          <span>{item.embedding.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${densePercent}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:opacity-90 transition"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}
