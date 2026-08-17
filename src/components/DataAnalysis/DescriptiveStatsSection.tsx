import React, { useState, useMemo } from 'react';
import { BarChart3, Copy, Check, Download, Table, CheckSquare, Square, ArrowRight } from 'lucide-react';
import { Language, DescriptiveResult, FrequencyResult } from '../../types';
import { isRTL } from '../../lib/i18n';
import { dataAnalysisService, DatasetAuditSummary } from '../../services/dataAnalysisService';

interface DescriptiveStatsSectionProps {
  rows: any[];
  headers: string[];
  auditSummary: DatasetAuditSummary;
  lang: Language;
  onNextStep: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DescriptiveStatsSection: React.FC<DescriptiveStatsSectionProps> = ({
  rows,
  headers,
  auditSummary,
  lang,
  onNextStep,
  onShowToast
}) => {
  // Variable selections
  const [selectedScaleVars, setSelectedScaleVars] = useState<string[]>(
    auditSummary.variables.filter(v => v.dataType === 'numeric').map(v => v.name)
  );
  const [selectedCatVars, setSelectedCatVars] = useState<string[]>(
    auditSummary.variables.filter(v => v.dataType === 'categorical').map(v => v.name)
  );

  const [copied, setCopied] = useState(false);
  const rtl = isRTL(lang);

  // Compute Descriptives for Scale Variables
  const scaleResults: DescriptiveResult[] = useMemo(() => {
    if (!rows || rows.length === 0 || selectedScaleVars.length === 0) return [];
    return dataAnalysisService.runDescriptives(rows, selectedScaleVars);
  }, [rows, selectedScaleVars]);

  // Compute Frequencies for Categorical Variables
  const catResults: FrequencyResult[] = useMemo(() => {
    if (!rows || rows.length === 0 || selectedCatVars.length === 0) return [];
    return dataAnalysisService.runFrequencies(rows, selectedCatVars);
  }, [rows, selectedCatVars]);

  const toggleScaleVar = (v: string) => {
    setSelectedScaleVars(prev =>
      prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]
    );
  };

