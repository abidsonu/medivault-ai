import React, { useState } from 'react';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { ExtractedReport, ExtractedMedicalTest } from '../types/index.js';

export const ReportComparisonView: React.FC = () => {
  const { state, activeMember, t } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('CBC');
  const [selectedParameter, setSelectedParameter] = useState<string>('Hemoglobin (Hb)');

  if (!state || !activeMember) return null;

  const memberReports = state.reports.filter(r => r.familyMemberId === activeMember.id);

  // Group reports by testCategory
  const categoriesWithReports = Array.from(new Set(memberReports.map(r => r.testCategory)));

  // Reports matching the selected category, sorted chronologically ascending
  const categoryReports = memberReports
    .filter(r => r.testCategory === selectedCategory)
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());

  // Extract all unique test parameters across these reports
  const allParams = Array.from(
    new Set(
      categoryReports.flatMap(r => r.tests.map(t => t.name))
    )
  );

  // Ensure selectedParameter exists in current category
  const activeParam = allParams.includes(selectedParameter) ? selectedParameter : allParams[0] || '';

  // Extract historical points for active parameter
  interface HistoricalPoint {
    reportId: string;
    date: string;
    hospital: string;
    test: ExtractedMedicalTest;
    numValue: number;
    diffFromPrev?: number;
    pctChange?: number;
    trend: 'improving' | 'worsening' | 'stable';
  }

  const historyPoints: HistoricalPoint[] = [];

  categoryReports.forEach((rep, idx) => {
    const test = rep.tests.find(t => t.name === activeParam);
    if (!test) return;

    const num = test.numValue ?? parseFloat(test.result);
    if (isNaN(num)) return;

    let diff: number | undefined;
    let pct: number | undefined;
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';

    if (idx > 0 && historyPoints.length > 0) {
      const prev = historyPoints[historyPoints.length - 1];
      diff = Number((num - prev.numValue).toFixed(2));
      pct = Number(((diff / prev.numValue) * 100).toFixed(1));

      // Clinically meaningful evaluation
      if (test.status === 'normal' && prev.test.status !== 'normal') {
        trend = 'improving';
      } else if (test.status !== 'normal' && prev.test.status === 'normal') {
        trend = 'worsening';
      } else if (Math.abs(pct) < 3) {
        trend = 'stable';
      } else if (activeParam.includes('Hemoglobin') || activeParam.includes('HDL') || activeParam.includes('Platelet')) {
        trend = diff > 0 ? 'improving' : 'worsening';
      } else if (activeParam.includes('Cholesterol') || activeParam.includes('LDL') || activeParam.includes('Triglyceride') || activeParam.includes('Glucose') || activeParam.includes('HbA1c')) {
        trend = diff < 0 ? 'improving' : 'worsening';
      }
    }

    historyPoints.push({
      reportId: rep.id,
      date: rep.testDate,
      hospital: rep.hospital,
      test,
      numValue: num,
      diffFromPrev: diff,
      pctChange: pct,
      trend,
    });
  });

  // Calculate chart boundaries
  const testRef = historyPoints[0]?.test;
  const minRef = testRef?.minRef ?? (testRef?.referenceRange?.includes('-') ? parseFloat(testRef.referenceRange.split('-')[0]) : undefined);
  const maxRef = testRef?.maxRef ?? (testRef?.referenceRange?.includes('-') ? parseFloat(testRef.referenceRange.split('-')[1]) : undefined);

  const values = historyPoints.map(p => p.numValue);
  const chartMin = Math.min(...values, minRef ?? 0) * 0.85;
  const chartMax = Math.max(...values, maxRef ?? 10) * 1.15;

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 60;
  const paddingY = 30;

  const getX = (idx: number) => {
    if (historyPoints.length <= 1) return svgWidth / 2;
    return paddingX + (idx / (historyPoints.length - 1)) * (svgWidth - 2 * paddingX);
  };

  const getY = (val: number) => {
    const range = chartMax - chartMin || 1;
    return svgHeight - paddingY - ((val - chartMin) / range) * (svgHeight - 2 * paddingY);
  };

  // Normal range band coordinates
  const bandTop = maxRef !== undefined ? getY(maxRef) : paddingY;
  const bandBottom = minRef !== undefined ? getY(minRef) : svgHeight - paddingY;
  const bandHeight = Math.max(0, bandBottom - bandTop);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Historical Report Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Automated parameter matching across test dates to visualize trajectories and recovery trends
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Category:</label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                const nextRep = memberReports.filter(r => r.testCategory === e.target.value);
                if (nextRep.length > 0 && nextRep[0].tests.length > 0) {
                  setSelectedParameter(nextRep[0].tests[0].name);
                }
              }}
              className="appearance-none text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {categoriesWithReports.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({memberReports.filter(r => r.testCategory === cat).length} reports)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Parameter Tabs Bar */}
      <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {allParams.map(param => (
            <button
              key={param}
              onClick={() => setSelectedParameter(param)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeParam === param
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {param}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-600 dark:text-teal-400">
              Trajectory & Reference Band
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {activeParam} Trend Over Time
            </h3>
            {testRef && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Stated Lab Reference Range: <strong>{testRef.referenceRange} {testRef.unit}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50 inline-block"></span>
              Normal Band
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-3xl mx-auto h-56 select-none">
            {/* Shaded Reference Band */}
            {bandHeight > 0 && (
              <rect
                x={paddingX}
                y={bandTop}
                width={svgWidth - 2 * paddingX}
                height={bandHeight}
                fill="currentColor"
                className="text-emerald-500/10 dark:text-emerald-400/10"
              />
            )}

            {/* Reference Range Bounds Lines */}
            {maxRef !== undefined && (
              <line
                x1={paddingX}
                y1={getY(maxRef)}
                x2={svgWidth - paddingX}
                y2={getY(maxRef)}
                stroke="currentColor"
                strokeDasharray="4 4"
                className="text-emerald-500/40"
              />
            )}
            {minRef !== undefined && (
              <line
                x1={paddingX}
                y1={getY(minRef)}
                x2={svgWidth - paddingX}
                y2={getY(minRef)}
                stroke="currentColor"
                strokeDasharray="4 4"
                className="text-emerald-500/40"
              />
            )}

            {/* Connecting Polyline */}
            {historyPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-teal-600 dark:text-teal-400"
                points={historyPoints.map((p, i) => `${getX(i)},${getY(p.numValue)}`).join(' ')}
              />
            )}

            {/* Data Points */}
            {historyPoints.map((p, i) => {
              const cx = getX(i);
              const cy = getY(p.numValue);
              const isNormal = p.test.status === 'normal';

              return (
                <g key={p.reportId}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    className={isNormal ? 'fill-emerald-600' : 'fill-rose-600'}
                    stroke="white"
                    strokeWidth={2}
                  />
                  {/* Value Label */}
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    className="text-[11px] font-mono font-bold fill-slate-900 dark:fill-white"
                  >
                    {p.numValue} {p.test.unit}
                  </text>
                  {/* Date Label */}
                  <text
                    x={cx}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {p.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Comparison History Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Chronological Progression Matrix
          </h3>
          <p className="text-[11px] text-slate-500">
            Absolute difference and percentage change calculated where clinically meaningful
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Test Date</th>
                <th className="px-5 py-3">Diagnostic Laboratory</th>
                <th className="px-5 py-3 text-right">Measured Result</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Change from Previous</th>
                <th className="px-5 py-3">Clinical Trajectory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {historyPoints.map((pt, idx) => {
                const isNormal = pt.test.status === 'normal';
                return (
                  <tr key={pt.reportId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900 dark:text-white">
                      {pt.date}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {pt.hospital}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono font-bold tabular-nums">
                      <span className={!isNormal ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                        {pt.numValue}
                      </span>{' '}
                      <span className="text-[11px] font-normal text-slate-400 font-sans">{pt.test.unit}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      {isNormal ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Within Range
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Out of Range
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                      {pt.diffFromPrev !== undefined ? (
                        <span className="text-slate-700 dark:text-slate-200">
                          {pt.diffFromPrev > 0 ? `+${pt.diffFromPrev}` : pt.diffFromPrev} {pt.pctChange !== undefined ? `(${pt.pctChange > 0 ? `+${pt.pctChange}` : pt.pctChange}%)` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-sans">Baseline</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {pt.trend === 'improving' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <TrendingUp className="w-3 h-3" />
                          Improving
                        </span>
                      ) : pt.trend === 'worsening' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          <TrendingDown className="w-3 h-3" />
                          Requires Attention
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Minus className="w-3 h-3" />
                          Stable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
