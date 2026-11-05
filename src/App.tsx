import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { UploadDocumentModal } from './components/UploadDocumentModal.js';
import { EmergencyCardModal } from './components/EmergencyCardModal.js';

// Views
import { DashboardView } from './views/DashboardView.js';
import { MedicalRecordsView } from './views/MedicalRecordsView.js';
import { ReportAnalyzerView } from './views/ReportAnalyzerView.js';
import { ReportComparisonView } from './views/ReportComparisonView.js';
import { PrescriptionsView } from './views/PrescriptionsView.js';
import { MedicinesView } from './views/MedicinesView.js';
import { DoctorsView } from './views/DoctorsView.js';
import { HealthTimelineView } from './views/HealthTimelineView.js';
import { RemindersView } from './views/RemindersView.js';
import { AiAssistantView } from './views/AiAssistantView.js';
import { FamilyProfilesView } from './views/FamilyProfilesView.js';
import { SettingsView } from './views/SettingsView.js';

import { Loader2, CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, loading, toastMessage } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'records':
        return <MedicalRecordsView />;
      case 'analyzer':
        return <ReportAnalyzerView />;
      case 'comparison':
        return <ReportComparisonView />;
      case 'prescriptions':
        return <PrescriptionsView />;
      case 'medicines':
        return <MedicinesView />;
      case 'doctors':
        return <DoctorsView />;
      case 'timeline':
        return <HealthTimelineView />;
      case 'reminders':
        return <RemindersView />;
      case 'assistant':
        return <AiAssistantView />;
      case 'family':
        return <FamilyProfilesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
        <p className="text-xs font-semibold font-mono text-slate-500 uppercase tracking-wider">
          Initializing Encrypted Medical Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-white dark:bg-slate-900 h-full shadow-2xl z-10">
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <UploadDocumentModal />
      <EmergencyCardModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium rounded-xl shadow-xl border border-slate-700/50 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 dark:text-teal-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
