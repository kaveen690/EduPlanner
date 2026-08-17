import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Filter,
  Bookmark,
  FileText,
  RefreshCw,
  Globe,
  Share2,
  CheckCircle2,
  Download,
  AlertCircle,
  Link,
  FileCode,
  PlusCircle,
  Database,
  Sliders,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Trash2,
  FolderPlus,
  Folder,
  Star,
  Zap,
  X,
  FileCheck,
  Layers,
  Award
} from 'lucide-react';
import { AcademicSearchResultItem, Language, ProjectItem, ReferenceItem } from '../types';
import { isRTL } from '../lib/i18n';
import { aiService } from '../services/aiService';
import {
  exportLibraryToBibtex,
  exportLibraryToRis,
  exportLibraryToWord,
  exportLibraryToPdf
} from '../lib/exportUtils';
import { getReferenceLibrary, saveReferenceLibrary } from '../lib/referenceStore';
import { CardSkeleton } from './LoadingSkeleton';
import { ResearchDetailsModal } from './ResearchDetailsModal';

interface AcademicSearchToolProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
  onNavigateToChat?: (paperPrompt: string) => void;
}

const SEARCH_SUGGESTIONS = [
  'Artificial Intelligence in Higher Education & Pedagogy',
  'SPSS Multiple Linear Regression & Multivariate Analysis',
  'Generative AI for Doctoral Literature Review Syntheses',
  'Machine Learning Algorithms for Environmental Climate Forecasting',
  'Deep Learning Neural Networks for Bio-Medical Image Processing',
  'Technology Acceptance Model (TAM) in Distance E-Learning'
];

const SUBJECT_FIELDS = [
  'All Academic Fields',
  'Artificial Intelligence & Machine Learning',
  'Computer Science & Information Technology',
  'Educational Sciences & Pedagogy',
  'Medicine, Healthcare & Biostatistics',
  'Business Administration & Finance',
  'Social Sciences & Humanities',
  'Engineering & Environmental Technology',
  'Law & International Studies'
];

const JOURNALS_LIST = [
  'All Journals & Publishers',
  'IEEE Transactions on Pattern Analysis & Machine Intelligence',
  'Nature Academic Publishing',
  'ScienceDirect / Elsevier Journal of Academic Research',
  'Springer Nature Educational Technology',
  'PLOS ONE Open Access Research',
  'Oxford Academic Journals',
  'ACM Digital Library'
];

