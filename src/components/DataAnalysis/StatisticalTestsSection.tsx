import React, { useState } from 'react';
import { Calculator, Play, CheckCircle2, AlertCircle, Copy, ArrowRight, Table, Activity } from 'lucide-react';
import { Language } from '../../types';
import { isRTL } from '../../lib/i18n';
import { dataAnalysisService, DatasetAuditSummary } from '../../services/dataAnalysisService';

interface StatisticalTestsSectionProps {
  rows: any[];
  headers: string[];
  auditSummary: DatasetAuditSummary;
  lang: Language;
  onTestExecuted: (testType: string, resultData: any) => void;
  onNextStep: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const StatisticalTestsSection: React.FC<StatisticalTestsSectionProps> = ({
  rows,
  headers,
  auditSummary,
  lang,
  onTestExecuted,
  onNextStep,
  onShowToast
}) => {
  const [selectedTest, setSelectedTest] = useState<string>('independent_ttest');

  // Input States
  const [dv, setDv] = useState<string>(headers[0] || '');
  const [ivs, setIvs] = useState<string[]>(headers.slice(1, 3));
  const [groupingVar, setGroupingVar] = useState<string>(headers[1] || headers[0] || '');
  const [rowVar, setRowVar] = useState<string>(headers[0] || '');
  const [colVar, setColVar] = useState<string>(headers[1] || '');
  const [var1, setVar1] = useState<string>(headers[0] || '');
  const [var2, setVar2] = useState<string>(headers[1] || '');
  const [multiVars, setMultiVars] = useState<string[]>(headers.slice(0, 4));

  // Result Output State
  const [activeResult, setActiveResult] = useState<{
    testType: string;
    data: any;
  } | null>(null);

  const rtl = isRTL(lang);

  const handleRunTest = () => {
    try {
      const data = dataAnalysisService.runStatisticalTest(selectedTest, rows, {
        dv,
        ivs,
        groupingVar,
        rowVar,
        colVar,
        var1,
        var2,
        variables: multiVars
      });

      setActiveResult({ testType: selectedTest, data });
      onTestExecuted(selectedTest, data);
      onShowToast('success', 'Statistical Test Computed', `${selectedTest.toUpperCase()} test executed successfully.`);
    } catch (err: any) {
      onShowToast('error', 'Statistical Error', err.message || 'Failed to compute statistical test.');
    }
  };

  const toggleMultiVar = (v: string) => {
    setMultiVars(prev => (prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]));
  };

