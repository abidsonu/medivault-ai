import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { analyzeMedicalReport, extractPrescriptionWithAI, askHealthAssistantAI } from './server/gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Allow large payloads for base64 medical documents / PDFs / scans
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// ----------------- API Endpoints -----------------

// 1. Get entire app state
app.get('/api/state', (_req: Request, res: Response) => {
  res.json(db.getState());
});

// 2. Set active family member
app.post('/api/active-member', (req: Request, res: Response) => {
  const { memberId } = req.body;
  if (!memberId) {
    return res.status(400).json({ error: 'memberId is required' });
  }
  const updatedState = db.setActiveMember(memberId);
  res.json(updatedState);
});

// 3. Reset to clean seed data
app.post('/api/reset-seed', (_req: Request, res: Response) => {
  const state = db.resetToSeed();
  res.json(state);
});

// 4. Documents CRUD
app.post('/api/documents', (req: Request, res: Response) => {
  try {
    const { title, category, hospital, testDate, doctorName, notes, tags, fileType, fileSize, fileUrl, familyMemberId } = req.body;
    const newDoc = {
      id: `doc_${Date.now()}`,
      familyMemberId: familyMemberId || db.getState().activeMemberId,
      title: title || 'Untitled Medical Document',
      category: category || 'Blood Test',
      hospital: hospital || 'Diagnostic Clinic',
      testDate: testDate || new Date().toISOString().split('T')[0],
      uploadDate: new Date().toISOString().split('T')[0],
      doctorName: doctorName || '',
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : [],
      fileType: fileType || 'pdf',
      fileSize: fileSize || '1.2 MB',
      fileUrl: fileUrl || '/src/assets/images/sample_lab_report_1793892778141.jpg',
      isAnalyzed: false,
    };
    db.addDocument(newDoc);
    res.json(newDoc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/documents/:id', (req: Request, res: Response) => {
  const doc = db.updateDocument(req.params.id, req.body);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  db.deleteDocument(req.params.id);
  res.json({ success: true });
});

// 5. AI Medical Report Analysis
app.post('/api/analyze-report', async (req: Request, res: Response) => {
  try {
    const { documentId, textContent, base64Data, mimeType, documentTitle, category } = req.body;
    const state = db.getState();
    const doc = state.documents.find(d => d.id === documentId);

    const title = documentTitle || doc?.title || 'Clinical Laboratory Report';
    const cat = category || doc?.category || 'Blood Test';
    const memberId = doc?.familyMemberId || state.activeMemberId;

    const report = await analyzeMedicalReport({
      documentTitle: title,
      category: cat,
      textContent: textContent || doc?.notes,
      base64Data,
      mimeType,
      documentId: documentId || `doc_${Date.now()}`,
      familyMemberId: memberId,
    });

    db.addReport(report);
    res.json(report);
  } catch (err: any) {
    console.error('Error analyzing report with Gemini:', err);
    res.status(500).json({
      error: err.message || 'AI Report Analysis encountered an unexpected error.',
    });
  }
});

// 6. AI Prescription Reader
app.post('/api/extract-prescription', async (req: Request, res: Response) => {
  try {
    const { textContent, base64Data, mimeType, familyMemberId } = req.body;
    const memberId = familyMemberId || db.getState().activeMemberId;

    const extracted = await extractPrescriptionWithAI({
      textContent,
      base64Data,
      mimeType,
      familyMemberId: memberId,
    });

    const newRx = {
      id: `rx_${Date.now()}`,
      familyMemberId: memberId,
      doctorName: extracted.doctorName || 'Attending Physician',
      hospital: extracted.hospital || 'Medical Center',
      prescriptionDate: extracted.prescriptionDate || new Date().toISOString().split('T')[0],
      diagnosis: extracted.diagnosis || 'Prescribed Medical Care',
      notes: extracted.notes || '',
      medicines: extracted.medicines || [],
      fileUrl: '/src/assets/images/sample_lab_report_1793892778141.jpg',
      scannedAt: new Date().toISOString(),
    };

    db.addPrescription(newRx);

    // Auto-create active medicines from extracted prescription
    for (const med of newRx.medicines) {
      db.addMedicine({
        id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        familyMemberId: memberId,
        name: med.name,
        genericName: med.genericName,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: newRx.prescriptionDate,
        prescribingDoctor: newRx.doctorName,
        instructions: med.instructions,
        status: 'active',
        timing: (med.timing?.length ? med.timing : ['Morning']) as any,
        refillRemainingDoses: 30,
        refillAlertDays: 7,
        logs: [],
      });
    }

    res.json(newRx);
  } catch (err: any) {
    console.error('Error in prescription extraction:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. MediVault AI Health Assistant (Chat grounded in verified patient records)
app.post('/api/chat-assistant', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const state = db.getState();
    const activeMember = state.familyMembers.find(m => m.id === state.activeMemberId) || state.familyMembers[0];
    const memberReports = state.reports.filter(r => r.familyMemberId === activeMember.id);
    const memberDocs = state.documents.filter(d => d.familyMemberId === activeMember.id);
    const memberMeds = state.medicines.filter(m => m.familyMemberId === activeMember.id);
    const memberApts = state.appointments.filter(a => a.familyMemberId === activeMember.id);

    // Add user message to history
    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user' as const,
      text: query,
      timestamp: new Date().toISOString(),
    };
    db.addChatMessage(userMsg);

    // Query Gemini
    const result = await askHealthAssistantAI({
      query,
      memberProfile: activeMember,
      documents: memberDocs,
      reports: memberReports,
      medicines: memberMeds,
      appointments: memberApts,
      chatHistory: state.chatHistory,
    });

    const assistantMsg = {
      id: `msg_${Date.now() + 1}`,
      sender: 'assistant' as const,
      text: result.response,
      timestamp: new Date().toISOString(),
      citations: result.citations,
    };
    db.addChatMessage(assistantMsg);

    res.json({ message: assistantMsg });
  } catch (err: any) {
    console.error('Error in chat assistant:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Medicines Management
app.post('/api/medicines', (req: Request, res: Response) => {
  const state = db.getState();
  const med = {
    id: `med_${Date.now()}`,
    familyMemberId: req.body.familyMemberId || state.activeMemberId,
    name: req.body.name,
    brandName: req.body.brandName,
    genericName: req.body.genericName,
    dosage: req.body.dosage,
    frequency: req.body.frequency,
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate,
    prescribingDoctor: req.body.prescribingDoctor || 'Attending Physician',
    instructions: req.body.instructions || '',
    status: (req.body.status || 'active') as 'active' | 'discontinued',
    timing: req.body.timing || ['Morning'],
    refillRemainingDoses: req.body.refillRemainingDoses ? Number(req.body.refillRemainingDoses) : undefined,
    refillAlertDays: req.body.refillAlertDays ? Number(req.body.refillAlertDays) : undefined,
    expiryDate: req.body.expiryDate,
    logs: [],
  };
  db.addMedicine(med);
  res.json(med);
});

app.post('/api/medicines/:id/log', (req: Request, res: Response) => {
  const { timeSlot, status } = req.body;
  const updated = db.logMedicineDose(req.params.id, timeSlot, status);
  if (!updated) return res.status(404).json({ error: 'Medicine not found' });
  res.json(updated);
});

app.put('/api/medicines/:id', (req: Request, res: Response) => {
  const updated = db.updateMedicine(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Medicine not found' });
  res.json(updated);
});

// 9. Reminders Management
app.post('/api/reminders', (req: Request, res: Response) => {
  const state = db.getState();
  const rem = {
    id: `rem_${Date.now()}`,
    familyMemberId: req.body.familyMemberId || state.activeMemberId,
    title: req.body.title,
    type: req.body.type || 'custom',
    dueDate: req.body.dueDate,
    dueTime: req.body.dueTime,
    status: 'pending' as const,
    description: req.body.description || '',
  };
  db.addReminder(rem);
  res.json(rem);
});

app.post('/api/reminders/:id/toggle', (req: Request, res: Response) => {
  const rem = db.toggleReminder(req.params.id);
  if (!rem) return res.status(404).json({ error: 'Reminder not found' });
  res.json(rem);
});

app.delete('/api/reminders/:id', (req: Request, res: Response) => {
  db.deleteReminder(req.params.id);
  res.json({ success: true });
});

// 10. Appointments and Doctors
app.post('/api/appointments', (req: Request, res: Response) => {
  const state = db.getState();
  const apt = {
    id: `apt_${Date.now()}`,
    familyMemberId: req.body.familyMemberId || state.activeMemberId,
    doctorId: req.body.doctorId,
    doctorName: req.body.doctorName,
    hospital: req.body.hospital,
    date: req.body.date,
    time: req.body.time,
    purpose: req.body.purpose,
    status: 'upcoming' as const,
    notes: req.body.notes,
  };
  db.addAppointment(apt);
  res.json(apt);
});

app.post('/api/doctors', (req: Request, res: Response) => {
  const doc = {
    id: `doc_${Date.now()}`,
    name: req.body.name,
    specialization: req.body.specialization,
    hospital: req.body.hospital,
    contactNumber: req.body.contactNumber,
    address: req.body.address,
    notes: req.body.notes,
  };
  db.addDoctor(doc);
  res.json(doc);
});

// 11. Family Members
app.post('/api/family-members', (req: Request, res: Response) => {
  const member = {
    id: `fam_${Date.now()}`,
    name: req.body.name,
    relationship: req.body.relationship || 'Other',
    age: Number(req.body.age) || 30,
    dob: req.body.dob || '1995-01-01',
    gender: req.body.gender || 'Other',
    bloodGroup: req.body.bloodGroup || 'O+',
    heightCm: Number(req.body.heightCm) || 170,
    weightKg: Number(req.body.weightKg) || 70,
    emergencyContact: req.body.emergencyContact || { name: '', relationship: '', phone: '' },
    allergies: req.body.allergies || [],
    chronicConditions: req.body.chronicConditions || [],
  };
  db.addFamilyMember(member);
  res.json(member);
});

app.put('/api/family-members/:id', (req: Request, res: Response) => {
  const member = db.updateFamilyMember(req.params.id, req.body);
  if (!member) return res.status(404).json({ error: 'Family member not found' });
  res.json(member);
});

// 12. Health Metrics
app.post('/api/health-metrics', (req: Request, res: Response) => {
  const state = db.getState();
  const metric = {
    id: `hm_${Date.now()}`,
    familyMemberId: req.body.familyMemberId || state.activeMemberId,
    date: req.body.date || new Date().toISOString().split('T')[0],
    type: req.body.type,
    value: Number(req.body.value),
    unit: req.body.unit,
  };
  db.addHealthMetric(metric);
  res.json(metric);
});

// ----------------- Vite Integration -----------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[MediVault AI Server] Running on http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
