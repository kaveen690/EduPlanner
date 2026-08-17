import React, { useState, useEffect } from 'react';
import {
  Wand2,
  X,
  RefreshCw,
  Check,
  Sparkles,
  FileText,
  Sliders,
  Maximize2,
  ArrowRight
} from 'lucide-react';
import { AiEditorAction, Language } from '../types';
import { aiService } from '../services/aiService';

interface AiEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onApplyText: (newText: string) => void;
  lang?: Language;
  title?: string;
}

const ACTION_OPTIONS: { id: AiEditorAction; label: string; description: string; icon: string }[] = [
  { id: 'rewrite', label: 'Rewrite', description: 'Rephrase for clarity and flow', icon: '🔄' },
  { id: 'summarize', label: 'Summarize', description: 'Condense into key points', icon: '📝' },
  { id: 'expand', label: 'Expand', description: 'Elaborate with academic depth', icon: '📈' },
  { id: 'shorten', label: 'Shorten', description: 'Trim wordiness and simplify', icon: '📉' },
  { id: 'improve_grammar', label: 'Fix Grammar', description: 'Correct typos and punctuation', icon: '✍️' },
  { id: 'academic_tone', label: 'Academic Tone', description: 'Elevate to formal peer-reviewed style', icon: '🎓' },
  { id: 'humanize', label: 'Humanize', description: 'Natural, natural-sounding rhythm', icon: '👤' },
];

export const AiEditorModal: React.FC<AiEditorModalProps> = ({
  isOpen,
  onClose,
  initialText,
  onApplyText,
  lang = 'en',
  title = 'AI Text Editor Studio'
}) => {
  const [selectedAction, setSelectedAction] = useState<AiEditorAction>('rewrite');
  const [customInstruction, setCustomInstruction] = useState('');
  const [editedText, setEditedText] = useState(initialText);
  const [summaryOfChanges, setSummaryOfChanges] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedText(initialText);
    setSummaryOfChanges('');
    setError(null);
  }, [initialText, isOpen]);

  if (!isOpen) return null;

  const handleRunAi = async () => {
    if (!initialText || !initialText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await aiService.editWithAi({
        text: initialText,
        action: selectedAction,
        customInstruction: customInstruction.trim() || undefined,
        language: lang
      });

      setEditedText(res.editedText);
      setSummaryOfChanges(res.summaryOfChanges);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing text with AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApplyText(editedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-900 via-slate-900 to-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/30">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">{title}</h3>
              <p className="text-xs text-slate-300">Refine, transform, and polish academic copy with Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select AI Transformation Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {ACTION_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAction(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedAction === opt.id
                      ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 text-violet-900 dark:text-violet-200 ring-2 ring-violet-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg mb-1">{opt.icon}</span>
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] opacity-75 line-clamp-1">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Instruction */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Custom Directive (Optional)
            </label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g. Focus on medical terminology, make it passive voice, emphasize statistical impact..."
              className="w-full px-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunAi}
            disabled={loading || !initialText.trim()}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-all shadow-md shadow-violet-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing Transformation...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Transform Text ({ACTION_OPTIONS.find(a => a.id === selectedAction)?.label})
              </>
            )}
          </button>

          {error && (
            <p className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Side by side preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Text */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Original Text
              </span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 min-h-[160px] max-h-[240px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {initialText || <span className="text-slate-400 italic">No text supplied.</span>}
              </div>
            </div>

            {/* AI Edited Text (Editable!) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  Transformed Output (Editable)
                </span>
                {summaryOfChanges && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {summaryOfChanges}
                  </span>
                )}
              </div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={7}
                placeholder="Transformed text will appear here..."
                className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-violet-300 dark:border-violet-700/60 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Apply Changes to Document
          </button>
        </div>
      </div>
    </div>
  );
};
