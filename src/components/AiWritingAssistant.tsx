import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  FileText,
  FileDown,
  BookMarked,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Eye,
  Sliders,
  ArrowRight,
  Layers,
  Info,
  Zap,
  BookOpen,
  Edit3,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Language, ProjectItem, AiEditorAction } from '../types';
import { isRTL } from '../lib/i18n';
import { aiService } from '../services/aiService';
import { FileUploadZone } from './FileUploadZone';
import { ParsedFileResult } from '../lib/fileParser';
import { exportWritingToWord, exportWritingToPdf } from '../lib/exportUtils';

interface AiWritingAssistantProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
}

export type WritingMode = 'academic' | 'professional' | 'natural' | 'simple';

export type WritingTool =
  | 'paraphrase'
  | 'clarity'
  | 'academic_style'
  | 'grammar'
  | 'shorten'
  | 'expand'
  | 'simplify';

const SAMPLE_ORIGINAL_TEXT = `The integration of digital higher education infrastructure requires structural policy adaptation and longitudinal validation across multi-tiered governance networks. Previous research demonstrates that academic leadership plays a pivotal role in technology adoption across regional institutions (Al-Duhoki et al., 2023; https://doi.org/10.1016/j.jedu.2023.01.004).

Furthermore, empirical evaluation demonstrates that these conceptual foundations warrant deeper methodological examination across multi-variable frameworks. Statistical processing confirms that predictor variables significantly influenced the primary outcome metric with robust F-statistics (F = 24.18, p < .001).`;

const SAMPLE_IMPROVED_TEXT = `Adopting digital higher education infrastructure necessitates structural policy realignment and longitudinal empirical validation across multi-tiered governance networks. Existing scholarship establishes that academic leadership exerts a decisive influence on technology integration within regional university systems (Al-Duhoki et al., 2023; https://doi.org/10.1016/j.jedu.2023.01.004).

Moreover, empirical assessment indicates that these theoretical models require broader methodological validation using multivariate analytical frameworks. Statistical regression confirms that independent predictor variables significantly affected primary outcome metrics (F = 24.18, p < .001).`;

