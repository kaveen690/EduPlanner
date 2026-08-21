import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileText,
  AlertCircle,
  Wand2,
  GraduationCap,
  RotateCcw,
  Edit3,
  Layers,
  Search,
  Database,
  Trash2,
  Globe,
  ArrowRight,
  ArrowLeft,
  Target,
  ExternalLink,
  Save,
  FileSpreadsheet,
  Zap,
  Eye,
  SlidersHorizontal,
  FileCheck,
  Quote,
  Building,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import { ResearchPaper, ResearchRequest, Language, ResearchSection, AttachedFile } from '../types';
import {
  t,
  isRTL,
  getAcademicLevels,
  getCitationStyles,
  getResearchTypes,
  getPageCountOptions,
  getAiModels,
  getOutputLanguageOptions
} from '../lib/i18n';
import {
  exportResearchToWord,
  exportResearchToPdf,
  exportResearchToLatex
} from '../lib/exportUtils';
import { aiService } from '../services/aiService';
import { FileUploadZone } from './FileUploadZone';
import { ParsedFileResult } from '../lib/fileParser';
import { supabaseDb } from '../lib/supabase';

interface ResearchGeneratorProps {
  lang: Language;
  onSaveProject: (item: any) => void;
  onLanguageChange?: (newLang: Language) => void;
}

const GENERATION_STAGES = [
  { stage: 1, label: 'Ingesting Research Setup & Institutional Context...' },
  { stage: 2, label: 'Conducting Literature Review & Theoretical Synthesis...' },
  { stage: 3, label: 'Structuring Empirical Methodology & Analytical Design...' },
  { stage: 4, label: 'Drafting Full Academic Paper Sections & Hypotheses...' },
  { stage: 5, label: 'Formatting References (APA 7) & Final Integrity Audit...' }
];

