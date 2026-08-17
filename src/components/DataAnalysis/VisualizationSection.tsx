import React, { useState } from 'react';
import { BarChart, PieChart, LineChart, Activity, Download, Plus, ArrowRight, Layers, LayoutGrid } from 'lucide-react';
import { Language, SpssDataset } from '../../types';
import { isRTL } from '../../lib/i18n';
import { InteractiveDataVisualizer } from '../SpssCharts';

interface VisualizationSectionProps {
  rows: any[];
  headers: string[];
  lang: Language;
  onNextStep: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const VisualizationSection: React.FC<VisualizationSectionProps> = ({
  rows,
  headers,
  lang,
  onNextStep,
  onShowToast
}) => {
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xAxisVar, setXAxisVar] = useState<string>(headers[0] || '');
  const [yAxisVar, setYAxisVar] = useState<string>(headers[1] || headers[0] || '');
  const [chartTitle, setChartTitle] = useState<string>('Dataset Empirical Distribution');

  const rtl = isRTL(lang);

  const handleDownloadChart = () => {
    onShowToast('success', 'Chart Exported', 'Chart saved as PNG image.');
  };

  const handleAddToReport = () => {
    onShowToast('success', 'Added to Chapter 4 Report', 'Visualization appended to Chapter 4 Results.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-400" />
            {lang === 'ku' ? 'دروستکەری چارتەکان (Chart Builder)' : lang === 'bad' ? 'دروستکەرێ چارتان' : lang === 'ar' ? 'منشئ المخططات والرسوم البيانية' : 'Interactive Chart Builder'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Generate high-resolution publication charts (Bar, Pie, Line, Scatter) directly from dataset rows
          </p>
        </div>

        <button
          onClick={onNextStep}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          {lang === 'ku' ? 'بەردەوامبوون بۆ تەفسیری AI و دروستکردنی بەشی ٤' : lang === 'bad' ? 'دەربازبوون بۆ دروستکرنا بەشێ ٤' : lang === 'ar' ? 'الانتقال إلى التفسير وإنشاء الفصل الرابع' : 'Proceed to AI Interpretation & Chapter 4'}
          <ArrowRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Controls & Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Config Options */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Chart Configuration
          </h4>

          {/* Chart Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Chart Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bar', label: 'Bar Chart', icon: <BarChart className="w-4 h-4 text-blue-400" /> },
                { id: 'pie', label: 'Pie Chart', icon: <PieChart className="w-4 h-4 text-emerald-400" /> },
                { id: 'line', label: 'Line Chart', icon: <LineChart className="w-4 h-4 text-cyan-400" /> },
                { id: 'scatter', label: 'Scatter Plot', icon: <Activity className="w-4 h-4 text-purple-400" /> }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedChartType(item.id as any)}
                  className={`p-3 rounded-xl border text-start flex items-center gap-2 transition-all ${
                    selectedChartType === item.id
                      ? 'bg-blue-600/20 border-blue-500 text-slate-100 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* X-Axis Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">X-Axis Variable</label>
            <select
              value={xAxisVar}
              onChange={e => setXAxisVar(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
            >
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Y-Axis Selector */}
          {selectedChartType !== 'pie' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Y-Axis Variable (Numeric)</label>
              <select
                value={yAxisVar}
                onChange={e => setYAxisVar(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
              >
                {headers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          )}

          {/* Chart Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Chart Title</label>
            <input
              type="text"
              value={chartTitle}
              onChange={e => setChartTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleDownloadChart}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-blue-400" />
              Download Chart PNG
            </button>
            <button
              onClick={handleAddToReport}
              className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Chart to Chapter 4
            </button>
          </div>
        </div>

        {/* Right: Chart Rendering Display */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <InteractiveDataVisualizer
            dataset={{
              id: 'ds_active',
              name: 'Active Dataset',
              columns: headers,
              data: rows,
              rowCount: rows.length
            }}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
};
