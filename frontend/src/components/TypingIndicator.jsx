import React from 'react';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 my-4 justify-start animate-fadeIn">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
        <Bot className="h-5 w-5" />
      </div>
      <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-1.5">
        <span className="text-xs text-slate-400 dark:text-slate-500 mr-1 font-medium">
          Retrieving answer
        </span>
        <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" />
      </div>
    </div>
  );
}
