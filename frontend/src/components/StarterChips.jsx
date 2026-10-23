import React from 'react';
import { Sparkles, DollarSign, Home, GraduationCap, Briefcase, FileText } from 'lucide-react';

const STARTER_PROMPTS = [
  { icon: DollarSign, text: "What is the annual tuition fee for B.Tech?" },
  { icon: Home, text: "What are the hostel room rent charges and curfew?" },
  { icon: Briefcase, text: "What was the highest and average placement package?" },
  { icon: GraduationCap, text: "What are the eligibility criteria for B.Tech admission?" },
  { icon: FileText, text: "Is 75% attendance mandatory for exams?" },
  { icon: Sparkles, text: "Are merit-based scholarships or fee waivers provided?" },
];

export default function StarterChips({ onSelectPrompt }) {
  return (
    <div className="my-8 text-center max-w-2xl mx-auto px-4">
      <div className="inline-flex p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 mb-3 shadow-xs border border-brand-100 dark:border-brand-900/40">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Welcome to CampusGuide AI
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Get instant, verified answers directly from official college records. Try asking one of these questions or type your own below:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
        {STARTER_PROMPTS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.text)}
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-brand-300 dark:hover:border-brand-700 shadow-xs hover:shadow transition group text-xs sm:text-sm text-slate-700 dark:text-slate-200"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-brand-600 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/60 transition">
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium group-hover:text-brand-600 dark:group-hover:text-brand-300 transition line-clamp-2">
                {item.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
