import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppState,
  FamilyMember,
  MedicalDocument,
  ExtractedReport,
  Prescription,
  MedicineItem,
  Reminder,
  Doctor,
  Appointment,
  ChatMessage,
  HealthMetric,
} from '../types/index.js';
import * as api from '../services/api.js';
import { translations, Language } from '../utils/i18n.js';

export type NavigationTab =
  | 'dashboard'
  | 'records'
  | 'analyzer'
  | 'comparison'
  | 'prescriptions'
  | 'medicines'
  | 'doctors'
  | 'timeline'
  | 'reminders'
  | 'assistant'
  | 'family'
  | 'settings';

interface AppContextType {
  state: AppState | null;
  loading: boolean;
  activeMember: FamilyMember | null;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  selectedDocumentId: string | null;
  setSelectedDocumentId: (id: string | null) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isEmergencyCardOpen: boolean;
  setIsEmergencyCardOpen: (open: boolean) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  switchActiveMember: (id: string) => Promise<void>;
  reloadState: () => Promise<void>;
  uploadDocument: (doc: Partial<MedicalDocument>) => Promise<MedicalDocument>;
  updateDocument: (id: string, updates: Partial<MedicalDocument>) => Promise<MedicalDocument>;
  deleteDocument: (id: string) => Promise<void>;
  analyzeReport: (payload: {
    documentId?: string;
    documentTitle?: string;
    category?: string;
    textContent?: string;
    base64Data?: string;
    mimeType?: string;
  }) => Promise<ExtractedReport>;
  extractPrescription: (payload: {
    textContent?: string;
    base64Data?: string;
    mimeType?: string;
    familyMemberId?: string;
  }) => Promise<Prescription>;
  sendMessageToAssistant: (query: string) => Promise<ChatMessage>;
  logDose: (medId: string, timeSlot: string, status: 'taken' | 'missed') => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  addReminder: (rem: Partial<Reminder>) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<void>;
  addMedicine: (med: Partial<MedicineItem>) => Promise<MedicineItem>;
  updateMedicine: (id: string, updates: Partial<MedicineItem>) => Promise<MedicineItem>;
  addDoctor: (doc: Partial<Doctor>) => Promise<Doctor>;
  addAppointment: (apt: Partial<Appointment>) => Promise<Appointment>;
  addFamilyMember: (member: Partial<FamilyMember>) => Promise<FamilyMember>;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => Promise<FamilyMember>;
  resetSeed: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEmergencyCardOpen, setIsEmergencyCardOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 4000);
  };

  const reloadState = async () => {
    try {
      const data = await api.fetchAppState();
      setState(data);
      if (!selectedReportId && data.reports.length > 0) {
        setSelectedReportId(data.reports[0].id);
      }
    } catch (e) {
      console.error('Failed to load app state:', e);
      showToast('Could not sync with server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadState();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const switchActiveMember = async (id: string) => {
    try {
      const updated = await api.setActiveFamilyMember(id);
      setState(updated);
      const member = updated.familyMembers.find(m => m.id === id);
      showToast(`Switched active profile to ${member?.name || 'Selected Member'}`);
    } catch (e: any) {
      showToast(e.message || 'Failed to switch profile');
    }
  };

  const uploadDocument = async (doc: Partial<MedicalDocument>) => {
    const created = await api.uploadMedicalDocument(doc);
    await reloadState();
    showToast('Medical document uploaded securely to your vault');
    return created;
  };

  const updateDocument = async (id: string, updates: Partial<MedicalDocument>) => {
    const updated = await api.updateMedicalDocument(id, updates);
    await reloadState();
    showToast('Document details updated');
    return updated;
  };

  const deleteDocument = async (id: string) => {
    await api.deleteMedicalDocument(id);
    await reloadState();
    showToast('Document removed from vault');
  };

  const analyzeReport = async (payload: {
    documentId?: string;
    documentTitle?: string;
    category?: string;
    textContent?: string;
    base64Data?: string;
    mimeType?: string;
  }) => {
    const report = await api.triggerAiReportAnalysis(payload);
    await reloadState();
    setSelectedReportId(report.id);
    setActiveTab('analyzer');
    showToast('AI analysis completed successfully');
    return report;
  };

  const extractPrescription = async (payload: {
    textContent?: string;
    base64Data?: string;
    mimeType?: string;
    familyMemberId?: string;
  }) => {
    const rx = await api.triggerAiPrescriptionExtract(payload);
    await reloadState();
    setActiveTab('prescriptions');
    showToast('Prescription parsed & added to active medicines');
    return rx;
  };

  const sendMessageToAssistant = async (query: string) => {
    const msg = await api.sendChatMessageToAssistant(query);
    await reloadState();
    return msg;
  };

  const logDose = async (medId: string, timeSlot: string, status: 'taken' | 'missed') => {
    await api.logMedicineDose(medId, timeSlot, status);
    await reloadState();
    showToast(`Dose marked as ${status}`);
  };

  const toggleReminder = async (id: string) => {
    await api.toggleReminder(id);
    await reloadState();
  };

  const addReminder = async (rem: Partial<Reminder>) => {
    const created = await api.createReminder(rem);
    await reloadState();
    showToast('Reminder created');
    return created;
  };

  const deleteReminder = async (id: string) => {
    await api.deleteReminder(id);
    await reloadState();
    showToast('Reminder removed');
  };

  const addMedicine = async (med: Partial<MedicineItem>) => {
    const created = await api.createMedicine(med);
    await reloadState();
    showToast('Medicine added to tracker');
    return created;
  };

  const updateMedicine = async (id: string, updates: Partial<MedicineItem>) => {
    const updated = await api.updateMedicine(id, updates);
    await reloadState();
    showToast('Medicine updated');
    return updated;
  };

  const addDoctor = async (doc: Partial<Doctor>) => {
    const created = await api.createDoctor(doc);
    await reloadState();
    showToast('Healthcare provider saved');
    return created;
  };

  const addAppointment = async (apt: Partial<Appointment>) => {
    const created = await api.createAppointment(apt);
    await reloadState();
    showToast('Appointment scheduled');
    return created;
  };

  const addFamilyMember = async (member: Partial<FamilyMember>) => {
    const created = await api.createFamilyMember(member);
    await reloadState();
    showToast(`Added profile for ${created.name}`);
    return created;
  };

  const updateFamilyMember = async (id: string, updates: Partial<FamilyMember>) => {
    const updated = await api.updateFamilyMember(id, updates);
    await reloadState();
    showToast('Profile updated');
    return updated;
  };

  const resetSeed = async () => {
    await api.resetDatabaseSeed();
    await reloadState();
    showToast('Vault restored to default demo records');
  };

  const activeMember = state?.familyMembers.find(m => m.id === state.activeMemberId) || state?.familyMembers[0] || null;

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        state,
        loading,
        activeMember,
        activeTab,
        setActiveTab,
        selectedReportId,
        setSelectedReportId,
        selectedDocumentId,
        setSelectedDocumentId,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isEmergencyCardOpen,
        setIsEmergencyCardOpen,
        globalSearch,
        setGlobalSearch,
        language,
        setLanguage,
        t,
        theme,
        toggleTheme,
        switchActiveMember,
        reloadState,
        uploadDocument,
        updateDocument,
        deleteDocument,
        analyzeReport,
        extractPrescription,
        sendMessageToAssistant,
        logDose,
        toggleReminder,
        addReminder,
        deleteReminder,
        addMedicine,
        updateMedicine,
        addDoctor,
        addAppointment,
        addFamilyMember,
        updateFamilyMember,
        resetSeed,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