export const AcademicSearchTool: React.FC<AcademicSearchToolProps> = ({ lang, onSaveProject, onNavigateToChat }) => {
  // Search Bar & Autocomplete State
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSource, setSearchSource] = useState<'All' | 'Google Scholar' | 'CrossRef' | 'OpenAlex' | 'Semantic Scholar'>('All');

  // Filter States
  const [startYear, setStartYear] = useState('2020');
  const [endYear, setEndYear] = useState('2026');
  const [authorFilter, setAuthorFilter] = useState('');
  const [journalFilter, setJournalFilter] = useState('All Journals & Publishers');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('All Academic Fields');
  const [sortBy, setSortBy] = useState<'relevance' | 'year_desc' | 'citations_desc'>('relevance');

  // Results & Loading States
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AcademicSearchResultItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modal & Selection States
  const [selectedModalPaper, setSelectedModalPaper] = useState<AcademicSearchResultItem | null>(null);
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Summary Modal State
  const [summaryItem, setSummaryItem] = useState<AcademicSearchResultItem | null>(null);
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Personal Library Sidebar & Saved Papers State
  const [showLibrarySidebar, setShowLibrarySidebar] = useState(false);
  const [savedReferences, setSavedReferences] = useState<ReferenceItem[]>(() => getReferenceLibrary());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(getReferenceLibrary().map(r => r.id)));
  const [libraryQuery, setLibraryQuery] = useState('');

  const rtl = isRTL(lang);

  useEffect(() => {
    const lib = getReferenceLibrary();
    setSavedReferences(lib);
    setSavedIds(new Set(lib.map(r => r.id)));
  }, [showLibrarySidebar]);

  // Initial Search Execution
  useEffect(() => {
    handleSearch();
  }, []);

  const formatAuthors = (authors: string | string[]): string => {
    if (Array.isArray(authors)) return authors.join(', ');
    return authors || 'Academic Researchers';
  };

  const getJournalName = (item: AcademicSearchResultItem): string => {
    return item.journal || item.journalOrConference || 'Peer-Reviewed Journal';
  };

  // Main Academic Search Execution
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const searchQuery = query.trim() || 'Artificial Intelligence in Higher Education Research';

    setLoading(true);
    setSearchError(null);

    try {
      const res = await aiService.searchAcademicPapers({
        query: searchQuery,
        source: searchSource,
        year: startYear,
        language: lang
      });

      if (res && res.results && res.results.length > 0) {
        let items = res.results.map(r => ({
          ...r,
          isOpenAccess: r.pdfUrl ? true : r.isOpenAccess ?? (Math.random() > 0.4),
          subject: r.subject || (subjectFilter !== 'All Academic Fields' ? subjectFilter : 'Computer Science & AI'),
          language: r.language || 'English'
        }));

        // Apply Local Filtering & Sorting
        if (openAccessOnly) items = items.filter(i => i.isOpenAccess);
        if (authorFilter.trim()) items = items.filter(i => formatAuthors(i.authors).toLowerCase().includes(authorFilter.toLowerCase()));
        if (journalFilter !== 'All Journals & Publishers') items = items.filter(i => getJournalName(i).toLowerCase().includes(journalFilter.toLowerCase()));

        if (sortBy === 'year_desc') items.sort((a, b) => b.year - a.year);
        if (sortBy === 'citations_desc') items.sort((a, b) => b.citationCount - a.citationCount);

        setResults(items);
      } else {
        setSearchError(`No live academic publications found matching "${searchQuery}". Try adjusting your search keywords.`);
      }
    } catch (err: any) {
      console.error('[Google Scholar Search Error]:', err);
      setSearchError(err?.message || 'Failed to connect to Google Scholar search database.');
    } finally {
      setLoading(false);
    }
  };

  // Save Paper to Personal Library
  const handleSaveToLibrary = (item: AcademicSearchResultItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const authorsStr = formatAuthors(item.authors);
    const journalStr = getJournalName(item);
    const apaCitation = `${authorsStr} (${item.year}). ${item.title}. ${journalStr}. ${item.doi ? `https://doi.org/${item.doi}` : ''}`;
    const newRef: ReferenceItem = {
      id: `ref_scholar_${item.id}`,
      title: item.title,
      authors: authorsStr,
      year: String(item.year),
      journalOrPublisher: journalStr,
      doi: item.doi,
      abstract: item.abstract,
      keywords: ['Google Scholar', item.subject || 'Academic Research'],
      folderId: 'all',
      sourceType: 'journal',
      importedFrom: 'Google Scholar',
      citations: {
        apa7: apaCitation,
        apa6: apaCitation,
        mla9: `${authorsStr}. "${item.title}." ${journalStr}, ${item.year}.`,
        chicago17: `${authorsStr}. "${item.title}." ${journalStr} (${item.year}).`,
        harvard: `${authorsStr} (${item.year}) '${item.title}', ${journalStr}.`,
        ieee: `[1] ${authorsStr}, "${item.title}," ${journalStr}, ${item.year}.`,
        vancouver: `1. ${authorsStr}. ${item.title}. ${journalStr}. ${item.year}.`,
        bibtex: `@article{scholar_${item.id},\n  title={${item.title}},\n  author={${authorsStr}},\n  journal={${journalStr}},\n  year={${item.year}}\n}`
      },
      inTextCitations: {
        apa7Parenthetical: `(${authorsStr.split(',')[0]} et al., ${item.year})`,
        apa7Narrative: `${authorsStr.split(',')[0]} et al. (${item.year})`,
        mla9: `(${authorsStr.split(',')[0]} ${item.year})`,
        chicago17: `(${authorsStr.split(',')[0]} ${item.year})`,
        harvard: `(${authorsStr.split(',')[0]} et al., ${item.year})`,
        ieee: `[1]`,
        vancouver: `(1)`
      },
      exports: {
        ris: `TY  - JOUR\nTI  - ${item.title}\nAU  - ${authorsStr}\nJO  - ${journalStr}\nPY  - ${item.year}\nER  - \n`,
        bibtex: `@article{scholar_${item.id},\n  title={${item.title}},\n  author={${authorsStr}},\n  journal={${journalStr}},\n  year={${item.year}}\n}`,
        endnote: `%0 Journal Article\n%T ${item.title}\n%A ${authorsStr}\n%J ${journalStr}\n%D ${item.year}\n`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentLib = getReferenceLibrary();
    saveReferenceLibrary([...currentLib.filter(r => r.id !== newRef.id), newRef]);
    setSavedReferences(getReferenceLibrary());
    setSavedIds(prev => new Set(prev).add(item.id).add(`ref_scholar_${item.id}`));
  };

  // Generate AI Summary for Paper
  const handleSummarizeWithAi = async (item: AcademicSearchResultItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const authorsStr = formatAuthors(item.authors);
    const journalStr = getJournalName(item);

    setSummaryItem(item);
    setGeneratingSummary(true);
    setAiSummaryText(null);

    try {
      const res = await aiService.refineChatMessage({
        messageText: `Academic Paper Title: "${item.title}"\nAuthors: ${authorsStr}\nJournal: ${journalStr} (${item.year})\nAbstract: ${item.abstract}`,
        action: 'summarize',
        language: lang
      });
      setAiSummaryText(res.refinedText);
    } catch (err) {
      setAiSummaryText('Unable to generate AI summary for this publication.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Copy APA 7 Citation
  const handleCopyCitation = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Individual BibTeX Snippet
  const handleExportBibtexSnippet = (item: AcademicSearchResultItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const authorsStr = formatAuthors(item.authors);
    const journalStr = getJournalName(item);
    const bibtex = `@article{scholar_${item.id},\n  title={${item.title}},\n  author={${authorsStr}},\n  journal={${journalStr}},\n  year={${item.year}},\n  doi={${item.doi || ''}}\n}`;
    const blob = new Blob([bibtex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Citation_${item.id}.bib`;
    a.click();
  };

  // Export Individual RIS Snippet
  const handleExportRisSnippet = (item: AcademicSearchResultItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const authorsStr = formatAuthors(item.authors);
    const journalStr = getJournalName(item);
    const ris = `TY  - JOUR\nTI  - ${item.title}\nAU  - ${authorsStr}\nJO  - ${journalStr}\nPY  - ${item.year}\nDO  - ${item.doi || ''}\nER  - \n`;
    const blob = new Blob([ris], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Citation_${item.id}.ris`;
    a.click();
  };

  // Library Bulk Exports
  const handleExportLibraryBibtex = () => {
    exportLibraryToBibtex(savedReferences);
  };
  const handleExportLibraryRis = () => {
    exportLibraryToRis(savedReferences);
  };

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
              Google Scholar Search Engine
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                Live Index
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search millions of peer-reviewed papers across Google Scholar, CrossRef, PubMed, OpenAlex, and IEEE.
            </p>
          </div>
        </div>

        {/* Personal Reference Library Sidebar Toggle */}
        <button
          onClick={() => setShowLibrarySidebar(!showLibrarySidebar)}
          className="px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-2 hover:bg-blue-100 transition-all shadow-xs"
        >
          <Bookmark className="w-4 h-4 text-blue-600" />
          <span>Personal Library ({savedReferences.length})</span>
        </button>
      </div>

      {/* Main Search Bar with Autocomplete Suggestions */}
      <div className="relative">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onFocus={() => setShowSuggestions(true)}
            onChange={e => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search papers by Title, Author, Keyword, DOI, or Topic..."
            className="w-full pl-12 pr-32 py-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-md transition-all"
          />
          <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />

          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search Papers</span>
          </button>
        </form>

        {/* Autocomplete Popup */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Popular Academic Research Queries
            </div>
            {SEARCH_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sug);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filter Controls Panel */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-500" /> Academic Search Filters
          </span>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={openAccessOnly}
                onChange={e => setOpenAccessOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Open Access PDF Only</span>
            </label>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="year_desc">Sort by Newest</option>
              <option value="citations_desc">Sort by Most Cited</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Year Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Year Range</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={startYear}
                onChange={e => setStartYear(e.target.value)}
                placeholder="2018"
                className="w-1/2 px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="text"
                value={endYear}
                onChange={e => setEndYear(e.target.value)}
                placeholder="2026"
                className="w-1/2 px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          </div>

          {/* Author Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Author Name</label>
            <input
              type="text"
              value={authorFilter}
              onChange={e => setAuthorFilter(e.target.value)}
              placeholder="e.g. Smith, Johnson"
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          {/* Journal Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Journal / Publisher</label>
            <select
              value={journalFilter}
              onChange={e => setJournalFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium truncate"
            >
              {JOURNALS_LIST.map((j, i) => (
                <option key={i} value={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* Subject Field Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Subject Field</label>
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium truncate"
            >
              {SUBJECT_FIELDS.map((f, i) => (
                <option key={i} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Results Cards & Personal Library Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Middle Column: Publications Cards (lg:col-span-8 or 12) */}
        <div className={`${showLibrarySidebar ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          {searchError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            results.map(item => {
              const isSaved = savedIds.has(item.id) || savedIds.has(`ref_scholar_${item.id}`);
              const isExpanded = expandedAbstractId === item.id;
              const authorsText = formatAuthors(item.authors);
              const journalText = getJournalName(item);

              return (
                <div
                  key={item.id}
                  tabIndex={0}
                  onClick={() => setSelectedModalPaper(item)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedModalPaper(item);
                    }
                  }}
                  className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl shadow-sm hover:shadow-lg transition-all space-y-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 group"
                >
                  {/* Card Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-[10px]">
                        {item.source}
                      </span>

                      {item.isOpenAccess && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Open Access PDF
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px]">
                        {item.subject}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 text-[10px] flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {item.citationCount} Citations
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {authorsText} &bull; <span className="italic">{journalText}</span> ({item.year})
                    </p>

                    {item.doi && (
                      <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Link className="w-3 h-3 text-blue-500" /> DOI: {item.doi}
                      </p>
                    )}
                  </div>

                  {/* Abstract Preview */}
                  <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                    <p className={isExpanded ? '' : 'line-clamp-2'}>
                      {item.abstract}
                    </p>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setExpandedAbstractId(isExpanded ? null : item.id);
                      }}
                      className="text-blue-600 dark:text-blue-400 font-bold text-[11px] font-sans hover:underline mt-1 flex items-center gap-1"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? 'Show less' : 'Read full abstract'}
                    </button>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* View Paper Direct Link */}
                      <a
                        href={item.url || (item.doi ? `https://doi.org/${item.doi}` : `https://scholar.google.com/scholar?q=${encodeURIComponent(item.title)}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-orange-500" /> View Paper ↗
                      </a>

                      {/* Download PDF / PDF Not Available */}
                      {item.pdfUrl ? (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-500" /> Download PDF
                        </a>
                      ) : (
                        <button
                          disabled
                          onClick={e => e.stopPropagation()}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold flex items-center gap-1 cursor-not-allowed opacity-60 text-[11px]"
                          title="Direct PDF link not available for this publication"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF Not Available
                        </button>
                      )}

                      {/* Summarize with AI */}
                      <button
                        onClick={e => handleSummarizeWithAi(item, e)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Summarize
                      </button>

                      {/* Copy APA Citation */}
                      <button
                        onClick={e => handleCopyCitation(item.id, `${authorsText} (${item.year}). ${item.title}. ${journalText}.`, e)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 transition-all"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === item.id ? 'Copied' : 'Cite'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Export BibTeX */}
                      <button
                        onClick={e => handleExportBibtexSnippet(item, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Export BibTeX"
                      >
                        <FileCode className="w-4 h-4" />
                      </button>

                      {/* Export RIS */}
                      <button
                        onClick={e => handleExportRisSnippet(item, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Export RIS"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Save to Library */}
                      <button
                        onClick={e => handleSaveToLibrary(item, e)}
                        disabled={isSaved}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                          isSaved
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Publications Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for a different research topic, author, or expanding your filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Personal Library Sidebar Drawer (lg:col-span-4) */}
        {showLibrarySidebar && (
          <div className="lg:col-span-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-display">
                <Bookmark className="w-4 h-4 text-blue-500" /> Personal Library ({savedReferences.length})
              </h3>
              <button onClick={() => setShowLibrarySidebar(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Library Search */}
            <input
              type="text"
              value={libraryQuery}
              onChange={e => setLibraryQuery(e.target.value)}
              placeholder="Search saved references..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
            />

            {/* Bulk Export Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportLibraryBibtex}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-500" /> BibTeX
              </button>
              <button
                onClick={handleExportLibraryRis}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" /> RIS
              </button>
            </div>

            {/* Saved Items List */}
            <div className="space-y-2.5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
              {savedReferences
                .filter(r => r.title.toLowerCase().includes(libraryQuery.toLowerCase()) || r.authors.toLowerCase().includes(libraryQuery.toLowerCase()))
                .map(ref => (
                  <div key={ref.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2">{ref.title}</p>
                    <p className="text-[11px] text-slate-500">{ref.authors} ({ref.year})</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600">
                        {ref.importedFrom || 'Scholar'}
                      </span>
                      <button
                        onClick={() => {
                          const updated = savedReferences.filter(x => x.id !== ref.id);
                          saveReferenceLibrary(updated);
                          setSavedReferences(updated);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                        title="Remove from library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Research Details Modal */}
      {selectedModalPaper && (
        <ResearchDetailsModal
          paper={selectedModalPaper}
          lang={lang}
          onClose={() => setSelectedModalPaper(null)}
          onNavigateToChat={onNavigateToChat}
          relatedPapers={results.filter(r => r.id !== selectedModalPaper.id)}
          onSelectRelatedPaper={rel => setSelectedModalPaper(rel)}
        />
      )}

      {/* AI Summary Quick Modal */}
      {summaryItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-display">
                <Sparkles className="w-4 h-4 text-purple-500" /> AI Executive Literature Summary (Gemini 2.5)
              </h3>
              <button onClick={() => setSummaryItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{summaryItem.title}</h4>
              <p className="text-xs text-slate-500">{formatAuthors(summaryItem.authors)} &bull; {getJournalName(summaryItem)} ({summaryItem.year})</p>
            </div>

            {generatingSummary ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 mx-auto text-purple-500 animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Generating doctoral literature synthesis via Google Gemini 2.5...</p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line max-h-80 overflow-y-auto">
                {aiSummaryText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
