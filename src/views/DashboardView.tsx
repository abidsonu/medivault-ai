import React from 'react';
import {
  FileText,
  Sparkles,
  Pill,
  Clock,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Droplets,
  Heart,
  Scale,
  Activity,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const DashboardView: React.FC = () => {
  const {
    state,
    activeMember,
    setActiveTab,
    setSelectedReportId,
    setIsUploadModalOpen,
    setIsEmergencyCardOpen,
    logDose,
    toggleReminder,
    t,
  } = useApp();

  if (!state || !activeMember) return null;

  const memberDocs = state.documents.filter(d => d.familyMemberId === activeMember.id);
  const memberReports = state.reports.filter(r => r.familyMemberId === activeMember.id);
  const memberMeds = state.medicines.filter(m => m.familyMemberId === activeMember.id && m.status === 'active');
  const memberReminders = state.reminders.filter(r => r.familyMemberId === activeMember.id && r.status === 'pending');
  const memberAppointments = state.appointments.filter(a => a.familyMemberId === activeMember.id && a.status === 'upcoming');
  const latestReport = memberReports[0];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Personal Health Vault
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-mono text-slate-500">
                Blood: {activeMember.bloodGroup} · Age {activeMember.age}
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {activeMember.name}
            </h2>
            <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your health records are organized, verified, and analyzed. You have{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">{memberMeds.length} active medications</strong>{' '}
              and{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">{memberReminders.length} pending reminders</strong> today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.uploadRecord}</span>
            </button>
            <button
              onClick={() => setIsEmergencyCardOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.emergencyCard}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab('records')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.totalDocuments}</span>
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {memberDocs.length}
            </span>
            <span className="text-[11px] text-slate-400">files</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('analyzer')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.reportsAnalyzed}</span>
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {memberReports.length}
            </span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">100% indexed</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('medicines')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.activeMedications}</span>
            <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {memberMeds.length}
            </span>
            <span className="text-[11px] text-slate-400">prescribed</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('reminders')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t.upcomingReminders}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {memberReminders.length}
            </span>
            <span className="text-[11px] text-slate-400">actions</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Today's Meds & Latest Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Today's Medicine Routine & Quick Log */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Medications */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Today's Medicine Schedule
                </h3>
                <p className="text-[11px] text-slate-500">
                  Track adherence and mark doses as taken
                </p>
              </div>
              <button
                onClick={() => setActiveTab('medicines')}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {memberMeds.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No active medications configured.</p>
              ) : (
                memberMeds.map(med => {
                  const todayLog = med.logs.find(l => l.date === today && l.timeSlot === med.timing[0]);
                  const isTaken = todayLog?.status === 'taken';

                  return (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isTaken ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{med.name}</h4>
                            <span className="text-[11px] font-mono text-slate-500 font-medium">{med.dosage}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {med.frequency} · {med.timing.join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isTaken ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.taken} ({todayLog.timestamp || 'Today'})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => logDose(med.id, med.timing[0], 'taken')}
                            className="px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 rounded-lg transition-colors cursor-pointer"
                          >
                            {t.markTaken}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Key Health Metrics Snapshot */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Health Metrics & Trends
                </h3>
                <p className="text-[11px] text-slate-500">Extracted from verified clinical laboratory reports</p>
              </div>
              <button
                onClick={() => setActiveTab('comparison')}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Comparison Charts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Hemoglobin</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">13.4</span>
                  <span className="text-[10px] text-slate-400">g/dL</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3 h-3" /> +19.6% recovered
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Total Cholesterol</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">178</span>
                  <span className="text-[10px] text-slate-400">mg/dL</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1">
                  <TrendingDown className="w-3 h-3" /> -21.9% normalized
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Fasting Glucose</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">89</span>
                  <span className="text-[10px] text-slate-400">mg/dL</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  Nominal (Ref &lt;100)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Blood Pressure</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">118/78</span>
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mt-1 block">
                  Optimal stage
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Latest AI Report Highlight & Upcoming Appointments */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latest AI Report Highlight */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Latest Analyzed Report
              </span>
              <button
                onClick={() => {
                  if (latestReport) setSelectedReportId(latestReport.id);
                  setActiveTab('analyzer');
                }}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
              >
                <span>Full Analysis</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestReport ? (
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {latestReport.reportType}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {latestReport.hospital} · {latestReport.testDate}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {latestReport.summary.mainFindings}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium text-center">
                    <strong className="font-bold font-mono text-sm block">{latestReport.summary.withinRangeCount}</strong>
                    <span className="text-[10px]">Within Range</span>
                  </div>
                  <div className="flex-1 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-medium text-center">
                    <strong className="font-bold font-mono text-sm block">{latestReport.summary.outsideRangeCount}</strong>
                    <span className="text-[10px]">Outside Range</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Questions for your next visit:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {latestReport.summary.doctorQuestions.slice(0, 2).map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-600 dark:text-teal-400 font-bold">·</span>
                        <span className="truncate">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No reports analyzed yet.</p>
            )}
          </div>

          {/* Upcoming Appointments & Doctor Visits */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Consultations
              </h3>
              <button
                onClick={() => setActiveTab('doctors')}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Providers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {memberAppointments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No upcoming appointments scheduled.</p>
              ) : (
                memberAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{apt.doctorName}</span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        {apt.date}
                      </span>
                    </div>
                    <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mt-0.5">{apt.purpose}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-1">
                      {apt.hospital} · {apt.time}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
