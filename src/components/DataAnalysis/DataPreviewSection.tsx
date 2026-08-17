import React, { useState, useMemo } from 'react';
import { Table, Search, ArrowUpDown, ChevronLeft, ChevronRight, Info, Database, Hash, Tag, AlertTriangle, ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { isRTL } from '../../lib/i18n';
import { DatasetAuditSummary } from '../../services/dataAnalysisService';

interface DataPreviewSectionProps {
  datasetName: string;
  rows: any[];
  headers: string[];
  auditSummary: DatasetAuditSummary;
  lang: Language;
  onNextStep: () => void;
}

export const DataPreviewSection: React.FC<DataPreviewSectionProps> = ({
  datasetName,
  rows,
  headers,
  auditSummary,
  lang,
  onNextStep
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedVarInfo, setSelectedVarInfo] = useState<string | null>(null);

  const rtl = isRTL(lang);

  // Filter & Sort Rows
  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        Object.values(r).some(val => String(val ?? '').toLowerCase().includes(q))
      );
    }

    if (sortCol) {
      result.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDir === 'asc' ? numA - numB : numB - numA;
        }
        return sortDir === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [rows, searchQuery, sortCol, sortDir]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRows.slice(start, start + pageSize);
  }, [filteredAndSortedRows, currentPage, pageSize]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const activeVariableMeta = auditSummary.variables.find(v => v.name === selectedVarInfo);

  return (
    <div className="space-y-6">
      {/* Top Dataset Info Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-slate-100">{datasetName}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {auditSummary.totalRows.toLocaleString()} Observations (Rows) | {auditSummary.totalColumns} Variables (Columns)
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNextStep}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            {lang === 'ku' ? 'بەردەوامبوون بۆ پاککردنەوەی داتا' : lang === 'bad' ? 'بەردەوامبوون بۆ پاککرنا داتایێ' : lang === 'ar' ? 'الانتقال إلى تنظيف البيانات' : 'Proceed to Data Cleaning'}
            <ArrowRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Page Size, Info Panel Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={lang === 'ku' ? 'گەڕان لە خشتەی داتادا...' : lang === 'bad' ? 'لێگەڕیان د داتایێ دا...' : lang === 'ar' ? 'البحث في الجدول...' : 'Search dataset rows...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400">
            {lang === 'ku' ? 'پیشاندانی دێڕەکان:' : 'Rows per page:'}
          </span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
        </div>
      </div>

      {/* Main Table Preview & Variable Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table View (Cols 3/4) */}
        <div className={`${selectedVarInfo ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4 transition-all`}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-start text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10 text-slate-300">
                  <tr>
                    <th className="p-3 text-center border-r border-slate-800 text-slate-500 w-12">#</th>
                    {headers.map(col => {
                      const vMeta = auditSummary.variables.find(v => v.name === col);
                      const isSorted = sortCol === col;
                      return (
                        <th
                          key={col}
                          className="p-3 border-r border-slate-800 font-bold whitespace-nowrap text-start hover:bg-slate-900/60 cursor-pointer select-none transition-colors"
                          onClick={() => handleSort(col)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate max-w-[140px] text-slate-100">{col}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {vMeta && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                    vMeta.dataType === 'numeric'
                                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}
                                >
                                  {vMeta.measurementLevel}
                                </span>
                              )}
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedVarInfo(col);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                                title="Variable Information"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                              <ArrowUpDown className={`w-3.5 h-3.5 ${isSorted ? 'text-blue-400' : 'text-slate-600'}`} />
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 1} className="p-8 text-center text-slate-500">
                        No rows found matching search query.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => {
                      const rowNum = (currentPage - 1) * pageSize + idx + 1;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-center border-r border-slate-800/80 font-mono text-[11px] text-slate-500">
                            {rowNum}
                          </td>
                          {headers.map(col => {
                            const val = row[col];
                            const isMissing = val === null || val === undefined || val === '' || Number.isNaN(val);
                            return (
                              <td key={col} className="p-3 border-r border-slate-800/60 whitespace-nowrap">
                                {isMissing ? (
                                  <span className="text-[10px] italic text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                    [Missing]
                                  </span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedRows.length)} of {filteredAndSortedRows.length} rows
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
                </button>
                <span className="font-bold text-slate-200 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Variable Metadata Info Panel (Col 1/4 when active) */}
        {selectedVarInfo && activeVariableMeta && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn h-fit">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 truncate">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                {activeVariableMeta.name}
              </h4>
              <button
                onClick={() => setSelectedVarInfo(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Data Type:</span>
                <span className="font-semibold text-slate-200 capitalize">{activeVariableMeta.dataType}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Measurement Level:</span>
                <span className="font-semibold text-sky-400">{activeVariableMeta.measurementLevel}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Missing Values:</span>
                <span className={`font-semibold ${activeVariableMeta.missingCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {activeVariableMeta.missingCount} ({activeVariableMeta.missingPercent}%)
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Unique Values:</span>
                <span className="font-semibold text-slate-200">{activeVariableMeta.uniqueValuesCount}</span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1.5">Sample Values:</p>
                <div className="flex flex-wrap gap-1">
                  {activeVariableMeta.sampleValues.map((sv, idx) => (
                    <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-800">
                      {String(sv)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
