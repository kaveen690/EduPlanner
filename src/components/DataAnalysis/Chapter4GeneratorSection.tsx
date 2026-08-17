import React, { useState } from 'react';
import { FileText, Sparkles, Download, Copy, Check, BookOpen, Table, FileCode, CheckCircle2 } from 'lucide-react';
import { Language, ResearchQuestionItem } from '../../types';
import { isRTL } from '../../lib/i18n';
import { dataAnalysisService, DatasetAuditSummary } from '../../services/dataAnalysisService';
import { exportSpssToWord, exportSpssToPdf, exportSpssToExcel } from '../../lib/exportUtils';

interface Chapter4GeneratorSectionProps {
  datasetName: string;
  rows: any[];
  headers: string[];
  auditSummary: DatasetAuditSummary;
  rqs: ResearchQuestionItem[];
  lang: Language;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const Chapter4GeneratorSection: React.FC<Chapter4GeneratorSectionProps> = ({
  datasetName,
  rows,
  headers,
  auditSummary,
  rqs,
  lang,
  onShowToast
}) => {
  const [chapter4Text, setChapter4Text] = useState<string>(() =>
    dataAnalysisService.buildChapter4Text(datasetName, rqs, auditSummary)
  );

  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const rtl = isRTL(lang);

  const handleGenerateAiInterpretation = async () => {
    setIsInterpreting(true);
    try {
      const computedSampleData = {
        totalRows: auditSummary.totalRows,
        totalColumns: auditSummary.totalColumns,
        missingCellPercent: auditSummary.missingCellPercent,
        researchQuestions: rqs.map(r => ({
          rqNumber: r.rqNumber,
          rqText: r.rqText,
          selectedTest: r.selectedTest,
          resultSummary: r.resultSummary
        }))
      };

      const resultText = await dataAnalysisService.generateAcademicInterpretation(
        'chapter4_summary',
        computedSampleData,
        datasetName,
        lang
      );

      setAiInterpretation(resultText);
      onShowToast('success', 'AI Interpretation Generated', 'Academic statistical writeup generated cleanly.');
    } catch (err: any) {
      onShowToast('error', 'AI Interpretation Error', err.message || 'Failed to generate interpretation.');
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleExportWord = async () => {
    try {
      const mockOutputData: any = {
        analysisType: 'descriptive',
        datasetName: datasetName,
        descriptives: dataAnalysisService.runDescriptives(rows, headers.slice(0, 5)),
        scholarlyWriteup: chapter4Text
      };
      await exportSpssToWord(mockOutputData);
      onShowToast('success', 'Word Export Complete', 'Chapter 4 exported to .docx with APA 7 formatting.');
    } catch (err: any) {
      onShowToast('error', 'Export Error', err.message || 'Failed to export Word document.');
    }
  };

  const handleExportPdf = () => {
    try {
      const mockOutputData: any = {
        analysisType: 'descriptive',
        datasetName: datasetName,
        descriptives: dataAnalysisService.runDescriptives(rows, headers.slice(0, 5)),
        scholarlyWriteup: chapter4Text
      };
      exportSpssToPdf(mockOutputData);
      onShowToast('success', 'PDF Export Complete', 'Chapter 4 exported to PDF.');
    } catch (err: any) {
      onShowToast('error', 'Export Error', err.message || 'Failed to export PDF.');
    }
  };

  const handleExportExcel = () => {
    try {
      const mockOutputData: any = {
        analysisType: 'descriptive',
        datasetName: datasetName,
        descriptives: dataAnalysisService.runDescriptives(rows, headers.slice(0, 5))
      };
      exportSpssToExcel(mockOutputData);
      onShowToast('success', 'Excel Export Complete', 'Statistical tables exported to Excel.');
    } catch (err: any) {
      onShowToast('error', 'Export Error', err.message || 'Failed to export Excel tables.');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(chapter4Text + '\n\n' + aiInterpretation);
    setCopiedText(true);
    onShowToast('success', 'Copied to Clipboard', 'Chapter 4 text copied.');
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {lang === 'ku' ? 'دروستکردنی بەشی ٤ (Chapter 4 Results & Findings)' : lang === 'bad' ? 'دروستکرنا بەشێ ٤' : lang === 'ar' ? 'إنشاء الفصل الرابع: النتائج والتفاصيل' : 'Generate Chapter 4: Results & Findings'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Structured academic Results chapter generated strictly from actual calculated statistical outputs without fabrication
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            Copy Text
          </button>

          <button
            onClick={handleExportWord}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Word (.docx)
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            Excel
          </button>
        </div>
      </div>

      {/* AI Interpretation Trigger Card */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">AI Academic Results Interpretation</h4>
            <p className="text-xs text-slate-400">
              Generate peer-reviewed APA 7 interpretation explaining empirical findings, p-values, correlations, and regression models.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateAiInterpretation}
          disabled={isInterpreting}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          {isInterpreting ? 'Interpreting Statistics...' : 'Interpret Results with AI'}
        </button>
      </div>

      {/* AI Writeup Panel */}
      {aiInterpretation && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-3 font-serif">
          <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> AI Scholarly Interpretation & Hypothesis Decision
          </h5>
          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800">
            {aiInterpretation}
          </div>
        </div>
      )}

      {/* Main Chapter 4 Document Textarea */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-slate-100 font-serif italic border-b border-slate-800 pb-3">
          CHAPTER FOUR: RESULTS AND FINDINGS (Editable Manuscript Text)
        </h4>

        <textarea
          value={chapter4Text}
          onChange={e => setChapter4Text(e.target.value)}
          rows={22}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-5 font-serif text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};