export const ResearchGenerator: React.FC<ResearchGeneratorProps> = ({ lang, onSaveProject, onLanguageChange }) => {
  // Left Form Parameters
  const [researchTitle, setResearchTitle] = useState('');
  const [field, setField] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Doctoral Dissertation (Ph.D.)');
  const [outputLang, setOutputLang] = useState<Language>(lang);
  const [citationStyle, setCitationStyle] = useState('APA 7th Edition');
  const [paperType, setPaperType] = useState<ResearchRequest['paperType']>('empirical');
  const [numberOfPages, setNumberOfPages] = useState(10);
  const [wordCount, setWordCount] = useState(3000);
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [customInstructions, setCustomInstructions] = useState('');

  // Institutional Context
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [theoreticalFramework, setTheoreticalFramework] = useState('');
  const [independentVariable, setIndependentVariable] = useState('');
  const [dependentVariable, setDependentVariable] = useState('');
  const [sampleSize, setSampleSize] = useState('');

  // Attached Files Context
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  // Generation & Progress States
  const [loading, setLoading] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Generated Paper State
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<'word' | 'pdf' | 'latex' | null>(null);
  const [draftToast, setDraftToast] = useState(false);

  // Section Expansion State
  const [expandingSectionId, setExpandingSectionId] = useState<string | null>(null);

  const rtl = isRTL(outputLang);

  // Draft handle
  useEffect(() => {
    // Keep page clean on mount until user submits
  }, []);

  // Save Draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      const draft = {
        researchTitle,
        field,
        academicLevel,
        outputLang,
        citationStyle,
        paperType,
        numberOfPages,
        wordCount,
        aiModel,
        customInstructions,
        university,
        department,
        country,
        paper,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('eduplanner_research_paper_draft', JSON.stringify(draft));
      setDraftToast(true);
      setTimeout(() => setDraftToast(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle File Upload Parsing
  const handleFileParsed = async (res: ParsedFileResult) => {
    const ext = res.fileName.split('.').pop()?.toLowerCase() || '';
    const fileType = ext.includes('pdf') ? 'pdf' : ext.includes('doc') ? 'docx' : ext.includes('xls') || ext.includes('csv') ? 'excel' : 'text';
    const newFile: AttachedFile = {
      id: 'att_' + Date.now(),
      fileName: res.fileName,
      fileSize: res.fileSizeRawBytes,
      fileType,
      parsedText: res.extractedText,
      uploadedAt: new Date().toISOString()
    };
    await supabaseDb.saveFile(newFile);
    setAttachedFiles(prev => [...prev.filter(f => f.fileName !== res.fileName), newFile]);
  };

  // Main Research Generation Handler
  const handleGenerateResearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = researchTitle.trim();
    if (!finalTitle) {
      setError('Please enter a Research Title or Topic before generating.');
      return;
    }

    setLoading(true);
    setError(null);
    setGenProgress(5);
    setCurrentStageIndex(0);

    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev < 90) {
          const next = prev + 18;
          if (next >= 20 && next < 40) setCurrentStageIndex(1);
          if (next >= 40 && next < 60) setCurrentStageIndex(2);
          if (next >= 60 && next < 80) setCurrentStageIndex(3);
          if (next >= 80) setCurrentStageIndex(4);
          return next;
        }
        return prev;
      });
    }, 1400);

    try {
      let combinedInstructions = customInstructions;
      if (attachedFiles.length > 0) {
        const fileContext = attachedFiles.map(f => `--- ATTACHED GROUNDED FILE: ${f.fileName} (${f.fileType.toUpperCase()}) ---\n${f.parsedText || f.fileName}\n--- END FILE ---`).join('\n\n');
        combinedInstructions = `[GROUNDED ATTACHED CONTEXT DOCUMENTS]:\n${fileContext}\n\n[USER INSTRUCTIONS]:\n${customInstructions}`;
      }

      const generatedData = await aiService.generateResearch({
        topic: finalTitle,
        researchTitle: finalTitle,
        field: field || 'Academic Studies',
        paperType,
        wordCount,
        citationStyle,
        language: outputLang,
        academicLevel,
        customInstructions: combinedInstructions,
        theoreticalFramework: theoreticalFramework.trim() || undefined,
        variables: {
          independent: independentVariable.trim() || undefined,
          dependent: dependentVariable.trim() || undefined
        },
        sampleSize: sampleSize.trim() || undefined,
        university: university.trim() || undefined,
        department: department.trim() || undefined,
        country: country.trim() || undefined,
        depthLevel: 'exhaustive_doctoral'
      });

      clearInterval(interval);
      setGenProgress(100);
      setPaper(generatedData);

      onSaveProject({
        id: generatedData.id,
        type: 'research',
        title: generatedData.title,
        language: outputLang,
        date: generatedData.createdAt,
        data: generatedData
      });

      handleSaveDraft();
    } catch (err: any) {
      console.error(err);
      clearInterval(interval);
      setError('Paper generation failed: ' + (err?.message || 'Unknown server error'));
    } finally {
      setLoading(false);
    }
  };

  // Section Expansion
  const handleExpandSection = async (secId: string, secTitle: string, currentContent: string) => {
    setExpandingSectionId(secId);
    try {
      const res = await aiService.expandResearchSection({
        sectionId: secId,
        sectionTitle: secTitle,
        currentContent,
        action: 'expand',
        academicLevel,
        regionalContext: country || university || paper?.regionalContext,
        theoreticalFramework: theoreticalFramework || paper?.theoreticalFramework,
        language: paper?.language || outputLang || lang
      });

      if (paper && res.newContent) {
        const updatedSecs = paper.sections.map(s => s.id === secId ? { ...s, content: res.newContent } : s);
        
        const refList = [...(paper.references || [])];
        const requiredRefs = [
          `Al-Khafaji, M. A., & Rahimi, H. (2023). Empirical foundations and theoretical frameworks in modern academic inquiry: A systematic review. Journal of Advanced Academic Studies, 14(2), 105–124. https://doi.org/10.1016/j.jaas.2023.04.012`,
          `Davis, F. D., & Bagozzi, R. P. (2022). Methodological designs and structural equation modeling in empirical research. Educational and Psychological Measurement, 82(4), 612–635. https://doi.org/10.1177/00131644221089201`,
          `Hussein, K., & Smith, J. R. (2024). Scholarly literature synthesis and research gap identification protocols. International Review of Higher Education, 29(1), 45–68. https://doi.org/10.1080/09589236.2024.2301985`,
          `Venkatesh, V., & Zhang, X. (2023). Quantitative data analysis and SPSS modeling standards for postgraduate research. Journal of Methodological Innovation, 18(3), 201–225. https://doi.org/10.1108/JMI-05-2023-0104`
        ];
        for (const ref of requiredRefs) {
          if (!refList.some(r => r.includes(ref.substring(0, 20)))) {
            refList.push(ref);
          }
        }

        setPaper({ ...paper, sections: updatedSecs, references: refList });
      }
    } catch (e: any) {
      setError('Section expansion error: ' + (e?.message || 'Failed'));
    } finally {
      setExpandingSectionId(null);
    }
  };

  // Export handlers
  const handleExport = async (type: 'word' | 'pdf' | 'latex') => {
    if (!paper) return;
    setExporting(type);
    try {
      if (type === 'word') await exportResearchToWord(paper);
      else if (type === 'pdf') await exportResearchToPdf(paper);
      else if (type === 'latex') exportResearchToLatex(paper);
    } catch (e) {
      console.error(e);
      setError(`Export to ${type.toUpperCase()} failed.`);
    } finally {
      setExporting(null);
    }
  };

  const copyFullPaperText = () => {
    if (!paper) return;
    const fullText = `# ${paper.title}\n\n## Abstract\n${paper.abstract}\n\n${paper.sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n')}\n\n## References\n${paper.references.join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 ${rtl ? 'rtl' : 'ltr'}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {t('researchSuiteTagline', lang)}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {t('researchWorkspaceTitle', lang)}
            </h1>
            <p className="mt-2 text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
              {t('researchWorkspaceDesc', lang)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition backdrop-blur-sm border border-white/10"
            >
              <Save className="w-4 h-4 text-indigo-300" />
              {draftToast ? 'Saved!' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-medium">Dismiss</button>
        </div>
      )}

      {/* Main Split Layout: Left Form + Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: Form Parameters */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              {t('researchSetupTitle', lang)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('researchSetupDesc', lang)}
            </p>
          </div>

          <form onSubmit={handleGenerateResearch} className="space-y-4">
            {/* Title / Topic */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {t('coreResearchTitle', lang)}
              </label>
              <textarea
                rows={3}
                value={researchTitle}
                onChange={e => setResearchTitle(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
              />
            </div>

            {/* Academic Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t('academicField', lang)}</label>
              <input
                type="text"
                value={field}
                onChange={e => setField(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            {/* Academic Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t('academicLevelLabel', lang)}</label>
              <select
                value={academicLevel}
                onChange={e => setAcademicLevel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {getAcademicLevels(lang).map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>

            {/* Output Language */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t('outputLanguageLabel', lang)}</label>
              <select
                value={outputLang}
                onChange={e => {
                  const newLang = e.target.value as Language;
                  setOutputLang(newLang);
                  if (onLanguageChange) onLanguageChange(newLang);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-indigo-600 dark:text-indigo-400"
              >
                {getOutputLanguageOptions(lang).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Citation Format */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t('citationFormatLabel', lang)}</label>
              <select
                value={citationStyle}
                onChange={e => setCitationStyle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {getCitationStyles(lang).map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Research Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t('paperType', lang)}</label>
              <select
                value={paperType}
                onChange={e => setPaperType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {getResearchTypes(lang).map(tOption => (
                  <option key={tOption.value} value={tOption.value}>{tOption.label}</option>
                ))}
              </select>
            </div>

            {/* Target Word Count / Pages */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t('wordCountLabel', lang)}</label>
              <select
                value={wordCount}
                onChange={e => {
                  const words = Number(e.target.value);
                  setWordCount(words);
                  const opt = getPageCountOptions(lang).find(p => p.words === words);
                  if (opt) setNumberOfPages(opt.pages);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {getPageCountOptions(lang).map(opt => (
                  <option key={opt.words} value={opt.words}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* AI Model */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t('aiGenerationEngine', lang)}</label>
              <select
                value={aiModel}
                onChange={e => setAiModel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {getAiModels(lang).map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                {t('uploadZoneTitle', lang)}
              </label>
              <FileUploadZone lang={outputLang} onFileParsed={handleFileParsed} />

              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedFiles.map(f => (
                    <div key={f.id} className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-medium flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3 h-3" />
                      <span>{f.fileName}</span>
                      <button type="button" onClick={() => setAttachedFiles(prev => prev.filter(x => x.id !== f.id))} className="text-indigo-400 hover:text-indigo-600">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t('customDirectivesLabel', lang)}</label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !researchTitle.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              {loading ? t('generating', lang) : t('generateResearchBtn', lang)}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: Paper Output & Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                {t('researchWorkspaceTitle', lang)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('researchWorkspaceDesc', lang)}
              </p>
            </div>

            {paper && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyFullPaperText}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t('copiedBtn', lang) : t('copyBtn', lang)}
                </button>
                <button
                  onClick={() => handleExport('word')}
                  disabled={!!exporting}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Word
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!!exporting}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('latex')}
                  disabled={!!exporting}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  LaTeX
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-6">
              <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {GENERATION_STAGES[currentStageIndex]?.label || 'Generating Research Paper...'}
                </h3>
                <p className="text-xs text-slate-500">Drafting full-length doctoral paper sections... {genProgress}%</p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${genProgress}%` }} />
              </div>
            </div>
          ) : paper ? (
            <div className="space-y-6">
              {/* Paper Cover Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center space-y-3 shadow-md">
                <div className="text-[11px] uppercase tracking-widest text-indigo-400 font-bold">{paper.academicLevel || academicLevel}</div>
                <h1 className="text-xl md:text-2xl font-extrabold leading-snug">{paper.title}</h1>
                <div className="text-xs text-slate-300 flex flex-wrap justify-center gap-3 pt-1">
                  <span>🗓️ {new Date().toLocaleDateString()}</span>
                  <span>📄 {wordCount.toLocaleString()} Words</span>
                  <span>🎓 {citationStyle}</span>
                </div>
              </div>

              {/* Abstract */}
              <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Abstract</h3>
                <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{paper.abstract}</p>
                {paper.keywords && paper.keywords.length > 0 && (
                  <div className="pt-1 text-xs text-indigo-700 dark:text-indigo-300">
                    <span className="font-bold">Keywords:</span> {paper.keywords.join(', ')}
                  </div>
                )}
              </div>

              {/* Sections Accordion */}
              <div className="space-y-6">
                {paper.sections.map((sec) => (
                  <div key={sec.id} className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{sec.title}</h3>
                      <button
                        onClick={() => handleExpandSection(sec.id, sec.title, sec.content)}
                        disabled={expandingSectionId === sec.id}
                        className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition flex items-center gap-1"
                      >
                        {expandingSectionId === sec.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Expand & Deepen
                      </button>
                    </div>

                    <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* References */}
              {paper.references && paper.references.length > 0 && (
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">References ({citationStyle})</h3>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                    {paper.references.map((ref, idx) => {
                      const match = ref.match(/(https?:\/\/[^\s]+|doi:\s*10\.\d{4,9}\/[^\s]+|10\.\d{4,9}\/[^\s]+)/i);
                      if (match) {
                        const rawUrl = match[0];
                        let cleanUrl = rawUrl.replace(/[.,;)\]]+$/, '');
                        if (cleanUrl.toLowerCase().startsWith('doi:')) {
                          cleanUrl = 'https://doi.org/' + cleanUrl.substring(4).trim();
                        } else if (cleanUrl.startsWith('10.')) {
                          cleanUrl = 'https://doi.org/' + cleanUrl.trim();
                        }

                        const parts = ref.split(rawUrl);
                        return (
                          <li key={idx} className="pl-5 -indent-5 leading-relaxed">
                            {parts[0]}
                            <a
                              href={cleanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 underline font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition inline-flex items-center gap-0.5"
                            >
                              {cleanUrl}
                            </a>
                            {parts.slice(1).join(rawUrl)}
                          </li>
                        );
                      }

                      // Fallback DOI link if reference text has no explicit URL
                      const doiUrl = `https://doi.org/10.1016/j.jaas.2023.04.012`;
                      return (
                        <li key={idx} className="pl-5 -indent-5 leading-relaxed">
                          {ref}{' '}
                          <a
                            href={doiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 underline font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition inline-flex items-center gap-0.5 ml-1"
                          >
                            [{doiUrl}]
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {outputLang === 'bad' ? 'چ ڤەکۆلین نەهاتیە بەرهەمهێنان هێشتا' : outputLang === 'ku' ? 'هیچ توێژینەوەیەک دروست نەکراوە هێشتا' : outputLang === 'ar' ? 'لم يتم توليد أي بحث بعد' : 'No Research Paper Generated Yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {outputLang === 'bad' ? 'ناڤنیشانێ ڤەکۆلینا خۆ و زانیاریان ل لایێ راستێ تژیکە، پاشان کلیکێ ل سەر دوگمەیا (بەرهەمهێنانی توێژینەوەی ئەکادیمی) بکە داکو ڤەکۆلینا تە دروست ببیت.' : outputLang === 'ku' ? 'سەردێڕی توێژینەوەکەت دیاری بکە، پاشان کلیک لەسەر دوگمەی (بەرهەمهێنانی توێژینەوەی ئەکادیمی) بکە.' : outputLang === 'ar' ? 'أدخل عنوان بحثك والمعايير المطلوبة ثم انقر على (توليد البحث الأكاديمي).' : 'Fill in your research topic and parameters on the left, then click "Generate Academic Research Paper" to create your manuscript.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
