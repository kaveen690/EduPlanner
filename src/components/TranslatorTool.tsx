import React, { useState } from 'react';
import {
  Languages,
  Sparkles,
  Copy,
  Check,
  ArrowRightLeft,
  RefreshCw,
  AlertCircle,
  Download,
  FileText
} from 'lucide-react';
import { TranslationOutput, Language, ProjectItem } from '../types';
import { isRTL } from '../lib/i18n';
import { aiService } from '../services/aiService';

interface TranslatorToolProps {
  lang: Language;
  onSaveProject: (item: ProjectItem) => void;
}

export const TranslatorTool: React.FC<TranslatorToolProps> = ({
  lang,
  onSaveProject
}) => {
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState<Language>(lang === 'en' ? 'ku' : 'en');
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<TranslationOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rtl = isRTL(targetLang);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;

    setLoading(true);
    setError(null);
    setTranslation(null);

    try {
      const data = await aiService.translateText({
        text: sourceText,
        sourceText,
        sourceLang,
        targetLang
      });

      setTranslation(data);

      onSaveProject({
        id: data.id,
        type: 'translation',
        title: `Translation (${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()}): ${sourceText.slice(0, 30)}...`,
        language: targetLang,
        date: data.createdAt,
        data
      });
    } catch (err: any) {
      console.error('[Academic Translation UI Error]:', err);
      setError(err.message || 'An error occurred while translating. Please check Gemini API key configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLangs = () => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang);
      setTargetLang('en');
    } else {
      const temp = sourceLang as Language;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }
  };

  const handleCopy = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Title banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-teal-900/90 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border border-teal-800/50">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
            <Languages className="w-3.5 h-3.5" /> Badini (بادینی) &bull; Sorani (سۆرانی) &bull; English &bull; Arabic (العربية)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Academic & Scientific Translation Engine
          </h1>
          <p className="text-slate-300 text-xs md:text-sm">
            High-fidelity translation preserving academic register, scientific terminology, and citation accuracy.
          </p>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <select
            value={sourceLang}
            onChange={e => setSourceLang(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
          >
            <option value="auto">Auto-Detect Language</option>
            <option value="en">English</option>
            <option value="bad">Kurdish Badini (بادینی - دهۆک)</option>
            <option value="ku">Kurdish Soranî (کوردی)</option>
            <option value="ar">Arabic (العربية)</option>
          </select>

          <button
            onClick={handleSwapLangs}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Swap Languages"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <select
            value={targetLang}
            onChange={e => setTargetLang(e.target.value as Language)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
          >
            <option value="bad">Kurdish Badini (بادینی - زانکۆیا دهۆک)</option>
            <option value="ku">Kurdish Soranî (کوردی)</option>
            <option value="en">English (Academic)</option>
            <option value="ar">Arabic (العربية الفصحى)</option>
          </select>
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading || !sourceText.trim()}
          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Translate Now
        </button>
      </div>

      {/* Input / Output Dual View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Text Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Source Academic Text
          </label>
          <textarea
            rows={10}
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
            placeholder="Paste your research text, abstract, hypotheses, or SPSS narrative here..."
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 resize-y"
          />
        </div>

        {/* Output Text Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Academic Translation Output ({targetLang.toUpperCase()})
            </label>

            {translation && (
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div
            dir={rtl ? 'rtl' : 'ltr'}
            className="w-full min-h-[15rem] p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
                <span className="text-xs">Translating text with Gemini AI...</span>
              </div>
            ) : translation ? (
              <div>
                <p>{translation.translatedText || (translation as any).translation}</p>

                {(translation.scholarlyNotes || (translation as any).terminologyNote) && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 italic">
                    <span className="font-semibold text-teal-600 dark:text-teal-400">Terminology Note:</span> {translation.scholarlyNotes || (translation as any).terminologyNote}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-slate-400 italic text-xs">
                Translation output will appear here after clicking "Translate Now".
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
};
