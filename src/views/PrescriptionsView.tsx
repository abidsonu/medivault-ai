import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Camera,
  Plus,
  Stethoscope,
  Building,
  Calendar,
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { Prescription } from '../types/index.js';

export const PrescriptionsView: React.FC = () => {
  const { state, activeMember, extractPrescription, t } = useApp();

  const [isScanning, setIsScanning] = useState(false);
  const [scanText, setScanText] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state || !activeMember) return null;

  const memberPrescriptions = state.prescriptions.filter(p => p.familyMemberId === activeMember.id);

  const handleScanPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanText.trim()) {
      setError('Please provide prescription text, doctor notes, or photo OCR.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const rx = await extractPrescription({
        textContent: scanText,
        familyMemberId: activeMember.id,
      });
      setSelectedPrescription(rx);
      setIsScanning(false);
      setScanText('');
    } catch (err: any) {
      setError(err.message || 'Failed to extract prescription with AI');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadSampleRx = () => {
    setScanText(
      `Rx - City Central Health Clinic
Dr. Elena Vance, MD, Cardiology
Patient: Alex Morgan (Age 34)
Date: 2026-11-04

Diagnosis: Mild Dyslipidemia Follow-up

1. Tab. Atorvastatin 10mg - 1 tab at bedtime (OD / HS) x 90 days
2. Cap. Vitamin D3 60,000 IU - 1 capsule once weekly on Sunday mornings with milk x 8 weeks
3. Tab. CoQ10 100mg - 1 tab daily after breakfast x 60 days

Advice: Avoid grapefruit juice. Recheck fasting lipid panel in 3 months.`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Digital Prescription Management
          </h2>
          <p className="text-xs text-slate-500">
            AI Prescription Reader automatically parses doctor's handwriting, dosages, frequency, and schedules daily reminders
          </p>
        </div>

        <button
          onClick={() => setIsScanning(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t.scanPrescription}</span>
        </button>
      </div>

      {/* AI Scanner Dialog / Drawer */}
      {isScanning && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-500/50 dark:border-teal-400/50 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Prescription Reader & OCR
              </h3>
            </div>
            <button
              onClick={() => setIsScanning(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleScanPrescription} className="space-y-3">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Doctor's Prescription Text / OCR Notes
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleRx}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  Load Sample Prescription
                </button>
              </div>
              <textarea
                rows={6}
                value={scanText}
                onChange={e => setScanText(e.target.value)}
                placeholder="Paste or type prescription details (Doctor name, hospital, medicines, dosage, instructions)..."
                className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsScanning(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Medications...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & Save to Medicines</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prescription Cards List */}
      <div className="space-y-4">
        {memberPrescriptions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Prescriptions Recorded
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan or enter your doctor's prescriptions to automatically populate your active medicine tracker and reminders.
            </p>
          </div>
        ) : (
          memberPrescriptions.map(rx => (
            <div
              key={rx.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
            >
              {/* Rx Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Doctor Prescription
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-mono text-slate-500">
                      {rx.prescriptionDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    {rx.doctorName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {rx.hospital}
                  </p>
                </div>

                {rx.diagnosis && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                    <span className="text-slate-400 font-semibold mr-1">Diagnosis:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{rx.diagnosis}</strong>
                  </div>
                )}
              </div>

              {/* Medicines Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Medication Name</th>
                      <th className="px-4 py-2.5">Dosage</th>
                      <th className="px-4 py-2.5">Frequency & Timing</th>
                      <th className="px-4 py-2.5">Duration</th>
                      <th className="px-4 py-2.5">Special Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {rx.medicines.map((med, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          <div>{med.name}</div>
                          {med.genericName && (
                            <div className="text-[11px] text-slate-400 font-normal">{med.genericName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium">
                          {med.dosage}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-teal-700 dark:text-teal-300">{med.frequency}</span>
                          {med.timing?.length > 0 && (
                            <span className="text-[11px] text-slate-400 block font-mono">
                              ({med.timing.join(', ')})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {med.duration}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs">
                          {med.instructions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rx.notes && (
                <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <strong>Physician Notes:</strong> {rx.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
