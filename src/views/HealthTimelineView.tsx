import React, { useState } from 'react';
import {
  Activity,
  FileSpreadsheet,
  Pill,
  Stethoscope,
  Calendar,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'report' | 'prescription' | 'appointment' | 'medication';
  title: string;
  subtitle: string;
  details: string;
  status?: string;
  badge?: string;
  referenceId?: string;
}

export const HealthTimelineView: React.FC = () => {
  const { state, activeMember, setActiveTab, setSelectedReportId, t } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  if (!state || !activeMember) return null;

  // Build unified events array
  const events: TimelineEvent[] = [];

  // 1. Reports
  state.reports
    .filter(r => r.familyMemberId === activeMember.id)
    .forEach(r => {
      events.push({
        id: `ev_rep_${r.id}`,
        date: r.testDate,
        type: 'report',
        title: r.reportType,
        subtitle: `${r.hospital} · Clinical Diagnostic Report`,
        details: r.summary.mainFindings,
        badge: r.summary.outsideRangeCount > 0 ? `${r.summary.outsideRangeCount} Abnormal` : 'All Within Range',
        status: r.summary.outsideRangeCount > 0 ? 'abnormal' : 'normal',
        referenceId: r.id,
      });
    });

  // 2. Prescriptions
  state.prescriptions
    .filter(p => p.familyMemberId === activeMember.id)
    .forEach(p => {
      events.push({
        id: `ev_rx_${p.id}`,
        date: p.prescriptionDate,
        type: 'prescription',
        title: `Prescription by ${p.doctorName}`,
        subtitle: `${p.hospital} · ${p.diagnosis || 'Prescribed Care'}`,
        details: `Medications: ${p.medicines.map(m => `${m.name} (${m.dosage})`).join(', ')}`,
        badge: `${p.medicines.length} Medicines`,
        status: 'normal',
      });
    });

  // 3. Appointments
  state.appointments
    .filter(a => a.familyMemberId === activeMember.id)
    .forEach(a => {
      events.push({
        id: `ev_apt_${a.id}`,
        date: a.date,
        type: 'appointment',
        title: `Consultation with ${a.doctorName}`,
        subtitle: `${a.hospital} at ${a.time}`,
        details: `Purpose: ${a.purpose}`,
        badge: a.status.toUpperCase(),
        status: 'normal',
      });
    });

  // Sort descending by date
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEvents = events.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Health History Timeline
          </h2>
          <p className="text-xs text-slate-500">
            Unified chronological journey connecting tests, consultations, and prescription adjustments for {activeMember.name}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setFilterType('report')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'report'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Lab Reports
          </button>
          <button
            onClick={() => setFilterType('prescription')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'prescription'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setFilterType('appointment')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'appointment'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Appointments
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredEvents.map(ev => {
          const isReport = ev.type === 'report';
          const isRx = ev.type === 'prescription';

          return (
            <div key={ev.id} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                  isReport
                    ? 'bg-teal-600 text-white'
                    : isRx
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-white'
                }`}
              >
                {isReport ? (
                  <FileSpreadsheet className="w-3 h-3" />
                ) : isRx ? (
                  <Pill className="w-3 h-3" />
                ) : (
                  <Stethoscope className="w-3 h-3" />
                )}
              </div>

              {/* Event Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                      {ev.date}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-[11px] font-semibold uppercase text-slate-400">
                      {ev.type}
                    </span>
                  </div>

                  {ev.badge && (
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-mono self-start sm:self-auto ${
                        ev.status === 'abnormal'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {ev.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {ev.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {ev.subtitle}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {ev.details}
                </p>

                {isReport && ev.referenceId && (
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedReportId(ev.referenceId!);
                        setActiveTab('analyzer');
                      }}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <span>Open AI Diagnostic Dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
