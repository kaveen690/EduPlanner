import React, { useState, useEffect } from 'react';
import { History, Clock, Trash2, ExternalLink, Edit3, X, Database } from 'lucide-react';
import { Language, DataAnalysisHistoryItem } from '../../types';
import { isRTL } from '../../lib/i18n';

interface AnalysisHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectHistoryItem: (item: DataAnalysisHistoryItem) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AnalysisHistoryDrawer: React.FC<AnalysisHistoryDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectHistoryItem,
  onShowToast
}) => {
  const [historyItems, setHistoryItems] = useState<DataAnalysisHistoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const rtl = isRTL(lang);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('eduplanner_data_analysis_history');
      if (saved) {
        try {
          setHistoryItems(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading history:', e);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    const updated = historyItems.filter(item => item.id !== id);
    setHistoryItems(updated);
    localStorage.setItem('eduplanner_data_analysis_history', JSON.stringify(updated));
    onShowToast('info', 'Analysis Deleted', 'Removed session from history.');
  };

  const handleRenameSave = (id: string) => {
    if (!editingName.trim()) return;
    const updated = historyItems.map(item =>
      item.id === id ? { ...item, datasetName: editingName.trim() } : item
    );
    setHistoryItems(updated);
    localStorage.setItem('eduplanner_data_analysis_history', JSON.stringify(updated));
    setEditingId(null);
    onShowToast('success', 'Session Renamed', 'Analysis session renamed.');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">
              {lang === 'ku' ? 'مێژووی شیکاری داتا' : lang === 'bad' ? 'مێژوویا شیکارکرنا داتایان' : lang === 'ar' ? 'سجل التحليلات السابقة' : 'Analysis History'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded.lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {historyItems.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-xs">
              No saved analysis sessions found.
            </div>
          ) : (
            historyItems.map(item => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none"
                        />
                        <button
                          onClick={() => handleRenameSave(item.id)}
                          className="text-xs text-blue-400 font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {item.datasetName}
                      </h4>
                    )}
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {item.timestamp}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingName(item.datasetName);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-400"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/60 pt-2">
                  <span>{item.rowsCount} rows • {item.varsCount} vars</span>
                  <button
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    Open Session <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
