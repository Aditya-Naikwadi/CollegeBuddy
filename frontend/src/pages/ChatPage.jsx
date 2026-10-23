import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Filter, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api';
import MessageItem from '../components/MessageItem';
import StarterChips from '../components/StarterChips';
import TypingIndicator from '../components/TypingIndicator';
import ExplainPanel from '../components/ExplainPanel';
import ColdStartBanner from '../components/ColdStartBanner';

export default function ChatPage({ isOnline, setIsOnline }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [explainData, setExplainData] = useState(null);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load categories and verify health on mount
  useEffect(() => {
    const initSystem = async () => {
      try {
        const health = await api.checkHealth();
        if (health && health.status === 'ok') {
          setIsOnline(true);
          setIsWakingUp(false);
        }
      } catch (e) {
        setIsOnline(false);
        setIsWakingUp(true);
      }

      try {
        const catRes = await api.getCategories();
        setCategories(catRes.categories || []);
      } catch (_) {}
    };

    initSystem();
    const interval = setInterval(initSystem, 15000);
    return () => clearInterval(interval);
  }, [setIsOnline]);

  const handleSend = async (customMessage = null) => {
    const textToSend = (customMessage || input).trim();
    if (!textToSend || loading) return;

    if (textToSend.length > 500) {
      setErrorMsg("Query exceeds the 500-character limit. Please shorten your question.");
      return;
    }
    setErrorMsg(null);

    // Append student turn
    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    // Format previous turns for API contract
    const apiHistory = newHistory.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Start timer for cold start detection
    const coldStartTimer = setTimeout(() => {
      setIsWakingUp(true);
    }, 4000);

    try {
      const response = await api.sendChat(textToSend, selectedCategory, apiHistory);
      clearTimeout(coldStartTimer);
      setIsWakingUp(false);
      setIsOnline(true);

      const botMessage = {
        role: 'assistant',
        content: response.answer,
        source: response.source,
        confidence: response.confidence,
        matches: response.matches,
        suggestions: response.suggestions,
        query_tokens: response.query_tokens,
        log_id: response.log_id,
        userQuery: textToSend,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      clearTimeout(coldStartTimer);
      console.error("Chat error:", err);
      const fallbackErrorMessage = {
        role: 'assistant',
        content: "I'm having trouble reaching the college information server right now. The server may still be spinning up from cold sleep. Please try again in 10 seconds.",
        source: 'fallback',
        confidence: 0.0,
        matches: [],
        suggestions: ["What is the B.Tech tuition fee?", "What are the hostel room rules?"],
        query_tokens: [],
        userQuery: textToSend,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackErrorMessage]);
      setErrorMsg(err.message || "Failed to communicate with AI backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    setMessages([]);
    setErrorMsg(null);
  };

  const handleFeedback = async (logId, helpful) => {
    await api.submitFeedback(logId, helpful);
  };

  const openExplainForMessage = (msg) => {
    setExplainData({
      query: msg.userQuery || "Query",
      source: msg.source,
      confidence: msg.confidence,
      matches: msg.matches || [],
      query_tokens: msg.query_tokens || []
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-2 sm:px-4">
      
      {/* Cloud cold-start banner */}
      <ColdStartBanner isWakingUp={isWakingUp} />

      {/* Category Filter Bar */}
      <div className="py-2.5 px-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/60 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-500 dark:text-slate-400">
          <Filter className="h-3.5 w-3.5 text-brand-500" />
          <span className="font-medium hidden sm:inline">Category:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            title="Reset conversation"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition shrink-0 ml-auto"
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden md:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Error notification banner */}
      {errorMsg && (
        <div className="mx-2 mt-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold px-1 hover:text-rose-900">×</button>
        </div>
      )}

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        {messages.length === 0 ? (
          <StarterChips onSelectPrompt={(prompt) => handleSend(prompt)} />
        ) : (
          messages.map((msg, index) => (
            <MessageItem
              key={index}
              message={msg}
              onSelectSuggestion={(sug) => handleSend(sug)}
              onOpenExplain={openExplainForMessage}
              onFeedback={handleFeedback}
            />
          ))
        )}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Control Bar */}
      <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 rounded-t-2xl shadow-lg">
        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCategory 
                ? `Ask a question about ${selectedCategory}...`
                : "Ask about admissions, fees, hostel, placements, exams..."
            }
            maxLength={500}
            className="w-full pl-4 pr-24 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none max-h-32 transition"
          />

          {/* Input Actions (Length indicator + Send button) */}
          <div className="absolute right-2 flex items-center gap-1.5">
            <span className={`text-[10px] font-mono pr-1 hidden sm:inline ${
              input.length > 450 ? 'text-amber-500 font-bold' : 'text-slate-400'
            }`}>
              {input.length}/500
            </span>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Send query"
              className={`p-2 rounded-lg transition flex items-center justify-center ${
                !input.trim() || loading
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20'
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
          <span className="hidden sm:inline">Hybrid Score: 0.4×TF-IDF + 0.6×FastEmbed</span>
        </div>
      </div>

      {/* "How I Answered" Explainability Drawer */}
      <ExplainPanel
        explainData={explainData}
        onClose={() => setExplainData(null)}
      />

    </div>
  );
}
