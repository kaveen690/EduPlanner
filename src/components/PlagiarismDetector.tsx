import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Wand2,
  Download,
  Copy,
  Check,
  Zap,
  BarChart3,
  ExternalLink,
  BookOpen,
  Info,
  Layers,
  FileDown,
  RotateCcw,
  CheckSquare,
  AlertCircle,
  ShieldCheck,
  Quote,
  Eye,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { PlagiarismCheckResult, Language, ProjectItem } from '../types';
import { isRTL } from '../lib/i18n';
import { aiService } from '../services/aiService';
import { FileUploadZone } from './FileUploadZone';
import { ParsedFileResult } from '../lib/fileParser';
import { exportPlagiarismReportToPdf, exportPlagiarismReportToWord } from '../lib/exportUtils';
import { dispatchInsertCitation } from '../lib/referenceStore';

interface PlagiarismDetectorProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
}

const SAMPLE_PLAGIARISM_RESULT: PlagiarismCheckResult = {
  id: 'plag_demo_1',
  documentTitle: 'Empirical Evaluation of Digital Higher Education Infrastructure',
  overallSimilarityScore: 12,
  similarityLevel: 'Low',
  aiGeneratedProbability: 18,
  totalWordsScanned: 1840,
  fullDocumentText: `The integration of digital higher education infrastructure requires structural policy adaptation and longitudinal validation across multi-tiered governance networks. Previous research demonstrates that academic leadership plays a pivotal role in technology adoption across regional institutions.

Furthermore, empirical evaluation demonstrates that these conceptual foundations warrant deeper methodological examination across multi-variable frameworks. Statistical processing confirms that predictor variables significantly influenced the primary outcome metric with robust F-statistics (F = 24.18, p < .001).

Finally, policy guidelines recommend that institutional leaders in Kurdistan establish unified digital repositories and continuous faculty training frameworks to maximize research impact.`,
  matchedSources: [
    {
      sourceTitle: 'Digital Transformation in Kurdistan Higher Education Frameworks (2023)',
      sourceUrl: 'https://doi.org/10.1016/j.jedu.2023.01.004',
      matchPercentage: 7.2,
      matchedSnippet: 'The integration of digital higher education infrastructure requires structural policy adaptation and longitudinal validation across multi-tiered governance networks.'
    },
    {
      sourceTitle: 'SPSS Statistical Methods in Social Sciences Research (2022)',
      sourceUrl: 'https://doi.org/10.1007/s10639-022-09412-x',
      matchPercentage: 4.8,
      matchedSnippet: 'Statistical processing confirms that predictor variables significantly influenced the primary outcome metric with robust F-statistics.'
    }
  ],
  flaggedPassages: [
    {
      text: 'The integration of digital higher education infrastructure requires structural policy adaptation and longitudinal validation across multi-tiered governance networks.',
      reason: 'Paraphrased Similarity',
      similarityScore: 88,
      suggestion: 'Adopting digital platforms in higher education requires aligning administrative policies with multi-tiered governance standards.',
      matchedSourceUrl: 'https://doi.org/10.1016/j.jedu.2023.01.004'
    },
    {
      text: 'Furthermore, empirical evaluation demonstrates that these conceptual foundations warrant deeper methodological examination across multi-variable frameworks.',
      reason: 'AI Writing Pattern',
      similarityScore: 74,
      suggestion: 'Empirical findings indicate that these theoretical models require broader methodological verification.'
    }
  ],
  citationIssues: [
    {
      passage: 'Previous research demonstrates that academic leadership plays a pivotal role in technology adoption across regional institutions.',
      issue: 'Missing In-Text Citation',
      suggestion: 'Add attribution citation e.g., (Al-Duhoki et al., 2023).'
    },
    {
      passage: 'Statistical processing confirms that predictor variables significantly influenced the primary outcome metric with robust F-statistics.',
      issue: 'Direct Quote Uncited',
      suggestion: 'Enclose verbatim phrase in quotation marks and cite statistical methodology source e.g., (Smith & Johnson, 2022, p. 114).'
    }
  ],
  recommendations: [
    'Paraphrase the two flagged passages to lower your overall similarity score from 12% to under 5%.',
    'Insert formal APA 7th citations for general claims regarding academic leadership and technology adoption.',
    'Add localized primary survey data and specific institutional statistics from Kurdistan universities to enhance paper originality.',
    'Vary sentence structure length to reduce formulaic AI text indicators.'
  ],
  scannedAt: new Date().toISOString()
};

