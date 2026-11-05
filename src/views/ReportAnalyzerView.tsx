import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  ChevronDown,
  Info,
  ArrowRight,
  RefreshCw,
  Printer,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { ExtractedReport, ExtractedMedicalTest } from '../types/index.js';

export const ReportAnalyzerView: React.FC = () => {
  const {
    state,
    activeMember,
    selectedReportId,
    setSelectedReportId,
    analyzeReport,
    setActiveTab,
    t,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'abnormal' | 'normal'>('all');
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  if (!state || !activeMember) return null;

  const memberReports = state.reports.filter(r => r.familyMemberId === activeMember.id);
  const activeReport = memberReports.find(r => r.id === selectedReportId) || memberReports[0];

  const handleReanalyze = async () => {
    if (!activeReport) return;
    setIsReanalyzing(true);
    try {
      const doc = state.documents.find(d => d.id === activeReport.documentId);
      await analyzeReport({
        documentId: activeReport.documentId,
        documentTitle: activeReport.reportType,
        category: activeReport.testCategory,
        textContent: doc?.notes,
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!activeReport) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center mx-auto text-teal-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No Reports Analyzed Yet
        </h3>
        <p className="text-xs text-slate-500">
          Upload a medical document or laboratory test result to extract values, reference ranges, and AI clinical summaries.
        </p>
        <button
          onClick={() => setActiveTab('records')}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer"
        >
          Go to Medical Records
        </button>
      </div>
    );
  }

  const testsToDisplay = activeReport.tests.filter(test => {
    if (filterStatus === 'abnormal') return test.status !== 'normal';
    if (filterStatus === 'normal') return test.status === 'normal';
    return true;
  });

  const abnormalTests = activeReport.tests.filter(t => t.status !== 'normal');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Report Selection & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            Selected Report:
          </label>
          <div className="relative">
            <select
              value={activeReport.id}
              onChange={e => setSelectedReportId(e.target.value)}
              className="appearance-none text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {memberReports.map(rep => (
                <option key={rep.id} value={rep.id}>
                  {rep.reportType} ({rep.testDate}) · {rep.hospital}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Re-run AI extraction"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
            <span>{isReanalyzing ? 'Analyzing...' : 'Re-analyze'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Section A: Report Summary Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-600 dark:text-teal-400">
              Clinical Report Summary
            </span>
            <h2 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {activeReport.reportType}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {activeReport.hospital} · Conducted on {activeReport.testDate}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {activeReport.summary.withinRangeCount} Within Range
            </span>
            {activeReport.summary.outsideRangeCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                {activeReport.summary.outsideRangeCount} Outside Range
              </span>
            )}
          </div>
        </div>

        {/* Why Conducted & Main Findings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Why this test is conducted:
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeReport.summary.whyConducted}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 space-y-1.5">
            <span className="font-semibold text-teal-900 dark:text-teal-200 block">
              Key Diagnostic Findings:
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeReport.summary.mainFindings}
            </p>
          </div>
        </div>
      </div>

      {/* Section B: Individual Test Analysis Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Individual Test Analysis
            </h3>
            <p className="text-[11px] text-slate-500">
              Extracted values compared strictly with laboratory stated reference ranges
            </p>
          </div>

          {/* Segmented Controls for filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Tests ({activeReport.tests.length})
            </button>
            <button
              onClick={() => setFilterStatus('abnormal')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterStatus === 'abnormal'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Outside Range ({abnormalTests.length})
            </button>
            <button
              onClick={() => setFilterStatus('normal')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterStatus === 'normal'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Within Range ({activeReport.tests.length - abnormalTests.length})
            </button>
          </div>
        </div>

        {/* The Diagnostic Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Test Name</th>
                <th className="px-5 py-3 text-right">Result</th>
                <th className="px-5 py-3">Reference Range</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Plain English Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {testsToDisplay.map((test, idx) => {
                const isNormal = test.status === 'normal';
                const isBorderline = test.status === 'borderline';

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      !isNormal ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {test.name}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono font-bold tabular-nums">
                      <span className={!isNormal ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                        {test.result}
                      </span>{' '}
                      <span className="text-[11px] font-normal text-slate-400 font-sans">{test.unit}</span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-500 tabular-nums">
                      {test.referenceRange} {test.unit}
                    </td>

                    <td className="px-5 py-3.5">
                      {isNormal ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Within Range
                        </span>
                      ) : isBorderline ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Borderline
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          Out of Range
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-sm">
                      {test.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section C: Detailed AI Explanation for Abnormal Results */}
      {abnormalTests.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Detailed Clinical Explanations for Out-of-Range Markers
              </h3>
              <p className="text-[11px] text-slate-500">
                Educational context explaining what each elevated or low value indicates
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {abnormalTests.map((test, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {test.name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {test.result} {test.unit} (Ref: {test.referenceRange})
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">What it represents:</strong> {test.explanation}
                </p>

                {test.possibleReasons && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200">Possible reasons:</strong> {test.possibleReasons}
                  </p>
                )}

                {test.discussionAdvice && (
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 text-xs text-teal-800 dark:text-teal-300 font-medium">
                    {test.discussionAdvice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section D: Questions to Ask Your Doctor */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recommended Questions for Your Doctor's Visit
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Bring these doctor-curated questions to your upcoming consultation for a productive discussion:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {activeReport.summary.doctorQuestions.map((q, idx) => (
            <li
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section E: AI Health Summary & Medical Disclaimer */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
          <Info className="w-4 h-4 text-slate-500" />
          <span>Patient Health Guidance & Disclaimer</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {activeReport.summary.healthSummary}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-700">
          {t.medicalDisclaimer}
        </p>
      </div>
    </div>
  );
};
