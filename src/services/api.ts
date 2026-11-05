import { AppState, MedicalDocument, ExtractedReport, Prescription, MedicineItem, Reminder, Doctor, Appointment, FamilyMember, ChatMessage, HealthMetric } from '../types/index.js';

export async function fetchAppState(): Promise<AppState> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Failed to fetch state');
  return res.json();
}

export async function setActiveFamilyMember(memberId: string): Promise<AppState> {
  const res = await fetch('/api/active-member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId }),
  });
  if (!res.ok) throw new Error('Failed to switch family member');
  return res.json();
}

export async function resetDatabaseSeed(): Promise<AppState> {
  const res = await fetch('/api/reset-seed', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

export async function uploadMedicalDocument(payload: Partial<MedicalDocument>): Promise<MedicalDocument> {
  const res = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
}

export async function updateMedicalDocument(id: string, payload: Partial<MedicalDocument>): Promise<MedicalDocument> {
  const res = await fetch(`/api/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update document');
  return res.json();
}

export async function deleteMedicalDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function triggerAiReportAnalysis(payload: {
  documentId?: string;
  documentTitle?: string;
  category?: string;
  textContent?: string;
  base64Data?: string;
  mimeType?: string;
}): Promise<ExtractedReport> {
  const res = await fetch('/api/analyze-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze report with AI');
  }
  return res.json();
}

export async function triggerAiPrescriptionExtract(payload: {
  textContent?: string;
  base64Data?: string;
  mimeType?: string;
  familyMemberId?: string;
}): Promise<Prescription> {
  const res = await fetch('/api/extract-prescription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to extract prescription with AI');
  }
  return res.json();
}

export async function sendChatMessageToAssistant(query: string): Promise<ChatMessage> {
  const res = await fetch('/api/chat-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send query to MediVault Assistant');
  }
  const data = await res.json();
  return data.message;
}

export async function createMedicine(payload: Partial<MedicineItem>): Promise<MedicineItem> {
  const res = await fetch('/api/medicines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save medicine');
  return res.json();
}

export async function logMedicineDose(medId: string, timeSlot: string, status: 'taken' | 'missed'): Promise<MedicineItem> {
  const res = await fetch(`/api/medicines/${medId}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeSlot, status }),
  });
  if (!res.ok) throw new Error('Failed to log dose');
  return res.json();
}

export async function updateMedicine(id: string, payload: Partial<MedicineItem>): Promise<MedicineItem> {
  const res = await fetch(`/api/medicines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update medicine');
  return res.json();
}

export async function createReminder(payload: Partial<Reminder>): Promise<Reminder> {
  const res = await fetch('/api/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create reminder');
  return res.json();
}

export async function toggleReminder(id: string): Promise<Reminder> {
  const res = await fetch(`/api/reminders/${id}/toggle`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle reminder');
  return res.json();
}

export async function deleteReminder(id: string): Promise<void> {
  const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete reminder');
}

export async function createDoctor(payload: Partial<Doctor>): Promise<Doctor> {
  const res = await fetch('/api/doctors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create doctor');
  return res.json();
}

export async function createAppointment(payload: Partial<Appointment>): Promise<Appointment> {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create appointment');
  return res.json();
}

export async function createFamilyMember(payload: Partial<FamilyMember>): Promise<FamilyMember> {
  const res = await fetch('/api/family-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add family member');
  return res.json();
}

export async function updateFamilyMember(id: string, payload: Partial<FamilyMember>): Promise<FamilyMember> {
  const res = await fetch(`/api/family-members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update family member');
  return res.json();
}

export async function createHealthMetric(payload: Partial<HealthMetric>): Promise<HealthMetric> {
  const res = await fetch('/api/health-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add health metric');
  return res.json();
}
