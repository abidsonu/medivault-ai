import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedReport, ExtractedMedicalTest, PrescriptionMedicine } from '../src/types/index.js';

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function analyzeMedicalReport(params: {
  documentTitle: string;
  category: string;
  textContent?: string;
  base64Data?: string;
  mimeType?: string;
  documentId: string;
  familyMemberId: string;
}): Promise<ExtractedReport> {
  const { documentTitle, category, textContent, base64Data, mimeType, documentId, familyMemberId } = params;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const systemInstruction = `You are MediVault AI, an expert clinical diagnostic report extraction system and patient educator.
Your task is to analyze medical laboratory reports, imaging reports, or diagnostic sheets.
Follow these clinical rules strictly:
1. Extract ALL individual medical tests with exact measured numerical or categorical results, units, and stated laboratory reference ranges.
2. For each test, accurately classify status as 'normal', 'borderline', or 'abnormal' according to the printed reference bounds.
3. Provide an educational explanation in clear, simple, reassuring English (6th-grade reading level) explaining what the test measures.
4. For borderline or abnormal values, describe physiological reasons and what to discuss with a physician.
5. Provide a high-level summary of the report: test type, why it is conducted, main findings, within range count, outside range count, overall health summary, and 3-4 specific questions the patient should ask their doctor.
6. Important: Do not offer definitive diagnoses or prescribe treatments. Emphasize that only their doctor can diagnose.
7. Return strictly valid structured JSON matching the requested schema.`;

  const contents: any[] = [];

  if (base64Data && mimeType) {
    contents.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data.replace(/^data:[^;]+;base64,/, ''),
      },
    });
  }

  const promptText = `Please thoroughly analyze this medical report.
Document Title: ${documentTitle}
Specified Category: ${category}
${textContent ? `Provided Report Content / OCR Notes:\n${textContent}` : 'Please perform optical character recognition (OCR) and diagnostic extraction on the attached document.'}

Extract all individual test parameters into the schema, calculate normal vs abnormal counts, explain each test simply, and formulate proactive questions for their doctor.`;

  contents.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: { parts: contents },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reportType: { type: Type.STRING, description: 'Specific medical report type e.g. Complete Blood Count (CBC)' },
          hospital: { type: Type.STRING, description: 'Laboratory or hospital name found on report' },
          testDate: { type: Type.STRING, description: 'Date of the test in YYYY-MM-DD or as printed' },
          testCategory: { type: Type.STRING, description: 'Medical category' },
          summary: {
            type: Type.OBJECT,
            properties: {
              testType: { type: Type.STRING },
              whyConducted: { type: Type.STRING },
              mainFindings: { type: Type.STRING },
              withinRangeCount: { type: Type.INTEGER },
              outsideRangeCount: { type: Type.INTEGER },
              healthSummary: { type: Type.STRING },
              doctorQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['testType', 'whyConducted', 'mainFindings', 'withinRangeCount', 'outsideRangeCount', 'healthSummary', 'doctorQuestions'],
          },
          tests: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                result: { type: Type.STRING },
                numValue: { type: Type.NUMBER, description: 'Numeric representation if applicable' },
                unit: { type: Type.STRING },
                referenceRange: { type: Type.STRING },
                minRef: { type: Type.NUMBER },
                maxRef: { type: Type.NUMBER },
                status: { type: Type.STRING, description: 'normal, borderline, or abnormal' },
                explanation: { type: Type.STRING },
                possibleReasons: { type: Type.STRING },
                discussionAdvice: { type: Type.STRING },
              },
              required: ['name', 'result', 'unit', 'referenceRange', 'status', 'explanation'],
            },
          },
        },
        required: ['reportType', 'hospital', 'testDate', 'summary', 'tests'],
      },
    },
  });

  const rawJson = response.text || '{}';
  const parsed = JSON.parse(rawJson);

  const tests: ExtractedMedicalTest[] = (parsed.tests || []).map((t: any) => ({
    name: t.name || 'Unknown Parameter',
    result: String(t.result ?? ''),
    numValue: typeof t.numValue === 'number' ? t.numValue : parseFloat(t.result) || undefined,
    unit: t.unit || '',
    referenceRange: t.referenceRange || 'Lab Reference',
    minRef: t.minRef,
    maxRef: t.maxRef,
    status: (['normal', 'borderline', 'abnormal'].includes(t.status?.toLowerCase()) ? t.status.toLowerCase() : 'normal') as any,
    explanation: t.explanation || '',
    possibleReasons: t.possibleReasons,
    discussionAdvice: t.discussionAdvice,
  }));

  const normalCount = tests.filter(t => t.status === 'normal').length;
  const abnormalCount = tests.filter(t => t.status !== 'normal').length;

  const resultReport: ExtractedReport = {
    id: `rep_${Date.now()}`,
    documentId,
    familyMemberId,
    reportType: parsed.reportType || documentTitle,
    hospital: parsed.hospital || 'Diagnostic Laboratory',
    testDate: parsed.testDate || new Date().toISOString().split('T')[0],
    testCategory: (category as any) || 'Blood Test',
    analyzedAt: new Date().toISOString(),
    summary: {
      testType: parsed.summary?.testType || parsed.reportType || documentTitle,
      whyConducted: parsed.summary?.whyConducted || 'Diagnostic evaluation and wellness tracking.',
      mainFindings: parsed.summary?.mainFindings || 'Test results evaluated against standard reference ranges.',
      withinRangeCount: parsed.summary?.withinRangeCount ?? normalCount,
      outsideRangeCount: parsed.summary?.outsideRangeCount ?? abnormalCount,
      healthSummary: parsed.summary?.healthSummary || 'All parameters reviewed. Consult your healthcare provider for clinical correlation.',
      doctorQuestions: parsed.summary?.doctorQuestions || [
        'How do these results compare with my previous tests?',
        'Do any of these findings require lifestyle or dietary adjustments?',
        'When should I schedule my next follow-up panel?',
      ],
    },
    tests,
  };

  return resultReport;
}

