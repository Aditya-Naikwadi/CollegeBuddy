import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatPage from './pages/ChatPage';
import FAQCatalogModal from './components/FAQCatalogModal';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isOnline, setIsOnline] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [injectedPrompt, setInjectedPrompt] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOnline={isOnline}
        onViewCatalog={() => setIsCatalogOpen(true)}
      />

      {/* Main View */}
      <main className="flex-1 flex flex-col">
        <ChatPage
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          injectedPrompt={injectedPrompt}
          onPromptConsumed={() => setInjectedPrompt(null)}
        />
      </main>

      {/* FAQ Catalog Modal */}
      <FAQCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectQuestion={(question) => {
          setInjectedPrompt(question);
          setIsCatalogOpen(false);
        }}
      />
    </div>
  );
}
