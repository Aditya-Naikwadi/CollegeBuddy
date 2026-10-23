import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  Lock,
  RefreshCw,
  Upload,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Database,
  Search,
  X,
  FileText
} from 'lucide-react';
import { api } from '../api';

export default function AdminPage({ onBackToChat }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || 'college-admin-supersecret-2026');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Dashboard Data
  const [faqs, setFaqs] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State for Add / Edit FAQ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Admissions',
    question: '',
    answer: '',
    paraphrases: '',
    keywords: '',
    source_url: '',
  });

  // Verify and load dashboard
  const loadDashboardData = async (activeToken = token) => {
    setLoading(true);
    setAuthError(null);
    try {
      const [unansweredRes, faqsRes] = await Promise.all([
        api.getAdminUnanswered(activeToken),
        api.getFAQs(),
      ]);

      setUnanswered(unansweredRes.unanswered || []);
      setFeedbackStats(unansweredRes.feedback_stats || null);
      setFaqs(faqsRes.faqs || []);
      setIsAuthenticated(true);
      localStorage.setItem('admin_token', activeToken);
    } catch (err) {
      console.error("Admin authentication error:", err);
      setIsAuthenticated(false);
      setAuthError(err.message || "Invalid Admin Token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData(token);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    loadDashboardData(token.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setToken('');
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setStatusMessage(null);
    try {
      const res = await api.retrainIndex(token);
      setStatusMessage({ type: 'success', text: res.message || 'AI Retrieval index retrained successfully.' });
      loadDashboardData(token);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to retrain index.' });
    } finally {
      setRetraining(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setStatusMessage({ type: 'error', text: 'Please upload a valid .csv file.' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);
    try {
      const res = await api.uploadCSV(file, token);
      setStatusMessage({ type: 'success', text: res.message || 'New FAQ dataset uploaded and indexed.' });
      loadDashboardData(token);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'CSV upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleOpenAddModal = (initialQuestion = '') => {
    setEditingFaq(null);
    setFormData({
      category: 'General',
      question: initialQuestion,
      answer: '',
      paraphrases: '',
      keywords: '',
      source_url: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category || 'General',
      question: faq.question || '',
      answer: faq.answer || '',
      paraphrases: faq.paraphrases || '',
      keywords: faq.keywords || '',
      source_url: faq.source_url || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm(`Are you sure you want to delete FAQ #${faqId}?`)) return;
    try {
      await api.deleteFAQ(faqId, token);
      setStatusMessage({ type: 'success', text: `FAQ #${faqId} deleted successfully.` });
      loadDashboardData(token);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete FAQ.' });
    }
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Question and Answer are required.");
      return;
    }

    try {
      if (editingFaq) {
        await api.updateFAQ(editingFaq.id, formData, token);
        setStatusMessage({ type: 'success', text: `FAQ #${editingFaq.id} updated successfully.` });
      } else {
        await api.createFAQ(formData, token);
        setStatusMessage({ type: 'success', text: 'New FAQ added successfully.' });
      }
      setIsModalOpen(false);
      loadDashboardData(token);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto w-full p-6 my-12 animate-fadeIn">
        <button
          onClick={onBackToChat}
          className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Chat
        </button>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-5">
          <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center border border-brand-200 dark:border-brand-800">
            <Lock className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600">ADMIN_TOKEN</code> to manage college FAQs, view logs, and retrain the AI models.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 text-left flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Security Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="college-admin-supersecret-2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Unlock Admin Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Categories list
  const categories = ['All', ...new Set(faqs.map((f) => f.category))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      (faq.keywords && faq.keywords.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6 animate-fadeIn">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToChat}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="Return to Chat"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Admin Management Console
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Authorized
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage knowledge base, inspect low-confidence queries, and retrain models without restarting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Retrain AI Index Button */}
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
            title="Rebuild TF-IDF and re-encode FastEmbed embeddings without redeploy"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining...' : 'Retrain Index'}</span>
          </button>

          {/* Upload CSV */}
          <label className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer transition">
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>{uploading ? 'Validating...' : 'Upload CSV'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-xs text-slate-600 dark:text-slate-400 transition"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="font-bold px-1">×</button>
        </div>
      )}

      {/* KPI Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Database className="h-4 w-4 text-brand-500" />
            <span>Active FAQs</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {faqs.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <ThumbsUp className="h-4 w-4 text-emerald-500" />
            <span>User Satisfaction</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {feedbackStats ? `${feedbackStats.satisfaction_rate_percent}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400">
            {feedbackStats?.thumbs_up || 0} Up / {feedbackStats?.thumbs_down || 0} Down
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <HelpCircle className="h-4 w-4 text-amber-500" />
            <span>Unanswered Queries</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {unanswered.length}
          </div>
          <span className="text-[10px] text-slate-400">Low confidence or fallback</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Shield className="h-4 w-4 text-purple-500" />
            <span>AI Architecture</span>
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
            Hybrid BGE + TF-IDF
          </div>
          <span className="text-[10px] text-slate-400">Threshold: 0.35</span>
        </div>
      </div>

      {/* SECTION 1: Frequent Unanswered Questions (Active Learning / Gap Analysis) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Frequent Unanswered Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logged student inquiries where confidence fell below 0.35. Click "Create FAQ" to fill knowledge gaps.
            </p>
          </div>
        </div>

        {unanswered.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No unanswered queries recorded in logs yet!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Logged Student Query</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Frequency</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Avg Confidence</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {unanswered.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      "{row.query}"
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                        {row.count}x
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {(row.avg_confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleOpenAddModal(row.query)}
                        className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 hover:bg-brand-100 border border-brand-200 dark:border-brand-800 text-[11px] font-semibold transition"
                      >
                        + Create FAQ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Manage Verified College FAQs (CRUD Table) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-brand-500" />
              Verified College FAQs ({filteredFaqs.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The primary knowledge base used for hybrid search and grounded responses.
            </p>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New FAQ</span>
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by question, answer, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-12">ID</th>
                <th className="py-2.5 px-3 font-semibold w-28">Category</th>
                <th className="py-2.5 px-3 font-semibold">Question & Answer Preview</th>
                <th className="py-2.5 px-3 font-semibold w-28 text-center">Updated</th>
                <th className="py-2.5 px-3 font-semibold w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-slate-400">
                    #{faq.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {faq.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {faq.question}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {faq.answer}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 text-[11px]">
                    {faq.last_updated || '—'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditModal(faq)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit FAQ"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete FAQ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Create / Edit FAQ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fadeIn">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingFaq ? `Edit FAQ #${editingFaq.id}` : 'Create New College FAQ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admissions, Fees, Hostel, Exams, Placements"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the annual tuition fee for B.Tech?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Verified Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Official college information text..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Paraphrases (separated by '|')
                </label>
                <input
                  type="text"
                  placeholder="e.g. How much are college fees?|B.Tech fee structure|engineering tuition cost"
                  value={formData.paraphrases}
                  onChange={(e) => setFormData({ ...formData, paraphrases: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[10px] text-slate-400">Helps hybrid retrieval capture student phrasing</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keywords (separated by '|')
                </label>
                <input
                  type="text"
                  placeholder="e.g. fee|tuition|btech|cost|charges|installment"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://college.edu/fees"
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition"
                >
                  Save & Re-Index
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
