import React, { useState } from 'react';
import {
  Stethoscope,
  Building,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { Doctor, Appointment } from '../types/index.js';

export const DoctorsView: React.FC = () => {
  const { state, activeMember, addDoctor, addAppointment, t } = useApp();

  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDoctorForApt, setSelectedDoctorForApt] = useState<Doctor | null>(null);

  // New Doctor form
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // New Appointment form
  const [aptDate, setAptDate] = useState('2026-11-20');
  const [aptTime, setAptTime] = useState('11:00 AM');
  const [purpose, setPurpose] = useState('');

  if (!state || !activeMember) return null;

  const memberAppointments = state.appointments.filter(a => a.familyMemberId === activeMember.id);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addDoctor({
      name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
      specialization: specialization.trim() || 'General Medicine',
      hospital: hospital.trim() || 'Medical Clinic',
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      notes: notes.trim(),
    });

    setIsAddDoctorOpen(false);
    setName('');
    setSpecialization('');
    setHospital('');
    setContactNumber('');
    setAddress('');
    setNotes('');
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForApt || !purpose.trim()) return;

    await addAppointment({
      familyMemberId: activeMember.id,
      doctorId: selectedDoctorForApt.id,
      doctorName: selectedDoctorForApt.name,
      hospital: selectedDoctorForApt.hospital,
      date: aptDate,
      time: aptTime,
      purpose: purpose.trim(),
      status: 'upcoming',
    });

    setIsScheduleOpen(false);
    setPurpose('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Doctors & Healthcare Providers
          </h2>
          <p className="text-xs text-slate-500">
            Manage your network of attending physicians, specialists, clinics, and scheduled appointments
          </p>
        </div>

        <button
          onClick={() => setIsAddDoctorOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Provider</span>
        </button>
      </div>

      {/* Upcoming Appointments Strip */}
      {memberAppointments.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Scheduled Consultations for {activeMember.name}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {memberAppointments.map(apt => (
              <div
                key={apt.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{apt.doctorName}</h4>
                  <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mt-0.5">{apt.purpose}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    {apt.hospital} · {apt.date} at {apt.time}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded">
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.doctors.map(doc => {
          const linkedPrescriptions = state.prescriptions.filter(p => p.doctorName.includes(doc.name) || doc.name.includes(p.doctorName));
          const linkedDocs = state.documents.filter(d => d.doctorName && (d.doctorName.includes(doc.name) || doc.name.includes(d.doctorName)));

          return (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</h3>
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">{doc.specialization}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{doc.hospital}</span>
                  </div>
                  {doc.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${doc.contactNumber}`} className="font-mono hover:underline text-teal-600 dark:text-teal-400">
                        {doc.contactNumber}
                      </a>
                    </div>
                  )}
                  {doc.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.address}</span>
                    </div>
                  )}
                </div>

                {doc.notes && (
                  <p className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg text-slate-600 dark:text-slate-400">
                    {doc.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {linkedPrescriptions.length} Rx · {linkedDocs.length} Reports
                </span>
                <button
                  onClick={() => {
                    setSelectedDoctorForApt(doc);
                    setIsScheduleOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                >
                  Schedule Visit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Doctor Modal */}
      {isAddDoctorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Healthcare Provider
              </h3>
              <button onClick={() => setIsAddDoctorOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-5 space-y-3 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Elena Vance"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  placeholder="e.g. Cardiology, Hematology, Pediatrics"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hospital / Clinic
                </label>
                <input
                  type="text"
                  value={hospital}
                  onChange={e => setHospital(e.target.value)}
                  placeholder="e.g. City Central Health Clinic"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Suite 400, 720 Lexington Ave, NY"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {isScheduleOpen && selectedDoctorForApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Schedule Appointment
                </h3>
                <p className="text-xs text-slate-500 font-medium">with {selectedDoctorForApt.name}</p>
              </div>
              <button onClick={() => setIsScheduleOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Purpose / Consultation Reason *
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="e.g. 6-Month Statin & Lipid Follow-up"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={e => setAptDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    value={aptTime}
                    onChange={e => setAptTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
