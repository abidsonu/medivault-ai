import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Menu,
  Languages,
  X,
  FileUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const {
    activeTab,
    activeMember,
    globalSearch,
    setGlobalSearch,
    theme,
    toggleTheme,
    language,
    setLanguage,
    setIsUploadModalOpen,
    t,
  } = useApp();

  const getTabLabel = () => {
    switch (activeTab) {
      case 'dashboard': return t.dashboard;
      case 'records': return t.records;
      case 'analyzer': return t.analyzer;
      case 'comparison': return t.comparison;
      case 'prescriptions': return t.prescriptions;
      case 'medicines': return t.medicines;
      case 'doctors': return t.doctors;
      case 'timeline': return t.timeline;
      case 'reminders': return t.reminders;
      case 'assistant': return t.assistant;
      case 'family': return t.family;
      case 'settings': return t.settings;
      default: return 'MediVault AI';
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Breadcrumb / Section Header & Mobile Hamburger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="text-sm lg:text-base font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            {getTabLabel()}
          </h1>
          {activeMember && (
            <span className="hidden sm:inline-flex text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              for <strong className="font-semibold text-slate-700 dark:text-slate-300 ml-1">{activeMember.name}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: Global Search Bar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Actions & Quick Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Selector */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Switch language (English / Malayalam)"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">{language === 'en' ? 'മലയാളം' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <FileUp className="w-3.5 h-3.5" />
          <span>{t.uploadRecord}</span>
        </button>
      </div>
    </header>
  );
};
