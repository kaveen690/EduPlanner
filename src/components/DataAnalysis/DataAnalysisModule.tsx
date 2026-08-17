import React, { useState } from 'react';
import {
  Upload,
  Table,
  Sliders,
  BarChart3,
  Calculator,
  HelpCircle,
  BarChart,
  FileText,
  History,
  CheckCircle2,
  Database,
  Layers,
  AlertTriangle,
  Activity,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Language, DataAnalysisStep, ResearchQuestionItem, DataAnalysisHistoryItem, DataCleaningOptions } from '../../types';
import { isRTL } from '../../lib/i18n';
import { dataAnalysisService, DatasetAuditSummary } from '../../services/dataAnalysisService';
import { DataUploadSection } from './DataUploadSection';
import { DataPreviewSection } from './DataPreviewSection';
import { DataCleaningSection } from './DataCleaningSection';
import { DescriptiveStatsSection } from './DescriptiveStatsSection';
import { StatisticalTestsSection } from './StatisticalTestsSection';
import { ResearchQuestionAnalysisSection } from './ResearchQuestionAnalysisSection';
import { VisualizationSection } from './VisualizationSection';
import { Chapter4GeneratorSection } from './Chapter4GeneratorSection';
import { AnalysisHistoryDrawer } from './AnalysisHistoryDrawer';

interface DataAnalysisModuleProps {
  lang: Language;
  onSaveProject: (item: any) => void;
}

