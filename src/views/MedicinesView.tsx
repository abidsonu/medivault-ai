import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  X,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { MedicineItem } from '../types/index.js';

export const MedicinesView: React.FC = () => {
  const { state, activeMember, logDose, addMedicine, updateMedicine, t } = useApp();

  const [filterTab, setFilterTab] = useState<'active' | 'discontinued'>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New medicine form state
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timings, setTimings] = useState<('Morning' | 'Afternoon' | 'Evening' | 'Bedtime')[]>(['Morning']);
  const [refillDoses, setRefillDoses] = useState('30');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  if (!state || !activeMember) return null;

  const memberMeds = state.medicines.filter(
    m => m.familyMemberId === activeMember.id && m.status === filterTab
  );

  const today = new Date().toISOString().split('T')[0];

  const handleTimingToggle = (slot: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime') => {
    if (timings.includes(slot)) {
      if (timings.length > 1) setTimings(timings.filter(t => t !== slot));
    } else {
      setTimings([...timings, slot]);
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    await addMedicine({
      familyMemberId: activeMember.id,
      name: name.trim(),
      brandName: brandName.trim(),
      genericName: genericName.trim(),
      dosage: dosage.trim(),
      frequency,
      prescribingDoctor: prescribingDoctor.trim() || 'Attending Physician',
      instructions: instructions.trim(),
      status: 'active',
      timing: timings,
      refillRemainingDoses: parseInt(refillDoses) || 30,
      refillAlertDays: 7,
      expiryDate,
      startDate: new Date().toISOString().split('T')[0],
      logs: [],
    });

    setIsAddModalOpen(false);
    setName('');
    setBrandName('');
    setGenericName('');
    setDosage('');
    setInstructions('');
  };

  const handleToggleStatus = async (med: MedicineItem) => {
    const nextStatus = med.status === 'active' ? 'discontinued' : 'active';
    await updateMedicine(med.id, {
      status: nextStatus,
      endDate: nextStatus === 'discontinued' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Medicine & Prescription Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Monitor daily doses, refill thresholds, and adherence for {activeMember.name}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setFilterTab('active')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterTab === 'active'
              ? 'bg-teal-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Active Medications ({state.medicines.filter(m => m.familyMemberId === activeMember.id && m.status === 'active').length})
        </button>
        <button
          onClick={() => setFilterTab('discontinued')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterTab === 'discontinued'
              ? 'bg-teal-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Discontinued History ({state.medicines.filter(m => m.familyMemberId === activeMember.id && m.status === 'discontinued').length})
        </button>
      </div>

      {/* Medications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memberMeds.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Pill className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No {filterTab} medications found.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan a prescription or click "Add Medication" to track schedules and refill reminders.
            </p>
          </div>
        ) : (
          memberMeds.map(med => {
            const lowRefill = med.refillRemainingDoses !== undefined && med.refillRemainingDoses <= 14;

            return (
              <div
                key={med.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top line */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {med.name}
                        </h3>
                        <span className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
                          {med.dosage}
                        </span>
                      </div>
                      {med.genericName && (
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {med.genericName} {med.brandName ? `(${med.brandName})` : ''}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        med.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {med.status}
                    </span>
                  </div>

                  {/* Doctor & Frequency */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p>
                      <strong className="text-slate-700 dark:text-slate-300">Schedule:</strong> {med.frequency} ({med.timing.join(', ')})
                    </p>
                    <p>
                      <strong className="text-slate-700 dark:text-slate-300">Doctor:</strong> {med.prescribingDoctor}
                    </p>
                    {med.instructions && (
                      <p className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-slate-600 dark:text-slate-400">
                        {med.instructions}
                      </p>
                    )}
                  </div>

                  {/* Dose Tracker for Today (If Active) */}
                  {med.status === 'active' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Today's Doses
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {med.timing.map(slot => {
                          const log = med.logs.find(l => l.date === today && l.timeSlot === slot);
                          const isTaken = log?.status === 'taken';

                          return (
                            <button
                              key={slot}
                              onClick={() => logDose(med.id, slot, isTaken ? 'missed' : 'taken')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                isTaken
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{slot}: {isTaken ? 'Taken' : 'Mark Taken'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Refill Info */}
                  {med.refillRemainingDoses !== undefined && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                      <span className={lowRefill ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}>
                        {lowRefill ? '⚠️ Low Supply: ' : ''}{med.refillRemainingDoses} doses left
                      </span>
                      {med.expiryDate && <span>Exp: {med.expiryDate}</span>}
                    </div>
                  )}
                </div>

                {/* Bottom Toggle Discontinue */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Started {med.startDate}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(med)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                  >
                    {med.status === 'active' ? 'Mark Discontinued' : 'Reactivate Medicine'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <span>
          <strong>Patient Safety Protocol:</strong> MediVault AI tracks prescribed dosages accurately. Never alter, pause, or adjust prescription strengths without the direct instruction of your prescribing physician.
        </span>
      </div>

      {/* Add Medication Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add New Medication
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="p-5 space-y-3.5 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Metformin or Atorvastatin"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Dosage / Strength *
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="e.g. 500 mg or 10 mg"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder="e.g. Glucophage"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Once weekly">Once weekly</option>
                    <option value="As needed (SOS)">As needed (SOS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Prescribing Doctor
                  </label>
                  <input
                    type="text"
                    value={prescribingDoctor}
                    onChange={e => setPrescribingDoctor(e.target.value)}
                    placeholder="e.g. Dr. Elena Vance"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Timing of Day
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Morning', 'Afternoon', 'Evening', 'Bedtime'] as const).map(slot => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => handleTimingToggle(slot)}
                        className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer ${
                          timings.includes(slot)
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Instructions / Notes
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder="e.g. Take after food with warm water"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
