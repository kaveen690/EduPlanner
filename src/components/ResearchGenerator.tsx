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
import { t, isRTL } from '../lib/i18n';
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
}

const ACADEMIC_LEVELS = [
  'Doctoral Dissertation (Ph.D.)',
  "Master's Thesis (M.Sc. / M.A.)",
  "Bachelor's Thesis (B.Sc. / B.A.)",
  'Peer-Reviewed Journal Article (IEEE/Springer/Elsevier)',
  'Undergraduate Senior Research Paper'
];

const CITATION_STYLES = [
  'APA 7th Edition',
  'APA 6th Edition',
  'MLA 9th Edition',
  'Chicago 17th Edition',
  'Harvard Reference Style',
  'IEEE Format',
  'Vancouver Style'
];

const RESEARCH_TYPES = [
  { value: 'empirical', label: 'Empirical Quantitative Study (Survey / Data Analysis)' },
  { value: 'literature_review', label: 'Systematic Literature Review & Meta-Analysis' },
  { value: 'case_study', label: 'Qualitative Case Study & Field Work' },
  { value: 'theoretical', label: 'Theoretical Framework & Conceptual Paper' },
  { value: 'methodological', label: 'Mixed-Methods Empirical Study' }
];

const PAGE_COUNT_OPTIONS = [
  { pages: 5, words: 1500, label: '5 Pages (~1,500 Words - Short Paper)' },
  { pages: 10, words: 3000, label: '10 Pages (~3,000 Words - Standard Journal Paper)' },
  { pages: 15, words: 5000, label: '15 Pages (~5,000 Words - Extended Journal Study)' },
  { pages: 25, words: 8000, label: '25 Pages (~8,000 Words - Master Thesis Chapter)' },
  { pages: 40, words: 12000, label: '40 Pages (~12,000 Words - Doctoral Dissertation)' }
];

const AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Google Gemini 2.5 Flash (Recommended - Fast)' },
  { id: 'gemini-2.5-pro', name: 'Google Gemini 2.5 Pro (Exhaustive Depth)' },
  { id: 'gpt-4o', name: 'OpenAI GPT-4o' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' }
];

const GENERATION_STAGES = [
  { stage: 1, label: 'Ingesting Research Setup & Institutional Context...' },
  { stage: 2, label: 'Conducting Literature Review & Theoretical Synthesis...' },
  { stage: 3, label: 'Structuring Empirical Methodology & Analytical Design...' },
  { stage: 4, label: 'Drafting Full Academic Paper Sections & Hypotheses...' },
  { stage: 5, label: 'Formatting References (APA 7) & Final Integrity Audit...' }
];

