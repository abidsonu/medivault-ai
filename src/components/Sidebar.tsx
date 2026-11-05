import React from 'react';
import {
  LayoutDashboard,
  FolderHeart,
  FileSpreadsheet,
  GitCompare,
  FileText,
  Pill,
  Stethoscope,
  Activity,
  BellRing,
  Bot,
  Users,
  Settings,
  ShieldCheck,
  Plus,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext.js';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { activeTab, setActiveTab, activeMember, state, switchActiveMember, setIsUploadModalOpen, setIsEmergencyCardOpen, t } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'records', label: t.records, icon: FolderHeart },
    { id: 'analyzer', label: t.analyzer, icon: FileSpreadsheet },
    { id: 'comparison', label: t.comparison, icon: GitCompare },
    { id: 'prescriptions', label: t.prescriptions, icon: FileText },
    { id: 'medicines', label: t.medicines, icon: Pill },
    { id: 'doctors', label: t.doctors, icon: Stethoscope },
    { id: 'timeline', label: t.timeline, icon: Activity },
    { id: 'reminders', label: t.reminders, icon: BellRing },
    { id: 'assistant', label: t.assistant, icon: Bot },
    { id: 'family', label: t.family, icon: Users },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <aside className="flex flex-col h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-none">
              MediVault <span className="text-teal-600 dark:text-teal-400 font-semibold">AI</span>
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1 font-medium">
              Clinical Vault & AI
            </span>
          </div>
        </div>
      </div>

      {/* Active Family Member Card & Quick Switcher */}
      <div className="px-3.5 py-3 border-b border-slate-100 dark:border-slate-800/80">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 px-2 mb-1.5 block">
          Active Patient Profile
        </label>
        <div className="relative group">
          <select
            value={activeMember?.id || ''}
            onChange={(e) => switchActiveMember(e.target.value)}
            className="w-full appearance-none bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer pr-7 transition-colors"
          >
            {state?.familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relationship} · {m.bloodGroup})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
                isActive
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
              {item.id === 'reminders' && (state?.reminders.filter(r => r.status === 'pending').length || 0) > 0 && (
                <span className="ml-auto text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {state?.reminders.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.uploadRecord}</span>
        </button>

        <button
          onClick={() => setIsEmergencyCardOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>{t.emergencyCard}</span>
        </button>

        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 font-mono">
          <span>DPDP Compliant</span>
          <span>AES-256</span>
        </div>
      </div>
    </aside>
  );
};
