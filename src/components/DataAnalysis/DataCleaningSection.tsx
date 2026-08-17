import React, { useState } from 'react';
import { Sliders, AlertTriangle, Trash2, Edit3, CheckCircle2, RotateCcw, ShieldAlert, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { Language, DataCleaningOptions } from '../../types';
import { isRTL } from '../../lib/i18n';
import { DatasetAuditSummary } from '../../services/dataAnalysisService';

interface DataCleaningSectionProps {
  auditSummary: DatasetAuditSummary;
  headers: string[];
  lang: Language;
  onApplyCleaning: (options: DataCleaningOptions) => void;
  onNextStep: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DataCleaningSection: React.FC<DataCleaningSectionProps> = ({
  auditSummary,
  headers,
  lang,
  onApplyCleaning,
  onNextStep,
  onShowToast
}) => {
  const [missingAction, setMissingAction] = useState<DataCleaningOptions['missingValueAction']>('leave');
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [selectedColsToRemove, setSelectedColsToRemove] = useState<string[]>([]);
  const [columnRenames, setColumnRenames] = useState<Record<string, string>>({});
  const [typeOverrides, setTypeOverrides] = useState<Record<string, 'Scale' | 'Nominal' | 'Ordinal'>>({});

  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingActionDescription, setPendingActionDescription] = useState('');

  const rtl = isRTL(lang);

  const toggleRemoveColumn = (col: string) => {
    setSelectedColsToRemove(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleRenameChange = (originalCol: string, newName: string) => {
    setColumnRenames(prev => ({
      ...prev,
      [originalCol]: newName
    }));
  };

  const handleTypeChange = (col: string, newType: 'Scale' | 'Nominal' | 'Ordinal') => {
    setTypeOverrides(prev => ({
      ...prev,
      [col]: newType
    }));
  };

  const handleTriggerApply = () => {
    const actions: string[] = [];
    if (removeDuplicates) actions.push(`Remove ${auditSummary.duplicateRowsCount} duplicate row(s)`);
    if (missingAction !== 'leave') actions.push(`Missing values handling: ${missingAction.toUpperCase()}`);
    if (selectedColsToRemove.length > 0) actions.push(`Drop ${selectedColsToRemove.length} column(s)`);
    const renameCount = Object.values(columnRenames).filter(v => v.trim()).length;
    if (renameCount > 0) actions.push(`Rename ${renameCount} variable(s)`);

    if (actions.length === 0) {
      onShowToast('info', 'No Actions Selected', 'Please configure at least one data cleaning action before applying.');
      return;
    }

    setPendingActionDescription(actions.join(' • '));
    setShowConfirmModal(true);
  };

  const confirmAndApply = () => {
    setShowConfirmModal(false);
    onApplyCleaning({
      removeDuplicates,
      missingValueAction: missingAction,
      columnRenames,
      typeOverrides,
      removeColumns: selectedColsToRemove
    });
    onShowToast('success', 'Data Cleaning Applied', 'Dataset successfully updated.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            {lang === 'ku' ? 'خاوێنکردنەوەی داتا (Data Cleaning)' : lang === 'bad' ? 'پاککرنا داتایێ (Data Cleaning)' : lang === 'ar' ? 'تنظيف البيانات' : 'Data Cleaning & Preprocessing'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Detect missing values, duplicate observations, outliers, and enforce variable data types
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNextStep}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            {lang === 'ku' ? 'تێپەڕاندن بۆ ئاماری وەسفی' : lang === 'bad' ? 'دەربازبوون بۆ ئامارا وەصفی' : lang === 'ar' ? 'الانتقال إلى الإحصاء الوصفي' : 'Proceed to Descriptives'}
            <ArrowRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audit Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Missing Cells</span>
            <AlertTriangle className={`w-4 h-4 ${auditSummary.totalMissingCells > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <p className="text-xl font-black text-slate-100 mt-2">
            {auditSummary.totalMissingCells} <span className="text-xs font-normal text-slate-400">({auditSummary.missingCellPercent}%)</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Duplicate Rows</span>
            <Layers className={`w-4 h-4 ${auditSummary.duplicateRowsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <p className="text-xl font-black text-slate-100 mt-2">
            {auditSummary.duplicateRowsCount}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Potential Outliers (IQR)</span>
            <ShieldAlert className={`w-4 h-4 ${auditSummary.outlierCount > 0 ? 'text-purple-400' : 'text-emerald-400'}`} />
          </div>
          <p className="text-xl font-black text-slate-100 mt-2">
            {auditSummary.outlierCount}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Variables</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-slate-100 mt-2">
            {headers.length}
          </p>
        </div>
      </div>

      {/* Cleaning Controls Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">
          Configure Data Cleaning Actions
        </h4>

        {/* 1. Missing Values Handler */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 block">
            1. Missing Values Imputation & Handling Strategy
          </label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { id: 'leave', label: 'Leave Unchanged', desc: 'Keep missing cells as NA' },
              { id: 'remove_rows', label: 'Remove Rows', desc: 'Drop any row containing missing values' },
              { id: 'mean', label: 'Replace with Mean', desc: 'Impute numeric average' },
              { id: 'median', label: 'Replace with Median', desc: 'Impute numeric median' },
              { id: 'mode', label: 'Replace with Mode', desc: 'Impute most frequent value' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setMissingAction(item.id as any)}
                className={`p-3 rounded-xl border text-start transition-all ${
                  missingAction === item.id
                    ? 'bg-blue-600/20 border-blue-500 text-slate-100 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <p className="text-xs font-bold">{item.label}</p>
                <p className="text-[10px] opacity-75 mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Duplicate Rows */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={e => setRemoveDuplicates(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-200">
                2. Automatically Remove Duplicate Rows ({auditSummary.duplicateRowsCount} detected)
              </span>
              <p className="text-[11px] text-slate-400">
                Identifies and strips exact duplicate observation rows across all variables
              </p>
            </div>
          </label>
        </div>

        {/* 3. Variable Manager & Renamer */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">
              3. Variable Renamer & Measurement Level Selector
            </label>
            <span className="text-[11px] text-slate-400">
              {selectedColsToRemove.length} variable(s) marked for removal
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-800/80 rounded-xl p-3 bg-slate-950">
            {headers.map(col => {
              const meta = auditSummary.variables.find(v => v.name === col);
              const isMarkedRemove = selectedColsToRemove.includes(col);

              return (
                <div
                  key={col}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                    isMarkedRemove
                      ? 'bg-rose-500/10 border-rose-500/30 opacity-60'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleRemoveColumn(col)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isMarkedRemove ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-rose-400'
                      }`}
                      title={isMarkedRemove ? 'Restore Column' : 'Remove Column'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{col}</span>
                    {meta && (
                      <span className="text-[10px] text-slate-500">
                        ({meta.missingCount} missing, {meta.uniqueValuesCount} unique)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Rename Input */}
                    <input
                      type="text"
                      placeholder={`Rename ${col}...`}
                      value={columnRenames[col] ?? ''}
                      onChange={e => handleRenameChange(col, e.target.value)}
                      disabled={isMarkedRemove}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 w-36"
                    />

                    {/* Level Selector */}
                    <select
                      value={typeOverrides[col] || meta?.measurementLevel || 'Scale'}
                      onChange={e => handleTypeChange(col, e.target.value as any)}
                      disabled={isMarkedRemove}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Scale">Scale (Numeric)</option>
                      <option value="Nominal">Nominal (Categorical)</option>
                      <option value="Ordinal">Ordinal (Ranked)</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleTriggerApply}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Apply Data Cleaning Rules
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-slate-100">Confirm Data Cleaning</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to apply the following data cleaning operations? This will modify the active dataset state:
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-blue-300">
              {pendingActionDescription}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndApply}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
              >
                Yes, Apply Cleaning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