export async function extractPrescriptionWithAI(params: {
  textContent?: string;
  base64Data?: string;
  mimeType?: string;
  familyMemberId: string;
}) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const systemInstruction = `You are MediVault AI Prescription Reader.
Extract all medications, prescribing doctor details, instructions, and duration from the prescription document or image.
If handwriting is unclear, note in instructions "Verify with pharmacist/doctor".
Extract timing slots (Morning, Afternoon, Evening, Bedtime) based on frequency indications (e.g. OD/morning, BD, TDS, QDS, HS/bedtime).`;

  const contents: any[] = [];
  if (params.base64Data && params.mimeType) {
    contents.push({
      inlineData: {
        mimeType: params.mimeType,
        data: params.base64Data.replace(/^data:[^;]+;base64,/, ''),
      },
    });
  }

  contents.push({
    text: `Please parse this prescription:\n${params.textContent || 'Extract from the attached prescription image/document.'}`,
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: { parts: contents },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          doctorName: { type: Type.STRING },
          hospital: { type: Type.STRING },
          prescriptionDate: { type: Type.STRING },
          diagnosis: { type: Type.STRING },
          notes: { type: Type.STRING },
          medicines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                genericName: { type: Type.STRING },
                dosage: { type: Type.STRING },
                frequency: { type: Type.STRING },
                duration: { type: Type.STRING },
                instructions: { type: Type.STRING },
                timing: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Array containing Morning, Afternoon, Evening, Bedtime',
                },
              },
              required: ['name', 'dosage', 'frequency', 'instructions'],
            },
          },
        },
        required: ['doctorName', 'prescriptionDate', 'medicines'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return parsed;
}

export async function askHealthAssistantAI(params: {
  query: string;
  memberProfile: any;
  documents: any[];
  reports: ExtractedReport[];
  medicines: any[];
  appointments: any[];
  chatHistory: any[];
}) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const reportsSummary = params.reports.map(r => ({
    reportId: r.id,
    reportType: r.reportType,
    testDate: r.testDate,
    hospital: r.hospital,
    abnormalTests: r.tests.filter(t => t.status !== 'normal').map(t => `${t.name}: ${t.result} ${t.unit} (Ref: ${t.referenceRange})`),
    allTests: r.tests.map(t => `${t.name}: ${t.result} ${t.unit} [${t.status}]`),
    healthSummary: r.summary.healthSummary,
  }));

  const activeMeds = params.medicines.filter(m => m.status === 'active').map(m => ({
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency,
    instructions: m.instructions,
    prescribingDoctor: m.prescribingDoctor,
  }));

  const systemInstruction = `You are MediVault Assistant, a personal health records companion for ${params.memberProfile.name} (${params.memberProfile.age} yrs, ${params.memberProfile.gender}, Blood: ${params.memberProfile.bloodGroup}).
You have authorized access to their digitized medical vault records.

CRITICAL RULES:
1. Ground your answers strictly in the user's provided medical records and diagnostic tests.
2. ALWAYS cite the specific document title and test date supporting your answer (e.g., "[CBC Report · Jan 15, 2026: Hemoglobin was 11.2 g/dL]").
3. If information is not in the records, clearly and politely state that it is not available in their vault.
4. When comparing historical tests (e.g. CBC or Lipid panels), compare the exact dates, values, and whether they improved, stabilized, or changed.
5. Provide compassionate, clear, educational guidance in everyday English.
6. MANDATORY DISCLAIMER: Do not diagnose diseases, prescribe medication, or tell users to alter doses. Recommend consulting their physician for medical decisions.
7. Return JSON with 'response' (markdown supported) and 'citations' array with { documentTitle, testDate, parameter, value }.`;

  const contextData = {
    patient: {
      name: params.memberProfile.name,
      age: params.memberProfile.age,
      gender: params.memberProfile.gender,
      bloodGroup: params.memberProfile.bloodGroup,
      allergies: params.memberProfile.allergies,
      chronicConditions: params.memberProfile.chronicConditions,
    },
    medicalReports: reportsSummary,
    activeMedications: activeMeds,
    upcomingAppointments: params.appointments,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: [
      { text: `Context Records Database:\n${JSON.stringify(contextData, null, 2)}` },
      { text: `User Question: "${params.query}"` },
    ],
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          response: { type: Type.STRING },
          citations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                documentTitle: { type: Type.STRING },
                testDate: { type: Type.STRING },
                parameter: { type: Type.STRING },
                value: { type: Type.STRING },
              },
              required: ['documentTitle', 'testDate'],
            },
          },
        },
        required: ['response'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    response: parsed.response || 'I could not find matching records in your vault for this query.',
    citations: parsed.citations || [],
  };
}
