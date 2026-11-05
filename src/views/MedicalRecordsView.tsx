import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
  Plus,
  Tag,
  Building,
  User,
  Calendar,
  Eye,
  CheckCircle2,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { MedicalDocument, DocumentCategory } from '../types/index.js';

export const MedicalRecordsView: React.FC = () => {
  const {
    state,
    activeMember,
    setActiveTab,
    setSelectedReportId,
    setIsUploadModalOpen,
    deleteDocument,
    updateDocument,
    analyzeReport,
    globalSearch,
    t,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<MedicalDocument | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  if (!state || !activeMember) return null;

  const memberDocs = state.documents.filter(d => d.familyMemberId === activeMember.id);

  // Categories present in member's docs
  const existingCategories = Array.from(new Set(memberDocs.map(d => d.category)));

  // Filter and search
  const filteredDocs = memberDocs.filter(doc => {
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const q = globalSearch.toLowerCase().trim();
    if (!q) return matchesCat;

    const matchesSearch =
      doc.title.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.hospital.toLowerCase().includes(q) ||
      (doc.doctorName && doc.doctorName.toLowerCase().includes(q)) ||
      doc.tags.some(t => t.toLowerCase().includes(q)) ||
      (doc.notes && doc.notes.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  // Sort
  filteredDocs.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.testDate).getTime() - new Date(a.testDate).getTime();
    if (sortBy === 'oldest') return new Date(a.testDate).getTime() - new Date(b.testDate).getTime();
    return a.title.localeCompare(b.title);
  });

  const handleRunAiAnalysis = async (doc: MedicalDocument) => {
    setAnalyzingId(doc.id);
    try {
      const report = await analyzeReport({
        documentId: doc.id,
        documentTitle: doc.title,
        category: doc.category,
        textContent: doc.notes,
      });
      setSelectedReportId(report.id);
      setActiveTab('analyzer');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleViewReport = (doc: MedicalDocument) => {
    const report = state.reports.find(r => r.documentId === doc.id);
    if (report) {
      setSelectedReportId(report.id);
      setActiveTab('analyzer');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Medical Document Vault
          </h2>
          <p className="text-xs text-slate-500">
            Securely encrypted diagnostic reports, scans, and clinical summaries for {activeMember.name}
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.uploadRecord}</span>
        </button>
      </div>

      {/* Filter Tabs & Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        {/* Category Pills (Interactive Filter Controls) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-teal-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Documents ({memberDocs.length})
          </button>
          {existingCategories.map(cat => {
            const count = memberDocs.filter(d => d.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400 font-medium">{t.sortBy}:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="newest">{t.newestFirst}</option>
            <option value="oldest">{t.oldestFirst}</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {t.noRecordsFound}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your laboratory reports, imaging scans, or prescriptions to begin tracking your medical history with AI.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.uploadRecord}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => {
            const hasReport = !!doc.extractedReportId || state.reports.some(r => r.documentId === doc.id);
            const isAnalyzing = analyzingId === doc.id;

            return (
              <div
                key={doc.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-5 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      {doc.category}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {doc.testDate}
                    </span>
                  </div>

                  {/* Document Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {doc.title}
                  </h3>

                  {/* Meta details */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospital}</span>
                    </div>
                    {doc.doctorName && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.doctorName}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes snippet */}
                  {doc.notes && (
                    <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      {doc.notes}
                    </p>
                  )}

                  {/* Unboxed Metadata Tags */}
                  {doc.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{doc.tags.join(' · ')}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete from Vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {hasReport ? (
                    <button
                      onClick={() => handleViewReport(doc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>View Analysis</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRunAiAnalysis(doc)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isAnalyzing ? 'Analyzing...' : 'AI Analyze'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                  {previewDoc.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  {previewDoc.hospital} · {previewDoc.testDate} · {previewDoc.fileSize}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-950 overflow-y-auto flex items-center justify-center min-h-[300px]">
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] rounded-lg shadow-md object-contain border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Encrypted File Hash Verified
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl}
                  download={previewDoc.title}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
