import React from 'react';
import { Loader2, Info } from 'lucide-react';

export default function ColdStartBanner({ isWakingUp }) {
  if (!isWakingUp) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 px-4 py-2 text-xs flex items-center justify-center gap-2">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
      <span>
        <strong>Waking up cloud server:</strong> The backend is spinning up on Render free tier (takes ~30-50 seconds on cold start). Answers will stream momentarily.
      </span>
    </div>
  );
}
