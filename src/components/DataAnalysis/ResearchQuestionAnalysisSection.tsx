import React, { useState } from 'react';
import { HelpCircle, Sparkles, Play, CheckCircle2, ArrowRight, Lightbulb, ShieldCheck } from 'lucide-react';
import { Language, ResearchQuestionItem } from '../../types';
import { isRTL } from '../../lib/i18n';
import { dataAnalysisService, DatasetAuditSummary } from '../../services/dataAnalysisService';

interface ResearchQuestionAnalysisSectionProps {
  rows: any[];
  headers: string[];
  auditSummary: DatasetAuditSummary;
  lang: Language;
  onRqsUpdated: (rqs: ResearchQuestionItem[]) => void;
  onNextStep: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ResearchQuestionAnalysisSection: React.FC<ResearchQuestionAnalysisSectionProps> = ({
  rows,
  headers,
  auditSummary,
  lang,
  onRqsUpdated,
  onNextStep,
  onShowToast
}) => {
  const [rqs, setRqs] = useState<ResearchQuestionItem[]>([
    {
      id: 'rq_1',
      rqNumber: 1,
      rqText: "What are university teachers' perceptions and awareness levels regarding AI?",
      selectedVars: headers.slice(0, 2),
      selectedTest: 'descriptive',
      alphaLevel: 0.05,
      status: 'draft'
    },
    {
      id: 'rq_2',
      rqNumber: 2,
      rqText: 'What factors influence teachers acceptance and integration of AI in research?',
      selectedVars: headers.slice(2, 4),
      selectedTest: 'regression',
      alphaLevel: 0.05,
      status: 'draft'
    },
    {
      id: 'rq_3',
      rqNumber: 3,
      rqText: 'Is there a significant difference in AI acceptance across different academic faculties?',
      selectedVars: [headers[0], headers[1]].filter(Boolean),
      selectedTest: 'anova',
      alphaLevel: 0.05,
      status: 'draft'
    },
    {
      id: 'rq_4',
      rqNumber: 4,
      rqText: 'Is there a significant relationship between teaching experience and research output?',
      selectedVars: [headers[0], headers[2]].filter(Boolean),
      selectedTest: 'pearson',
      alphaLevel: 0.05,
      status: 'draft'
    }
  ]);

  const rtl = isRTL(lang);

  const handleRqTextChange = (id: string, text: string) => {
    setRqs(prev => prev.map(item => (item.id === id ? { ...item, rqText: text } : item)));
  };

  const handleVarToggle = (rqId: string, varName: string) => {
    setRqs(prev =>
      prev.map(item => {
        if (item.id !== rqId) return item;
        const updatedVars = item.selectedVars.includes(varName)
          ? item.selectedVars.filter(v => v !== varName)
          : [...item.selectedVars, varName];

        // Trigger smart recommendation for updated vars
        const recommendation = dataAnalysisService.recommendTestForRQ(
          auditSummary.variables,
          updatedVars
        );

        return {
          ...item,
          selectedVars: updatedVars,
          recommendedTest: recommendation.recommendedTest,
          selectedTest: item.selectedTest === 'descriptive' ? recommendation.recommendedTest : item.selectedTest
        };
      })
    );
  };

  const handleTestChange = (rqId: string, test: string) => {
    setRqs(prev => prev.map(item => (item.id === rqId ? { ...item, selectedTest: test } : item)));
  };

  const handleAlphaChange = (rqId: string, alpha: number) => {
    setRqs(prev => prev.map(item => (item.id === rqId ? { ...item, alphaLevel: alpha } : item)));
  };

  const executeRqAnalysis = (rqId: string) => {
    const rq = rqs.find(item => item.id === rqId);
    if (!rq) return;

    if (!rq.selectedVars || rq.selectedVars.length === 0) {
      onShowToast('error', 'Select Variables', 'Please select at least 1 variable for Research Question analysis.');
      return;
    }

    try {
      let resultData: any;
      if (rq.selectedTest === 'descriptive' || rq.selectedTest === 'frequency') {
        resultData = dataAnalysisService.runDescriptives(rows, rq.selectedVars);
      } else {
        resultData = dataAnalysisService.runStatisticalTest(rq.selectedTest, rows, {
          dv: rq.selectedVars[0],
          ivs: rq.selectedVars.slice(1),
          groupingVar: rq.selectedVars[1] || rq.selectedVars[0],
          rowVar: rq.selectedVars[0],
          colVar: rq.selectedVars[1],
          var1: rq.selectedVars[0],
          var2: rq.selectedVars[1],
          variables: rq.selectedVars
        });
      }

      const summaryText = dataAnalysisService.generateLocalInterpretationFallback(rq.selectedTest, resultData);

      const updatedRqs = rqs.map(item => {
        if (item.id !== rqId) return item;
        return {
          ...item,
          status: 'computed' as const,
          computedOutput: resultData,
          resultSummary: summaryText
        };
      });

      setRqs(updatedRqs);
      onRqsUpdated(updatedRqs);
      onShowToast('success', `RQ ${rq.rqNumber} Computed`, `Statistical analysis executed cleanly for Research Question ${rq.rqNumber}.`);
    } catch (err: any) {
      onShowToast('error', `RQ ${rq.rqNumber} Error`, err.message || 'Failed to execute test.');
    }
  };

  const handleProceed = () => {
    onRqsUpdated(rqs);
    onNextStep();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            {lang === 'ku' ? 'شیکردنەوەی پرسیارەکانی توێژینەوە (Analyze Research Questions)' : lang === 'bad' ? 'شیکارکرنا پرسیارێن ڤەکۆلینێ' : lang === 'ar' ? 'تحليل أسئلة البحث' : 'Analyze Research Questions (RQ 1–4)'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Map research questions to dataset variables, receive smart statistical recommendations, and execute targeted hypothesis testing
          </p>
        </div>

        <button
          onClick={handleProceed}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          {lang === 'ku' ? 'بەردەوامبوون بۆ دروستکەری چارتەکان' : lang === 'bad' ? 'دەربازبوون بۆ دروستکەرێ چارتان' : lang === 'ar' ? 'الانتقال إلى المخططات البيانية' : 'Proceed to Visualizations'}
          <ArrowRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* RQs List Cards */}
      <div className="space-y-6">
        {rqs.map((rq, idx) => {
          const rec = dataAnalysisService.recommendTestForRQ(
            auditSummary.variables,
            rq.selectedVars
          );

          return (
            <div
              key={rq.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                    RQ{rq.rqNumber}
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Research Question {rq.rqNumber}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Alpha (α):</span>
                  <select
                    value={rq.alphaLevel}
                    onChange={e => handleAlphaChange(rq.id, Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1"
                  >
                    <option value={0.05}>.05 (95% Confidence)</option>
                    <option value={0.01}>.01 (99% Confidence)</option>
                    <option value={0.10}>.10 (90% Confidence)</option>
                  </select>
                </div>
              </div>

              {/* RQ Input Text */}
              <input
                type="text"
                value={rq.rqText}
                onChange={e => handleRqTextChange(rq.id, e.target.value)}
                placeholder="Enter Research Question statement..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />

              {/* Variable Picker & Test Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Variables */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Select Variables</label>
                  <div className="max-h-36 overflow-y-auto grid grid-cols-2 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {headers.map(h => (
                      <label key={h} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rq.selectedVars.includes(h)}
                          onChange={() => handleVarToggle(rq.id, h)}
                          className="rounded bg-slate-900 border-slate-700 text-blue-600"
                        />
                        <span className="truncate">{h}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Selected Test */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Statistical Analysis Method</label>
                  <select
                    value={rq.selectedTest}
                    onChange={e => handleTestChange(rq.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                  >
                    <option value="descriptive">Frequencies, Mean & Standard Deviation</option>
                    <option value="independent_ttest">Independent Samples T-Test</option>
                    <option value="anova">One-Way ANOVA</option>
                    <option value="chisquare">Chi-Square Test of Independence</option>
                    <option value="pearson">Pearson Correlation</option>
                    <option value="spearman">Spearman Rank Correlation</option>
                    <option value="regression">Linear Multiple Regression</option>
                    <option value="reliability">Cronbach's Alpha Reliability</option>
                  </select>

                  {/* Recommendation Card */}
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Recommended: {rec.recommendedTest.toUpperCase()}</strong>
                      <span className="text-[11px] text-blue-200">{rec.reason}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Trigger & Result View */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="text-xs text-slate-400">
                  Status: {rq.status === 'computed' ? <span className="text-emerald-400 font-bold">✔ Computed</span> : 'Draft'}
                </span>

                <button
                  onClick={() => executeRqAnalysis(rq.id)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Analyze RQ{rq.rqNumber}
                </button>
              </div>

              {/* Computed Output Display */}
              {rq.resultSummary && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 font-serif">
                  <p className="font-bold text-emerald-400 italic">Empirical Findings for RQ {rq.rqNumber}:</p>
                  <p className="whitespace-pre-line leading-relaxed">{rq.resultSummary}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
