import React, { useState } from 'react';
import { X, UploadCloud, FileText, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { DocumentCategory } from '../types/index.js';

const CATEGORIES: DocumentCategory[] = [
  'CBC',
  'Blood Test',
  'Lipid Profile',
  'Liver Function (LFT)',
  'Kidney Function (KFT)',
  'Thyroid Panel',
  'Diabetes & HbA1c',
  'Urine Test',
  'X-Ray',
  'MRI Scan',
  'CT Scan',
  'Ultrasound',
  'ECG & Echo',
  'Discharge Summary',
  'Doctor Prescription',
  'Medical Certificate',
  'Vaccination Record',
  'Other',
];

export const UploadDocumentModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadDocument,
    analyzeReport,
    extractPrescription,
    activeMember,
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('CBC');
  const [hospital, setHospital] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [analyzeNow, setAnalyzeNow] = useState(true);
  const [file, setFile] = useState<{ name: string; size: string; base64: string; type: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isUploadModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFile({
        name: selected.name,
        size: `${(selected.size / (1024 * 1024)).toFixed(1)} MB`,
        base64,
        type: selected.type,
      });
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    };
    reader.readAsDataURL(selected);
  };

  const handleLoadSampleReport = () => {
    setTitle('Lipid Profile & Glucose Evaluation');
    setCategory('Lipid Profile');
    setHospital('Metro Health Diagnostic Center');
    setTestDate('2026-11-02');
    setDoctorName('Dr. Elena Vance');
    setNotes('Annual routine fasting blood sample. 12-hour overnight fast.');
    setTagsInput('Lipid, Fasting, Cholesterol, Wellness');
    setFile({
      name: 'sample_lab_report.jpg',
      size: '1.2 MB',
      base64: '',
      type: 'image/jpeg',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Document title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const createdDoc = await uploadDocument({
        familyMemberId: activeMember?.id,
        title: title.trim(),
        category,
        hospital: hospital.trim() || 'Clinical Laboratory',
        testDate,
        doctorName: doctorName.trim(),
        notes: notes.trim(),
        tags,
        fileType: file?.type.includes('pdf') ? 'pdf' : 'jpg',
        fileSize: file?.size || '1.1 MB',
        fileUrl: file?.base64 || '/src/assets/images/sample_lab_report_1793892778141.jpg',
      });

      if (analyzeNow) {
        if (category === 'Doctor Prescription') {
          await extractPrescription({
            textContent: notes,
            base64Data: file?.base64,
            mimeType: file?.type,
          });
        } else {
          await analyzeReport({
            documentId: createdDoc.id,
            documentTitle: createdDoc.title,
            category: createdDoc.category,
            textContent: notes,
            base64Data: file?.base64,
            mimeType: file?.type,
          });
        }
      }

      setIsUploadModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and analyze document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-none">
              Upload Medical Record
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Adding to <strong className="text-slate-700 dark:text-slate-300">{activeMember?.name}'s</strong> vault
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-xl p-5 text-center transition-colors relative bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              {file ? (
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">{file.name}</span> ({file.size})
                  <p className="text-[11px] text-slate-400 mt-0.5">Click or drag another file to replace</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Drag and drop your report or <span className="text-teal-600 dark:text-teal-400 font-semibold underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Supports PDF, JPG, PNG up to 20MB
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleLoadSampleReport}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              Load Sample Clinical Report
            </button>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count (CBC) or Lipid Profile"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Medical Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as DocumentCategory)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Test Date
              </label>
              <input
                type="date"
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hospital / Diagnostic Center
              </label>
              <input
                type="text"
                value={hospital}
                onChange={e => setHospital(e.target.value)}
                placeholder="e.g. City Central Health Clinic"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Doctor Name (Optional)
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Elena Vance"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. CBC, Hemoglobin, Fasting, Routine"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Clinical Notes / Symptoms
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any doctor comments, symptoms, or fasting state..."
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>
          </div>

          {/* AI Extraction Checkbox */}
          <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 flex items-start gap-3">
            <input
              type="checkbox"
              id="analyzeNow"
              checked={analyzeNow}
              onChange={e => setAnalyzeNow(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="analyzeNow" className="text-xs cursor-pointer">
              <strong className="text-teal-900 dark:text-teal-200 font-semibold block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Analyze with MediVault AI immediately
              </strong>
              <span className="text-teal-700/90 dark:text-teal-300/80 text-[11px] block mt-0.5">
                Automatically reads test values, detects abnormal ranges, and generates patient-friendly explanations and doctor consultation questions.
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload & Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
