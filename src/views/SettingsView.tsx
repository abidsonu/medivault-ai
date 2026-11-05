import React, { useState } from 'react';
import {
  Settings,
  Languages,
  Moon,
  Sun,
  Download,
  ShieldCheck,
  Trash2,
  RotateCcw,
  FileText,
  Lock,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const SettingsView: React.FC = () => {
  const {
    state,
    activeMember,
    language,
    setLanguage,
    theme,
    toggleTheme,
    resetSeed,
    showToast,
    t,
  } = useApp();

  const [isResetting, setIsResetting] = useState(false);

  if (!state || !activeMember) return null;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `medivault_health_export_${activeMember.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Complete medical record archive exported successfully');
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleResetData = async () => {
    if (window.confirm('Restore MediVault to the pristine initial clinical sample dataset?')) {
      setIsResetting(true);
      try {
        await resetSeed();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Vault Settings & Data Governance
        </h2>
        <p className="text-xs text-slate-500">
          Privacy management, data portability, and localization controls
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Interface & Language Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Switcher */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-teal-600" />
                Language / ഭാഷ
              </span>
              <p className="text-[11px] text-slate-500">
                Choose UI language (English or മലയാളം)
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  language === 'en' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ml')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  language === 'ml' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                മലയാളം
              </button>
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-teal-400" />}
                Appearance Theme
              </span>
              <p className="text-[11px] text-slate-500">
                Current: {theme === 'light' ? 'Crisp Light Mode' : 'Clinical Dark Mode'}
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Toggle {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Export & Doctor Summary Portability */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Health Records Portability & Consultation Sharing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-teal-600" />
                Comprehensive Clinical Summary (PDF)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Generate an organized medical summary sheet for doctor visits containing CBC trends, cholesterol control, active medications, and allergies.
              </p>
            </div>
            <button
              onClick={handlePrintSummary}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer w-full"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Doctor Summary</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-teal-600" />
                Export Complete Data Archive (JSON)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Download all raw extracted test metrics, doctor prescriptions, reminders, and historical measurements for local backup.
              </p>
            </div>
            <button
              onClick={handleExportJson}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer w-full"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Health Archive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security, Privacy & DPDP Act Compliance */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Security & Indian DPDP Act Compliance
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <strong className="text-slate-900 dark:text-white block font-semibold">Zero Public URLs</strong>
            <p className="text-[11px] text-slate-500">
              Documents are stored with strict tenant isolation and short-lived signed access. No public storage buckets.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <strong className="text-slate-900 dark:text-white block font-semibold">Consent-Driven AI</strong>
            <p className="text-[11px] text-slate-500">
              Medical report extraction runs only when explicitly authorized by the user. Zero unauthorized model training.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <strong className="text-slate-900 dark:text-white block font-semibold">Right to Erasure</strong>
            <p className="text-[11px] text-slate-500">
              Users retain full rights to delete individual records, family member profiles, or their entire vault at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Reset Options */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Demo Sandbox State
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Reset to pristine historical CBC and Lipid test records for testing and evaluation
          </p>
        </div>

        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isResetting ? 'Resetting...' : 'Restore Demo Records'}</span>
        </button>
      </div>
    </div>
  );
};
