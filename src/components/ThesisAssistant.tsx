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
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ThesisData, Language, ProjectItem } from '../types';
import { exportThesisToWord, exportThesisToPdf } from '../lib/exportUtils';
import { isRTL, t, getAcademicLevels, getOutputLanguageOptions } from '../lib/i18n';
import { aiService } from '../services/aiService';

interface ThesisAssistantProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
  onLanguageChange?: (newLang: Language) => void;
}

export const ThesisAssistant: React.FC<ThesisAssistantProps> = ({
  lang,
  onSaveProject,
  onLanguageChange
}) => {
  const [thesisTitle, setThesisTitle] = useState('');
  const [field, setField] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Master Thesis');
  const [outputLang, setOutputLang] = useState<Language>(lang);
  const [loading, setLoading] = useState(false);
  const [thesis, setThesis] = useState<ThesisData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rtl = isRTL(outputLang);

  const getLocalizedLabels = (currentLang: Language) => {
    const isAr = currentLang === 'ar';
    const isEn = currentLang === 'en';
    return {
      statementHeader: isAr
        ? 'البيان المركزي للأطروحة (Central Thesis Statement)'
        : isEn
        ? 'Central Thesis Statement'
        : 'دەربڕینا سەرەکی یا تیزێ (Central Thesis Statement)',
      abstractHeader: isAr
        ? 'الملخص التنفيذي للأطروحة (Thesis Abstract)'
        : isEn
        ? 'Executive Thesis Abstract'
        : 'کورتیا ئەکادیمی یا تیزێ (Thesis Abstract)',
      chapterBreakdownHeader: isAr
        ? 'الهيكل المعماري للأطروحة (فصل بفصل)'
        : isEn
        ? 'Chapter-by-Chapter Architectural Breakdown'
        : 'دابەشکرنا بەش ب بەش یا ڕێکخستنا تیزێ',
      chapterPrefix: isAr
        ? 'الفصل'
        : isEn
        ? 'Ch.'
        : 'بەشێ',
      objectiveLabel: isAr
        ? 'الهدف المحوري:'
        : isEn
        ? 'Objective:'
        : 'ئارمانج:',
      outlineLabel: isAr
        ? 'مخطط المحاور:'
        : isEn
        ? 'Section Outline:'
        : 'پێکهاتەیا بەشێ:',
      argumentsLabel: isAr
        ? 'الحجج والنماذج الرئيسية:'
        : isEn
        ? 'Core Arguments:'
        : 'بەلگە و مۆدێلێن سەرەکی:',
      defenseHeader: isAr
        ? 'الاستعداد للمناقشة الأكاديمية (أسئلة وأجوبة لجنة التقييم)'
        : isEn
        ? 'Oral Defense Preparation (Committee Q&A)'
        : 'ئامادەکارییا گفتوگۆیا زانستی (پرسیارێن لیجنا تاوتوێیێ)',
      questionPrefix: isAr
        ? 'سؤال اللجنة'
        : isEn
        ? 'Committee Question'
        : 'پرسیارا لیژنەیێ',
      answerStrategy: isAr
        ? 'استراتيجية الإجابة المقترحة:'
        : isEn
        ? 'Suggested Answer Strategy:'
        : 'ستراتیژییا بەرسڤدانێ:',
      referencesHeader: isAr
        ? 'المراجع الأكاديمية المعتمدة (روابط ذات صلة)'
        : isEn
        ? 'Academic References (Clickable Links)'
        : 'ژێدەرێن ئەکادیمی یێن پڕباوەر ب لینکێن کارا',
      copyAllBtn: isAr ? 'نسخ الكل' : isEn ? 'Copy All' : 'کۆپیکرنا هەمی دەقی',
      copiedBtn: isAr ? 'تم النسخ' : isEn ? 'Copied' : 'کۆپی بوو',
    };
  };

  const labels = getLocalizedLabels(outputLang);

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
      thesis.defensePreparation.map(d => `Q: ${d.question}\nA: ${d.sampleAnswer}`).join('\n\n') +
      (thesis.references && thesis.references.length > 0 ? `\n\nREFERENCES:\n` + thesis.references.map(r => `- ${r.authors} (${r.year}). ${r.title}. ${r.journal || ''}. URL: ${r.url}`).join('\n') : '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 ${rtl ? 'rtl' : 'ltr'}`}>
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-lg border border-emerald-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
          <GraduationCap className="w-4 h-4" /> {t('thesisSuiteTagline', outputLang)}
        </div>
        <h1 className="text-2xl font-bold">{t('thesisWorkspaceTitle', outputLang)}</h1>
        <p className="text-slate-300 text-sm mt-1">
          {t('thesisWorkspaceDesc', outputLang)}
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {t('coreResearchTitle', outputLang)}
            </label>
            <input
              type="text"
              value={thesisTitle}
              onChange={e => setThesisTitle(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {t('academicField', outputLang)}
              </label>
              <input
                type="text"
                value={field}
                onChange={e => setField(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {t('academicLevelLabel', outputLang)}
              </label>
              <select
                value={academicLevel}
                onChange={e => setAcademicLevel(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold"
              >
                {getAcademicLevels(outputLang).map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {t('outputLanguageLabel', outputLang)}
              </label>
              <select
                value={outputLang}
                onChange={e => {
                  const newLang = e.target.value as Language;
                  setOutputLang(newLang);
                  if (onLanguageChange) onLanguageChange(newLang);
                }}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold"
              >
                {getOutputLanguageOptions(outputLang).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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
                <RefreshCw className="w-4 h-4 animate-spin" /> {t('generating', outputLang)}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> {t('generateThesisBtn', outputLang)}
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
              {thesis.thesisTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? labels.copiedBtn : labels.copyAllBtn}
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
                {labels.statementHeader}
              </span>
              <p className="text-sm font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                "{thesis.centralThesisStatement}"
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {labels.abstractHeader}
              </span>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {thesis.abstract}
              </p>
            </div>

            {/* Chapter Breakdown */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-3">
                {labels.chapterBreakdownHeader}
              </span>
              <div className="space-y-4">
                {thesis.chapters.map(ch => (
                  <div key={ch.chapterNumber} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold">
                          {labels.chapterPrefix} {ch.chapterNumber}
                        </span>
                        {ch.chapterTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{labels.objectiveLabel}</span> {ch.objective}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">{labels.outlineLabel}</span>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                          {ch.outline.map((o, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" /> {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">{labels.argumentsLabel}</span>
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
                <HelpCircle className="w-4 h-4" /> {labels.defenseHeader}
              </span>
              <div className="space-y-3">
                {thesis.defensePreparation.map((qa, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1.5">
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      {labels.questionPrefix} {idx + 1}: "{qa.question}"
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{labels.answerStrategy}</span> {qa.sampleAnswer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic References with Working Clickable Links */}
            {thesis.references && thesis.references.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-3">
                  <BookOpen className="w-4 h-4" /> {labels.referencesHeader}
                </span>
                <div className="space-y-3">
                  {thesis.references.map((ref, idx) => {
                    const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(ref.title || thesis.thesisTitle)}`;
                    const doiUrl = ref.doi ? `https://doi.org/${ref.doi}` : `https://search.crossref.org/?q=${encodeURIComponent(ref.title || thesis.thesisTitle)}`;
                    const pdfSearchUrl = ref.pdfUrl || `https://scholar.google.com/scholar?q=filetype:pdf+${encodeURIComponent(ref.title || thesis.thesisTitle)}`;

                    return (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                            {ref.authors} ({ref.year}). <span className="italic">{ref.title}</span>. {ref.journal}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                            <a
                              href={pdfSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs shrink-0 font-bold shadow-sm"
                              title="داگرتنا فایلا PDF یێ ژێدەری"
                            >
                              <FileText className="w-3.5 h-3.5" /> PDF
                            </a>
                            <a
                              href={scholarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0 font-bold shadow-sm"
                            >
                              <ExternalLink className="w-3 h-3" /> Google Scholar
                            </a>
                            {ref.doi && (
                              <a
                                href={doiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0 font-bold shadow-sm"
                              >
                                <ExternalLink className="w-3 h-3" /> DOI Link
                              </a>
                            )}
                          </div>
                        </div>
                        {ref.doi && (
                          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                            DOI: <a href={doiUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500 font-mono">{ref.doi}</a>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
