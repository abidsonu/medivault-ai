import fs from 'fs';
import path from 'path';
import { AppState, FamilyMember, MedicalDocument, ExtractedReport, Prescription, MedicineItem, Doctor, Appointment, Reminder, HealthMetric, ChatMessage } from '../src/types/index.js';
import {
  initialFamilyMembers,
  initialDocuments,
  initialReports,
  initialPrescriptions,
  initialMedicines,
  initialDoctors,
  initialAppointments,
  initialReminders,
  initialHealthMetrics,
  initialChatHistory,
} from './seedData.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'medivault-db.json');

class DatabaseStore {
  private data: AppState;

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): AppState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.familyMembers && parsed.documents) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing db file, resetting to fresh seed data:', e);
    }

    const defaultState: AppState = {
      familyMembers: initialFamilyMembers,
      activeMemberId: 'fam_1',
      documents: initialDocuments,
      reports: initialReports,
      prescriptions: initialPrescriptions,
      medicines: initialMedicines,
      doctors: initialDoctors,
      appointments: initialAppointments,
      reminders: initialReminders,
      healthMetrics: initialHealthMetrics,
      chatHistory: initialChatHistory,
      language: 'en',
      theme: 'light',
    };

    this.saveData(defaultState);
    return defaultState;
  }

  private saveData(state: AppState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write medivault-db.json:', e);
    }
  }

  public getState(): AppState {
    return this.data;
  }

  public resetToSeed(): AppState {
    this.data = {
      familyMembers: initialFamilyMembers,
      activeMemberId: 'fam_1',
      documents: initialDocuments,
      reports: initialReports,
      prescriptions: initialPrescriptions,
      medicines: initialMedicines,
      doctors: initialDoctors,
      appointments: initialAppointments,
      reminders: initialReminders,
      healthMetrics: initialHealthMetrics,
      chatHistory: initialChatHistory,
      language: 'en',
      theme: 'light',
    };
    this.saveData(this.data);
    return this.data;
  }

  public setActiveMember(id: string) {
    this.data.activeMemberId = id;
    this.saveData(this.data);
    return this.data;
  }

  public addDocument(doc: MedicalDocument) {
    this.data.documents.unshift(doc);
    this.saveData(this.data);
    return doc;
  }

  public updateDocument(id: string, updates: Partial<MedicalDocument>) {
    const idx = this.data.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.documents[idx] = { ...this.data.documents[idx], ...updates };
      this.saveData(this.data);
      return this.data.documents[idx];
    }
    return null;
  }

  public deleteDocument(id: string) {
    this.data.documents = this.data.documents.filter(d => d.id !== id);
    this.data.reports = this.data.reports.filter(r => r.documentId !== id);
    this.saveData(this.data);
    return true;
  }

  public addReport(report: ExtractedReport) {
    this.data.reports = this.data.reports.filter(r => r.documentId !== report.documentId);
    this.data.reports.unshift(report);
    const doc = this.data.documents.find(d => d.id === report.documentId);
    if (doc) {
      doc.isAnalyzed = true;
      doc.extractedReportId = report.id;
    }
    this.saveData(this.data);
    return report;
  }

  public addPrescription(rx: Prescription) {
    this.data.prescriptions.unshift(rx);
    this.saveData(this.data);
    return rx;
  }

  public addMedicine(med: MedicineItem) {
    this.data.medicines.unshift(med);
    this.saveData(this.data);
    return med;
  }

  public updateMedicine(id: string, updates: Partial<MedicineItem>) {
    const idx = this.data.medicines.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.medicines[idx] = { ...this.data.medicines[idx], ...updates };
      this.saveData(this.data);
      return this.data.medicines[idx];
    }
    return null;
  }

  public logMedicineDose(medId: string, timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime', status: 'taken' | 'missed') {
    const med = this.data.medicines.find(m => m.id === medId);
    if (med) {
      const today = new Date().toISOString().split('T')[0];
      const existingLog = med.logs.find(l => l.date === today && l.timeSlot === timeSlot);
      if (existingLog) {
        existingLog.status = status;
        existingLog.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        med.logs.push({
          id: `log_${Date.now()}`,
          date: today,
          timeSlot,
          status,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
      if (status === 'taken' && med.refillRemainingDoses && med.refillRemainingDoses > 0) {
        med.refillRemainingDoses -= 1;
      }
      this.saveData(this.data);
      return med;
    }
    return null;
  }

  public addReminder(reminder: Reminder) {
    this.data.reminders.unshift(reminder);
    this.saveData(this.data);
    return reminder;
  }

  public toggleReminder(id: string) {
    const rem = this.data.reminders.find(r => r.id === id);
    if (rem) {
      rem.status = rem.status === 'completed' ? 'pending' : 'completed';
      this.saveData(this.data);
      return rem;
    }
    return null;
  }

  public deleteReminder(id: string) {
    this.data.reminders = this.data.reminders.filter(r => r.id !== id);
    this.saveData(this.data);
    return true;
  }

  public addDoctor(doctor: Doctor) {
    this.data.doctors.unshift(doctor);
    this.saveData(this.data);
    return doctor;
  }

  public addAppointment(apt: Appointment) {
    this.data.appointments.unshift(apt);
    this.saveData(this.data);
    return apt;
  }

  public addFamilyMember(member: FamilyMember) {
    this.data.familyMembers.push(member);
    this.saveData(this.data);
    return member;
  }

  public updateFamilyMember(id: string, updates: Partial<FamilyMember>) {
    const idx = this.data.familyMembers.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.data.familyMembers[idx] = { ...this.data.familyMembers[idx], ...updates };
      this.saveData(this.data);
      return this.data.familyMembers[idx];
    }
    return null;
  }

  public addChatMessage(msg: ChatMessage) {
    this.data.chatHistory.push(msg);
    this.saveData(this.data);
    return msg;
  }

  public addHealthMetric(metric: HealthMetric) {
    this.data.healthMetrics.push(metric);
    this.saveData(this.data);
    return metric;
  }
}

export const db = new DatabaseStore();
