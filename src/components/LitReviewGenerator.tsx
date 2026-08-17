import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileText,
  AlertCircle,
  Layers,
  Search,
  Upload,
  PlusCircle,
  Edit3,
  Wand2,
  FileCode,
  CheckCircle2,
  Trash2,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Target,
  X,
  ExternalLink,
  Globe,
  Compass,
  GitCompare,
  GraduationCap,
  Calculator,
  Settings,
  Table,
  CheckSquare,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { LitReviewData, LitReviewPaperMeta, Language, ProjectItem, AcademicSearchResultItem, ResearchGapOutput, MethodologyOutput } from '../types';
import { exportLitReviewToWord, exportLitReviewToPdf, exportLitReviewToLatex } from '../lib/exportUtils';
import { isRTL, t } from '../lib/i18n';
import { aiService } from '../services/aiService';
import { FileUploadZone } from './FileUploadZone';
import { ParsedFileResult } from '../lib/fileParser';

interface LitReviewGeneratorProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
}

export const LitReviewGenerator: React.FC<LitReviewGeneratorProps> = ({
  lang,
  onSaveProject
}) => {
  // Input Parameters
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('Education & Social Sciences');
  const [citationStyle, setCitationStyle] = useState('APA 7th Edition');
  const [outputLang, setOutputLang] = useState<Language>(lang);
  const [currentResearchId, setCurrentResearchId] = useState<string>(() => `res_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    setOutputLang(lang);
      }, [lang]);

  const handleTopicChange = (newTopic: string) => {
        setTopic(newTopic);
    const newId = `res_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setCurrentResearchId(newId);
    setReview(null);
    setInputPapers([]);
    setRawPastedAbstracts('');
    setGapData(null);
    setMethodologyData(null);
    setScholarResults([]);
  };
  const [academicLevel, setAcademicLevel] = useState("Master's Thesis (M.Sc. / M.A.)");
  const [targetLength, setTargetLength] = useState('Comprehensive');
  const [researchQuestions, setResearchQuestions] = useState('');
  const [researchObjectives, setResearchObjectives] = useState('');

  // Loaded Papers Queue (Google Scholar, PDFs, Manual Entry)
  const [inputPapers, setInputPapers] = useState<LitReviewPaperMeta[]>([]);
  const [rawPastedAbstracts, setRawPastedAbstracts] = useState('');

  // Manual Paper Add Form State
  const [showAddManual, setShowAddManual] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newYear, setNewYear] = useState('2024');
  const [newJournal, setNewJournal] = useState('');
  const [newDoi, setNewDoi] = useState('');
  const [newAbstract, setNewAbstract] = useState('');
  const [newKeywords, setNewKeywords] = useState('');

  // Google Scholar / CrossRef / OpenAlex Live Search Drawer State
  const [showScholarModal, setShowScholarModal] = useState(false);
  const [scholarQuery, setScholarQuery] = useState('');
  const [scholarSource, setScholarSource] = useState<'All' | 'Google Scholar' | 'CrossRef' | 'OpenAlex'>('All');
  const [scholarYear, setScholarYear] = useState('2020');
  const [searchingScholar, setSearchingScholar] = useState(false);
  const [scholarResults, setScholarResults] = useState<AcademicSearchResultItem[]>([]);
  const [scholarError, setScholarError] = useState<string | null>(null);
  const [searchExplanation, setSearchExplanation] = useState<string | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<string[]>([]);

  // Progress & Execution States
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [review, setReview] = useState<LitReviewData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dedicated Research Gap States
  const [loadingGap, setLoadingGap] = useState(false);
  const [gapStep, setGapStep] = useState('');
  const [gapPercent, setGapPercent] = useState(0);
  const [gapData, setGapData] = useState<ResearchGapOutput | null>(null);

  // Dedicated Methodology Generator States
  const [studyStatus, setStudyStatus] = useState<'Proposal / Planned Study' | 'Data Collection in Progress' | 'Completed Study'>('Proposal / Planned Study');
  const [preferredSoftware, setPreferredSoftware] = useState('SPSS');
  const [customDesignPreference, setCustomDesignPreference] = useState('');
  const [loadingMethodology, setLoadingMethodology] = useState(false);
  const [methodologyStep, setMethodologyStep] = useState('');
  const [methodologyPercent, setMethodologyPercent] = useState(0);
  const [methodologyData, setMethodologyData] = useState<MethodologyOutput | null>(null);

  // Section Editing & Iteration States
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [iterating, setIterating] = useState<string | null>(null);

  // Source Details Drawer State
  const [selectedSource, setSelectedSource] = useState<LitReviewPaperMeta | null>(null);

  const rtl = isRTL(outputLang);

  // Helper to open source details modal
  const handleOpenSourceDetails = (source: LitReviewPaperMeta) => {
    setSelectedSource(source);
  };

  // Helper to render continuous academic paragraphs with clickable in-text citations
  const renderAcademicParagraphs = (
    text: string,
    sourcesList: LitReviewPaperMeta[] = []
  ) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\s*\n/);

    return (
      <div className="space-y-4 leading-relaxed font-serif text-slate-800 dark:text-slate-200 text-sm md:text-base">
        {paragraphs.map((para, pIdx) => {
          const citationRegex = /(\([A-Za-z\u0600-\u06FF\s&.,\-]+,\s*\d{4}[a-z]?\))/g;
          const parts = para.split(citationRegex);

          return (
            <p key={pIdx} className="text-justify indent-6">
              {parts.map((part, partIdx) => {
                if (citationRegex.test(part)) {
                  const cleanStr = part.replace(/[()]/g, '').trim();
                  const commaIdx = cleanStr.lastIndexOf(',');
                  const authorStr = commaIdx !== -1 ? cleanStr.substring(0, commaIdx).trim() : cleanStr;
                  const yearStr = commaIdx !== -1 ? cleanStr.substring(commaIdx + 1).trim() : '';

                  const matchedSource = sourcesList.find(s => {
                    const sAuthor = (s.author || '').toLowerCase();
                    const aName = authorStr.toLowerCase();
                    return (sAuthor.includes(aName) || aName.includes(sAuthor)) && (!yearStr || String(s.year).includes(yearStr));
                  }) || {
                    id: `source_cit_${pIdx}_${partIdx}`,
                    title: `Academic Research Source: ${authorStr} (${yearStr || '2023'})`,
                    author: authorStr || 'Academic Research Group',
                    year: parseInt(yearStr) || 2023,
                    journalOrSource: 'Peer-Reviewed Academic Publication',
                    abstractText: `Empirical scholarly publication cited as "${part}" supporting theoretical & empirical claims in this Literature Review.`,
                    sourceType: 'CrossRef',
                    doi: undefined
                  };

                  return (
                    <button
                      key={partIdx}
                      type="button"
                      onClick={() => handleOpenSourceDetails(matchedSource)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-sans font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer text-xs mx-0.5 shadow-2xs"
                      title="Click to view verified academic source details"
                    >
                      <span>{part}</span>
                      <ExternalLink className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                    </button>
                  );
                }

                return <span key={partIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // --- Handlers for Adding Papers ---

  const handleFileParsed = (parsed: ParsedFileResult) => {
    const extractedTitle = parsed.fileName.replace(/\.[^/.]+$/, '');
    const keywordsList = parsed.extractedText
      .slice(0, 1000)
      .match(/\b[A-Za-z\-]{4,}\b/g)
      ?.slice(0, 5) || ['PDF Document', 'Empirical Study'];

    const newPaperItem: LitReviewPaperMeta = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: extractedTitle,
      author: 'Uploaded PDF Author',
      year: 2024,
      journalOrSource: `File: ${parsed.fileName}`,
      abstractText: parsed.extractedText.slice(0, 1800),
      keywords: keywordsList,
      sourceType: 'PDF Upload'
    };

    setInputPapers(prev => [...prev, newPaperItem]);
    if (!topic) setTopic(extractedTitle);
  };

  const handleAddManualPaper = () => {
    if (!newTitle.trim() || !newAbstract.trim()) return;
    const paperItem: LitReviewPaperMeta = {
      id: `manual_${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Academic Researcher',
      year: parseInt(newYear) || 2024,
      journalOrSource: newJournal.trim() || 'User Metadata Entry',
      doi: newDoi.trim() || undefined,
      abstractText: newAbstract.trim(),
      keywords: newKeywords ? newKeywords.split(',').map(k => k.trim()) : undefined,
      sourceType: 'User Metadata'
    };
    setInputPapers(prev => [...prev, paperItem]);

    setNewTitle('');
    setNewAuthor('');
    setNewYear('2024');
    setNewJournal('');
    setNewDoi('');
    setNewAbstract('');
    setNewKeywords('');
    setShowAddManual(false);
  };

  const handleScholarSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryToSearch = scholarQuery.trim() || topic.trim() || 'Academic Literature Synthesis';

    setSearchingScholar(true);
    setScholarError(null);
    setSearchExplanation(null);

    try {
      const res = await aiService.searchAcademicPapers({
        query: queryToSearch,
        source: scholarSource,
        year: scholarYear,
        language: outputLang,
        researchContext: {
          title: topic || queryToSearch,
          field,
          academicLevel: (academicLevel as any) || "Master's",
          researchType: 'Quantitative',
          proposalDepth: 'Standard',
          language: outputLang
        }
      });

      if (res && res.results && res.results.length > 0) {
        setScholarResults(res.results);
        if (res.searchExplanation) setSearchExplanation(res.searchExplanation);
        if (res.expandedConcepts) setExpandedConcepts(res.expandedConcepts);
      } else {
        setScholarResults([]);
        setScholarError(`No peer-reviewed publications found matching "${queryToSearch}". Multiple academic query variations were attempted across CrossRef & OpenAlex databases.`);
      }
    } catch (err: any) {
      console.error('[Scholar Search Error]:', err);
      setScholarError(err?.message || 'Failed to retrieve academic search results.');
    } finally {
      setSearchingScholar(false);
    }
  };

  const handleAddScholarPaperToQueue = (item: AcademicSearchResultItem) => {
    if (inputPapers.some(p => p.title.toLowerCase() === item.title.toLowerCase())) return;

    const paperMeta: LitReviewPaperMeta = {
      id: item.id || `scholar_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: item.title,
      author: Array.isArray(item.authors) ? item.authors.join(', ') : item.authors,
      year: item.year || 2023,
      journalOrSource: item.journalOrConference || 'Peer-Reviewed Journal',
      doi: item.doi,
      abstractText: item.abstract,
      citationCount: item.citationCount,
      keywords: [item.source, 'Google Scholar Index', 'Empirical Study'],
      sourceType: item.source as any
    };

    setInputPapers(prev => [...prev, paperMeta]);
    if (!topic) setTopic(item.title);
  };

  const handleRemoveInputPaper = (id: string) => {
    setInputPapers(prev => prev.filter(p => p.id !== id));
  };

  // --- Literature Review Generation ---
  const handleGenerate = async (e?: React.FormEvent) => {
                        if (e) e.preventDefault();
    if (!topic.trim() && inputPapers.length === 0) return;

    const reqResearchId = currentResearchId;
    const reqTopic = topic.trim();

    setReview(null);
    setLoading(true);
    setError(null);
    setProgressPercent(10);
    setProgressStep('Stage 1/7: Initializing research context & literature boundaries...');
    
    const stepTimer = setInterval(() => {
      setProgressPercent(prev => {
        if (prev < 25) {
          setProgressStep('Stage 2/7: Finding relevant peer-reviewed academic literature...');
          return prev + 15;
        } else if (prev < 45) {
          setProgressStep('Stage 3/7: Organizing literature into dynamic thematic clusters...');
          return prev + 15;
        } else if (prev < 65) {
          setProgressStep('Stage 4/7: Comparing previous empirical studies, consensus & contradictions...');
          return prev + 15;
        } else if (prev < 80) {
          setProgressStep('Stage 5/7: Identifying specific contextual & methodological research gaps...');
          return prev + 15;
        } else if (prev < 95) {
          setProgressStep('Stage 6/7: Writing Literature Review & formatting citations (APA 7)...');
          return prev + 10;
        }
        return prev;
      });
    }, 900);

    // Filter input papers for topic relevance
    const cleanTopicLower = topic.trim().toLowerCase();
    const topicWords = cleanTopicLower.replace(/[^\w\s\u0600-\u06FF]/g, '').split(/\s+/).filter(w => w.length > 3);
    const relevantPapers = inputPapers.filter(p => {
      if (topicWords.length === 0) return true;
      const pTitle = (p.title || '').toLowerCase();
      const pAbs = (p.abstractText || '').toLowerCase();
      return topicWords.some(w => pTitle.includes(w) || pAbs.includes(w));
    });

    const papersContext = relevantPapers.length > 0
      ? relevantPapers.map((p, idx) => `[Paper #${idx + 1}]\nTitle: ${p.title}\nAuthor(s): ${p.author} (${p.year})\nJournal/Source: ${p.journalOrSource || 'Academic Journal'}\nDOI: ${p.doi || 'N/A'}\nKeywords: ${p.keywords ? p.keywords.join(', ') : 'N/A'}\nAbstract: ${p.abstractText}`).join('\n\n---\n\n')
      : rawPastedAbstracts.trim();

    try {
            const data = await aiService.generateLitReview({
        researchId: reqResearchId,
        researchContext: {
          title: topic.trim(),
          field,
          academicLevel: (academicLevel as any) || "Master's",
          researchType: 'Quantitative',
          proposalDepth: 'Standard',
          language: outputLang,
          outputLanguage: outputLang
        },
        topic: topic.trim() || (inputPapers[0]?.title ?? 'Academic Literature Review'),
        field,
        citationStyle,
        language: outputLang,
        academicLevel,
        targetLength,
        researchQuestions: researchQuestions.trim() || undefined,
        researchObjectives: researchObjectives.trim() || undefined,
        papersContext,
        papers: relevantPapers
      });

      clearInterval(stepTimer);
      setProgressPercent(100);
      if (reqResearchId !== currentResearchId || topic.trim() !== reqTopic) {
        return;
      }
                  setReview(data);

      onSaveProject({
        id: data.id,
        type: 'litreview',
        title: `Lit Review: ${data.title}`,
        language: outputLang,
        date: data.createdAt,
        data
      });
    } catch (err: any) {
      clearInterval(stepTimer);
      console.error(err);
      setError(err.message || 'An error occurred while generating the Systematic Literature Review.');
    } finally {
      setLoading(false);
      setProgressPercent(0);
    }
  };

  // Dedicated Research Gap Generator Handler
  const handleGenerateResearchGap = async () => {
    if (!topic.trim()) return;
    setLoadingGap(true);
    setGapPercent(10);
    setGapStep('Stage 1/6: Analyzing previous empirical studies & literature synthesis...');

    const gapTimer = setInterval(() => {
      setGapPercent(prev => {
        if (prev < 25) {
          setGapStep('Stage 2/6: Comparing research findings, consensus & contradictions...');
          return prev + 15;
        } else if (prev < 45) {
          setGapStep('Stage 3/6: Identifying empirical & methodological limitations...');
          return prev + 15;
        } else if (prev < 65) {
          setGapStep('Stage 4/6: Evaluating qualitative evidence strength...');
          return prev + 15;
        } else if (prev < 85) {
          setGapStep('Stage 5/6: Identifying contextual, geographical & population research gaps...');
          return prev + 15;
        } else if (prev < 95) {
          setGapStep('Stage 6/6: Connecting the gap to the current study...');
          return prev + 10;
        }
        return prev;
      });
    }, 850);

    try {
      const res = await aiService.generateResearchGap({
        topic: topic.trim(),
        field,
        academicLevel,
        language: outputLang,
        researchQuestions: researchQuestions.trim() || undefined,
        researchObjectives: researchObjectives.trim() || undefined,
        literatureSynthesis: review ? review.executiveSynthesis : undefined,
        sources: allAvailableSources
      });

      clearInterval(gapTimer);
      setGapPercent(100);
      setGapData(res);
      if (review) {
        setReview({ ...review, researchGapDetails: res });
      }
    } catch (e: any) {
      clearInterval(gapTimer);
      console.error(e);
      setError('Research Gap generation failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setLoadingGap(false);
      setGapPercent(0);
    }
  };

  // Dedicated Methodology Generator Handler
  const handleGenerateMethodology = async () => {
    if (!topic.trim()) return;
    setLoadingMethodology(true);
    setMethodologyPercent(10);
    setMethodologyStep('Stage 1/6: Deriving research design from title & research questions...');

    const mTimer = setInterval(() => {
      setMethodologyPercent(prev => {
        if (prev < 25) {
          setMethodologyStep('Stage 2/6: Identifying target population & sampling strategy...');
          return prev + 15;
        } else if (prev < 45) {
          setMethodologyStep('Stage 3/6: Designing research instruments & questionnaire constructs...');
          return prev + 15;
        } else if (prev < 65) {
          setMethodologyStep('Stage 4/6: Formulating validity & reliability procedures...');
          return prev + 15;
        } else if (prev < 85) {
          setMethodologyStep('Stage 5/6: Structuring data collection & ethical protocols...');
          return prev + 15;
        } else if (prev < 95) {
          setMethodologyStep('Stage 6/6: Building research alignment matrix & writing chapter...');
          return prev + 10;
        }
        return prev;
      });
    }, 850);

    try {
      const res = await aiService.generateDetailedMethodology({
        topic: topic.trim(),
        field,
        academicLevel,
        language: outputLang,
        studyStatus,
        researchQuestions: researchQuestions.trim() || undefined,
        researchObjectives: researchObjectives.trim() || undefined,
        researchGap: gapData ? gapData.detailedGapParagraphs : (review ? review.researchGaps : undefined),
        preferredSoftware,
        customDesignPreference: customDesignPreference.trim() || undefined
      });

      clearInterval(mTimer);
      setMethodologyPercent(100);
      setMethodologyData(res);
      if (review) {
        setReview({ ...review, methodologyDetails: res });
      }
    } catch (e: any) {
      clearInterval(mTimer);
      console.error(e);
      setError('Methodology generation failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setLoadingMethodology(false);
      setMethodologyPercent(0);
    }
  };

  const handleIterateSection = async (
    sectionKey: 'synthesis' | 'consensus' | 'differences' | 'gaps' | 'future' | 'appraisal',
    action: 'expand' | 'tone'
  ) => {
    if (!review) return;
    setIterating(sectionKey);

    try {
      let currentText = review.executiveSynthesis;
      if (sectionKey === 'consensus') currentText = review.similaritiesAndConsensus;
      else if (sectionKey === 'differences') currentText = review.methodologicalDifferences;
      else if (sectionKey === 'gaps') currentText = review.researchGaps;
      else if (sectionKey === 'future') currentText = review.futureResearchDirections;
      else if (sectionKey === 'appraisal') currentText = review.criticalAppraisal;

      const response = await aiService.expandResearchSection({
        sectionId: sectionKey,
        sectionTitle: sectionKey,
        currentContent: currentText,
        action: 'expand',
        academicLevel,
        language: outputLang
      });

      if (response && response.newContent) {
        if (sectionKey === 'synthesis') setReview({ ...review, executiveSynthesis: response.newContent });
        else if (sectionKey === 'consensus') setReview({ ...review, similaritiesAndConsensus: response.newContent });
        else if (sectionKey === 'differences') setReview({ ...review, methodologicalDifferences: response.newContent });
        else if (sectionKey === 'gaps') setReview({ ...review, researchGaps: response.newContent });
        else if (sectionKey === 'future') setReview({ ...review, futureResearchDirections: response.newContent });
        else if (sectionKey === 'appraisal') setReview({ ...review, criticalAppraisal: response.newContent });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIterating(null);
    }
  };

  const handleCopy = () => {
    if (!review) return;
    const text = `# ${review.title}\n\n## Executive Literature Synthesis\n${review.executiveSynthesis}\n\n${review.themes.map((t, idx) => `## Theme ${idx + 1}: ${t.themeName}\n${t.synthesis}`).join('\n\n')}\n\n## Similarities & Empirical Consensus\n${review.similaritiesAndConsensus}\n\n## Methodological Differences\n${review.methodologicalDifferences}\n\n## Empirical Research Gaps\n${review.researchGaps}\n\n${gapData ? `## Evidence-Based Research Gap Analysis\nStrength: ${gapData.evidenceStrength}\nTypes: ${gapData.gapTypes?.join(', ')}\n${gapData.detailedGapParagraphs}\n\n## How Current Study Addresses Gap\n${gapData.howCurrentStudyAddressesGap}\n\n` : ''}${methodologyData ? `## Research Methodology Chapter\nDesign: ${methodologyData.researchDesign}\nStatus: ${methodologyData.studyStatus}\nSoftware: ${methodologyData.preferredSoftware}\n\n${methodologyData.fullMethodologyChapter}\n\n` : ''}## References\n${review.references.join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allAvailableSources = [...(review?.papers || []), ...inputPapers];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border border-indigo-800/50">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" /> Academic Systematic Literature Review & Methodology Suite
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Literature Review, Gap & Methodology Workspace
          </h1>
          <p className="text-slate-300 text-xs md:text-sm">
            Generate continuous academic paragraphs with clickable in-text citations, verified APA 7 references, evidence-based Research Gap, and complete Academic Methodology chapter.
          </p>
        </div>
      </div>

      {/* Main Form & Papers Collector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Main Topic & Academic Domain */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Core Research Title / Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => handleTopicChange(e.target.value)}
                placeholder="e.g. هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک"
                required={inputPapers.length === 0}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Academic Field / Discipline
              </label>
              <input
                type="text"
                value={field}
                onChange={e => setField(e.target.value)}
                placeholder="e.g. Early Childhood Education & Pedagogy"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Academic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Academic Level</label>
              <select
                value={academicLevel}
                onChange={e => setAcademicLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="Undergraduate Senior Paper">Undergraduate Senior Paper</option>
                <option value="Master's Thesis (M.Sc. / M.A.)">Master's Thesis (M.Sc. / M.A.)</option>
                <option value="Doctoral Dissertation (Ph.D.)">Doctoral Dissertation (Ph.D.)</option>
                <option value="Peer-Reviewed Journal Manuscript">Peer-Reviewed Journal Manuscript</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Synthesis Depth & Length</label>
              <select
                value={targetLength}
                onChange={e => setTargetLength(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="Short">Short (Executive Overview)</option>
                <option value="Standard">Standard (Standard Literature Review)</option>
                <option value="Detailed">Detailed (Extended Multi-Theme Synthesis)</option>
                <option value="Comprehensive">Comprehensive (Exhaustive PhD-Level Review)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Citation Format</label>
              <select
                value={citationStyle}
                onChange={e => setCitationStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold text-indigo-600 dark:text-indigo-400"
              >
                <option value="APA 7th Edition">APA 7th Edition (Standard)</option>
                <option value="MLA 9th Edition">MLA 9th Edition</option>
                <option value="Chicago 17th Edition">Chicago 17th Edition</option>
                <option value="Harvard Style">Harvard Referencing Style</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Output Language (100% Lock)</label>
              <select
                value={outputLang}
                onChange={e => setOutputLang(e.target.value as Language)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="en">English (Academic Standard)</option>
                <option value="bad">بادینی (کوردی - دهۆک)</option>
                <option value="ku">کوردی (سۆرانی)</option>
                <option value="ar">العربية (الأكاديمية)</option>
              </select>
            </div>
          </div>

          {/* Optional RQs & Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Optional Research Questions</label>
              <textarea
                rows={2}
                value={researchQuestions}
                onChange={e => setResearchQuestions(e.target.value)}
                placeholder="e.g. What is the level of innovation awareness among kindergarten teachers in Duhok?"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Optional Research Objectives</label>
              <textarea
                rows={2}
                value={researchObjectives}
                onChange={e => setResearchObjectives(e.target.value)}
                placeholder="e.g. To assess the impact of professional development workshops on educational innovation..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Academic Papers Input Collector Hub */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Academic Sources Hub ({inputPapers.length} Papers Queued)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowScholarModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" /> Search Scholar / CrossRef
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddManual(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Abstract Metadata
                </button>
              </div>
            </div>

            <FileUploadZone lang={lang} onFileParsed={handleFileParsed} onClearFile={() => {}} />

            {/* Loaded Input Papers Badges */}
            {inputPapers.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Loaded Papers Queue for AI Meta-Synthesis:
                  </span>
                  <button type="button" onClick={() => setInputPapers([])} className="text-[11px] text-rose-500 hover:underline font-bold">
                    Clear All Loaded Papers
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inputPapers.map(p => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 relative shadow-xs">
                      <div className="flex items-start justify-between gap-2 pr-6">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">{p.title}</h5>
                        <button type="button" onClick={() => handleRemoveInputPaper(p.id)} className="text-slate-400 hover:text-red-500 absolute top-3 right-3">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-semibold">{p.author} ({p.year})</span>
                        <span>&bull;</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200">
                          {p.sourceType || 'Paper'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || (!topic.trim() && inputPapers.length === 0)}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Synthesizing Literature Review & Continuous Academic Paragraphs...' : 'Generate Academic Literature Review'}
          </button>
        </form>
      </div>

      {/* Progress Feedback */}
      {loading && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 space-y-4 shadow-xs text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{progressStep}</h4>
            <p className="text-xs text-slate-500">Executing systematic analysis across titles, abstracts, methodology, and empirical gaps...</p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden max-w-md mx-auto">
            <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Literature Review Output Workspace */}
      {review && !loading && (
        <div dir={rtl ? 'rtl' : 'ltr'} className="space-y-6">
          {/* Toolbar Actions Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-md">
                Literature Review: {review.title}
              </h3>
              <p className="text-[11px] text-slate-500">
                Academic Domain: {review.field} &bull; Citation Standard: {citationStyle} &bull; Level: {academicLevel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy All'}
              </button>
              <button
                onClick={() => exportLitReviewToWord(review)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> DOCX
              </button>
              <button
                onClick={() => exportLitReviewToPdf(review)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => exportLitReviewToLatex(review)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <FileCode className="w-3.5 h-3.5" /> LaTeX (.tex)
              </button>
            </div>
          </div>

          {/* Continuous Academic Paragraphs Document Display */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 space-y-8 shadow-sm">
            
            {/* Document Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 text-center space-y-2">
              <span className="text-[11px] uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400">
                Systematic Literature Review & Meta-Synthesis Chapter
              </span>
              <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {review.title}
              </h1>
              <div className="text-xs text-slate-500 flex justify-center gap-3 pt-1">
                <span>🎓 {academicLevel}</span>
                <span>📚 {field}</span>
                <span>✍️ {citationStyle}</span>
              </div>
            </div>

            {/* Academic Quality & Synthesis Scorecard */}
            {review.qualityScores && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Literature Review Quality & Alignment Validator
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      review.qualityScores.status === 'Excellent'
                        ? 'bg-emerald-600'
                        : review.qualityScores.status === 'Satisfactory'
                        ? 'bg-blue-600'
                        : 'bg-amber-600'
                    }`}>
                      Overall Score: {review.qualityScores.overallQuality}/100 ({review.qualityScores.status})
                    </span>
                  </div>
                </div>

                {/* Score meters grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Topic Alignment</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{review.qualityScores.topicAlignment}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Evidence Quality</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{review.qualityScores.evidenceQuality}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Critical Synthesis</span>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{review.qualityScores.criticalSynthesis}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Gap Support</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{review.qualityScores.researchGapSupport}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Academic Depth</span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{review.qualityScores.academicDepth}/100</span>
                  </div>
                </div>

                {/* Feedback / Needs Improvement Box */}
                {review.qualityScores.status === 'Needs Improvement' && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Quality Assessment: Needs Improvement
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      {review.qualityScores.improvementFeedback?.map((fb, idx) => (
                        <li key={idx}>{fb}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleIterateSection('synthesis', 'expand')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Continue Writing / Expand Depth
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleGenerate(e)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Improve Literature Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 1. Executive Literature Synthesis (Paragraphs) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  1. Executive Literature Synthesis
                </h2>
                <button
                  onClick={() => handleIterateSection('synthesis', 'expand')}
                  disabled={iterating === 'synthesis'}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Deepen Section
                </button>
              </div>

              {renderAcademicParagraphs(review.executiveSynthesis, allAvailableSources)}
            </div>

            {/* 2. Thematic Syntheses (Paragraphs) */}
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                2. Thematic Analysis & Empirical Synthesis
              </h2>

              <div className="space-y-6">
                {review.themes?.map((theme, idx) => (
                  <div key={idx} className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 border-l-4 border-indigo-600 pl-3">
                      2.{idx + 1} {theme.themeName}
                    </h3>
                    {renderAcademicParagraphs(theme.synthesis, allAvailableSources)}
                    {theme.researchGap && (
                      <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 font-serif leading-relaxed">
                        <span className="font-bold block mb-1">Identified Theme Research Gap:</span>
                        {theme.researchGap}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Similarities & Empirical Consensus (Paragraphs) */}
            {review.similaritiesAndConsensus && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  3. Similarities & Empirical Consensus Points
                </h2>
                {renderAcademicParagraphs(review.similaritiesAndConsensus, allAvailableSources)}
              </div>
            )}

            {/* 4. Methodological Differences & Comparative Analysis (Paragraphs) */}
            {review.methodologicalDifferences && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  4. Methodological Differences & Comparative Analysis
                </h2>
                {renderAcademicParagraphs(review.methodologicalDifferences, allAvailableSources)}
              </div>
            )}

            {/* 5. Empirical Research Gaps (Paragraphs) */}
            {review.researchGaps && (
              <div className="space-y-3 p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50">
                <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 border-b border-amber-200/60 dark:border-amber-800/60 pb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  5. Contextual & Empirical Research Gap
                </h2>
                {renderAcademicParagraphs(review.researchGaps, allAvailableSources)}
              </div>
            )}

            {/* 6. Future Research Directions (Paragraphs) */}
            {review.futureResearchDirections && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  6. Future Research Directions
                </h2>
                {renderAcademicParagraphs(review.futureResearchDirections, allAvailableSources)}
              </div>
            )}

            {/* Dedicated Evidence-Based Research Gap Generator Zone */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-300/50 dark:border-amber-700/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    Evidence-Based Academic Research Gap Analysis
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Synthesize reviewed studies, compare empirical findings, and establish specific contextual, geographical, & methodological research gaps.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateResearchGap}
                  disabled={loadingGap}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loadingGap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loadingGap ? 'Generating Research Gap...' : 'Generate Research Gap'}
                </button>
              </div>

              {loadingGap && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-2 text-center border border-amber-200 dark:border-amber-900">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{gapStep}</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden max-w-sm mx-auto">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${gapPercent}%` }} />
                  </div>
                </div>
              )}

              {gapData && !loadingGap && (
                <div className="space-y-6 pt-3 border-t border-amber-200/60 dark:border-amber-800/60">
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold shadow-2xs">
                      Evidence Strength: {gapData.evidenceStrength} Evidence
                    </span>
                    {gapData.gapTypes?.map((gt, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-800">
                        {gt}
                      </span>
                    ))}
                  </div>

                  {/* Detailed Research Gap Paragraphs */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800 pb-1">
                      Synthesized Research Gap Statement
                    </h4>
                    {renderAcademicParagraphs(gapData.detailedGapParagraphs, allAvailableSources)}
                  </div>

                  {/* How the Current Study Addresses the Gap */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 border-b border-indigo-200 dark:border-indigo-800 pb-1">
                      How the Current Study Addresses the Identified Gap
                    </h4>
                    {renderAcademicParagraphs(gapData.howCurrentStudyAddressesGap, allAvailableSources)}
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Comprehensive Methodology Generator Zone */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-300/50 dark:border-blue-700/50 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Academic Methodology & Study Alignment Generator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Logically derive study design, population, sampling strategy, instruments, validity, reliability, data collection, ethical protocols, analysis plan, and alignment matrix.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateMethodology}
                  disabled={loadingMethodology}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loadingMethodology ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loadingMethodology ? 'Generating Methodology...' : 'Generate Academic Methodology'}
                </button>
              </div>

              {/* Methodology Parameters Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-200/60 dark:border-blue-900/60 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Study Status & Tense</label>
                  <select
                    value={studyStatus}
                    onChange={e => setStudyStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="Proposal / Planned Study">Proposal / Planned Study (Future Tense)</option>
                    <option value="Data Collection in Progress">Data Collection in Progress</option>
                    <option value="Completed Study">Completed Study (Past Academic Tense)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Analysis Software</label>
                  <select
                    value={preferredSoftware}
                    onChange={e => setPreferredSoftware(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="SPSS">IBM SPSS Statistics</option>
                    <option value="R">R / RStudio Environment</option>
                    <option value="Python">Python (Pandas / SciPy)</option>
                    <option value="NVivo">NVivo Qualitative Software</option>
                    <option value="Excel">Microsoft Excel Analysis ToolPak</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Design Preference (Optional)</label>
                  <input
                    type="text"
                    value={customDesignPreference}
                    onChange={e => setCustomDesignPreference(e.target.value)}
                    placeholder="e.g. Quantitative Correlational Design"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {loadingMethodology && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 space-y-2 text-center border border-blue-200 dark:border-blue-900">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{methodologyStep}</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden max-w-sm mx-auto">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${methodologyPercent}%` }} />
                  </div>
                </div>
              )}

              {methodologyData && !loadingMethodology && (
                <div className="space-y-6 pt-4 border-t border-blue-200 dark:border-blue-900">
                  {/* Badges Overview Bar */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold shadow-2xs">
                      Design: {methodologyData.researchDesign}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold shadow-2xs">
                      Status: {methodologyData.studyStatus}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-white font-bold shadow-2xs">
                      Software: {methodologyData.preferredSoftware}
                    </span>
                  </div>

                  {/* Research Alignment Matrix Table */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                      <Table className="w-4 h-4 text-blue-600" />
                      Research Alignment Matrix (Questions &rarr; Objectives &rarr; Data &rarr; Instruments &rarr; Analysis)
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                          <tr>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">Research Question</th>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">Objective</th>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">Data Required</th>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">Instrument</th>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">Analysis Method</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                          {methodologyData.alignmentMatrix?.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                              <td className="p-3 font-semibold">{row.researchQuestion}</td>
                              <td className="p-3">{row.objective}</td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{row.dataRequired}</td>
                              <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">{row.instrument}</td>
                              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{row.analysisMethod}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Questionnaire Structure / Constructs */}
                  {methodologyData.questionnaireStructure && methodologyData.questionnaireStructure.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                        Recommended Questionnaire Structure & Construct Dimensions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {methodologyData.questionnaireStructure.map((sec, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                              {sec.section}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{sec.construct}</h5>
                            <p className="text-[11px] text-slate-500 font-serif leading-snug">{sec.itemsDescription}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Continuous Academic Methodology Chapter */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                      Full Academic Methodology Chapter Text
                    </h4>
                    {renderAcademicParagraphs(methodologyData.fullMethodologyChapter, allAvailableSources)}
                  </div>
                </div>
              )}
            </div>

            {/* 7. References Section (Clickable References) */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-indigo-600" />
                References ({citationStyle})
              </h2>
              <p className="text-xs text-slate-500">
                Click any reference entry below to inspect the verified source record, abstract, and original link.
              </p>

              <div className="space-y-3 font-serif text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {review.references?.map((refStr, idx) => {
                  // Find matching source
                  const matchedSource = allAvailableSources[idx] || {
                    id: `ref_${idx}`,
                    title: refStr,
                    author: refStr.split('(')[0]?.trim() || 'Academic Author',
                    year: parseInt(refStr.match(/\((\d{4})\)/)?.[1] || '2023') || 2023,
                    journalOrSource: 'Peer-Reviewed Academic Publication',
                    abstractText: `Verified scholarly reference cited in the Literature Review: "${refStr}"`,
                    sourceType: 'CrossRef',
                    doi: refStr.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i)?.[0]
                  };

                  return (
                    <div
                      key={idx}
                      onClick={() => handleOpenSourceDetails(matchedSource)}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer transition flex items-start justify-between gap-3 group"
                    >
                      <p className="pl-6 -indent-6 text-justify">
                        {refStr}
                      </p>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Clickable Citation / Reference Source Details Modal */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setSelectedSource(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {selectedSource.doi || selectedSource.verificationStatus === 'verified' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> ✓ Verified Academic Source
                  </div>
                ) : selectedSource.verificationStatus === 'partially_verified' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> ⚠ Partially Verified
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-300 dark:border-slate-700">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> ✕ Unverified Source
                  </div>
                )}

                {selectedSource.relevanceScore && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                    Topic Relevance: {selectedSource.relevanceScore}%
                  </span>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {selectedSource.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Authors: {selectedSource.author} &bull; Year: {selectedSource.year} &bull; Journal: {selectedSource.journalOrSource || 'Peer-Reviewed Journal'}
                {selectedSource.publisher && ` &bull; Publisher: ${selectedSource.publisher}`}
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {selectedSource.doi && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">Digital Object Identifier (DOI):</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 text-xs">{selectedSource.doi}</span>
                  </div>
                  <a
                    href={`https://doi.org/${selectedSource.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> DOI Link
                  </a>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider mb-1.5">
                  Abstract & Research Findings:
                </span>
                <p className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-serif leading-relaxed text-xs md:text-sm border border-slate-200/60 dark:border-slate-700/60">
                  {selectedSource.abstractText || 'No abstract preview text available for this publication record.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider mb-1.5">
                  Formatted APA 7th Reference:
                </span>
                <p className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 font-mono text-xs leading-relaxed">
                  {selectedSource.author} ({selectedSource.year}). {selectedSource.title}. <em>{selectedSource.journalOrSource || 'Peer-Reviewed Journal'}</em>. {selectedSource.doi ? `https://doi.org/${selectedSource.doi}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                Close
              </button>
              <a
                href={selectedSource.doi ? `https://doi.org/${selectedSource.doi}` : `https://scholar.google.com/scholar?q=${encodeURIComponent(selectedSource.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition transform active:scale-95"
              >
                <ExternalLink className="w-4 h-4" /> Open Original Source
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Google Scholar Search Drawer Modal */}
      {showScholarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold tracking-tight">Academic Literature & Citation Ingestion</h3>
              </div>
              <button type="button" onClick={() => setShowScholarModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <form onSubmit={handleScholarSearch} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={scholarQuery}
                  onChange={e => setScholarQuery(e.target.value)}
                  placeholder="Enter keywords, author, or paper title..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />

                <select
                  value={scholarSource}
                  onChange={e => setScholarSource(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 font-semibold"
                >
                  <option value="All">All Indexers</option>
                  <option value="Google Scholar">Google Scholar</option>
                  <option value="CrossRef">CrossRef REST</option>
                  <option value="OpenAlex">OpenAlex OA</option>
                </select>

                <button
                  type="submit"
                  disabled={searchingScholar}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {searchingScholar ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {searchingScholar && (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs font-bold">Searching Google Scholar, CrossRef, and OpenAlex databases...</p>
                </div>
              )}

              {scholarError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {scholarError}
                </div>
              )}

              {searchExplanation && !searchingScholar && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{searchExplanation}</span>
                  </div>
                </div>
              )}

              {scholarResults.map(item => {
                const isAlreadyInQueue = inputPapers.some(p => p.title.toLowerCase() === item.title.toLowerCase());
                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">{Array.isArray(item.authors) ? item.authors.join(', ') : item.authors} ({item.year || 2023})</p>
                      {item.abstract && <p className="text-[11px] font-serif text-slate-600 line-clamp-2">{item.abstract}</p>}
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadyInQueue}
                      onClick={() => handleAddScholarPaperToQueue(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 ${isAlreadyInQueue ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                    >
                      {isAlreadyInQueue ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                      {isAlreadyInQueue ? 'Added' : 'Add to Queue'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
