import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Bookmark,
  BookOpen,
  FileCode,
  FileText,
  Star,
  Link,
  Share2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Layers
} from 'lucide-react';
import { AcademicSearchResultItem, Language } from '../types';
import { aiService } from '../services/aiService';
import { getReferenceLibrary, saveReferenceLibrary } from '../lib/referenceStore';
import { t } from '../lib/i18n';

interface ResearchDetailsModalProps {
  paper: AcademicSearchResultItem;
  lang: Language;
  onClose: () => void;
  onNavigateToChat?: (paperContext: string) => void;
  relatedPapers?: AcademicSearchResultItem[];
  onSelectRelatedPaper?: (item: AcademicSearchResultItem) => void;
}

export const ResearchDetailsModal: React.FC<ResearchDetailsModalProps> = ({
  paper,
  lang,
  onClose,
  onNavigateToChat,
  relatedPapers = [],
  onSelectRelatedPaper
}) => {
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(() => getReferenceLibrary().some(r => r.title === paper.title));
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'summary' | 'citations'>('details');

  const authorsStr = Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors || 'Academic Authors';
  const journalStr = paper.journal || paper.journalOrConference || 'Peer-Reviewed Journal';
  const doiUrl = paper.doi ? (paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`) : paper.url;
  const apa7Citation = `${authorsStr} (${paper.year}). ${paper.title}. ${journalStr}. ${paper.doi ? `https://doi.org/${paper.doi}` : ''}`;

  const handleSaveToLibrary = () => {
    const currentLib = getReferenceLibrary();
    const newRef = {
      id: `ref_${paper.id}`,
      title: paper.title,
      authors: authorsStr,
      year: String(paper.year),
      journalOrPublisher: journalStr,
      doi: paper.doi,
      abstract: paper.abstract,
      keywords: [paper.subject || 'Academic Paper'],
      folderId: 'all',
      sourceType: 'journal',
      importedFrom: 'Google Scholar',
      citations: {
        apa7: apa7Citation,
        apa6: apa7Citation,
        mla9: `${authorsStr}. "${paper.title}." ${journalStr}, ${paper.year}.`,
        chicago17: `${authorsStr}. "${paper.title}." ${journalStr} (${paper.year}).`,
        harvard: `${authorsStr} (${paper.year}) '${paper.title}', ${journalStr}.`,
        ieee: `[1] ${authorsStr}, "${paper.title}," ${journalStr}, ${paper.year}.`,
        vancouver: `1. ${authorsStr}. ${paper.title}. ${journalStr}. ${paper.year}.`,
        bibtex: `@article{paper_${paper.id},\n  title={${paper.title}},\n  author={${authorsStr}},\n  journal={${journalStr}},\n  year={${paper.year}}\n}`
      },
      inTextCitations: {
        apa7Parenthetical: `(${authorsStr.split(',')[0]} et al., ${paper.year})`,
        apa7Narrative: `${authorsStr.split(',')[0]} et al. (${paper.year})`,
        mla9: `(${authorsStr.split(',')[0]} ${paper.year})`,
        chicago17: `(${authorsStr.split(',')[0]} ${paper.year})`,
        harvard: `(${authorsStr.split(',')[0]} et al., ${paper.year})`,
        ieee: `[1]`,
        vancouver: `(1)`
      },
      exports: {
        ris: `TY  - JOUR\nTI  - ${paper.title}\nAU  - ${authorsStr}\nJO  - ${journalStr}\nPY  - ${paper.year}\nER  - \n`,
        bibtex: `@article{paper_${paper.id},\n  title={${paper.title}},\n  author={${authorsStr}},\n  journal={${journalStr}},\n  year={${paper.year}}\n}`,
        endnote: `%0 Journal Article\n%T ${paper.title}\n%A ${authorsStr}\n%J ${journalStr}\n%D ${paper.year}\n`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveReferenceLibrary([...currentLib.filter(r => r.id !== newRef.id), newRef as any]);
    setIsSaved(true);
  };

  const handleGenerateSummary = async () => {
    setActiveTab('summary');
    if (aiSummary) return;
    setLoadingSummary(true);
    try {
      const res = await aiService.refineChatMessage({
        messageText: `Academic Publication Analysis Request:\nTitle: "${paper.title}"\nAuthors: ${authorsStr}\nJournal: ${journalStr} (${paper.year})\nAbstract: ${paper.abstract}`,
        action: 'summarize',
        language: lang
      });
      setAiSummary(res.refinedText);
    } catch (e) {
      setAiSummary('Failed to generate AI executive summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(type);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  const handleChatWithPaper = () => {
    const prompt = `I would like to analyze the research paper titled "${paper.title}" by ${authorsStr} (${paper.year}), published in ${journalStr}.\n\nAbstract: ${paper.abstract}\n\nPlease help answer questions and explain findings from this publication.`;
    if (onNavigateToChat) {
      onNavigateToChat(prompt);
    } else {
      window.dispatchEvent(new CustomEvent('eduplanner:navigate_chat', { detail: { prompt } }));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-[10px]">
                {paper.source || 'Google Scholar'}
              </span>
              {paper.isOpenAccess && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Open Access PDF
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 text-[10px] flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {paper.citationCount} Citations
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 font-display leading-snug">
              {paper.title}
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {authorsStr} &bull; <span className="italic">{journalStr}</span> ({paper.year})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* View Paper Button */}
            <a
              href={doiUrl || `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-bold flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> {t('viewPaperBtn', lang)} ↗
            </a>

            {/* Download PDF Button */}
            {(() => {
              const activePdfUrl = paper.pdfUrl || `https://scholar.google.com/scholar?q=filetype:pdf+${encodeURIComponent(paper.title)}`;
              return (
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  title="داگرتنا فایلا PDF / Open Access PDF Search"
                >
                  <Download className="w-3.5 h-3.5" /> {t('pdfNotAvailableBtn', lang) === 'فایلا PDF بەردەست نینە' ? 'داگرتنا فایلا PDF' : t('pdfNotAvailableBtn', lang) === 'فایلی PDF بەردەست نییە' ? 'داگرتنی فایلی PDF' : 'Download PDF'}
                </a>
              );
            })()}

            {/* Chat with Paper Button */}
            <button
              onClick={handleChatWithPaper}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" /> {t('navChat', lang)}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Save to Library */}
            <button
              onClick={handleSaveToLibrary}
              disabled={isSaved}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isSaved ? t('savedPaperBtn', lang) : t('savePaperBtn', lang)}
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Publication Details
          </button>
          <button
            onClick={handleGenerateSummary}
            className={`py-3 border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'summary'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> AI Executive Summary
          </button>
          <button
            onClick={() => setActiveTab('citations')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'citations'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Citations & References
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Abstract */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-display">
                  Abstract
                </h4>
                <p className="font-serif leading-relaxed text-sm bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {paper.abstract}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400">PUBLICATION JOURNAL</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{journalStr}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400">PUBLICATION YEAR</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{paper.year}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400">DIGITAL OBJECT IDENTIFIER (DOI)</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 text-xs">{paper.doi || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400">RESEARCH DISCIPLINE</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{paper.subject || 'Academic Studies'}</span>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-display">
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(paper.subject ? [paper.subject, 'Empirical Study', 'Peer-Reviewed'] : ['Academic Research', 'Peer-Reviewed']).map((kw, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Papers */}
              {relatedPapers.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-display flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-500" /> Related Publications in {paper.subject || 'Same Field'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relatedPapers.slice(0, 2).map(rel => (
                      <div
                        key={rel.id}
                        onClick={() => onSelectRelatedPaper && onSelectRelatedPaper(rel)}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all cursor-pointer space-y-1"
                      >
                        <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{rel.title}</p>
                        <p className="text-[11px] text-slate-500">{Array.isArray(rel.authors) ? rel.authors.join(', ') : rel.authors} ({rel.year})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Gemini 2.5 Literature Synthesis
                </h4>
              </div>

              {loadingSummary ? (
                <div className="py-12 text-center space-y-2">
                  <Sparkles className="w-6 h-6 mx-auto text-purple-500 animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">Analyzing methodology and synthesizing literature takeaways...</p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs sm:text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                  {aiSummary || 'Click "AI Executive Summary" above to generate a summary.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'citations' && (
            <div className="space-y-4 font-serif">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-display font-sans">
                Formatted APA 7 Citation
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
                <p className="pl-6 -indent-6 leading-relaxed text-slate-800 dark:text-slate-200">
                  {apa7Citation}
                </p>
                <button
                  onClick={() => handleCopy(apa7Citation, 'apa')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs"
                >
                  {copiedCitation === 'apa' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCitation === 'apa' ? 'Copied' : 'Copy APA 7'}
                </button>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-display font-sans pt-2">
                BibTeX Format
              </h4>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                {`@article{scholar_${paper.id},\n  title={${paper.title}},\n  author={${authorsStr}},\n  journal={${journalStr}},\n  year={${paper.year}},\n  doi={${paper.doi || ''}}\n}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