  const toggleIv = (v: string) => {
    setIvs(prev => (prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            {lang === 'ku' ? 'تاقیکردنەوە ئامارییەکان (Statistical Tests)' : lang === 'bad' ? 'تاقیکرنەوێن ئاماری' : lang === 'ar' ? 'الاختبارات الإحصائية' : 'Inferential Statistical Tests'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Execute Parametric & Non-Parametric Hypothesis Tests with exact p-value computations
          </p>
        </div>

        <button
          onClick={onNextStep}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          {lang === 'ku' ? 'بەردەوامبوون بۆ شیکاری پرسیارەکانی توێژینەوە' : lang === 'bad' ? 'دەربازبوون بۆ پرسیارێن ڤەکۆلینێ' : lang === 'ar' ? 'الانتقال إلى تحليل أسئلة البحث' : 'Proceed to RQ Analysis'}
          <ArrowRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main Grid: Test Picker & Input Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Test Selector List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Select Statistical Test
          </h4>

          {[
            { id: 'independent_ttest', label: 'Independent Samples T-Test', desc: 'Compare 2 independent group means' },
            { id: 'paired_ttest', label: 'Paired Samples T-Test', desc: 'Compare paired observations (Pre vs Post)' },
            { id: 'anova', label: 'One-Way ANOVA', desc: 'Compare 3+ group means with F-ratio' },
            { id: 'chisquare', label: 'Chi-Square Test of Independence', desc: 'Categorical cross-tabulation association' },
            { id: 'pearson', label: 'Pearson Correlation Matrix', desc: 'Linear relationship between scale variables' },
            { id: 'spearman', label: 'Spearman Rank Correlation', desc: 'Monotonic relationship between ordinal variables' },
            { id: 'regression', label: 'Linear Multiple Regression', desc: 'Predict DV from multiple IV predictors' },
            { id: 'reliability', label: "Cronbach's Alpha Reliability", desc: 'Internal consistency for Likert scale items' }
          ].map(test => (
            <button
              key={test.id}
              onClick={() => setSelectedTest(test.id)}
              className={`w-full text-start p-3 rounded-xl border transition-all ${
                selectedTest === test.id
                  ? 'bg-blue-600/20 border-blue-500 text-slate-100 shadow-md shadow-blue-500/10 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <p className="text-xs">{test.label}</p>
              <p className="text-[10px] font-normal text-slate-400 mt-0.5">{test.desc}</p>
            </button>
          ))}
        </div>

        {/* Right: Test Parameters Input Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h4 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Configure Parameters: {selectedTest.toUpperCase()}</span>
            <button
              onClick={handleRunTest}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Calculate Test
            </button>
          </h4>

          {/* Test Specific Inputs */}
          {selectedTest === 'independent_ttest' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Dependent Variable (Scale)</label>
                <select
                  value={dv}
                  onChange={e => setDv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Grouping Variable (2 Groups)</label>
                <select
                  value={groupingVar}
                  onChange={e => setGroupingVar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedTest === 'paired_ttest' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Variable 1 (Pre / Baseline)</label>
                <select
                  value={var1}
                  onChange={e => setVar1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Variable 2 (Post / Follow-up)</label>
                <select
                  value={var2}
                  onChange={e => setVar2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedTest === 'anova' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Dependent Variable (Continuous)</label>
                <select
                  value={dv}
                  onChange={e => setDv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Grouping Factor (Categorical)</label>
                <select
                  value={groupingVar}
                  onChange={e => setGroupingVar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedTest === 'chisquare' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Row Variable</label>
                <select
                  value={rowVar}
                  onChange={e => setRowVar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Column Variable</label>
                <select
                  value={colVar}
                  onChange={e => setColVar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {(selectedTest === 'pearson' || selectedTest === 'spearman' || selectedTest === 'reliability') && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Select Target Scale Items / Variables</label>
              <div className="max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                {headers.map(h => (
                  <label key={h} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multiVars.includes(h)}
                      onChange={() => toggleMultiVar(h)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    <span className="truncate">{h}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedTest === 'regression' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Dependent Variable (Y)</label>
                <select
                  value={dv}
                  onChange={e => setDv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Independent Predictor Variables (X)</label>
                <div className="max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  {headers.filter(h => h !== dv).map(h => (
                    <label key={h} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ivs.includes(h)}
                        onChange={() => toggleIv(h)}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600"
                      />
                      <span className="truncate">{h}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Output View */}
          {activeResult && activeResult.testType === selectedTest && (
            <div className="pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-serif italic">
                <CheckCircle2 className="w-4 h-4" /> SPSS Output Table — Calculated Empirical Results
              </h5>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto font-serif">
                {/* Render SPSS Result Tables */}
                {selectedTest === 'independent_ttest' && (
                  <table className="w-full text-xs text-start border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-700 text-slate-300 font-bold">
                        <th className="p-2 text-start">Group</th>
                        <th className="p-2 text-center">N</th>
                        <th className="p-2 text-center">Mean</th>
                        <th className="p-2 text-center">Std. Dev</th>
                        <th className="p-2 text-center">Mean Diff</th>
                        <th className="p-2 text-center">t</th>
                        <th className="p-2 text-center">df</th>
                        <th className="p-2 text-center">p-value</th>
                        <th className="p-2 text-center">95% CI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      <tr>
                        <td className="p-2 font-semibold">{activeResult.data.group1Name}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.group1Count}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.group1Mean}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.group1Sd}</td>
                        <td className="p-2 text-center font-mono text-blue-400 font-bold" rowSpan={2}>{activeResult.data.meanDiff}</td>
                        <td className="p-2 text-center font-mono text-blue-400 font-bold" rowSpan={2}>{activeResult.data.tStat}</td>
                        <td className="p-2 text-center font-mono" rowSpan={2}>{activeResult.data.df}</td>
                        <td className={`p-2 text-center font-mono font-bold ${activeResult.data.pValue < 0.05 ? 'text-emerald-400' : 'text-rose-400'}`} rowSpan={2}>
                          {activeResult.data.pValue}
                        </td>
                        <td className="p-2 text-center font-mono" rowSpan={2}>
                          [{activeResult.data.ci95Lower}, {activeResult.data.ci95Upper}]
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">{activeResult.data.group2Name}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.group2Count}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.group2Mean}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.group2Sd}</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {selectedTest === 'anova' && (
                  <table className="w-full text-xs text-start border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-700 text-slate-300 font-bold">
                        <th className="p-2 text-start">Source</th>
                        <th className="p-2 text-center">Sum of Squares</th>
                        <th className="p-2 text-center">df</th>
                        <th className="p-2 text-center">Mean Square</th>
                        <th className="p-2 text-center">F</th>
                        <th className="p-2 text-center">Sig. (p)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      <tr>
                        <td className="p-2 font-semibold">Between Groups</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.betweenSS}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.betweenDf}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.betweenMS}</td>
                        <td className="p-2 text-center font-mono font-bold text-blue-400" rowSpan={2}>{activeResult.data.fStat}</td>
                        <td className={`p-2 text-center font-mono font-bold ${activeResult.data.pValue < 0.05 ? 'text-emerald-400' : 'text-rose-400'}`} rowSpan={2}>
                          {activeResult.data.pValue}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">Within Groups</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.withinSS}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.withinDf}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.withinMS}</td>
                      </tr>
                      <tr className="border-t-2 border-slate-700 font-bold">
                        <td className="p-2">Total</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.totalSS}</td>
                        <td className="p-2 text-center font-mono">{activeResult.data.totalDf}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {selectedTest === 'regression' && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-300">
                      Model Summary: R = {activeResult.data.r}, R² = {activeResult.data.r2}, Adj R² = {activeResult.data.adjR2}, F = {activeResult.data.fStat}, p = {activeResult.data.pValue}
                    </p>
                    <table className="w-full text-xs text-start border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-700 text-slate-300 font-bold">
                          <th className="p-2 text-start">Predictor</th>
                          <th className="p-2 text-center">Unstandardized B</th>
                          <th className="p-2 text-center">Std. Error</th>
                          <th className="p-2 text-center">Standardized Beta</th>
                          <th className="p-2 text-center">t</th>
                          <th className="p-2 text-center">p-value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {activeResult.data.coefficients.map((c: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2 font-semibold">{c.variable}</td>
                            <td className="p-2 text-center font-mono">{c.b}</td>
                            <td className="p-2 text-center font-mono">{c.stdErr}</td>
                            <td className="p-2 text-center font-mono">{c.beta}</td>
                            <td className="p-2 text-center font-mono text-blue-400 font-bold">{c.tStat}</td>
                            <td className={`p-2 text-center font-mono font-bold ${c.pValue < 0.05 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {c.pValue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedTest === 'reliability' && (
                  <div className="space-y-2 text-slate-200">
                    <p className="text-xs font-bold">Reliability Statistics</p>
                    <div className="flex gap-6 text-sm font-mono">
                      <span>Items: {activeResult.data.itemCount}</span>
                      <span className={`font-bold ${activeResult.data.cronbachAlpha >= 0.7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        Cronbach's Alpha α = {activeResult.data.cronbachAlpha}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
