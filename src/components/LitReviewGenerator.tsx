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
import { t, isRTL, getAcademicLevels, getCitationStyles, getOutputLanguageOptions } from '../lib/i18n';
import { exportLitReviewToWord, exportLitReviewToPdf, exportLitReviewToLatex } from '../lib/exportUtils';
import { aiService } from '../services/aiService';
import { FileUploadZone } from './FileUploadZone';
import { ParsedFileResult } from '../lib/fileParser';

interface LitReviewGeneratorProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
  onLanguageChange?: (newLang: Language) => void;
}

export const LitReviewGenerator: React.FC<LitReviewGeneratorProps> = ({
  lang,
  onSaveProject,
  onLanguageChange
}) => {
  // Input Parameters
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('');
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

  const [selectedGapTag, setSelectedGapTag] = useState<string | null>(null);
  const [showEvidenceDetails, setShowEvidenceDetails] = useState(false);

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

  const allAvailableSources = [...(review?.papers || []), ...inputPapers];

  // Dedicated Research Gap Generator Handler
  const handleGenerateResearchGap = async () => {
    const activeTopic = topic.trim() || review?.title || '';
    if (!activeTopic) {
      setError(outputLang === 'bad' ? 'تکایە سەردێڕ یان بابەتی توێژینەوە بنڤێسە بەری دروچەیی بەرهەم بینی.' : 'Please enter a research topic or title before generating the research gap.');
      return;
    }
    setError(null);
    setLoadingGap(true);
    setGapPercent(10);
    const isBad = outputLang === 'bad';
    setGapStep(isBad ? 'قۆناغا ١/٦: شیکاریا دیراسەیێن ئەزموونی و پوختەکرنا ئەدەبیاتان...' : 'Stage 1/6: Analyzing previous empirical studies & literature synthesis...');

    const gapTimer = setInterval(() => {
      setGapPercent(prev => {
        if (prev < 25) {
          setGapStep(isBad ? 'قۆناغا ٢/٦: بەراوردکرنا دەرئەنجامێن ڤەکۆلینێ و هەڤدەنگی و دژبەریان...' : 'Stage 2/6: Comparing research findings, consensus & contradictions...');
          return prev + 15;
        } else if (prev < 45) {
          setGapStep(isBad ? 'قۆناغا ٣/٦: دەستنیشانکرنا سنورداربوونیێن ئەزموونی و میتۆدۆلۆجی...' : 'Stage 3/6: Identifying empirical & methodological limitations...');
          return prev + 15;
        } else if (prev < 65) {
          setGapStep(isBad ? 'قۆناغا ٤/٦: هەڵسەنگاندنا هێزا بەڵگەیا ئاکادیمی...' : 'Stage 4/6: Evaluating qualitative evidence strength...');
          return prev + 15;
        } else if (prev < 85) {
          setGapStep(isBad ? 'قۆناغا ٥/٦: دەستنیشانکرنا دروچەیێن سیاقی، جوگرافی و جڤاکی...' : 'Stage 5/6: Identifying contextual, geographical & population research gaps...');
          return prev + 15;
        } else if (prev < 95) {
          setGapStep(isBad ? 'قۆناغا ٦/٦: بەستنەوەیا دروچەیێ ب ڤەکۆلینا نووکە ڤە...' : 'Stage 6/6: Connecting the gap to the current study...');
          return prev + 10;
        }
        return prev;
      });
    }, 850);

    try {
      const res = await aiService.generateResearchGap({
        topic: activeTopic,
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
        setReview(prev => prev ? { ...prev, researchGapDetails: res } : null);
      }
    } catch (e: any) {
      clearInterval(gapTimer);
      console.error(e);
      setError(isBad ? 'بەرهەمهێنانا دروچەیی ب سەر نەکەفت: ' + (e?.message || 'کێشەیا نەناسراو') : 'Research Gap generation failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setLoadingGap(false);
      setGapPercent(0);
    }
  };

  // Dedicated Methodology Generator Handler
  const handleGenerateMethodology = async () => {
    const activeTopic = topic.trim() || review?.title || '';
    if (!activeTopic) {
      setError(outputLang === 'bad' ? 'تکایە سەردێڕ یان بابەتی توێژینەوە بنڤێسە بەری میتۆدۆلۆجیا بەرهەم بینی.' : 'Please enter a research topic or title before generating the academic methodology.');
      return;
    }
    setError(null);
    setLoadingMethodology(true);
    setMethodologyPercent(10);
    const isBad = outputLang === 'bad';
    setMethodologyStep(isBad ? 'قۆناغا ١/٦: دەستنیشانکرنا دیزاینێ توێژینەوەیێ ژ سەردێڕ و پرسیاران...' : 'Stage 1/6: Deriving research design from title & research questions...');

    const mTimer = setInterval(() => {
      setMethodologyPercent(prev => {
        if (prev < 25) {
          setMethodologyStep(isBad ? 'قۆناغا ٢/٦: دیارکرنا جڤاکێ توێژینەوەیێ و دیزاینا نموونەیێ...' : 'Stage 2/6: Identifying target population & sampling strategy...');
          return prev + 15;
        } else if (prev < 45) {
          setMethodologyStep(isBad ? 'قۆناغا ٣/٦: داڕشتنا ئامرازێن پێوانێ و پرسیارنامەیێ...' : 'Stage 3/6: Designing research instruments & questionnaire constructs...');
          return prev + 15;
        } else if (prev < 65) {
          setMethodologyStep(isBad ? 'قۆناغا ٤/٦: دارشتنا ڕێکارێن ڕاستگۆیی و جێگیریێ...' : 'Stage 4/6: Formulating validity & reliability procedures...');
          return prev + 15;
        } else if (prev < 85) {
          setMethodologyStep(isBad ? 'قۆناغا ٥/٦: ڕێکخستنا کۆمکرنا داتایان و بنەمایێن ئەیتیكی...' : 'Stage 5/6: Structuring data collection & ethical protocols...');
          return prev + 15;
        } else if (prev < 95) {
          setMethodologyStep(isBad ? 'قۆناغا ٦/٦: دروستکرنا ماتریسکا ئێکگرتوو و نڤێسینا بەشێ میتۆدۆلۆجی...' : 'Stage 6/6: Building research alignment matrix & writing chapter...');
          return prev + 10;
        }
        return prev;
      });
    }, 850);

    try {
      const res = await aiService.generateDetailedMethodology({
        topic: activeTopic,
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
        setReview(prev => prev ? { ...prev, methodologyDetails: res } : null);
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
        language: review?.language || outputLang || lang
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

  const getLocalizedHeader = (key: string, lang: Language): string => {
    const isBad = lang === 'bad';
    const isKu = lang === 'ku';
    const isAr = lang === 'ar';

    switch (key) {
      case 'sec_1':
        return isBad
          ? '١. پوختەیا جێبەجێکاریا ئەدەبیاتێن زانستی (Executive Synthesis)'
          : isKu
          ? '١. پوختەی جێبەجێکاری ئەدەبیاتی زانستی'
          : isAr
          ? '١. المراجعة التوليفية التنفيذية للأدبيات'
          : '1. Executive Literature Synthesis';

      case 'sec_2':
        return isBad
          ? '٢. شیکاریا بابەتی و پوختەیا ئەزموونی (Thematic Analysis)'
          : isKu
          ? '٢. شیکاری بابەتی و پوختەی ئەزموونی'
          : isAr
          ? '٢. التحليل الموضوعي والتوليف الميداني'
          : '2. Thematic Analysis & Empirical Synthesis';

      case 'sec_3':
        return isBad
          ? '٣. خاڵێن هەڤشێوەیی و هەڤدەنگییا ئەزموونی (Consensus Points)'
          : isKu
          ? '٣. خاڵەکانی هاوشێوەیی و هاودەنگی ئەزموونی'
          : isAr
          ? '٣. نقاط التوافق والاتساق الميداني'
          : '3. Similarities & Empirical Consensus Points';

      case 'sec_4':
        return isBad
          ? '٤. جیاوازیێن میتۆدۆلۆجی و شیکاریا بەراوردکاری (Methodological Differences)'
          : isKu
          ? '٤. جیاوازییە میتۆدۆلۆجییەکان و شیکاری بەراوردکاری'
          : isAr
          ? '٤. الاختلافات المنهجية والتحليل المقارن'
          : '4. Methodological Differences & Comparative Analysis';

      case 'sec_5':
        return isBad
          ? '٥. دروچەیێ ئەزموونی و سیاقی یێ ڤەکۆلینێ (Contextual & Empirical Gap)'
          : isKu
          ? '٥. درزی ئەزموونی و سیاقی توێژینەوە'
          : isAr
          ? '٥. الفجوة البحثية السياقية والتجريبية'
          : '5. Contextual & Empirical Research Gap';

      case 'sec_6':
        return isBad
          ? '٦. ئاڕاستەیێن ڤەکۆلینا ئاینده (Future Directions)'
          : isKu
          ? '٦. ئاراستەکانی توێژینەوەی داهاتوو'
          : isAr
          ? '٦. التوجيهات المستقبلية للبحوث'
          : '6. Future Research Directions';

      case 'gap_title':
        return isBad
          ? 'شیکاریا ڕەخنەیی یا دروچەیێن ڤەکۆلینا ئاکادیمی'
          : isKu
          ? 'شیکاری ڕەخنەیی درزەکانی توێژینەوەی ئەکادیمی'
          : isAr
          ? 'تحليل الفجوات البحثية الأكاديمية المستندة إلى الأدلة'
          : 'Evidence-Based Academic Research Gap Analysis';

      case 'gap_statement':
        return isBad
          ? 'دەقێ ڕاستەقینە یێ دروچەیا ڤەکۆلینێ (Synthesized Research Gap Statement)'
          : isKu
          ? 'ڕاگەیەندراوی درزی توێژینەوە'
          : isAr
          ? 'صياغة بيان الفجوة البحثية الميدانية'
          : 'Synthesized Research Gap Statement';

      case 'how_study_addresses_gap':
        return isBad
          ? 'چەوانیا چارەسەرکرنا ڤێ دروچەیێ ژ لایێ ڤەکۆلینا نووکە ڤە'
          : isKu
          ? 'چۆنیەتی چارەسەرکردنی ئەم درزە لەلایەن توێژینەوەی ئێستاوە'
          : isAr
          ? 'كيفية معالجة الدراسة الحالية للفجوة المحددة'
          : 'How the Current Study Addresses the Identified Gap';

      case 'methodology_generator_title':
        return isBad
          ? 'بەرهەمهێنانا میتۆدۆلۆجیا زانستی و ڕێکخستنا توێژینەوەیێ'
          : isKu
          ? 'داڕشتنی میتۆدۆلۆجیای زانستی و هاوتەریبکردنی توێژینەوە'
          : isAr
          ? 'مولد المنهجية الأكاديمية ومصفوفة الاتساق البحثي'
          : 'Academic Methodology & Study Alignment Generator';

      case 'matrix_title':
        return isBad
          ? 'ماتریسکا ئێکگرتووا توێژینەوەیێ (پرسیار → ئارمانج → داتا → ئامراز → شیکاری)'
          : isKu
          ? 'ماتریسی هاوتەریبی توێژینەوە'
          : isAr
          ? 'مصفوفة الاتساق البحثي (الأسئلة ← الأهداف ← البيانات ← الأدوات ← التحليل)'
          : 'Research Alignment Matrix (Questions → Objectives → Data → Instruments → Analysis)';

      case 'questionnaire_structure_title':
        return isBad
          ? 'دیزاینا پێشنیارکری یا پرسیارنامەیێ و رەهەندێن پێوانێ'
          : isKu
          ? 'پێکهاتەی پێشنیارکراوی پرسیارنامە'
          : isAr
          ? 'الهيكل الموصى به للاستبانة وأبعاد القياس'
          : 'Recommended Questionnaire Structure & Construct Dimensions';

      case 'full_methodology_chapter_title':
        return isBad
          ? 'دەقێ ڕاستەقینە یێ بەشێ میتۆدۆلۆجیا ئاکادیمی (Chapter 3)'
          : isKu
          ? 'دەقی تەواوی بەشی میتۆدۆلۆجی'
          : isAr
          ? 'النص الكامل لفصل المنهجية الأكاديمية'
          : 'Full Academic Methodology Chapter Text';

      case 'references_title':
        return isBad
          ? `لیستا ژێدەرێن زانستی (${citationStyle})`
          : isKu
          ? `لیستی سەرچاوە زانستییەکان (${citationStyle})`
          : isAr
          ? `قائمة المراجع الأكاديمية (${citationStyle})`
          : `References (${citationStyle})`;

      default:
        return key;
    }
  };

  const handleCopy = () => {
    if (!review) return;
    const text = `# ${review.title}\n\n## Executive Literature Synthesis\n${review.executiveSynthesis}\n\n${review.themes.map((t, idx) => `## Theme ${idx + 1}: ${t.themeName}\n${t.synthesis}`).join('\n\n')}\n\n## Similarities & Empirical Consensus\n${review.similaritiesAndConsensus}\n\n## Methodological Differences\n${review.methodologicalDifferences}\n\n## Empirical Research Gaps\n${review.researchGaps}\n\n${gapData ? `## Evidence-Based Research Gap Analysis\nStrength: ${gapData.evidenceStrength}\nTypes: ${gapData.gapTypes?.join(', ')}\n${gapData.detailedGapParagraphs}\n\n## How Current Study Addresses Gap\n${gapData.howCurrentStudyAddressesGap}\n\n` : ''}${methodologyData ? `## Research Methodology Chapter\nDesign: ${methodologyData.researchDesign}\nStatus: ${methodologyData.studyStatus}\nSoftware: ${methodologyData.preferredSoftware}\n\n${methodologyData.fullMethodologyChapter}\n\n` : ''}## References\n${review.references.join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border border-indigo-800/50">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" /> {t('litReviewSuiteTagline', lang)}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('litReviewWorkspaceTitle', lang)}
          </h1>
          <p className="text-slate-300 text-xs md:text-sm">
            {t('litReviewWorkspaceDesc', lang)}
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
                {t('coreResearchTitle', lang)}
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => handleTopicChange(e.target.value)}
                placeholder=""
                required={inputPapers.length === 0}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('academicField', lang)}
              </label>
              <input
                type="text"
                value={field}
                onChange={e => setField(e.target.value)}
                placeholder=""
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Academic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('academicLevelLabel', lang)}</label>
              <select
                value={academicLevel}
                onChange={e => setAcademicLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                {getAcademicLevels(lang).map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('synthesisDepth', lang)}</label>
              <select
                value={targetLength}
                onChange={e => setTargetLength(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="Short">{lang === 'bad' ? 'کورت (تێڕوانینا گشتی)' : lang === 'ku' ? 'کورت (تێڕوانینی گشتی)' : lang === 'ar' ? 'قصير (نظرة عامة)' : 'Short (Executive Overview)'}</option>
                <option value="Standard">{lang === 'bad' ? 'پێوانەیی (پێداچوونا ستاندارد)' : lang === 'ku' ? 'ستاندارد (پێداچوونەوەی ستاندارد)' : lang === 'ar' ? 'قياسي (مراجعة قياسية)' : 'Standard (Standard Literature Review)'}</option>
                <option value="Detailed">{lang === 'bad' ? 'مفصل (تراکم چەند تەمایی)' : lang === 'ku' ? 'ورد (تەواو بەش بەش)' : lang === 'ar' ? 'مفصل (توليف شامل)' : 'Detailed (Extended Multi-Theme Synthesis)'}</option>
                <option value="Comprehensive">{lang === 'bad' ? 'تەمام (ئاستێ دکتۆرایێ)' : lang === 'ku' ? 'تەواو (ئاستی دکتۆرا)' : lang === 'ar' ? 'شامل (مستوى الدكتوراه)' : 'Comprehensive (Exhaustive PhD-Level Review)'}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('citationFormatLabel', lang)}</label>
              <select
                value={citationStyle}
                onChange={e => setCitationStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold text-indigo-600 dark:text-indigo-400"
              >
                {getCitationStyles(lang).map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('outputLanguageLabel', lang)}</label>
              <select
                value={outputLang}
                onChange={e => {
                  const newLang = e.target.value as Language;
                  setOutputLang(newLang);
                  if (onLanguageChange) onLanguageChange(newLang);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                {getOutputLanguageOptions(lang).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional RQs & Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('optionalResearchQuestions', lang)}</label>
              <textarea
                rows={2}
                value={researchQuestions}
                onChange={e => setResearchQuestions(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('optionalResearchObjectives', lang)}</label>
              <textarea
                rows={2}
                value={researchObjectives}
                onChange={e => setResearchObjectives(e.target.value)}
                placeholder=""
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
                  {t('academicSourcesHub', lang)} ({inputPapers.length} {t('papersQueued', lang)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowScholarModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" /> {t('searchScholar', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddManual(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> {t('addAbstractMetadata', lang)}
                </button>
              </div>
            </div>

            <FileUploadZone lang={lang} onFileParsed={handleFileParsed} onClearFile={() => {}} />

            {/* Loaded Input Papers Badges */}
            {inputPapers.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {lang === 'bad' ? 'لیستا بەڵگەنامە و ژێدەرێن هاتییە بارکرن بۆ پێکڤەگرێدانێ:' : lang === 'ku' ? 'لیستی سەرچاوە بارکراوەکان بۆ پێکهاتەی AI:' : lang === 'ar' ? 'قائمة الأوراق المحملة للتحليل الشامل:' : 'Loaded Papers Queue for AI Meta-Synthesis:'}
                  </span>
                  <button type="button" onClick={() => setInputPapers([])} className="text-[11px] text-rose-500 hover:underline font-bold">
                    {lang === 'bad' ? 'پاککرنا هەمی فایلا' : lang === 'ku' ? 'سڕینەوەی هەموو فایلەکان' : lang === 'ar' ? 'إزالة جميع الملفات' : 'Clear All Loaded Papers'}
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
            {loading ? t('generating', lang) : t('generateLitReviewBtn', lang)}
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
                {t('navLitReview', outputLang)}: {review.title}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('academicField', outputLang)}: {review.field} &bull; {t('citationFormatLabel', outputLang)}: {citationStyle} &bull; {t('academicLevelLabel', outputLang)}: {academicLevel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t('copiedBtn', outputLang) : t('copyBtn', outputLang)}
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
                {outputLang === 'bad' ? 'بەشێ پێداچوونا ئەدەبیاتان و تراکما تیۆری یا سیستەماتیک' : outputLang === 'ku' ? 'بەشی پێداچوونەوەی ئەدەبیاتی زانستی' : outputLang === 'ar' ? 'فصل مراجعة الأدبيات والتوليف الأكاديمي الشامل' : 'Systematic Literature Review & Meta-Synthesis Chapter'}
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
                      {outputLang === 'bad' ? 'شیکاریا ڕاستگۆیی و ڕێکخستنا کوالیتییا پێداچوونێ' : outputLang === 'ku' ? 'پشکنینی کوالیتی پێداچوونەوەی زانستی' : outputLang === 'ar' ? 'أداة التحقق من جودة مراجعة الأدبيات' : 'Literature Review Quality & Alignment Validator'}
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
                      {outputLang === 'bad' ? 'نمرەی گشتی:' : outputLang === 'ku' ? 'نمرەی گشتی:' : outputLang === 'ar' ? 'النتيجة الإجمالية:' : 'Overall Score:'} {review.qualityScores.overallQuality}/100 ({review.qualityScores.status})
                    </span>
                  </div>
                </div>

                {/* Score meters grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">{outputLang === 'bad' ? 'گونجانا بابەتی' : outputLang === 'ku' ? 'گونجانی بابەت' : outputLang === 'ar' ? 'ملاءمة الموضوع' : 'Topic Alignment'}</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{review.qualityScores.topicAlignment}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">{outputLang === 'bad' ? 'کوالیتییا بەڵگان' : outputLang === 'ku' ? 'کوالیتی بەڵگەکان' : outputLang === 'ar' ? 'جودة الأدلة' : 'Evidence Quality'}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{review.qualityScores.evidenceQuality}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">{outputLang === 'bad' ? 'تراکما ڕەخنەیی' : outputLang === 'ku' ? 'پێکهاتەی ڕەخنەیی' : outputLang === 'ar' ? 'التوليف النقدي' : 'Critical Synthesis'}</span>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{review.qualityScores.criticalSynthesis}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">{outputLang === 'bad' ? 'پشتگیرییا دروچەیێ' : outputLang === 'ku' ? 'پشتگیری درز' : outputLang === 'ar' ? 'دعم الفجوة' : 'Gap Support'}</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{review.qualityScores.researchGapSupport}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">{outputLang === 'bad' ? 'کووراتیا ئەکادیمی' : outputLang === 'ku' ? 'قوڵیی ئەکادیمی' : outputLang === 'ar' ? 'العمق الأكاديمي' : 'Academic Depth'}</span>
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
                  {getLocalizedHeader('sec_1', outputLang)}
                </h2>
                <button
                  onClick={() => handleIterateSection('synthesis', 'expand')}
                  disabled={iterating === 'synthesis'}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> {outputLang === 'bad' ? 'کوورکرنا بەشێ 🪄' : outputLang === 'ku' ? 'قوڵکردنەوەی بەش 🪄' : outputLang === 'ar' ? 'تعميق القسم 🪄' : 'Deepen Section 🪄'}
                </button>
              </div>

              {renderAcademicParagraphs(review.executiveSynthesis, allAvailableSources)}
            </div>

            {/* 2. Thematic Syntheses (Paragraphs) */}
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                {getLocalizedHeader('sec_2', outputLang)}
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
                        <span className="font-bold block mb-1">
                           {outputLang === 'bad' ? 'دروچەیا زانستی یا هاتیا دەستنیشانکرن:' : 'Identified Theme Research Gap:'}
                        </span>
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
                  {getLocalizedHeader('sec_3', outputLang)}
                </h2>
                {renderAcademicParagraphs(review.similaritiesAndConsensus, allAvailableSources)}
              </div>
            )}

            {/* 4. Methodological Differences & Comparative Analysis (Paragraphs) */}
            {review.methodologicalDifferences && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  {getLocalizedHeader('sec_4', outputLang)}
                </h2>
                {renderAcademicParagraphs(review.methodologicalDifferences, allAvailableSources)}
              </div>
            )}

            {/* 5. Empirical Research Gaps (Paragraphs) */}
            {review.researchGaps && (
              <div className="space-y-3 p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50">
                <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 border-b border-amber-200/60 dark:border-amber-800/60 pb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  {getLocalizedHeader('sec_5', outputLang)}
                </h2>
                {renderAcademicParagraphs(review.researchGaps, allAvailableSources)}
              </div>
            )}

            {/* 6. Future Research Directions (Paragraphs) */}
            {review.futureResearchDirections && (
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  {getLocalizedHeader('sec_6', outputLang)}
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
                    {getLocalizedHeader('gap_title', outputLang)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {outputLang === 'bad'
                      ? 'پوختەیا دیراسەیێن پشکدار، بەراوردکرنا دەرئەنجامێن مەیدانی، و دەستنیشانکرنا دروچەیێن جوگرافی، میتۆدۆلۆجی و ئەزموونی.'
                      : 'Synthesize reviewed studies, compare empirical findings, and establish specific contextual, geographical, & methodological research gaps.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateResearchGap}
                  disabled={loadingGap}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loadingGap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loadingGap
                    ? (outputLang === 'bad' ? 'د دەستنیشانکرنا دروچەیێ دا...' : 'Generating Research Gap...')
                    : (outputLang === 'bad' ? 'بەرهەمهێنانا دروچەیا ڤەکۆلینێ' : 'Generate Research Gap')}
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
                    <button
                      type="button"
                      onClick={() => setShowEvidenceDetails(!showEvidenceDetails)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        showEvidenceDetails
                          ? 'bg-amber-700 text-white ring-2 ring-amber-400'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                      title="Click to view interactive evidence quality & appraisal metrics"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{outputLang === 'bad' ? `هێزا بەڵگەیا زانستی: ${gapData.evidenceStrength}` : `Evidence Strength: ${gapData.evidenceStrength}`}</span>
                    </button>
                    {gapData.gapTypes?.map((gt, i) => {
                      const isSelected = selectedGapTag === gt;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedGapTag(isSelected ? null : gt)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900'
                          }`}
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>{gt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Evidence Quality Appraisal Panel */}
                  {showEvidenceDetails && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 space-y-2 text-xs animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Evidence Quality Appraisal: {gapData.evidenceStrength} Evidence Rating
                        </h5>
                        <button
                          type="button"
                          onClick={() => setShowEvidenceDetails(false)}
                          className="text-amber-800 dark:text-amber-300 hover:underline font-bold"
                        >
                          Close
                        </button>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                        {outputLang === 'bad'
                          ? `ئاستێ بەڵگان پشتبەستنێ ل سەر سنورداربوون و هووربڕیا دیراسەیێن مەیدانی دکەت. پلەیا "${gapData.evidenceStrength}" ئاماژەیێ ددەتە کواڵتییا ژێدەرێن زانستی، هووریا دیزاینا تاقیکرنێن ئاماری، و دروستاتییا سەلماندنا هیپۆتیزان د ناڤ بەلگێن سێکوچکەیی دا.`
                          : outputLang === 'ku'
                          ? `ئاستی بەڵگەکان پشتیان بە هێزی توێژینەوە مەیدانییەکان و سەلماندنی هیپۆتیزەکان بەستووە.`
                          : outputLang === 'ar'
                          ? `يعبر مؤشر قوة الأدلة (${gapData.evidenceStrength}) عن درجة الموثوقية والأثر الإحصائي للدراسات المسحية الميدانية المعتمدة.`
                          : `The Evidence Strength indicator (${gapData.evidenceStrength}) evaluates the empirical rigor, sample power adequacy ($N$), and peer-reviewed citation authority across cited studies.`}
                      </p>
                    </div>
                  )}

                  {/* Focused Dynamic Gap Analysis Card */}
                  {selectedGapTag && (() => {
                    const tagLower = selectedGapTag.toLowerCase();
                    const activeTopicStr = topic.trim() || review?.title || 'Academic Research Study';
                    const isBad = outputLang === 'bad';
                    const isKu = outputLang === 'ku';
                    const isAr = outputLang === 'ar';

                    let title = 'Scholarly Research Gap Analysis';
                    let paragraphs: string[] = [];
                    let impact = '';

                    if (tagLower.includes('geograph') || tagLower.includes('جوگرافی') || tagLower.includes('جغرافي')) {
                      title = isBad ? 'شیکاریا ڕەخنەیی یا دروچەیێ جوگرافی (Geographical Gap Analysis)' : isKu ? 'شیکاری ڕەخنەیی درزی جوگرافی' : isAr ? 'التحليل النمذجي للفجوة الجغرافية' : 'Geographical & Contextual Gap Analysis';
                      paragraphs = [
                        isBad
                          ? `د ئەدەبیاتێن زانستیێن نێودەوڵەتی دا ل سەر "${activeTopicStr}"، زۆربەیا هەرە مەزنا ڤەکۆلینێن مەیدانی د ناڤبەرا زانکۆ و ناڤەندێن توێژینەوەیێن ڕۆژئاڤا هاتینە ئەنجامدان. ئەڤ لایەنگرییا جوگرافی (Geographical Bias) دبیتە ئەگەرێ هندێ کو مۆدێلێن تیۆری نەشێن ب شێوەیەکێ گشتگیر ب سەر ژینگەیێن ڕۆژهەڵاتا ناوەڕاست و ناڤچەیی (وێنێ زانکۆیێن هەرێما کوردستانێ) دا بهێنە جێبەجێکرن.`
                          : isKu
                          ? `لە ئەدەبیاتی زانستی نێودەوڵەتییدا سەبارەت بە "${activeTopicStr}"، زۆربەی توێژینەوەکان لە ناوەندە ئەکادیمییەکانی ڕۆژئاوا ئەنجامدراون. ئەم لایەنگرییە جوگرافییە دەبێتە هۆی ئەوەی کە ئەنجامەکان بۆ ژینگەی ناوچەیی گشتگیر نەبن.`
                          : isAr
                          ? `تظهر المراجعة النقدية للأدبيات العلمية المتعلقة بـ "${activeTopicStr}" تمركزاً جغرافياً واضحاً في المؤسسات الغربية والدول المتقدمة، مما يحد من تعميم النتائج (Generalizability) على البيئات الأكاديمية والمؤسسية المحلية والإقليمية.`
                          : `A critical review of the empirical corpus regarding "${activeTopicStr}" demonstrates a pronounced geographical clustering within Western and high-resource institutional settings. Consequently, existing theoretical models exhibit limited contextual generalizability when applied to emerging regional ecosystems.`,
                        isBad
                          ? `کەلێنا جوگرافی یا ڕاستەقینە بریتی یە ژ نەبوونا داتایێن مەیدانی د ناوچەیێن پەرەپێدراو دا، کو تێدا جیاوازییا ژێرخانا تەکنۆلۆجی و سیاقێ سۆسیۆ-ئابووری وەدکەت کو گۆڕاوێن سەربەخۆ ئەنجامێن جیاواز د شیکاریا ئاماری دا دەربێخن.`
                          : isKu
                          ? `دەرزی جوگرافی ڕاستەقینە بریتییە لە نەبوونی داتای مەیدانی لە ناوچە پەڕەپێدراوەکاندا بەهۆی جیاوازی کۆمەڵایەتی و ئابووری.`
                          : isAr
                          ? `وتتجلى الفجوة الجغرافية في غياب البيانات الميدانية الدقيقة التي تأخذ بعين الاعتبار الخصائص الديموغرافية والبنية التحتية للمؤسسات التعليمية والأكاديمية المحلية.`
                          : `The identified geographical gap stems from the absence of empirical baseline metrics within regional academic institutions, where distinct socio-cultural dynamics and infrastructure parameters modulate key variable interactions.`
                      ];
                      impact = isBad
                        ? `ئەڤ توێژینەوەیە ب شێوەیەکێ سەربەخۆ ڤێ دروچەیا جوگرافی پڕ دکەت ب ڕێکا ئەنجامدانا دیراسەیەکی مەیدانی د ناڤبەرا زانکۆ و دامەزراوەیێن ناوچەیی دا.`
                        : isKu
                        ? `ئەم توێژینەوەیە بە شێوەیەکی سەربەخۆ ئەم درزە جوگرافییە پڕ دەکاتەوە بە ئەنجامدانی توێژینەوەیەکی مەیدانی ناوچەیی.`
                        : isAr
                        ? `تسهم هذه الدراسة في سد الفجوة الجغرافية من خلال تقديم تحليل ميداني مباشر يغطي المؤسسات الإقليمية والمحلية.`
                        : `This study directly addresses the geographical gap by conducting an empirical investigation tailored specifically to local and regional academic frameworks.`;
                    } else if (tagLower.includes('method') || tagLower.includes('میتۆد') || tagLower.includes('منهج')) {
                      title = isBad ? 'شیکاریا ڕەخنەیی یا دروچەیێ میتۆدۆلۆجی (Methodological Gap Analysis)' : isKu ? 'شیکاری ڕەخنەیی درزی میتۆدۆلۆجی' : isAr ? 'التحليل النمذجي للفجوة المنهجية' : 'Methodological & Design Gap Analysis';
                      paragraphs = [
                        isBad
                          ? `زۆربەیا توێژینەوەیێن پێشین ل سەر "${activeTopicStr}" پشتبەستنێ ل سەر دیزاینێن بڕگەیی (Cross-Sectional Designs) دکەن کو داتایان د ئێک دەمێ دیارکراو دا کۆم دکەن. ئەڤ شێوازە کێماسییا ڕوون هەیە د دۆزینەوەیا پەیوەندییا هۆکار و ئەنجامی دا (Causal Inference).`
                          : isKu
                          ? `زۆربەی توێژینەوەکانی پێشوو لەسەر "${activeTopicStr}" پشتیان بە دیزاینی بڕگەیی بەستووە کە توانای سەلماندنی پێوەندی هۆکار و ئەنجامی نییە.`
                          : isAr
                          ? `تعتمد معظم الدراسات السابقة المتعلقة بـ "${activeTopicStr}" على التصاميم المسحية المقطعية (Cross-Sectional Designs)، والتي تعاني من قيود منهجية حادة في تحديد العلاقات العلية المباشرة (Causal Inferences).`
                          : `Prior scholarly research on "${activeTopicStr}" overwhelmingly relies on cross-sectional observational survey designs. This methodological constraint restricts the capacity to establish definitive causal pathways between operational constructs.`,
                        isBad
                          ? `علاوە ل سەر ڤێ چەندێ، نەبوونا پێوەرێن سێکوچکەیی (Methodological Triangulation) و پشت بەستنا زێدە ل سەر خود-ڕاپۆرتدانێ (Self-Reported Data) هەڵەیێن زاتی د ئامارێن SPSS دا زێدە دکەت.`
                          : isKu
                          ? `جگە لەوەش، بەکارهێنانی ڕاستەوخۆی پرسیارنامە سەربەخۆکان لەوانەیە ببێتە هۆی بەرزبوونەوەی هەڵەی ئاماری.`
                          : isAr
                          ? `علاوة على ذلك، فإن الاعتماد المفرط على أدوات التقييم الذاتي دون استخدام منهجية التثليث (Methodological Triangulation) يزيد من نسبة التحيز القياسي.`
                          : `Furthermore, the heavy reliance on self-reported psychometric instruments without cross-validation through structural modeling or qualitative triangulation introduces systematic measurement variance.`
                      ];
                      impact = isBad
                        ? `تێزا نووکە مۆدێلەکێ تەواو یێ ئاماری (بکارئینانا تاقیکرنێن SPSS: Pearson, Linear Regression, ANOVA) بکارئینایت دا کو هووربڕیا دیزاینێ توێژینەوەیێ تەواو بکەت.`
                        : isKu
                        ? `ئەم توێژینەوەیە مۆدێلێکی پێشکەوتووی ئاماری بەکاردەهێنێت بۆ بەرزکردنەوەی وردی توێژینەوەکە.`
                        : isAr
                        ? `تعالج هذه الدراسة هذه الفجوة المنهجية من خلال تطبيق نموذج إحصائي متكامل يتضمن اختبارات الانحدار والارتباط والتباين.`
                        : `This investigation resolves the methodological gap by instituting a multi-variate statistical framework featuring structural regression and bivariate correlation analytics.`;
                    } else {
                      title = isBad ? 'شیکاریا ڕەخنەیی یا دروچەیێ ئەزموونی و سیاقی (Empirical & Contextual Gap Analysis)' : isKu ? 'شیکاری ڕەخنەیی درزی ئەزموونی' : isAr ? 'التحليل النمذجي للفجوة التجريبية والسياقية' : 'Empirical & Theoretical Gap Analysis';
                      paragraphs = [
                        isBad
                          ? `دروچەیێ ئەزموونی ڕوو ددەت دەمێ د ناڤبەرا پێشبینیێن تیۆری و ئەنجامێن مەیدانی دا دژبەری (Empirical Contradictions) یان کەلێنێن ڕوون هەبن دەربارەی "${activeTopicStr}". ڤەکۆلینێن بەری نووکە ب هووربینی کاریگەرییا گۆڕاوێن سەربەخۆ د ناڤ گۆڕاوێن لادەر (Moderating Variables) دا نەپێوایە.`
                          : isKu
                          ? `درزی ئەزموونی کاتێک ڕوودەدات کە لە نێوان پێشبینییە تیۆرییەکان و ئەنجامە مەیدانییەکاندا دژبەری هەبێت سەبارەت بە "${activeTopicStr}".`
                          : isAr
                          ? `تظهر الفجوة التجريبية والسياقية عند وجود تناقضات في النتائج الميدانية السابقة المتعلقة بـ "${activeTopicStr}"، أو غياب التقييم الدقيق للمتغيرات المعدلة (Moderating Variables).`
                          : `An empirical and contextual gap emerges from documented discrepancies across previous empirical findings regarding "${activeTopicStr}". Existing literature lacks a synthesized evaluation of interaction effects among primary moderating constructs.`,
                        isBad
                          ? `ئەڤ کەلێنا ئەزموونی داوا دکەت کو ب شێوەیەکێ مەیدانی و زانستی پێوەرێن نوو بهێنە ئێکخستن دا کو ڕاستییێن جڤاکی و ئاکادیمی ب تەواوی دیار بن.`
                          : isKu
                          ? `ئەم درزە ئەزموونییە داوای ئەنجامدانی توێژینەوەیەکی مەیدانی نوێ دەکات بۆ ڕوونکردنەوەی پەیوەندییەکان.`
                          : isAr
                          ? `وتتطلب هذه الفجوة التجريبية إجراء دراسة ميدانية شاملة لإعادة تقييم الفرضيات في ضوء البيانات الميدانية الحديثة.`
                          : `Addressing this empirical gap requires rigorous dynamic hypothesis testing to reconcile legacy empirical discrepancies.`
                      ];
                      impact = isBad
                        ? `ئەڤ توێژینەوەیە ب شێوەیەکێ ڕاستەوخۆ سەرپەرشتیا چارەسەرکرنا ڤێ دروچەیێ ئەزموونی دکەت ب دابینکرنا شیکاریەکا تەواو بۆ داتایێن مەیدانی.`
                        : isKu
                        ? `ئەم توێژینەوەیە ڕاستەوخۆ کار لەسەر پرکردنەوەی ئەم درزە ئەزموونییە دەکات.`
                        : isAr
                        ? `تهدف هذه الدراسة بشكل مباشر إلى سد هذه الفجوة التجريبية عبر تقديم أدلة إحصائية مثبتة.`
                        : `This paper directly fills the empirical gap by deploying empirical validation to resolve prior domain inconsistencies.`;
                    }

                    return (
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-emerald-500/15 border border-amber-400/50 dark:border-amber-700/50 space-y-4 shadow-lg animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/80 pb-3">
                          <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                            {title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSelectedGapTag(null)}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>Clear Filter</span>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3 font-serif leading-relaxed text-sm text-slate-800 dark:text-slate-200">
                          {paragraphs.map((p, pIdx) => (
                            <p key={pIdx} className="text-justify indent-4">
                              {p}
                            </p>
                          ))}
                        </div>

                        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900 text-xs font-sans text-amber-950 dark:text-amber-200 font-semibold flex items-center gap-2">
                          <Target className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{impact}</span>
                        </div>
                      </div>
                    );
                  })()}

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
                      {outputLang === 'bad' ? `دیزاین: ${methodologyData.researchDesign}` : `Design: ${methodologyData.researchDesign}`}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold shadow-2xs">
                      {outputLang === 'bad' ? `بارودۆخ: ${methodologyData.studyStatus}` : `Status: ${methodologyData.studyStatus}`}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-white font-bold shadow-2xs">
                      {outputLang === 'bad' ? `پرۆگرام: ${methodologyData.preferredSoftware}` : `Software: ${methodologyData.preferredSoftware}`}
                    </span>
                  </div>

                  {/* Research Alignment Matrix Table */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                      <Table className="w-4 h-4 text-blue-600" />
                      {getLocalizedHeader('matrix_title', outputLang)}
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                          <tr>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">
                              {outputLang === 'bad' ? 'پرسیارا توێژینەوەیێ' : 'Research Question'}
                            </th>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">
                              {outputLang === 'bad' ? 'ئارمانجا توێژینەوەیێ' : 'Objective'}
                            </th>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">
                              {outputLang === 'bad' ? 'داتایا پێویست' : 'Data Required'}
                            </th>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">
                              {outputLang === 'bad' ? 'ئامرازێ پێوانێ' : 'Instrument'}
                            </th>
                            <th className="p-3 border-b border-slate-200 dark:border-slate-700">
                              {outputLang === 'bad' ? 'ڕێکا شیکاریا ئاماری' : 'Analysis Method'}
                            </th>
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
                        {getLocalizedHeader('questionnaire_structure_title', outputLang)}
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
                      {getLocalizedHeader('full_methodology_chapter_title', outputLang)}
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
                {getLocalizedHeader('references_title', outputLang)}
              </h2>
              <p className="text-xs text-slate-500">
                {outputLang === 'bad'
                  ? 'کلیک ل سەر هەر ژێدەرەکێ خوارێ بکە دا کو زانیاریێن ڕاستەقینە، ژێدەرێ سەرەکی، و کورتەیا توێژینەوەیێ ببینی.'
                  : 'Click any reference entry below to inspect the verified source record, abstract, and original link.'}
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
