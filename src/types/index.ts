export type DocumentCategory =
  | 'Blood Test'
  | 'CBC'
  | 'Lipid Profile'
  | 'Liver Function (LFT)'
  | 'Kidney Function (KFT)'
  | 'Thyroid Panel'
  | 'Diabetes & HbA1c'
  | 'Urine Test'
  | 'X-Ray'
  | 'MRI Scan'
  | 'CT Scan'
  | 'Ultrasound'
  | 'ECG & Echo'
  | 'Discharge Summary'
  | 'Doctor Prescription'
  | 'Medical Certificate'
  | 'Vaccination Record'
  | 'Other';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'Self' | 'Spouse' | 'Child' | 'Parent' | 'Other';
  age: number;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  chronicConditions: string[];
  avatarUrl?: string;
}

export interface MedicalDocument {
  id: string;
  familyMemberId: string;
  title: string;
  category: DocumentCategory;
  hospital: string;
  testDate: string;
  uploadDate: string;
  doctorName?: string;
  notes?: string;
  tags: string[];
  fileType: 'pdf' | 'jpg' | 'jpeg' | 'png';
  fileSize: string;
  fileUrl: string;
  isAnalyzed: boolean;
  extractedReportId?: string;
}

export interface ExtractedMedicalTest {
  name: string;
  result: string;
  numValue?: number;
  unit: string;
  referenceRange: string;
  minRef?: number;
  maxRef?: number;
  status: 'normal' | 'borderline' | 'abnormal';
  explanation: string;
  possibleReasons?: string;
  discussionAdvice?: string;
}

export interface ExtractedReport {
  id: string;
  documentId: string;
  familyMemberId: string;
  reportType: string;
  hospital: string;
  testDate: string;
  testCategory: DocumentCategory;
  summary: {
    testType: string;
    whyConducted: string;
    mainFindings: string;
    withinRangeCount: number;
    outsideRangeCount: number;
    healthSummary: string;
    doctorQuestions: string[];
  };
  tests: ExtractedMedicalTest[];
  rawText?: string;
  analyzedAt: string;
}

export interface PrescriptionMedicine {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  timing: ('Morning' | 'Afternoon' | 'Evening' | 'Bedtime')[];
}

export interface Prescription {
  id: string;
  familyMemberId: string;
  doctorName: string;
  hospital: string;
  prescriptionDate: string;
  diagnosis?: string;
  medicines: PrescriptionMedicine[];
  notes?: string;
  fileUrl?: string;
  scannedAt?: string;
}

export interface MedicineScheduleLog {
  id: string;
  date: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime';
  status: 'taken' | 'missed' | 'pending';
  timestamp?: string;
}

export interface MedicineItem {
  id: string;
  familyMemberId: string;
  name: string;
  brandName?: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribingDoctor: string;
  instructions: string;
  status: 'active' | 'discontinued';
  timing: ('Morning' | 'Afternoon' | 'Evening' | 'Bedtime')[];
  refillRemainingDoses?: number;
  refillAlertDays?: number;
  expiryDate?: string;
  logs: MedicineScheduleLog[];
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  contactNumber: string;
  address: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  familyMemberId: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  date: string;
  time: string;
  purpose: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Reminder {
  id: string;
  familyMemberId: string;
  title: string;
  type: 'medicine' | 'test' | 'appointment' | 'refill' | 'checkup' | 'custom';
  dueDate: string;
  dueTime?: string;
  status: 'pending' | 'completed';
  description: string;
}

export interface HealthMetric {
  id: string;
  familyMemberId: string;
  date: string;
  type: 'weight' | 'bp_systolic' | 'bp_diastolic' | 'blood_glucose' | 'hba1c' | 'cholesterol' | 'heart_rate';
  value: number;
  unit: string;
}

export interface ChatCitation {
  documentTitle: string;
  testDate: string;
  parameter?: string;
  value?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: ChatCitation[];
}

export interface AppState {
  familyMembers: FamilyMember[];
  activeMemberId: string;
  documents: MedicalDocument[];
  reports: ExtractedReport[];
  prescriptions: Prescription[];
  medicines: MedicineItem[];
  doctors: Doctor[];
  appointments: Appointment[];
  reminders: Reminder[];
  healthMetrics: HealthMetric[];
  chatHistory: ChatMessage[];
  language: 'en' | 'ml';
  theme: 'light' | 'dark';
}
