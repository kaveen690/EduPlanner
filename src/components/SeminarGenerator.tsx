import React, { useState } from 'react';
import {
  Presentation,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { SeminarPresentation, SeminarRequest, Language, Slide } from '../types';
import { t, isRTL, getOutputLanguageOptions } from '../lib/i18n';
import { exportSeminarToPptx, exportSeminarToPdf, exportSeminarToWord } from '../lib/exportUtils';
import { aiService } from '../services/aiService';

interface SeminarGeneratorProps {
  lang: Language;
  onSaveProject: (item: any) => void;
  onLanguageChange?: (newLang: Language) => void;
}

export const SeminarGenerator: React.FC<SeminarGeneratorProps> = ({ lang, onSaveProject, onLanguageChange }) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [keySubtopics, setKeySubtopics] = useState('');
  const [speakerTone, setSpeakerTone] = useState<SeminarRequest['speakerTone']>('engaging');
  const [outputLang, setOutputLang] = useState<Language>(lang);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seminar, setSeminar] = useState<SeminarPresentation | null>(null);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exportingPptx, setExportingPptx] = useState(false);

  const rtl = isRTL(outputLang);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await aiService.generateSeminar({
        topic,
        audience: audience || 'Academic Community',
        slideCount,
        durationMinutes,
        keySubtopics,
        speakerTone,
        language: outputLang
      });

      setSeminar(data);
      setCurrentSlideIndex(0);

      onSaveProject({
        id: data.id,
        type: 'seminar',
        title: data.topic,
        language: outputLang,
        date: data.createdAt,
        data
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating seminar.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPptx = async () => {
    if (!seminar) return;
    setExportingPptx(true);
    try {
      await exportSeminarToPptx(seminar);
    } catch (e) {
      console.error(e);
    } finally {
      setExportingPptx(false);
    }
  };

  const handleExportPdf = () => {
    if (!seminar) return;
    exportSeminarToPdf(seminar);
  };

  const handleExportWordScript = async () => {
    if (!seminar) return;
    await exportSeminarToWord(seminar);
  };

  const handleCopy = () => {
    if (!seminar) return;
    const text = `SEMINAR: ${seminar.topic}\nSLIDES:\n` +
      seminar.slides.map(s => `Slide ${s.slideNumber}: ${s.title}\nPoints:\n` + s.bulletPoints.map(bp => `- ${bp}`).join('\n') + `\nSpeaker Notes: ${s.speakerNotes}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeSlide: Slide | undefined = seminar?.slides[currentSlideIndex];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white shadow-lg border border-amber-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Slide Studio & PowerPoint Generator
          </div>
          <h2 className="text-xl md:text-2xl font-bold">{t('seminarTitle', lang)}</h2>
          <p className="text-xs md:text-sm text-amber-200">{t('seminarSubtitle', lang)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Presentation className="w-5 h-5 text-amber-500" /> Seminar Parameters
            </h3>

            {/* Topic */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('topic', lang)} *
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder=""
                required
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Audience & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('audience', lang)}
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('durationMinutes', lang)}
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  min={5}
                  max={120}
                  step={5}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Slide Count & Speaker Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('slideCount', lang)}
                </label>
                <select
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value={5}>5 Slides (Short Overview)</option>
                  <option value={8}>8 Slides (Standard Presentation)</option>
                  <option value={12}>12 Slides (Comprehensive Keynote)</option>
                  <option value={15}>15 Slides (Extended Workshop)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Speaker Tone
                </label>
                <select
                  value={speakerTone}
                  onChange={(e) => setSpeakerTone(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="engaging">Engaging & Dynamic</option>
                  <option value="academic">Academic & Formal</option>
                  <option value="executive">Executive & Direct</option>
                  <option value="persuasive">Persuasive Keynote</option>
                </select>
              </div>
            </div>

            {/* Output Language */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('languageSelect', lang)}
              </label>
              <select
                value={outputLang}
                onChange={(e) => {
                  const newLang = e.target.value as Language;
                  setOutputLang(newLang);
                  if (onLanguageChange) onLanguageChange(newLang);
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {getOutputLanguageOptions(lang).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Key Subtopics */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('keySubtopics', lang)}
              </label>
              <textarea
                value={keySubtopics}
                onChange={(e) => setKeySubtopics(e.target.value)}
                placeholder="e.g., Background, Core Algorithms, Case Study, Ethical Implications, Future Roadmap"
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-all shadow-md shadow-amber-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> {t('generating', lang)}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> {t('generate', lang)}
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Presentation Preview & Slide Presenter Column */}
        <div className="lg:col-span-7 space-y-6">
          {!seminar && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Presentation className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Slide Show & PowerPoint Presenter Studio
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter your seminar topic to generate interactive slides, speaker practice notes, and downloadable PowerPoint .PPTX files.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-amber-600 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Building Seminar Presentation Deck...
                </h4>
                <p className="text-xs text-slate-500">
                  Creating {slideCount} structured slides, speaker notes, graphic suggestions, and Q&A prompts
                </p>
              </div>
            </div>
          )}

          {seminar && !loading && activeSlide && (
            <div dir={rtl ? 'rtl' : 'ltr'} className="space-y-6">
              {/* Header Action Controls */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    {seminar.slides.length} Slides
                  </span>
                  <span className="text-xs text-slate-500">
                    {seminar.audience}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      showSpeakerNotes
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t('speakerNotes', lang)}
                  </button>

                  <button
                    onClick={handleExportPptx}
                    disabled={exportingPptx}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                    title="Export PowerPoint Presentation Deck"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .PPTX
                  </button>

                  <button
                    onClick={handleExportPdf}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                    title="Export PDF Presentation & Notes"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .PDF
                  </button>

                  <button
                    onClick={handleExportWordScript}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                    title="Export Presentation Script & Notes to Word"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .DOCX
                  </button>
                </div>
              </div>

              {/* SLIDE PRESENTER STAGE */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 text-white p-6 md:p-10 shadow-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                {/* Top Slide Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Slide {activeSlide.slideNumber} / {seminar.slides.length}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {seminar.topic}
                  </span>
                </div>

                {/* Slide Content */}
                <div className="my-auto space-y-4">
                  <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white">
                    {activeSlide.title}
                  </h2>

                  <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                    {activeSlide.bulletPoints.map((bp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Carousel Controls */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                  <button
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white transition-colors flex items-center gap-1"
                  >
                    {rtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {t('prevSlide', lang)}
                  </button>

                  <span>
                    {t('slideOf', lang)} {currentSlideIndex + 1} / {seminar.slides.length}
                  </span>

                  <button
                    onClick={() => setCurrentSlideIndex(Math.min(seminar.slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === seminar.slides.length - 1}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white transition-colors flex items-center gap-1 font-semibold"
                  >
                    {t('nextSlide', lang)}
                    {rtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Speaker Notes Card */}
              {showSpeakerNotes && activeSlide.speakerNotes && (
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <MessageSquare className="w-4 h-4" /> {t('speakerNotes', lang)} (Slide {activeSlide.slideNumber})
                  </div>
                  <p className="leading-relaxed text-slate-800 dark:text-slate-300 italic">
                    "{activeSlide.speakerNotes}"
                  </p>
                </div>
              )}

              {/* Visual Suggestion Card */}
              {activeSlide.visualSuggestion && (
                <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 space-y-1 text-xs text-sky-950 dark:text-sky-200">
                  <div className="font-bold flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                    <Lightbulb className="w-4 h-4" /> {t('visualSuggestion', lang)}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {activeSlide.visualSuggestion}
                  </p>
                </div>
              )}

              {/* Q&A Prompts Section */}
              {seminar.qAndA && seminar.qAndA.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" /> {t('qAndAPrompts', lang)}
                  </h3>

                  <div className="space-y-3">
                    {seminar.qAndA.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          Q: {item.question}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">
                          A: {item.answer}
                        </p>
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
