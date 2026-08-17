import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, ArrowRight, CheckCircle2, FileText, Database, ShieldCheck, Loader2 } from 'lucide-react';
import { Language } from '../../types';
import { isRTL } from '../../lib/i18n';
import { dataAnalysisService } from '../../services/dataAnalysisService';

interface DataUploadSectionProps {
  lang: Language;
  onFileLoaded: (data: {
    fileName: string;
    fileSizeFormatted: string;
    rows: any[];
    headers: string[];
    isSavFormat?: boolean;
  }) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DataUploadSection: React.FC<DataUploadSectionProps> = ({
  lang,
  onFileLoaded,
  onShowToast
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [selectedFileInfo, setSelectedFileInfo] = useState<{
    name: string;
    size: string;
    rowsCount: number;
    colsCount: number;
    isSav?: boolean;
    rowsData?: any[];
    headers?: string[];
  } | null>(null);

  const rtl = isRTL(lang);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFile = async (file: File) => {
    setUploadError(null);
    setIsProcessing(true);

    // 1. Client-side File Validations
    const ext = file.name.slice(((file.name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
    const validExts = ['xlsx', 'xls', 'csv', 'sav'];

    if (!validExts.includes(ext)) {
      const err = 'Unsupported file type. Please upload an Excel (.xlsx, .xls), CSV (.csv), or SPSS (.sav) file.';
      setUploadError(err);
      onShowToast('error', 'Unsupported File Type', err);
      setIsProcessing(false);
      return;
    }

    if (file.size === 0) {
      const err = 'File is empty. Please select a valid dataset file containing rows and columns.';
      setUploadError(err);
      onShowToast('error', 'Empty File', err);
      setIsProcessing(false);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      const err = 'File is too large. Maximum allowed file size is 25MB.';
      setUploadError(err);
      onShowToast('error', 'File Too Large', err);
      setIsProcessing(false);
      return;
    }

    // 2. Perform Real Multipart/Form-Data Upload API Call
    try {
      const result = await dataAnalysisService.uploadFileToServer(file);

      if (!result.success) {
        const errMsg = result.error || 'Upload failed. Please try again.';
        setUploadError(errMsg);
        onShowToast('error', 'Upload Failed', errMsg);
        setIsProcessing(false);
        return;
      }

      const formattedSize = formatFileSize(file.size);

      if (result.isSavFormat || ext === 'sav') {
        const info = {
          name: result.fileName || file.name,
          size: formattedSize,
          rowsCount: 0,
          colsCount: 0,
          isSav: true,
          rowsData: [],
          headers: []
        };
        setSelectedFileInfo(info);
        onShowToast('success', 'SPSS (.sav) Uploaded Successfully', 'SPSS dataset stored and ready for statistical processing.');
        setIsProcessing(false);
        // Automatically transition to Data Preview after successful server confirmation
        onFileLoaded({
          fileName: info.name,
          fileSizeFormatted: info.size,
          rows: [],
          headers: [],
          isSavFormat: true
        });
        return;
      }

      let rows: any[] = result.rows || [];
      if (!rows || rows.length === 0) {
        const err = 'File uploaded, but no data rows could be extracted.';
        setUploadError(err);
        onShowToast('error', 'Empty Dataset Content', err);
        setIsProcessing(false);
        return;
      }

      const headers = result.headers && result.headers.length > 0 ? result.headers : Object.keys(rows[0]);

      const info = {
        name: result.fileName || file.name,
        size: formattedSize,
        rowsCount: rows.length,
        colsCount: headers.length,
        isSav: false,
        rowsData: rows,
        headers
      };

      setSelectedFileInfo(info);
      onShowToast('success', 'Upload Successful', `File "${file.name}" uploaded and parsed cleanly (${rows.length} rows, ${headers.length} columns).`);
      setIsProcessing(false);

      // Automatically navigate to Data Preview after successful upload
      onFileLoaded({
        fileName: info.name,
        fileSizeFormatted: info.size,
        rows: info.rowsData,
        headers: info.headers
      });
    } catch (err: any) {
      console.error('[File Upload Error]:', err);
      const errMsg = err?.message || 'Upload failed. Please try again.';
      setUploadError(errMsg);
      onShowToast('error', 'Upload Failed', errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleContinue = () => {
    if (!selectedFileInfo) return;
    if (selectedFileInfo.rowsData && selectedFileInfo.headers) {
      onFileLoaded({
        fileName: selectedFileInfo.name,
        fileSizeFormatted: selectedFileInfo.size,
        rows: selectedFileInfo.rowsData,
        headers: selectedFileInfo.headers,
        isSavFormat: selectedFileInfo.isSav
      });
    }
  };

  const loadSampleDataset = () => {
    const sampleRows = [
      { RespondentID: 1, Gender: 'Female', Faculty: 'Science', TeachingExp: 5, AI_Awareness: 4.2, AI_Acceptance: 4.5, ResearchOutput: 8 },
      { RespondentID: 2, Gender: 'Male', Faculty: 'Engineering', TeachingExp: 12, AI_Awareness: 3.8, AI_Acceptance: 4.1, ResearchOutput: 14 },
      { RespondentID: 3, Gender: 'Female', Faculty: 'Medicine', TeachingExp: 8, AI_Awareness: 4.9, AI_Acceptance: 4.8, ResearchOutput: 19 },
      { RespondentID: 4, Gender: 'Male', Faculty: 'Arts', TeachingExp: 3, AI_Awareness: 2.9, AI_Acceptance: 3.2, ResearchOutput: 4 },
      { RespondentID: 5, Gender: 'Female', Faculty: 'Engineering', TeachingExp: 15, AI_Awareness: 4.5, AI_Acceptance: 4.6, ResearchOutput: 22 },
      { RespondentID: 6, Gender: 'Male', Faculty: 'Science', TeachingExp: 7, AI_Awareness: 4.0, AI_Acceptance: 3.9, ResearchOutput: 11 },
      { RespondentID: 7, Gender: 'Female', Faculty: 'Medicine', TeachingExp: 10, AI_Awareness: 4.7, AI_Acceptance: 4.9, ResearchOutput: 17 },
      { RespondentID: 8, Gender: 'Male', Faculty: 'Arts', TeachingExp: 2, AI_Awareness: 3.1, AI_Acceptance: 3.0, ResearchOutput: 3 },
      { RespondentID: 9, Gender: 'Female', Faculty: 'Science', TeachingExp: 9, AI_Awareness: 4.3, AI_Acceptance: 4.4, ResearchOutput: 13 },
      { RespondentID: 10, Gender: 'Male', Faculty: 'Engineering', TeachingExp: 14, AI_Awareness: 4.6, AI_Acceptance: 4.7, ResearchOutput: 20 },
      { RespondentID: 11, Gender: 'Female', Faculty: 'Medicine', TeachingExp: 6, AI_Awareness: 4.1, AI_Acceptance: 4.3, ResearchOutput: 9 },
      { RespondentID: 12, Gender: 'Male', Faculty: 'Science', TeachingExp: 11, AI_Awareness: 3.9, AI_Acceptance: 4.0, ResearchOutput: 15 },
      { RespondentID: 13, Gender: 'Female', Faculty: 'Arts', TeachingExp: 4, AI_Awareness: 3.4, AI_Acceptance: 3.5, ResearchOutput: 6 },
      { RespondentID: 14, Gender: 'Male', Faculty: 'Medicine', TeachingExp: 18, AI_Awareness: 4.8, AI_Acceptance: 4.9, ResearchOutput: 25 },
      { RespondentID: 15, Gender: 'Female', Faculty: 'Engineering', TeachingExp: 9, AI_Awareness: 4.4, AI_Acceptance: 4.5, ResearchOutput: 16 }
    ];
    const headers = Object.keys(sampleRows[0]);
    const info = {
      name: 'Sample_University_AI_Survey.xlsx',
      size: '42.5 KB',
      rowsCount: sampleRows.length,
      colsCount: headers.length,
      isSav: false,
      rowsData: sampleRows,
      headers
    };
    setSelectedFileInfo(info);
    onShowToast('success', 'Sample Dataset Loaded', 'University Faculty Survey dataset loaded successfully.');
    onFileLoaded({
      fileName: info.name,
      fileSizeFormatted: info.size,
      rows: sampleRows,
      headers
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            {lang === 'ku' ? 'بارکردنی فایلی داتا' : lang === 'bad' ? 'بارکرنا فایلا داتایان' : lang === 'ar' ? 'تحميل ملف البيانات' : 'Dataset Upload'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ku'
              ? 'پشتگیری لە فایلی Excel (.xlsx, .xls) و CSV (.csv) و SPSS (.sav) دەکات'
              : lang === 'bad'
              ? 'پشتگیریێ ژ فایلێن Excel و CSV و SPSS .sav دکەت'
              : lang === 'ar'
              ? 'يدعم ملفات إكسل (.xlsx, .xls) والملفات النصية CSV (.csv) وحزم SPSS (.sav)'
              : 'Upload structured academic research datasets (.xlsx, .xls, .csv, .sav)'}
          </p>
        </div>

        <button
          onClick={loadSampleDataset}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          {lang === 'ku' ? 'بارکردنی داتای نموونەیی' : lang === 'bad' ? 'بارکرنا داتایا نموونەیی' : lang === 'ar' ? 'تحميل نموذج بيانات' : 'Load Sample Dataset'}
        </button>
      </div>

      {/* Drag and Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isProcessing) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-200 bg-slate-900/60 relative ${
          dragActive
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700'
        } ${isProcessing ? 'opacity-80 pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-slate-200">
              {isProcessing
                ? 'Uploading file to server & parsing structure...'
                : lang === 'ku'
                ? 'فایلەکەت بۆ ئێرە ڕابکێشە یان بگەڕێ'
                : lang === 'bad'
                ? 'فایلا خۆ ڕابکێشە ڤێرە یان راگەڕیانێ بکە'
                : lang === 'ar'
                ? 'اسحب وأسقط ملف البيانات هنا أو تصفح الملفات'
                : 'Drag & Drop your dataset file here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supported formats: Excel (.xlsx, .xls), CSV (.csv), SPSS (.sav) | Max file size: 25MB
            </p>
          </div>

          {/* Browse Files Button */}
          <label className={`cursor-pointer px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all inline-flex items-center gap-2 ${
            isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
          }`}>
            <FileSpreadsheet className="w-4 h-4" />
            {lang === 'ku' ? 'هەڵبژاردنی فایل' : lang === 'bad' ? 'دەستنیشانکرنا فایلی' : lang === 'ar' ? 'تصفح الملفات' : 'Browse Files'}
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.sav"
              onChange={handleFileInputChange}
              disabled={isProcessing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Error Message Box */}
      {uploadError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-200">Upload Error</h4>
            <p className="mt-0.5 opacity-90">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Selected File Card */}
      {selectedFileInfo && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{selectedFileInfo.name}</h4>
                <p className="text-xs text-slate-400">{selectedFileInfo.size}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedFileInfo(null)}
              disabled={isProcessing}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              {lang === 'ku' ? 'سڕینەوە / گۆڕینی فایل' : lang === 'bad' ? 'ژێبرن / گوهۆڕینا فایلی' : lang === 'ar' ? 'استبدال الملف' : 'Remove / Replace'}
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'ku' ? 'ژمارەی دێڕەکان (Observations)' : 'Total Rows'}
              </p>
              <p className="text-lg font-black text-slate-100 mt-1">
                {selectedFileInfo.isSav ? 'SPSS File Uploaded' : selectedFileInfo.rowsCount.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'ku' ? 'ژمارەی گۆڕاوەکان (Variables)' : 'Total Columns'}
              </p>
              <p className="text-lg font-black text-slate-100 mt-1">
                {selectedFileInfo.isSav ? 'SPSS File Uploaded' : selectedFileInfo.colsCount.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">File Status</p>
              <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Uploaded to Server
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Format Engine</p>
              <p className="text-xs font-bold text-sky-400 mt-2">
                {selectedFileInfo.isSav ? 'SPSS Engine Integration' : 'Server Express Parser'}
              </p>
            </div>
          </div>

          {selectedFileInfo.isSav && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>SPSS (.sav) Format Notice:</strong> This SPSS binary file is stored on the server.
                The statistical calculation engine parses CSV and Excel files directly; for complete SPSS binary key/value label mapping, the service delegates to the backend statistical endpoint.
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {lang === 'ku' ? 'بەردەوامبوون بۆ پێشبینینی داتا' : lang === 'bad' ? 'بەردەوامبوون بۆ پێشبینینا داتایێ' : lang === 'ar' ? 'الانتقال إلى معاينة البيانات' : 'Continue to Data Preview'}
              <ArrowRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
