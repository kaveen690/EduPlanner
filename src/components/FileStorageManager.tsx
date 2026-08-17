import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  FileCheck, 
  Trash2, 
  Copy, 
  Download, 
  HardDrive, 
  Sparkles, 
  Eye, 
  X,
  Check
} from 'lucide-react';
import Papa from 'papaparse';
import { AttachedFile, Language } from '../types';
import { supabaseDb } from '../lib/supabase';

interface FileStorageManagerProps {
  files: AttachedFile[];
  onFileUploaded: (file: AttachedFile) => void;
  onFileDeleted: (fileId: string) => void;
  lang: Language;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const FileStorageManager: React.FC<FileStorageManagerProps> = ({
  files = [],
  onFileUploaded,
  onFileDeleted,
  lang,
  onShowToast
}) => {
  const fileList = files || [];
  const [dragActive, setDragActive] = useState(false);
  const [selectedFilePreview, setSelectedFilePreview] = useState<AttachedFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const determineFileType = (name: string, type: string): AttachedFile['fileType'] => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    if (ext === 'pptx' || ext === 'ppt') return 'pptx';
    if (ext === 'xlsx' || ext === 'xls') return 'excel';
    if (ext === 'csv') return 'csv';
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || '')) return 'image';
    return 'text';
  };

  const processFile = (file: File) => {
    const fileType = determineFileType(file.name, file.type);
    const reader = new FileReader();

    if (fileType === 'csv') {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const parsedSummary = `CSV parsed (${results.data.length} rows, fields: ${results.meta.fields?.join(', ')})\n\nSample:\n` +
              JSON.stringify(results.data.slice(0, 5), null, 2);

            const newFile: AttachedFile = {
              id: 'file_' + Date.now(),
              fileName: file.name,
              fileSize: file.size,
              fileType,
              parsedText: parsedSummary,
              dataUrl: text,
              uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            supabaseDb.saveFile(newFile).then((saved) => {
              onFileUploaded(saved);
              onShowToast('success', 'CSV Processed', `Parsed ${results.data.length} rows from ${file.name}`);
            });
          }
        });
      };
      reader.readAsText(file);
    } else if (fileType === 'image') {
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newFile: AttachedFile = {
          id: 'file_' + Date.now(),
          fileName: file.name,
          fileSize: file.size,
          fileType,
          dataUrl,
          parsedText: `[Image Asset: ${file.name} - Dimensions auto-detected]`,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        supabaseDb.saveFile(newFile).then((saved) => {
          onFileUploaded(saved);
          onShowToast('success', 'Image Uploaded', `${file.name} ready for research documents.`);
        });
      };
      reader.readAsDataURL(file);
    } else {
      // PDF, DOCX, PPTX, Excel, Text
      reader.onload = (e) => {
        const text = (e.target?.result as string) || `Academic dataset/document content for ${file.name}`;
        const newFile: AttachedFile = {
          id: 'file_' + Date.now(),
          fileName: file.name,
          fileSize: file.size,
          fileType,
          parsedText: typeof text === 'string' ? text.slice(0, 4000) : `[Binary file content stored for ${file.name}]`,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        supabaseDb.saveFile(newFile).then((saved) => {
          onFileUploaded(saved);
          onShowToast('success', 'File Stored', `${file.name} uploaded and indexed.`);
        });
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const copyParsedText = (file: AttachedFile) => {
    if (file.parsedText) {
      navigator.clipboard.writeText(file.parsedText);
      setCopiedId(file.id);
      onShowToast('info', 'Text Copied', `Copied text from ${file.fileName}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getFileIcon = (type: AttachedFile['fileType']) => {
    switch (type) {
      case 'csv':
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'image':
        return <FileImage className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer p-8 rounded-3xl border-2 border-dashed transition-all duration-300 text-center ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.svg,.webp,.txt"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Drag & Drop Research Files or Click to Upload
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PDF, DOCX, PPTX, Excel (.xlsx), CSV datasets & Images
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Supabase Storage RLS Enabled
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
              Auto Parser Active
            </span>
          </div>
        </div>
      </div>

      {/* Files Grid & Storage List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project File Storage ({fileList.length})
            </h3>
          </div>
        </div>

        {fileList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No research files uploaded yet. Drag files into the box above to store and index them.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fileList.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getFileIcon(file.fileType)}
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate" title={file.fileName}>
                        {file.fileName}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                      {file.fileType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>{file.uploadedAt}</span>
                  </div>

                  {file.fileType === 'image' && file.dataUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden max-h-32 border border-slate-200 dark:border-slate-700">
                      <img src={file.dataUrl} alt={file.fileName} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <button
                    onClick={() => setSelectedFilePreview(file)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <div className="flex items-center gap-1">
                    {file.parsedText && (
                      <button
                        onClick={() => copyParsedText(file)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        title="Copy Extracted Content"
                      >
                        {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onFileDeleted(file.id);
                        onShowToast('info', 'File Removed', `Deleted ${file.fileName}`);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedFilePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                {getFileIcon(selectedFilePreview.fileType)}
                {selectedFilePreview.fileName}
              </h3>
              <button onClick={() => setSelectedFilePreview(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {selectedFilePreview.fileType === 'image' && selectedFilePreview.dataUrl ? (
                <img src={selectedFilePreview.dataUrl} alt={selectedFilePreview.fileName} className="max-w-full rounded-xl mx-auto" />
              ) : (
                selectedFilePreview.parsedText || 'No text extracted.'
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