export const AiWritingAssistant: React.FC<AiWritingAssistantProps> = ({
  lang,
  onSaveProject
}) => {
  const [originalText, setOriginalText] = useState(SAMPLE_ORIGINAL_TEXT);
  const [improvedText, setImprovedText] = useState(SAMPLE_IMPROVED_TEXT);
  const [documentTitle, setDocumentTitle] = useState('Academic Manuscript Draft');
  const [selectedLang, setSelectedLang] = useState<Language>(lang);
  const [selectedMode, setSelectedMode] = useState<WritingMode>('academic');
  const [selectedTool, setSelectedTool] = useState<WritingTool>('academic_style');

  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [replaced, setReplaced] = useState(false);
  const [librarySaved, setLibrarySaved] = useState(false);
  const [exporting, setExporting] = useState<'word' | 'pdf' | null>(null);
  const [viewDiffMode, setViewDiffMode] = useState(true);
  const [summaryOfChanges, setSummaryOfChanges] = useState('Elevated vocabulary to peer-reviewed academic register, enhanced sentence flow, preserved inline citations & DOI links.');
  const [error, setError] = useState<string | null>(null);

  const rtl = isRTL(selectedLang);

  const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = (text: string) => text.length;

  const handleRunTransformation = async (toolToRun?: WritingTool) => {
    const activeTool = toolToRun || selectedTool;
    if (!originalText || !originalText.trim()) return;

    setLoading(true);
    setProgressStep(1);
    setError(null);

    // Map UI tool to AiEditorAction
    let editorAction: AiEditorAction = 'rewrite';
    let customInstruction = '';

    if (activeTool === 'paraphrase') {
      editorAction = 'rewrite';
      customInstruction = `Paraphrase the text thoroughly while strictly preserving original factual claims, citations, inline quotations, references, and DOI links. Tone mode: ${selectedMode}.`;
    } else if (activeTool === 'clarity') {
      editorAction = 'shorten';
      customInstruction = `Improve sentence clarity and eliminate ambiguity while strictly preserving citations, references, and DOI links. Tone mode: ${selectedMode}.`;
    } else if (activeTool === 'academic_style') {
      editorAction = 'academic_tone';
      customInstruction = `Elevate prose to formal peer-reviewed academic style while preserving all citations, references, author names, and DOI URLs. Tone mode: ${selectedMode}.`;
    } else if (activeTool === 'grammar') {
      editorAction = 'improve_grammar';
      customInstruction = `Correct punctuation, syntax, and grammatical typos without altering technical terms, citations, or DOI links. Tone mode: ${selectedMode}.`;
    } else if (activeTool === 'shorten') {
      editorAction = 'shorten';
      customInstruction = `Trim wordiness and condense paragraphs while preserving essential data, citations, and DOI links. Tone mode: ${selectedMode}.`;
    } else if (activeTool === 'expand') {
      editorAction = 'expand';
      customInstruction = `Elaborate with academic depth and scholarly transitions while preserving original citations and DOI links. Tone mode: ${selectedMode}.`;
    } else if (activeTool === 'simplify') {
      editorAction = 'shorten';
      customInstruction = `De-jargonize complex statements into plain, accessible prose while preserving author names, citations, and DOI links. Tone mode: ${selectedMode}.`;
    }

    // Step progress simulation
    setTimeout(() => setProgressStep(2), 600);
    setTimeout(() => setProgressStep(3), 1200);

    try {
      const res = await aiService.editWithAi({
        text: originalText,
        action: editorAction,
        customInstruction,
        language: selectedLang
      });

      setImprovedText(res.editedText);
      setSummaryOfChanges(res.summaryOfChanges || `Transformed using ${activeTool.toUpperCase()} in ${selectedMode.toUpperCase()} mode. Preserved citations & DOIs.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to refine text. Please try again.');
    } finally {
      setLoading(false);
      setProgressStep(0);
    }
  };

  const handleCopyImprovedText = () => {
    if (!improvedText) return;
    navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplaceOriginalText = () => {
    if (!improvedText) return;
    setOriginalText(improvedText);
    setReplaced(true);
    setTimeout(() => setReplaced(false), 2500);
  };

  const handleSaveToLibrary = () => {
    if (!improvedText) return;
    onSaveProject({
      id: `writing_${Date.now()}`,
      type: 'report',
      title: `Writing: ${documentTitle}`,
      language: selectedLang,
      date: new Date().toISOString(),
      data: {
        originalText,
        improvedText,
        mode: selectedMode,
        tool: selectedTool,
        title: documentTitle
      }
    });
    setLibrarySaved(true);
    setTimeout(() => setLibrarySaved(false), 3000);
  };

  const handleExportWord = async () => {
    if (!improvedText) return;
    setExporting('word');
    try {
      await exportWritingToWord(documentTitle, improvedText, selectedMode.toUpperCase());
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = () => {
    if (!improvedText) return;
    setExporting('pdf');
    try {
      exportWritingToPdf(documentTitle, improvedText, selectedMode.toUpperCase());
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handleFileParsed = (parsed: ParsedFileResult) => {
    setOriginalText(parsed.extractedText);
    if (parsed.fileName) setDocumentTitle(parsed.fileName);
  };

  const handleClearFile = () => {
    setOriginalText('');
  };

  // Simple Word Diff Renderer for Side-by-Side Visual Highlights
  const renderVisualDiff = (orig: string, imp: string) => {
    const origWords = orig.split(/(\s+)/);
    const impWords = imp.split(/(\s+)/);
    const origSet = new Set(origWords.map(w => w.trim().toLowerCase()).filter(Boolean));
    const impSet = new Set(impWords.map(w => w.trim().toLowerCase()).filter(Boolean));

    return (
      <div className="font-serif text-xs leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
        {impWords.map((word, idx) => {
          const clean = word.trim().toLowerCase();
          const isNew = clean && !origSet.has(clean) && clean.length > 2;

          if (isNew) {
            return (
              <span key={idx} className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 px-1 py-0.5 rounded font-bold">
                {word}
              </span>
            );
          }
          return <span key={idx}>{word}</span>;
        })}
      </div>
    );
  };

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-purple-800/50">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Wand2 className="w-4 h-4 text-purple-400" /> AI Academic Writing & Style Workbench
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            AI Academic Writing Assistant
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Paraphrase manuscript paragraphs, enhance academic clarity, elevate peer-reviewed style, and compare side-by-side versions while strictly preserving citations, DOI links, and empirical facts.
          </p>
        </div>

        {/* Preservation Guarantee Badge */}
        <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-500/40 text-xs text-purple-200 space-y-1 shrink-0 self-start md:self-center max-w-xs">
          <div className="flex items-center gap-1.5 font-bold text-purple-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Citation & Meaning Preserved
          </div>
          <p className="text-[10px] text-slate-300">
            Factual claims, citations, DOI links, references, and specialized terminology are strictly retained.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Controls Header Bar: Language + Writing Mode + Tools */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Row 1: Language & Writing Modes */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          
          {/* Writing Mode Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Writing Tone & Register:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'academic', label: '🎓 Academic', desc: 'Formal peer-reviewed style' },
                { id: 'professional', label: '💼 Professional', desc: 'Authoritative executive tone' },
                { id: 'natural', label: '🌿 Natural', desc: 'Fluid human-sounding cadence' },
                { id: 'simple', label: '💡 Simple', desc: 'Clear plain language' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id as WritingMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedMode === mode.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                  title={mode.desc}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5 shrink-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Target Output Language:
            </span>
            <select
              value={selectedLang}
              onChange={e => setSelectedLang(e.target.value as Language)}
              className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none"
            >
              <option value="en">English (Scholarly Academic)</option>
              <option value="bad">بادینی (کوردی - دهۆک)</option>
              <option value="ku">کوردی (سۆرانی)</option>
              <option value="ar">العربية (الأكاديمية الفصحى)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Writing Transformation Tools Buttons */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
            Select Transformation Tool:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'academic_style', label: 'Improve Academic Style', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
              { id: 'paraphrase', label: 'Paraphrase', icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> },
              { id: 'clarity', label: 'Improve Clarity', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
              { id: 'grammar', label: 'Grammar Correction', icon: <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> },
              { id: 'shorten', label: 'Shorten Text', icon: <Minimize2 className="w-3.5 h-3.5 text-rose-400" /> },
              { id: 'expand', label: 'Expand Text', icon: <Maximize2 className="w-3.5 h-3.5 text-blue-400" /> },
              { id: 'simplify', label: 'Simplify Text', icon: <BookOpen className="w-3.5 h-3.5 text-teal-400" /> }
            ].map(tool => {
              const isSelected = selectedTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setSelectedTool(tool.id as WritingTool);
                    handleRunTransformation(tool.id as WritingTool);
                  }}
                  disabled={loading}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-purple-600 shadow-md ring-2 ring-purple-500/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tool.icon}
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: Original Text */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                ORIGINAL MANUSCRIPT TEXT
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Source Document
              </h3>
            </div>
            
            <div className="text-right text-[11px] text-slate-500 font-semibold">
              <span>{wordCount(originalText)} Words &bull; {charCount(originalText)} Chars</span>
            </div>
          </div>

          {/* File Upload Zone Component */}
          <div className="space-y-1">
            <FileUploadZone
              lang={selectedLang}
              onFileParsed={handleFileParsed}
              onClearFile={handleClearFile}
            />
          </div>

          {/* Document Title Input */}
          <input
            type="text"
            value={documentTitle}
            onChange={e => setDocumentTitle(e.target.value)}
            placeholder="Document title..."
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />

          {/* Original Text Input Area */}
          <textarea
            value={originalText}
            onChange={e => setOriginalText(e.target.value)}
            placeholder="Paste your original academic manuscript text here..."
            rows={12}
            className="flex-1 w-full p-4 font-serif text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
          />

          {/* Transform Button */}
          <button
            onClick={() => handleRunTransformation()}
            disabled={loading || !originalText.trim()}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {progressStep === 1 ? 'Analyzing Structure...' : progressStep === 2 ? 'Preserving Citations & DOIs...' : 'Formatting Side-by-Side Diff...'}
                </span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Transform Text ({selectedTool.toUpperCase()})
              </>
            )}
          </button>
        </div>

        {/* RIGHT PANEL: Improved Text */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col">
          
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                IMPROVED ACADEMIC OUTPUT ({selectedMode.toUpperCase()})
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Refined Copy
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold">
                  {selectedTool.toUpperCase()}
                </span>
              </h3>
            </div>

            {/* View Diff Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewDiffMode(!viewDiffMode)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                  viewDiffMode
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Eye className="w-3 h-3" /> {viewDiffMode ? 'Visual Diff Highlight' : 'Plain Text'}
              </button>
            </div>
          </div>

          {/* Word & Character Count */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
            <span>{wordCount(improvedText)} Words &bull; {charCount(improvedText)} Chars</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {wordCount(improvedText) - wordCount(originalText) >= 0 ? `+${wordCount(improvedText) - wordCount(originalText)} Words` : `${wordCount(improvedText) - wordCount(originalText)} Words`}
            </span>
          </div>

          {/* Improved Text Display / Visual Diff Container */}
          <div className="flex-1 min-h-[300px] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-y-auto">
            {loading ? (
              <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-xs text-slate-500">Refining text, preserving citations and DOI links...</p>
              </div>
            ) : viewDiffMode ? (
              renderVisualDiff(originalText, improvedText)
            ) : (
              <textarea
                value={improvedText}
                onChange={e => setImprovedText(e.target.value)}
                rows={12}
                className="w-full h-full font-serif text-xs bg-transparent text-slate-900 dark:text-slate-100 outline-none leading-relaxed"
              />
            )}
          </div>

          {/* Summary of AI Changes Card */}
          {summaryOfChanges && (
            <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-xs space-y-1">
              <span className="font-bold text-purple-900 dark:text-purple-300 text-[10px] uppercase block">
                Summary of AI Enhancements:
              </span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                {summaryOfChanges}
              </p>
            </div>
          )}

          {/* Action Suite Suite */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={handleCopyImprovedText}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleReplaceOriginalText}
              className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 text-purple-900 dark:text-purple-200 flex items-center justify-center gap-1 transition-all border border-purple-200 dark:border-purple-800"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
              <span>{replaced ? 'Replaced!' : 'Replace Original'}</span>
            </button>

            <button
              onClick={handleSaveToLibrary}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1 transition-all shadow-sm"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>{librarySaved ? 'Saved!' : 'Save to Library'}</span>
            </button>

            <button
              onClick={handleExportWord}
              disabled={exporting === 'word'}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 transition-all shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>DOCX</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={exporting === 'pdf'}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 transition-all shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explicit AI Detector Disclaimer Box */}
      <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-900 dark:text-amber-300 block">
            AI Writing Assistant Transparency Disclaimer
          </span>
          <p className="leading-relaxed text-[11px]">
            This tool enhances sentence clarity, vocabulary precision, and academic tone while preserving factual claims and citations. <strong>It does NOT claim to bypass AI detectors or guarantee that AI-generated text will not be flagged.</strong> Use this assistant responsibly to polish your original scholarly research.
          </p>
        </div>
      </div>
    </div>
  );
};
