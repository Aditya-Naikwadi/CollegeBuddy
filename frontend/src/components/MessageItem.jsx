import React, { useState } from 'react';
import { Bot, User, ThumbsUp, ThumbsDown, Sparkles, Check, HelpCircle, ExternalLink } from 'lucide-react';

export default function MessageItem({ message, onSelectSuggestion, onOpenExplain, onFeedback }) {
  const isUser = message.role === 'user';
  const [feedbackGiven, setFeedbackGiven] = useState(message.feedbackState || null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackClick = async (helpful) => {
    if (feedbackGiven !== null || !message.log_id || isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      if (onFeedback) {
        await onFeedback(message.log_id, helpful);
      }
      setFeedbackGiven(helpful);
    } catch (err) {
      console.error("Failed to record feedback:", err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getSourceBadge = () => {
    if (!message.source) return null;
    if (message.source === 'llm') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Sparkles className="h-3 w-3" /> Claude Grounded
        </span>
      );
    }
    if (message.source === 'retrieval') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Check className="h-3 w-3" /> Verified FAQ Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <HelpCircle className="h-3 w-3" /> Low Confidence (&lt; 0.35)
      </span>
    );
  };

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
          <Bot className="h-5 w-5" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Source Badge for Assistant */}
        {!isUser && message.source && (
          <div className="flex items-center gap-2 mb-1.5 pl-1">
            {getSourceBadge()}
            {message.confidence !== undefined && (
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                Score: {(message.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* Text Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700/80 shadow-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Assistant Actions Bar (Feedback & How I Answered) */}
        {!isUser && message.log_id && (
          <div className="flex flex-wrap items-center gap-3 mt-2 pl-1 text-xs text-slate-500 dark:text-slate-400">
            
            {/* Feedback Thumbs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] mr-1">Helpful?</span>
              
              <button
                onClick={() => handleFeedbackClick(true)}
                disabled={feedbackGiven !== null || isSubmittingFeedback}
                title="Helpful answer"
                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${
                  feedbackGiven === true ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                }`}
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${feedbackGiven === true ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => handleFeedbackClick(false)}
                disabled={feedbackGiven !== null || isSubmittingFeedback}
                title="Not helpful"
                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${
                  feedbackGiven === false ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
                }`}
              >
                <ThumbsDown className={`h-3.5 w-3.5 ${feedbackGiven === false ? 'fill-current' : ''}`} />
              </button>

              {feedbackGiven !== null && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1 font-medium">
                  Saved!
                </span>
              )}
            </div>

            {/* How I Answered Drawer Trigger */}
            <button
              onClick={() => onOpenExplain(message)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-200/80 dark:border-brand-800/80 transition font-medium"
            >
              <Sparkles className="h-3 w-3" />
              <span>How I answered</span>
            </button>
          </div>
        )}

        {/* Follow-up Suggestion Chips */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 pl-1 w-full space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {message.source === 'fallback' ? 'Suggested Related Questions:' : 'Explore Further:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="text-left text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition shadow-xs"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
