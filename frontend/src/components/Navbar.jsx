import React from 'react';
import { GraduationCap, Moon, Sun, Shield, HelpCircle, Activity } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode, isOnline, onOpenAdmin, onViewCatalog }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                CampusGuide AI
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                Hybrid RAG
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official University FAQ Portal
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Server Status Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            title={isOnline ? "Backend connected and ready" : "Connecting to backend server..."}
          >
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="hidden md:inline">{isOnline ? 'System Online' : 'Waking Server'}</span>
          </div>

          {/* Browse FAQs Button */}
          {onViewCatalog && (
            <button
              onClick={onViewCatalog}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Browse all verified FAQs"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>FAQ Catalog</span>
            </button>
          )}

          {/* Admin Portal Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Admin Portal"
            >
              <Shield className="h-3.5 w-3.5 text-brand-500" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
        </div>

      </div>
    </header>
  );
}