  const toggleCatVar = (v: string) => {
    setSelectedCatVars(prev =>
      prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]
    );
  };

  const selectAllScale = () => {
    const allNumeric = auditSummary.variables.filter(v => v.dataType === 'numeric').map(v => v.name);
    setSelectedScaleVars(allNumeric);
  };

  const deselectAllScale = () => setSelectedScaleVars([]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('success', 'Table Copied', 'SPSS table copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            {lang === 'ku' ? 'ئاماری وەسفی (Descriptive Statistics)' : lang === 'bad' ? 'ئامارا وەصفی' : lang === 'ar' ? 'الإحصاء الوصفي' : 'Descriptive Statistics Dashboard'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            SPSS-style publication tables for continuous scale variables and categorical item frequencies
          </p>
        </div>

        <button
          onClick={onNextStep}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          {lang === 'ku' ? 'بەردەوامبوون بۆ تاقیکردنەوە ئەزموونییەکان' : lang === 'bad' ? 'بەردەوامبوون بۆ تاقیکرنەوان' : lang === 'ar' ? 'الانتقال إلى الاختبارات الإحصائية' : 'Proceed to Inferential Tests'}
          <ArrowRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Variable Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scale Variable Picker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Numeric Scale Variables ({selectedScaleVars.length} selected)
            </h4>
            <div className="flex gap-2 text-[11px]">
              <button onClick={selectAllScale} className="text-blue-400 hover:underline">Select All</button>
              <span className="text-slate-600">•</span>
              <button onClick={deselectAllScale} className="text-slate-400 hover:underline">Clear</button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {headers.map(h => {
              const meta = auditSummary.variables.find(v => v.name === h);
              const isNumeric = meta?.dataType === 'numeric';
              const isChecked = selectedScaleVars.includes(h);

              return (
                <label
                  key={h}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isChecked ? 'bg-blue-600/20 text-slate-100 font-semibold' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleScaleVar(h)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600"
                    />
                    <span className="truncate">{h}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isNumeric ? 'text-blue-400 bg-blue-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                    {meta?.measurementLevel || 'Scale'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Categorical Variable Picker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Categorical Variables ({selectedCatVars.length} selected)
            </h4>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {headers.map(h => {
              const isChecked = selectedCatVars.includes(h);
              return (
                <label
                  key={h}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isChecked ? 'bg-emerald-600/20 text-slate-100 font-semibold' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCatVar(h)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-600"
                    />
                    <span className="truncate">{h}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. SPSS-Style Descriptive Statistics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-serif italic">
              Table 1. Descriptive Statistics of Continuous Variables
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Includes N, Mean, Median, Std. Deviation, Variance, Min, Max, Range, and 95% Confidence Intervals
            </p>
          </div>

          <button
            onClick={() => {
              const text = scaleResults.map(r => `${r.variable}\t${r.count}\t${r.mean}\t${r.stdDev}\t${r.median}\t${r.variance}\t${r.min}\t${r.max}\t${(r.max - r.min).toFixed(3)}\t[${(r.mean - 1.96 * (r.seMean || 0)).toFixed(2)}, ${(r.mean + 1.96 * (r.seMean || 0)).toFixed(2)}]`).join('\n');
              copyToClipboard(`Variable\tN\tMean\tStd. Dev\tMedian\tVariance\tMin\tMax\tRange\t95% CI\n` + text);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Table
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse font-serif">
            <thead>
              <tr className="border-y-2 border-slate-700 text-slate-300 font-bold bg-slate-950/60">
                <th className="p-3 text-start">Variable</th>
                <th className="p-3 text-center">N</th>
                <th className="p-3 text-center">Mean</th>
                <th className="p-3 text-center">Std. Deviation</th>
                <th className="p-3 text-center">Median</th>
                <th className="p-3 text-center">Variance</th>
                <th className="p-3 text-center">Min</th>
                <th className="p-3 text-center">Max</th>
                <th className="p-3 text-center">Range</th>
                <th className="p-3 text-center">95% CI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {scaleResults.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-sans">
                    No numeric scale variables selected.
                  </td>
                </tr>
              ) : (
                scaleResults.map((res, idx) => {
                  const range = (res.max - res.min).toFixed(3);
                  const ciLower = (res.mean - 1.96 * (res.seMean || 0)).toFixed(2);
                  const ciUpper = (res.mean + 1.96 * (res.seMean || 0)).toFixed(2);

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-100">{res.variable}</td>
                      <td className="p-3 text-center font-mono">{res.count}</td>
                      <td className="p-3 text-center font-mono font-bold text-blue-400">{res.mean}</td>
                      <td className="p-3 text-center font-mono">{res.stdDev}</td>
                      <td className="p-3 text-center font-mono">{res.median}</td>
                      <td className="p-3 text-center font-mono">{res.variance}</td>
                      <td className="p-3 text-center font-mono">{res.min}</td>
                      <td className="p-3 text-center font-mono">{res.max}</td>
                      <td className="p-3 text-center font-mono">{range}</td>
                      <td className="p-3 text-center font-mono text-emerald-400">
                        [{ciLower}, {ciUpper}]
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="border-t-2 border-slate-700 text-[11px] text-slate-400 italic">
              <tr>
                <td colSpan={10} className="p-3">
                  Note. CI = Confidence Interval; N = Valid sample size; SE = Standard Error of Mean.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2. Categorical Frequencies Tables */}
      {catResults.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Categorical Frequency Distributions
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {catResults.map((freqRes, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 font-serif">
                <h5 className="text-xs font-bold text-slate-100 italic border-b border-slate-800 pb-2">
                  Frequency Table: {freqRes.variable}
                </h5>

                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-700 text-slate-300 font-bold bg-slate-950/60">
                      <th className="p-2 text-start">Category</th>
                      <th className="p-2 text-center">Frequency</th>
                      <th className="p-2 text-center">Percent (%)</th>
                      <th className="p-2 text-center">Cumulative %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {freqRes.items.map((cat, cIdx) => (
                      <tr key={cIdx}>
                        <td className="p-2 font-medium">{cat.value}</td>
                        <td className="p-2 text-center font-mono">{cat.count}</td>
                        <td className="p-2 text-center font-mono">{cat.percent}%</td>
                        <td className="p-2 text-center font-mono">{cat.cumulativePercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-700 font-bold text-slate-100">
                    <tr>
                      <td className="p-2">Total</td>
                      <td className="p-2 text-center font-mono">{freqRes.totalCount}</td>
                      <td className="p-2 text-center font-mono">100.0%</td>
                      <td className="p-2 text-center font-mono">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