export const ResearchGenerator: React.FC<ResearchGeneratorProps> = ({ lang, onSaveProject }) => {
  // Left Form Parameters
  const [researchTitle, setResearchTitle] = useState('');
  const [field, setField] = useState('Education & Social Sciences');
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

  // Restore Draft on Mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('eduplanner_research_paper_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.researchTitle) setResearchTitle(parsed.researchTitle);
        if (parsed.field) setField(parsed.field);
        if (parsed.academicLevel) setAcademicLevel(parsed.academicLevel);
        if (parsed.citationStyle) setCitationStyle(parsed.citationStyle);
        if (parsed.paperType) setPaperType(parsed.paperType);
        if (parsed.customInstructions) setCustomInstructions(parsed.customInstructions);
        if (parsed.paper) setPaper(parsed.paper);
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
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
        language: outputLang
      });

      if (paper && res.newContent) {
        const updatedSecs = paper.sections.map(s => s.id === secId ? { ...s, content: res.newContent } : s);
        setPaper({ ...paper, sections: updatedSecs });
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
              EduPlanner AI Research Paper Suite
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {outputLang === 'bad' ? 'سیستەمێ بەرهەمهێنانا توێژینەوەیا ئەکادیمی' : outputLang === 'ku' ? 'سیستەمی بەرهەمهێنانی توێژینەوەی ئەکادیمی' : outputLang === 'ar' ? 'منظومة كتابة البحوث الأكاديمية' : 'AI Academic Research Paper Generator'}
            </h1>
            <p className="mt-2 text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
              {outputLang === 'bad'
                ? 'داڕشتنا توێژینەوەیا ئەکادیمی د ئاستێ دکتۆرا و ماستەر بەپێی ستانداردێن نێودەوڵەتی، بێ ژمارەیێن ئاماری یێن دەستکرد، دگەل پاراستنا ١٠٠٪ یا زمانی دیارکری.'
                : outputLang === 'ku'
                ? 'داڕشتنی توێژینەوەی ئەکادیمی لە ئاستی دکتۆرا و ماستەر بەپێی ستانداردە نێودەوڵەتییەکان بەبێ ژمارەی ئاماری دەستکرد بە یەک زمانی دروست.'
                : outputLang === 'ar'
                ? 'إعداد وتطوير أوراق علمية وأطروحات ماجستير ودكتوراه وفق المعايير الدولية بدقة منهجية وتوثيق خالي من الأرقام الوهمية.'
                : 'Generate peer-reviewed quality doctoral research papers, master thesis chapters, and journal manuscripts with 100% single-language consistency and zero fake statistics.'}
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
              Research Parameters & Setup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify academic parameters, language, and target page length.
            </p>
          </div>

          <form onSubmit={handleGenerateResearch} className="space-y-4">
            {/* Title / Topic */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Research Title / Topic <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={researchTitle}
                onChange={e => setResearchTitle(e.target.value)}
                placeholder="e.g. هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
              />
            </div>

            {/* Academic Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Academic Field / Domain</label>
              <input
                type="text"
                value={field}
                onChange={e => setField(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            {/* Academic Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Target Academic Level</label>
              <select
                value={academicLevel}
                onChange={e => setAcademicLevel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {ACADEMIC_LEVELS.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Output Language */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Output Language (100% Single Language Lock)</label>
              <select
                value={outputLang}
                onChange={e => setOutputLang(e.target.value as Language)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-indigo-600 dark:text-indigo-400"
              >
                <option value="en">English (Scholarly Academic English)</option>
                <option value="ku">Kurdish Sorani (شێوەزاری سۆرانی)</option>
                <option value="bad">Kurdish Badini (شێوەزارێ بادینی - دهۆک)</option>
                <option value="ar">Arabic (اللغة العربية الفصحى الأكاديمية)</option>
              </select>
            </div>

            {/* Citation Format */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Citation Style</label>
              <select
                value={citationStyle}
                onChange={e => setCitationStyle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {CITATION_STYLES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Research Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Research Design Type</label>
              <select
                value={paperType}
                onChange={e => setPaperType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {RESEARCH_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Target Word Count / Pages */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Target Length / Word Count</label>
              <select
                value={wordCount}
                onChange={e => {
                  const words = Number(e.target.value);
                  setWordCount(words);
                  const opt = PAGE_COUNT_OPTIONS.find(p => p.words === words);
                  if (opt) setNumberOfPages(opt.pages);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {PAGE_COUNT_OPTIONS.map(opt => (
                  <option key={opt.words} value={opt.words}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* AI Model */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">AI Generation Engine</label>
              <select
                value={aiModel}
                onChange={e => setAiModel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                Attach Context / Empirical Data Files
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
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Custom Research Directives</label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="Add specific research questions, theoretical framework guidelines, or institutional requirements..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating Academic Paper...' : 'Generate Academic Research Paper'}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: Paper Output & Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Academic Research Paper Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Peer-reviewed quality paper adhering strictly to selected language and academic standards.
              </p>
            </div>

            {paper && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyFullPaperText}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
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
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
                    {paper.references.map((ref, idx) => (
                      <li key={idx} className="pl-5 -indent-5 leading-relaxed">{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Research Paper Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Fill in your research topic and parameters on the left, then click "Generate Academic Research Paper" to create your manuscript.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
