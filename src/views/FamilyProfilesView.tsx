import React, { useState } from 'react';
import {
  Users,
  Plus,
  User,
  Heart,
  Droplets,
  Scale,
  ShieldAlert,
  Phone,
  Check,
  X,
  Edit2,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { FamilyMember } from '../types/index.js';

export const FamilyProfilesView: React.FC = () => {
  const { state, activeMember, switchActiveMember, addFamilyMember, updateFamilyMember, t } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('Other');
  const [age, setAge] = useState('30');
  const [dob, setDob] = useState('1996-01-01');
  const [gender, setGender] = useState<FamilyMember['gender']>('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [heightCm, setHeightCm] = useState('165');
  const [weightKg, setWeightKg] = useState('62');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');

  if (!state) return null;

  const handleOpenAdd = () => {
    setEditingMember(null);
    setName('');
    setRelationship('Other');
    setAge('30');
    setDob('1996-01-01');
    setGender('Female');
    setBloodGroup('O+');
    setHeightCm('165');
    setWeightKg('62');
    setContactName('');
    setContactPhone('');
    setAllergiesText('');
    setConditionsText('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (m: FamilyMember) => {
    setEditingMember(m);
    setName(m.name);
    setRelationship(m.relationship);
    setAge(m.age.toString());
    setDob(m.dob);
    setGender(m.gender);
    setBloodGroup(m.bloodGroup);
    setHeightCm(m.heightCm.toString());
    setWeightKg(m.weightKg.toString());
    setContactName(m.emergencyContact.name);
    setContactPhone(m.emergencyContact.phone);
    setAllergiesText(m.allergies.join(', '));
    setConditionsText(m.chronicConditions.join(', '));
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const allergies = allergiesText.split(',').map(s => s.trim()).filter(Boolean);
    const chronicConditions = conditionsText.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name: name.trim(),
      relationship,
      age: parseInt(age) || 30,
      dob,
      gender,
      bloodGroup,
      heightCm: parseInt(heightCm) || 165,
      weightKg: parseInt(weightKg) || 60,
      emergencyContact: {
        name: contactName.trim() || 'Primary Contact',
        relationship: 'Family',
        phone: contactPhone.trim(),
      },
      allergies,
      chronicConditions,
    };

    if (editingMember) {
      await updateFamilyMember(editingMember.id, payload);
    } else {
      await addFamilyMember(payload);
    }

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Family Member Profiles
          </h2>
          <p className="text-xs text-slate-500">
            Manage separate, private medical vaults for your entire family under one centralized account
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Family Profile</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.familyMembers.map(member => {
          const isActive = member.id === activeMember?.id;
          const memberDocs = state.documents.filter(d => d.familyMemberId === member.id);
          const memberMeds = state.medicines.filter(m => m.familyMemberId === member.id && m.status === 'active');
          const heightM = member.heightCm / 100;
          const bmi = heightM > 0 ? (member.weightKg / (heightM * heightM)).toFixed(1) : 'N/A';

          return (
            <div
              key={member.id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between shadow-xs ${
                isActive
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* Top bar with Relationship Badge and Active tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                    {member.relationship.toUpperCase()}
                  </span>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 text-teal-600" />
                      Active Patient
                    </span>
                  ) : (
                    <button
                      onClick={() => switchActiveMember(member.id)}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Switch to this vault
                    </button>
                  )}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 flex items-center justify-center text-base font-bold font-mono">
                      {member.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {member.age} yrs · {member.gender} · DOB: {member.dob}
                    </p>
                  </div>
                </div>

                {/* Vitals Summary Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Blood</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">{member.bloodGroup}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Weight</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{member.weightKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">BMI</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{bmi}</strong>
                  </div>
                </div>

                {/* Allergies & Conditions */}
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Allergies: </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {member.allergies.length > 0 ? member.allergies.join(', ') : 'None recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">Conditions: </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {member.chronicConditions.length > 0 ? member.chronicConditions.join(', ') : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {memberDocs.length} Docs · {memberMeds.length} Meds
                </span>
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Profile Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingMember ? 'Edit Profile' : 'Add Family Member'}
              </h3>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. David Morgan"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => {
                      setDob(e.target.value);
                      const calculatedAge = new Date().getFullYear() - new Date(e.target.value).getFullYear();
                      if (calculatedAge > 0) setAge(calculatedAge.toString());
                    }}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={e => setHeightCm(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    value={allergiesText}
                    onChange={e => setAllergiesText(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Chronic Conditions (comma separated)
                  </label>
                  <input
                    type="text"
                    value={conditionsText}
                    onChange={e => setConditionsText(e.target.value)}
                    placeholder="e.g. Asthma, Hypertension, Type 2 Diabetes"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. David Morgan"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 234-5678"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
