import React from 'react';
import { X, AlertTriangle, Phone, Heart, Droplets, ShieldAlert, QrCode, Printer, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const EmergencyCardModal: React.FC = () => {
  const { isEmergencyCardOpen, setIsEmergencyCardOpen, activeMember, state } = useApp();

  if (!isEmergencyCardOpen || !activeMember) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                Emergency Medical ID
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Critical health information for emergency responders & doctors
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEmergencyCardOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Identity & Blood Group Header */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 via-teal-500/5 to-transparent border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-rose-600 dark:text-rose-400">
                Primary Patient
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {activeMember.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {activeMember.age} yrs · {activeMember.gender} · DOB: {activeMember.dob}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 block">
                Blood Group
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg font-mono font-bold text-base shadow-sm mt-0.5">
                <Droplets className="w-4 h-4" />
                <span>{activeMember.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* Critical Allergies (Highest Priority) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Known Medical Allergies (Severe Warning)</span>
            </div>
            <div className="p-3 rounded-lg bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              {activeMember.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-rose-900 dark:text-rose-200">
                  {activeMember.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-200/70 dark:bg-rose-900/60 rounded">
                      ⚠️ {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No known drug allergies reported.</p>
              )}
            </div>
          </div>

          {/* Chronic Conditions & Ongoing Medications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Chronic Health Conditions
              </span>
              {activeMember.chronicConditions.length > 0 ? (
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  {activeMember.chronicConditions.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">None recorded.</p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Active Medications
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                {state?.medicines.filter(m => m.familyMemberId === activeMember.id && m.status === 'active').slice(0, 3).map((m, i) => (
                  <li key={i} className="truncate">
                    <strong>{m.name}</strong> ({m.dosage})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                Emergency Primary Contact
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {activeMember.emergencyContact.name} ({activeMember.emergencyContact.relationship})
              </p>
              <a
                href={`tel:${activeMember.emergencyContact.phone}`}
                className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 mt-0.5"
              >
                <Phone className="w-3 h-3" />
                {activeMember.emergencyContact.phone}
              </a>
            </div>

            {/* Simulated Digital QR for emergency first responders */}
            <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
              <QrCode className="w-12 h-12 text-slate-800 dark:text-slate-200" />
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">Emergency Scan</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            MediVault ID #{activeMember.id.replace('fam_', 'MV-88')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
            <button
              onClick={() => setIsEmergencyCardOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
