import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { ThesisData, Language, ProjectItem } from '../types';
import { exportThesisToWord, exportThesisToPdf } from '../lib/exportUtils';
import { isRTL } from '../lib/i18n';
import { aiService } from '../services/aiService';

interface ThesisAssistantProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
}

export const ThesisAssistant: React.FC<ThesisAssistantProps> = ({
  lang,
  onSaveProject
}) => {
  const [thesisTitle, setThesisTitle] = useState('');
  const [field, setField] = useState('Law & International Relations');
  const [academicLevel, setAcademicLevel] = useState('Master Thesis');
  const [outputLang, setOutputLang] = useState<Language>(lang);
  const [loading, setLoading] = useState(false);
  const [thesis, setThesis] = useState<ThesisData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rtl = isRTL(lang);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesisTitle.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await aiService.generateThesis({
        thesisTitle,
        field,
        academicLevel,
        language: outputLang
      });

      setThesis(data);

      onSaveProject({
        id: data.id,
        type: 'thesis',
        title: `Thesis: ${data.thesisTitle}`,
        language: outputLang,
        date: data.createdAt,
        data
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the Thesis Architecture.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!thesis) return;
    const text = `THESIS ARCHITECTURE: ${thesis.thesisTitle}\nLevel: ${thesis.academicLevel} | Field: ${thesis.field}\n\nCENTRAL THESIS STATEMENT:\n${thesis.centralThesisStatement}\n\nABSTRACT:\n${thesis.abstract}\n\nCHAPTER BLUEPRINT:\n` +
      thesis.chapters.map(c => `Chapter ${c.chapterNumber}: ${c.chapterTitle}\nObjective: ${c.objective}\nOutline: ${c.outline.join(', ')}`).join('\n\n') +
      `\n\nDEFENSE PREPARATION:\n` +
      thesis.defensePreparation.map(d => `Q: ${d.question}\nA: ${d.sampleAnswer}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Title banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-900/90 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border border-blue-800/50">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" /> Doctoral & Master Thesis Architect
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Thesis Assistant & Chapter Architect
          </h1>
          <p className="text-slate-300 text-xs md:text-sm">
            Formulate thesis statements, structure chapters, draft outlines, and prepare defense committee Q&A.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Thesis Title or Central Question *
            </label>
            <input
              type="text"
              value={thesisTitle}
              onChange={e => setThesisTitle(e.target.value)}
              placeholder="e.g. Constitutional Frameworks and Environmental Protection Rights in Emerging Economies"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Academic Domain
              </label>
              <input
                type="text"
                value={field}
                onChange={e => setField(e.target.value)}
                placeholder="e.g. Public Law & Governance"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Academic Degree Level
              </label>
              <select
                value={academicLevel}
                onChange={e => setAcademicLevel(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="Master Thesis">Master's Thesis (M.Sc / M.A)</option>
                <option value="PhD Dissertation">Doctoral Dissertation (Ph.D)</option>
                <option value="Senior Capstone">Senior Honor Capstone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Output Language
              </label>
              <select
                value={outputLang}
                onChange={e => setOutputLang(e.target.value as Language)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="en">English (Academic)</option>
                <option value="bad">بادینی (کوردی - دهۆک)</option>
                <option value="ku">کوردی (سۆرانی)</option>
                <option value="ar">العربية (الأكاديمية)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !thesisTitle.trim()}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Structuring Thesis...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Thesis Architecture
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Output Display */}
      {thesis && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              Thesis: {thesis.thesisTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy All'}
              </button>
              <button
                onClick={() => exportThesisToWord(thesis)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Word (.docx)
              </button>
              <button
                onClick={() => exportThesisToPdf(thesis)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* Thesis Statement Banner */}
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
                Central Thesis Statement
              </span>
              <p className="text-sm font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                "{thesis.centralThesisStatement}"
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Thesis Abstract
              </span>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {thesis.abstract}
              </p>
            </div>

            {/* Chapter Breakdown */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-3">
                Chapter-by-Chapter Architectural Breakdown
              </span>
              <div className="space-y-4">
                {thesis.chapters.map(ch => (
                  <div key={ch.chapterNumber} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold">
                          Ch. {ch.chapterNumber}
                        </span>
                        {ch.chapterTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      Objective: {ch.objective}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Section Outline:</span>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                          {ch.outline.map((o, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" /> {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Core Arguments:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          {ch.keyArguments.map((arg, i) => (
                            <li key={i}>{arg}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Defense Prep Q&A */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-3">
                <HelpCircle className="w-4 h-4" /> Oral Defense Preparation (Committee Q&A)
              </span>
              <div className="space-y-3">
                {thesis.defensePreparation.map((qa, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1.5">
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      Committee Question {idx + 1}: "{qa.question}"
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Suggested Answer Strategy:</span> {qa.sampleAnswer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