export const DataAnalysisModule: React.FC<DataAnalysisModuleProps> = ({
  lang,
  onSaveProject
}) => {
  const [currentStep, setCurrentStep] = useState<DataAnalysisStep>('upload');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Dataset State
  const [datasetName, setDatasetName] = useState<string>('University_Faculty_Survey.xlsx');
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [auditSummary, setAuditSummary] = useState<DatasetAuditSummary>({
    totalRows: 0,
    totalColumns: 0,
    totalCells: 0,
    totalMissingCells: 0,
    missingCellPercent: 0,
    duplicateRowsCount: 0,
    outlierCount: 0,
    variables: []
  });

  const [analysesRunCount, setAnalysesRunCount] = useState<number>(0);
  const [rqs, setRqs] = useState<ResearchQuestionItem[]>([]);
  const [toastNotification, setToastNotification] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
  } | null>(null);

  const rtl = isRTL(lang);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToastNotification({ type, title, message });
    setTimeout(() => setToastNotification(null), 3500);
  };

  const steps: { id: DataAnalysisStep; label: string; labelKu: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: '1. Upload Data', labelKu: '١. بارکردنی داتا', icon: <Upload className="w-4 h-4" /> },
    { id: 'preview', label: '2. Preview', labelKu: '٢. پێشبینین', icon: <Table className="w-4 h-4" /> },
    { id: 'clean', label: '3. Clean Data', labelKu: '٣. پاککردنەوە', icon: <Sliders className="w-4 h-4" /> },
    { id: 'descriptive', label: '4. Descriptives', labelKu: '٤. ئاماری وەسفی', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'tests', label: '5. Statistical Tests', labelKu: '٥. تاقیکردنەوەکان', icon: <Calculator className="w-4 h-4" /> },
    { id: 'rq-analysis', label: '6. RQ Analysis', labelKu: '٦. شیکاری پرسیارەکان', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'visualization', label: '7. Visualization', labelKu: '٧. دروستکەری چارت', icon: <BarChart className="w-4 h-4" /> },
    { id: 'chapter4', label: '8. Chapter 4', labelKu: '٨. بەشی چوارەم', icon: <FileText className="w-4 h-4" /> }
  ];

  const handleFileLoaded = (data: {
    fileName: string;
    fileSizeFormatted: string;
    rows: any[];
    headers: string[];
  }) => {
    setDatasetName(data.fileName);
    setRows(data.rows);
    setHeaders(data.headers);

    const audit = dataAnalysisService.audit(data.rows);
    setAuditSummary(audit);

    setCurrentStep('preview');

    // Save to LocalStorage History
    const historyItem: DataAnalysisHistoryItem = {
      id: 'session_' + Date.now(),
      datasetName: data.fileName,
      timestamp: new Date().toLocaleDateString(),
      rowsCount: data.rows.length,
      varsCount: data.headers.length,
      missingPercentage: audit.missingCellPercent,
      analysesRun: ['Uploaded', 'Audited'],
      lastStep: 'preview'
    };

    const existing = localStorage.getItem('eduplanner_data_analysis_history');
    let list: DataAnalysisHistoryItem[] = [];
    if (existing) {
      try { list = JSON.parse(existing); } catch (e) {}
    }
    localStorage.setItem('eduplanner_data_analysis_history', JSON.stringify([historyItem, ...list.slice(0, 15)]));

    onSaveProject({
      id: historyItem.id,
      title: `Data Analysis: ${data.fileName}`,
      type: 'spss',
      date: historyItem.timestamp
    });
  };

  const handleApplyCleaning = (options: DataCleaningOptions) => {
    const cleanedRows = dataAnalysisService.applyCleaning(rows, options);
    setRows(cleanedRows);
    if (cleanedRows.length > 0) {
      const newHeaders = Object.keys(cleanedRows[0]);
      setHeaders(newHeaders);
      const newAudit = dataAnalysisService.audit(cleanedRows);
      setAuditSummary(newAudit);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div
            className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 text-xs font-semibold max-w-sm ${
              toastNotification.type === 'success'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                : toastNotification.type === 'error'
                ? 'bg-rose-950 border-rose-500 text-rose-200'
                : 'bg-blue-950 border-blue-500 text-blue-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">{toastNotification.title}</p>
              {toastNotification.message && <p className="opacity-80 text-[11px] mt-0.5">{toastNotification.message}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Main Module Header & Academic Cards Grid */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
                <BarChart3 className="w-6 h-6" />
              </span>
              {lang === 'ku' ? 'شیکردنەوەی داتا' : lang === 'bad' ? 'شیکارکرنا داتایان' : lang === 'ar' ? 'وحدة تحليل البيانات الأكاديمية' : 'Data Analysis Module'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Professional Academic Statistical Suite, Dataset Cleaning, Hypothesis Testing & Chapter 4 Generator
            </p>
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 flex items-center gap-2 transition-all shadow-md shrink-0"
          >
            <History className="w-4 h-4 text-blue-400" />
            {lang === 'ku' ? 'مێژووی شیکارییەکان' : lang === 'bad' ? 'مێژوویا شیکارکرنێ' : lang === 'ar' ? 'سجل التحليلات' : 'Analysis History'}
          </button>
        </div>

        {/* Dashboard Dashboard Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Upload Dataset</span>
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-sm font-bold text-slate-100 mt-2 truncate">{rows.length > 0 ? datasetName : 'No file'}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Observations (Rows)</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-black text-slate-100 mt-1">{rows.length.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Variables (Cols)</span>
              <Table className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-black text-slate-100 mt-1">{headers.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Missing Cells</span>
              <AlertTriangle className={`w-4 h-4 ${auditSummary.totalMissingCells > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
            </div>
            <p className="text-xl font-black text-slate-100 mt-1">
              {auditSummary.totalMissingCells} <span className="text-xs text-slate-400 font-normal">({auditSummary.missingCellPercent}%)</span>
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Analyses Executed</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-black text-slate-100 mt-1">{analysesRunCount}</p>
          </div>
        </div>

        {/* 8-Step Progress Indicator Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl overflow-x-auto">
          <div className="flex items-center min-w-max gap-1">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isDone = steps.findIndex(s => s.id === currentStep) > idx;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => {
                      if (rows.length > 0 || step.id === 'upload') {
                        setCurrentStep(step.id);
                      } else {
                        showToast('info', 'Upload Required', 'Please upload a dataset file first.');
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                        : isDone
                        ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
                        : 'text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {step.icon}
                    <span>{lang === 'ku' || lang === 'bad' ? step.labelKu : step.label}</span>
                  </button>

                  {idx < steps.length - 1 && (
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-700 shrink-0 ${rtl ? 'rotate-180' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Step Content Renderer */}
      <div className="min-h-[500px]">
        {currentStep === 'upload' && (
          <DataUploadSection
            lang={lang}
            onFileLoaded={handleFileLoaded}
            onShowToast={showToast}
          />
        )}

        {currentStep === 'preview' && (
          <DataPreviewSection
            datasetName={datasetName}
            rows={rows}
            headers={headers}
            auditSummary={auditSummary}
            lang={lang}
            onNextStep={() => setCurrentStep('clean')}
          />
        )}

        {currentStep === 'clean' && (
          <DataCleaningSection
            auditSummary={auditSummary}
            headers={headers}
            lang={lang}
            onApplyCleaning={handleApplyCleaning}
            onNextStep={() => setCurrentStep('descriptive')}
            onShowToast={showToast}
          />
        )}

        {currentStep === 'descriptive' && (
          <DescriptiveStatsSection
            rows={rows}
            headers={headers}
            auditSummary={auditSummary}
            lang={lang}
            onNextStep={() => setCurrentStep('tests')}
            onShowToast={showToast}
          />
        )}

        {currentStep === 'tests' && (
          <StatisticalTestsSection
            rows={rows}
            headers={headers}
            auditSummary={auditSummary}
            lang={lang}
            onTestExecuted={() => setAnalysesRunCount(prev => prev + 1)}
            onNextStep={() => setCurrentStep('rq-analysis')}
            onShowToast={showToast}
          />
        )}

        {currentStep === 'rq-analysis' && (
          <ResearchQuestionAnalysisSection
            rows={rows}
            headers={headers}
            auditSummary={auditSummary}
            lang={lang}
            onRqsUpdated={setRqs}
            onNextStep={() => setCurrentStep('visualization')}
            onShowToast={showToast}
          />
        )}

        {currentStep === 'visualization' && (
          <VisualizationSection
            rows={rows}
            headers={headers}
            lang={lang}
            onNextStep={() => setCurrentStep('chapter4')}
            onShowToast={showToast}
          />
        )}

        {currentStep === 'chapter4' && (
          <Chapter4GeneratorSection
            datasetName={datasetName}
            rows={rows}
            headers={headers}
            auditSummary={auditSummary}
            rqs={rqs}
            lang={lang}
            onShowToast={showToast}
          />
        )}
      </div>

      {/* Analysis History Drawer */}
      <AnalysisHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
        onSelectHistoryItem={(item) => {
          showToast('info', 'Loaded Session', `Opened ${item.datasetName}`);
        }}
        onShowToast={showToast}
      />
    </div>
  );
};
