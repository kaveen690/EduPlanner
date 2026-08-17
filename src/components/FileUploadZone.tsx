import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { parseUploadedFile, ParsedFileResult } from '../lib/fileParser';
import { Language } from '../types';
import { t, isRTL } from '../lib/i18n';

interface FileUploadZoneProps {
  accept?: string;
  onFileParsed: (result: ParsedFileResult) => void;
  onClearFile?: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  lang: Language;
  compact?: boolean;
  label?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  accept = '.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt',
  onFileParsed,
  onClearFile,
  onShowToast,
  lang,
  compact = false,
  label
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedFileResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rtl = isRTL(lang);

  const handleProcessFile = async (file: File) => {
    setLoading(true);
    try {
      const res = await parseUploadedFile(file);
      setLoading(false);

      if (res.success) {
        setParsedResult(res);
        onFileParsed(res);
        if (onShowToast) {
          onShowToast('success', t('fileParsedSuccess', lang), `${res.fileName} (${res.fileSizeFormatted}, ${res.wordCount} words)`);
        }
      } else {
        if (onShowToast) {
          onShowToast('error', t('fileParseError', lang), res.error || 'Failed to read file.');
        }
      }
    } catch (e: any) {
      setLoading(false);
      if (onShowToast) {
        onShowToast('error', t('fileParseError', lang), e?.message || 'Error processing file upload.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleProcessFile(file);
    }
  };

  const handleClear = () => {
    setParsedResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClearFile) onClearFile();
  };

  const getFileIcon = (ext: string) => {
    if (['XLSX', 'XLS', 'CSV'].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (['DOCX', 'DOC'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (['PDF'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-rose-500" />;
    }
    return <FileText className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Loading Skeleton */}
      {loading ? (
        <div className={`p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 flex items-center justify-center gap-3 ${compact ? 'py-3' : 'py-8'}`}>
          <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
            {t('parsingFile', lang)}
          </span>
        </div>
      ) : parsedResult ? (
        /* Parsed File Success Badge */
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm shrink-0">
              {getFileIcon(parsedResult.fileType)}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {parsedResult.fileName}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shrink-0">
                  {parsedResult.fileType}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mt-0.5">
                <span>{parsedResult.fileSizeFormatted}</span>
                <span>&bull;</span>
                <span>{parsedResult.wordCount} words extracted</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-800 transition-colors shrink-0"
            title={t('clearFile', lang)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'
          } ${compact ? 'p-3 gap-1.5' : 'p-6 gap-3'}`}
        >
          <div className={`rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-indigo-500 flex items-center justify-center ${compact ? 'p-2' : 'p-3.5'}`}>
            <UploadCloud className={compact ? 'w-5 h-5' : 'w-7 h-7'} />
          </div>

          <div className="space-y-0.5 max-w-sm">
            <h4 className={`font-bold text-slate-800 dark:text-slate-200 ${compact ? 'text-xs' : 'text-sm'}`}>
              {t('uploadZoneTitle', lang)}
            </h4>
            <p className={`text-slate-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {t('dragDropHint', lang)}
            </p>
          </div>

          <button
            type="button"
            className={`font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm flex items-center gap-1.5 ${compact ? 'px-3 py-1 text-[11px]' : 'px-4 py-2 text-xs'}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> {t('browseFiles', lang)}
          </button>
        </div>
      )}
    </div>
  );
};