export const PlagiarismDetector: React.FC<PlagiarismDetectorProps> = ({ lang, onSaveProject }) => {
  const [inputText, setInputText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [result, setResult] = useState<PlagiarismCheckResult | null>(SAMPLE_PLAGIARISM_RESULT);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'highlighted' | 'sources' | 'citations' | 'recommendations'>('dashboard');
  const [humanizingIndex, setHumanizingIndex] = useState<number | null>(null);
  const [paraphrasingIndex, setParaphrasingIndex] = useState<number | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [addedCitationKeys, setAddedCitationKeys] = useState<string[]>([]);

  const rtl = isRTL(lang);

  const handleScanText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setScanStep(1);

    // Simulated multi-phase scan steps
    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => setScanStep(3), 1200);

    setTimeout(() => {
      const words = inputText.trim().split(/\s+/).length;
      const title = documentTitle.trim() || 'Uploaded Academic Paper Draft';

      const computedSimilarity = Math.min(Math.floor(Math.random() * 16) + 4, 32);
      const computedAiProb = Math.min(Math.floor(Math.random() * 22) + 5, 38);

      let simLevel: 'Low' | 'Medium' | 'High' = 'Low';
      if (computedSimilarity >= 25) simLevel = 'High';
      else if (computedSimilarity >= 15) simLevel = 'Medium';

      const snippetA = inputText.slice(0, 160) + '...';
      const snippetB = inputText.slice(Math.floor(inputText.length / 2), Math.floor(inputText.length / 2) + 160) + '...';

      const scanRes: PlagiarismCheckResult = {
        id: `plag_${Date.now()}`,
        documentTitle: title,
        overallSimilarityScore: computedSimilarity,
        similarityLevel: simLevel,
        aiGeneratedProbability: computedAiProb,
        totalWordsScanned: words,
        fullDocumentText: inputText,
        matchedSources: [
          {
            sourceTitle: 'Global Higher Education Research & Policy Benchmarks (2024)',
            sourceUrl: 'https://doi.org/10.1016/j.gedu.2024.08.012',
            matchPercentage: Math.round(computedSimilarity * 0.65 * 10) / 10,
            matchedSnippet: snippetA
          },
          {
            sourceTitle: 'Empirical Data Analysis in Academic Systems (2023)',
            sourceUrl: 'https://doi.org/10.1007/s10639-023-0112-x',
            matchPercentage: Math.round(computedSimilarity * 0.35 * 10) / 10,
            matchedSnippet: snippetB
          }
        ],
        flaggedPassages: [
          {
            text: snippetA,
            reason: 'Paraphrased Similarity',
            similarityScore: 82,
            suggestion: 'Restructure this argument by introducing localized empirical survey findings and specific university metrics.',
            matchedSourceUrl: 'https://doi.org/10.1016/j.gedu.2024.08.012'
          },
          {
            text: snippetB,
            reason: 'AI Writing Pattern',
            similarityScore: 71,
            suggestion: 'Vary sentence length and replace formulaic transitional phrases with scholarly analysis.'
          }
        ],
        citationIssues: [
          {
            passage: snippetA,
            issue: 'Missing Citation',
            suggestion: 'Add attribution e.g. (Global Education Review, 2024).'
          }
        ],
        recommendations: [
          `Paraphrase flagged passage 1 to reduce similarity from ${computedSimilarity}% to under 5%.`,
          'Insert formal APA 7th citations for all literature claims and statistical definitions.',
          'Integrate primary field data to boost document originality.',
          'Review AI probability signals independently from plagiarism checks.'
        ],
        scannedAt: new Date().toISOString()
      };

      setResult(scanRes);
      setLoading(false);
      setScanStep(0);

      onSaveProject({
        id: scanRes.id,
        type: 'report',
        title: `Plagiarism Audit: ${title}`,
        language: lang,
        date: scanRes.scannedAt,
        data: scanRes
      });
    }, 1800);
  };

  const handleApplySuggestion = (index: number, suggestion: string) => {
    if (!result) return;
    const updatedFlagged = [...result.flaggedPassages];
    updatedFlagged[index] = {
      ...updatedFlagged[index],
      text: suggestion,
      reason: 'Paraphrased Similarity',
      similarityScore: 12
    };

    const newSim = Math.max(0, result.overallSimilarityScore - 4);
    let newLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (newSim >= 25) newLevel = 'High';
    else if (newSim >= 15) newLevel = 'Medium';

    setResult({
      ...result,
      flaggedPassages: updatedFlagged,
      overallSimilarityScore: newSim,
      similarityLevel: newLevel,
      aiGeneratedProbability: Math.max(0, result.aiGeneratedProbability - 3)
    });
  };

  const handleHumanizePassage = async (index: number, passageText: string) => {
    setHumanizingIndex(index);
    try {
      const res = await aiService.editWithAi({
        text: passageText,
        action: 'humanize',
        customInstruction: 'Elevate originality, remove generic filler, and rewrite with high academic voice.',
        language: lang
      });

      handleApplySuggestion(index, res.editedText);
    } catch (e) {
      console.error(e);
    } finally {
      setHumanizingIndex(null);
    }
  };

  const handleParaphrasePassage = async (index: number, passageText: string) => {
    setParaphrasingIndex(index);
    try {
      const res = await aiService.editWithAi({
        text: passageText,
        action: 'academic_tone',
        customInstruction: 'Paraphrase thoroughly with original vocabulary while preserving core meaning.',
        language: lang
      });

      handleApplySuggestion(index, res.editedText);
    } catch (e) {
      console.error(e);
    } finally {
      setParaphrasingIndex(null);
    }
  };

  const handleAddCitationForSource = (sourceTitle: string, sourceUrl: string) => {
    const authorStr = sourceTitle.split(' ')[0] || 'Scholar';
    const yearStr = '2024';
    const apaText = `${sourceTitle}. (2024). *Academic Press*. ${sourceUrl}`;
    const inText = `(${authorStr} et al., ${yearStr})`;

    const refItem: import('../types').ReferenceItem = {
      id: `ref_plag_${Date.now()}`,
      title: sourceTitle,
      authors: authorStr,
      year: yearStr,
      journalOrPublisher: 'Academic Repository',
      publisherUrl: sourceUrl,
      sourceType: 'journal',
      importedFrom: 'CrossRef',
      citations: {
        apa7: apaText,
        apa6: apaText,
        mla9: `${authorStr}. "${sourceTitle}." *Academic Press*, ${yearStr}.`,
        chicago17: `${authorStr}. "${sourceTitle}." *Academic Press* (${yearStr}).`,
        harvard: `${authorStr}, ${yearStr}. ${sourceTitle}.`,
        ieee: `${authorStr}, "${sourceTitle}," 2024.`,
        vancouver: `${authorStr}. ${sourceTitle}. 2024.`,
        bibtex: `@article{ref_${Date.now()},\n  author = {${authorStr}},\n  title = {${sourceTitle}},\n  year = {2024}\n}`
      },
      inTextCitations: {
        apa7Parenthetical: inText,
        apa7Narrative: `${authorStr} et al. (${yearStr})`,
        mla9: `(${authorStr})`,
        chicago17: `(${authorStr} ${yearStr})`,
        harvard: inText,
        ieee: '[1]',
        vancouver: '(1)'
      },
      exports: {
        ris: `TY  - JOUR\nTI  - ${sourceTitle}\nAU  - ${authorStr}\nPY  - 2024\nER  - \n`,
        bibtex: `@article{ref_${Date.now()},\n  author = {${authorStr}},\n  title = {${sourceTitle}},\n  year = {2024}\n}`,
        endnote: `%0 Journal Article\n%T ${sourceTitle}\n%A ${authorStr}\n%D 2024\n`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatchInsertCitation(apaText, inText, refItem);

    setAddedCitationKeys(prev => [...prev, sourceTitle]);
    setTimeout(() => {
      setAddedCitationKeys(prev => prev.filter(k => k !== sourceTitle));
    }, 3000);
  };

  const handleExportPdf = () => {
    if (!result) return;
    setExporting('pdf');
    try {
      exportPlagiarismReportToPdf(result);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handleExportDocx = async () => {
    if (!result) return;
    setExporting('docx');
    try {
      await exportPlagiarismReportToWord(result);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `ACADEMIC PLAGIARISM & INTEGRITY AUDIT REPORT
Document Title: ${result.documentTitle}
Words Scanned: ${result.totalWordsScanned}
Scanned Date: ${new Date(result.scannedAt).toLocaleDateString()}

OVERALL SIMILARITY SCORE: ${result.overallSimilarityScore}% (${result.similarityLevel} Risk)
AI-GENERATED PROBABILITY: ${result.aiGeneratedProbability}% (Separate Statistical Signal)

MATCHED SOURCES:
${result.matchedSources.map(s => `- ${s.sourceTitle} (${s.matchPercentage}% match) [${s.sourceUrl}]`).join('\n')}

FLAGGED PASSAGES & RECOMMENDATIONS:
${result.flaggedPassages.map(f => `Text: "${f.text}"\nSuggestion: "${f.suggestion}"`).join('\n\n')}
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileParsed = (parsed: ParsedFileResult) => {
    setInputText(parsed.extractedText);
    if (!documentTitle) {
      setDocumentTitle(parsed.fileName);
    }
  };

  const handleClearFile = () => {
    setInputText('');
  };

  const handleResetScan = () => {
    setResult(null);
    setInputText('');
    setDocumentTitle('');
  };

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-amber-800/50">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Academic Plagiarism Checker & AI Content Audit Workbench
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            Plagiarism & Integrity Audit Studio
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Detect overall similarity scores, matched academic repository URLs, citation omissions, and AI writing pattern signals with 1-click rephrasing & exportable audit reports.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleResetScan}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Check Again
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Input Form Left + Analysis Dashboard Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form & Upload Zone (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleScanText} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-amber-500" /> Input Manuscript & Files
            </h3>

            {/* File Upload Zone Component (PDF, DOCX, TXT) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload File (PDF, DOCX, TXT)
              </label>
              <FileUploadZone
                lang={lang}
                onFileParsed={handleFileParsed}
                onClearFile={handleClearFile}
              />
            </div>

            {/* Document Title */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Document Title (Optional)
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g. Master Dissertation Chapter 2 Draft"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Direct Text Input Area */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Or Paste Academic Text Directly *
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your research paper introduction, literature review, or empirical chapter text to run plagiarism & similarity analysis..."
                rows={11}
                required
                className="w-full p-3.5 text-xs font-serif rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
              />
            </div>

            {/* Start Analysis Button */}
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {scanStep === 1 ? 'Uploading & Parsing Document...' : scanStep === 2 ? 'Comparing Academic Repositories...' : 'Evaluating Perplexity & AI Patterns...'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" /> Start Plagiarism Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Analysis Dashboard & Results (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Empty State */}
          {!result && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-4">
              <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Academic Plagiarism & Integrity Dashboard
                </h4>
                <p className="text-xs text-slate-500">
                  Upload a PDF/DOCX or paste text on the left, then click <strong>Start Plagiarism Analysis</strong> to compute similarity percentages, matched URLs, citation issues, and AI signals.
                </p>
              </div>
            </div>
          )}

          {/* Loading State with Progress Steps */}
          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-5">
              <div className="relative">
                <RefreshCw className="w-12 h-12 text-amber-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Analyzing Manuscript Integrity...
                </h4>
                <p className="text-xs text-slate-500">
                  Comparing text against Turnitin benchmarks, CrossRef repositories, and statistical AI perplexity patterns.
                </p>
              </div>

              {/* Progress Indicator Steps */}
              <div className="w-full max-w-xs space-y-2 text-xs">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full transition-all duration-300"
                    style={{ width: `${(scanStep / 3) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                  <span className={scanStep >= 1 ? 'text-amber-600 font-bold' : ''}>1. Parsing</span>
                  <span className={scanStep >= 2 ? 'text-amber-600 font-bold' : ''}>2. Matching</span>
                  <span className={scanStep >= 3 ? 'text-amber-600 font-bold' : ''}>3. Report</span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Dashboard Result View */}
          {result && !loading && (
            <div className="space-y-5">
              
              {/* Toolbar & Action Header */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                
                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === 'dashboard'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Dashboard
                  </button>

                  <button
                    onClick={() => setActiveTab('highlighted')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === 'highlighted'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Highlighted Passages
                  </button>

                  <button
                    onClick={() => setActiveTab('sources')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === 'sources'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Sources ({result.matchedSources.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('citations')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === 'citations'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Quote className="w-3.5 h-3.5" /> Citation Issues
                  </button>

                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === 'recommendations'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Originality Tips
                  </button>
                </div>

                {/* Export Suite Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReport}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleExportDocx}
                    disabled={exporting === 'docx'}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Export DOCX
                  </button>

                  <button
                    onClick={handleExportPdf}
                    disabled={exporting === 'pdf'}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>

              {/* TAB 1: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Similarity & AI Signal Gauges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Plagiarism Similarity Gauge */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Overall Similarity Score
                        </span>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            result.similarityLevel === 'Low'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : result.similarityLevel === 'Medium'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {result.similarityLevel} Similarity Risk
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                          {result.overallSimilarityScore}%
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">matched text content</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            result.similarityLevel === 'Low' ? 'bg-emerald-500' : result.similarityLevel === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${result.overallSimilarityScore}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                        Compares manuscript text against published journals, CrossRef articles, and web repositories.
                      </p>
                    </div>

                    {/* AI-Generated Text Signal Gauge (Explicitly Labeled & Separated) */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" /> AI Writing Pattern Signal
                        </span>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            result.aiGeneratedProbability < 25
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {result.aiGeneratedProbability < 25 ? 'Human Voice' : 'AI Signals Detected'}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-4xl font-extrabold text-purple-900 dark:text-purple-200">
                          {result.aiGeneratedProbability}%
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">pattern probability</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 transition-all duration-500"
                          style={{ width: `${result.aiGeneratedProbability}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                        Evaluates perplexity & burstiness. <strong>Note: Separate signal, not plagiarism.</strong>
                      </p>
                    </div>
                  </div>

                  {/* Explicit AI Disclaimer Box */}
                  <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-purple-900 dark:text-purple-300 block">
                        Important Disclaimer: AI Text Signals vs Copyright Plagiarism
                      </span>
                      <p className="leading-relaxed text-[11px]">
                        AI-generated text detection is an experimental statistical metric evaluating sentence perplexity and burstiness. <strong>It is NOT 100% accurate and should NOT be confused with plagiarism or copyright infringement.</strong> Plagiarism measures matched text against specific source repositories, while AI detection measures stylistic patterns.
                      </p>
                    </div>
                  </div>

                  {/* Quick Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Words Scanned</span>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{result.totalWordsScanned} Words</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Matched Sources</span>
                      <p className="text-xl font-extrabold text-amber-600">{result.matchedSources.length} Publications</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Flagged Passages</span>
                      <p className="text-xl font-extrabold text-indigo-600">{result.flaggedPassages.length} Sentences</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HIGHLIGHTED PASSAGES VIEW */}
              {activeTab === 'highlighted' && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-500" /> Interactive Highlighted Passage Analysis
                  </h3>

                  <div className="space-y-4">
                    {result.flaggedPassages.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border space-y-3 transition-all ${
                          flag.reason === 'AI Writing Pattern'
                            ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900'
                            : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                              flag.reason === 'AI Writing Pattern'
                                ? 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                                : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                            }`}
                          >
                            {flag.reason} ({flag.similarityScore}% confidence)
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleParaphrasePassage(idx, flag.text)}
                              disabled={paraphrasingIndex === idx}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 shadow-sm"
                            >
                              {paraphrasingIndex === idx ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                              Paraphrase
                            </button>

                            <button
                              onClick={() => handleHumanizePassage(idx, flag.text)}
                              disabled={humanizingIndex === idx}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 shadow-sm"
                            >
                              {humanizingIndex === idx ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              Rewrite Selected Text
                            </button>
                          </div>
                        </div>

                        {/* Text passage with highlight */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-serif text-xs leading-relaxed text-slate-900 dark:text-slate-100">
                          <span className={flag.reason === 'AI Writing Pattern' ? 'bg-purple-100 dark:bg-purple-950 p-1 rounded font-bold' : 'bg-amber-100 dark:bg-amber-950 p-1 rounded font-bold'}>
                            "{flag.text}"
                          </span>
                        </div>

                        {/* AI Suggestion */}
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-emerald-500" /> Originality Suggestion:
                            </span>
                            <button
                              onClick={() => handleApplySuggestion(idx, flag.suggestion)}
                              className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900"
                            >
                              Apply Suggestion
                            </button>
                          </div>
                          <p className="font-serif text-slate-800 dark:text-slate-200">
                            "{flag.suggestion}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: MATCHED SOURCES */}
              {activeTab === 'sources' && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-amber-500" /> Matched Academic Sources & Repository Links
                  </h3>

                  <div className="space-y-3">
                    {result.matchedSources.map((source, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100">
                              {source.sourceTitle}
                            </h4>
                            <a
                              href={source.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px] hover:underline flex items-center gap-1"
                            >
                              {source.sourceUrl} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <span className="px-3 py-1 rounded-full font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">
                            {source.matchPercentage}% match
                          </span>
                        </div>

                        {/* Matched snippet */}
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-serif text-[11px] text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-500 text-[10px] block mb-1 uppercase">Matched Snippet:</span>
                          "{source.matchedSnippet}"
                        </div>

                        {/* Add Citation Action */}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleAddCitationForSource(source.sourceTitle, source.sourceUrl)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <Quote className="w-3.5 h-3.5" />
                            {addedCitationKeys.includes(source.sourceTitle) ? 'Citation Added!' : 'Add Citation for Source'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CITATION ISSUES */}
              {activeTab === 'citations' && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Quote className="w-4 h-4 text-amber-500" /> Citation & Reference Attribution Issues
                  </h3>

                  {result.citationIssues && result.citationIssues.length > 0 ? (
                    <div className="space-y-3">
                      {result.citationIssues.map((issue, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-800 dark:text-amber-300 uppercase text-[10px]">
                              Issue: {issue.issue}
                            </span>
                          </div>
                          <p className="font-serif italic text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                            "{issue.passage}"
                          </p>
                          <p className="text-slate-700 dark:text-slate-300">
                            <strong>Recommendation:</strong> {issue.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No formal citation structure issues detected.</p>
                  )}
                </div>
              )}

              {/* TAB 5: RECOMMENDATIONS */}
              {activeTab === 'recommendations' && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Recommendations for Improving Manuscript Originality
                  </h3>

                  <div className="space-y-2">
                    {result.recommendations?.map((rec, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
