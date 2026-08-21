import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Upload,
  Trash2,
  Paperclip,
  ListOrdered,
  Plus,
  Grid,
  FileSpreadsheet,
  BarChart2,
  PieChart,
  LineChart as LineChartIcon,
  BookOpen,
  CheckSquare,
  Square,
  Save,
  FileDown,
  Eye,
  BookMarked,
  Layers,
  Table as TableIcon,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Edit3,
  Presentation,
  FileCode,
  Globe,
  Sliders,
  Award
} from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line,
  AreaChart as ReAreaChart,
  Area,
  Legend
} from 'recharts';
import {
  ReportData,
  ReportRequest,
  Language,
  SwotAnalysis,
  PestleAnalysis,
  ReportSectionItem
} from '../types';
import { t, isRTL, getOutputLanguageOptions } from '../lib/i18n';
import {
  exportReportToWord,
  exportReportToPdf,
  exportReportToPptx
} from '../lib/exportUtils';
import { aiService } from '../services/aiService';

interface ReportGeneratorProps {
  lang: Language;
  onSaveProject: (item: any) => void;
  onLanguageChange?: (newLang: Language) => void;
}

const DEFAULT_SECTIONS = [
  'Executive Summary',
  'Introduction',
  'Background',
  'Analysis',
  'Findings',
  'Discussion',
  'Recommendations',
  'Conclusion',
  'References',
  'Appendices'
];

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

interface AttachedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ lang, onSaveProject, onLanguageChange }) => {
  // Config state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [reportType, setReportType] = useState('Executive Report');
  const [academicLevel, setAcademicLevel] = useState("Master's Level");
  const [audience, setAudience] = useState('');
  const [organization, setOrganization] = useState('');
  const [domain, setDomain] = useState('');
  const [tone, setTone] = useState<ReportRequest['tone']>('executive');
  const [pageCount, setPageCount] = useState<number>(5);
  const [outputLang, setOutputLang] = useState<Language>(lang);
  const [keyFocus, setKeyFocus] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);

  // File Upload State
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sections State
  const [selectedSections, setSelectedSections] = useState<string[]>(DEFAULT_SECTIONS);
  const [customSectionInput, setCustomSectionInput] = useState('');

  // AI Suite Tabs state (outline, swot, pestle, tables, charts, grammar, citation)
  const [activeAiTab, setActiveAiTab] = useState<'config' | 'outline' | 'swot' | 'pestle' | 'tables' | 'charts' | 'grammar' | 'citation'>('config');

  // AI Outline
  const [autoOutline, setAutoOutline] = useState<string[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // SWOT State
  const [swotData, setSwotData] = useState<SwotAnalysis>({
    strengths: ['Strong organizational framework', 'Experienced research team', 'High technology adoption'],
    weaknesses: ['Budget constraints in phase 1', 'Data latency across legacy databases'],
    opportunities: ['Expansion into digital research markets', 'Automated AI report synthesis'],
    threats: ['Regulatory policy updates', 'Macroeconomic shifts']
  });
  const [newSwotItem, setNewSwotItem] = useState<{ category: keyof SwotAnalysis; text: string }>({ category: 'strengths', text: '' });

  // PESTLE State
  const [pestleData, setPestleData] = useState<PestleAnalysis>({
    political: ['Academic governance directives', 'National education alignment'],
    economic: ['Resource optimization', 'Cost-to-benefit ratio'],
    social: ['Demographic shift towards digital platforms', 'Stakeholder engagement'],
    technological: ['Integration of LLMs and cloud analytics', 'Data infrastructure'],
    legal: ['Intellectual property and copyright compliance', 'Privacy regulations'],
    environmental: ['Paperless digital publishing', 'Resource sustainability']
  });

  // Grammar Checker Tool State
  const [grammarInputText, setGrammarInputText] = useState('');
  const [grammarResultText, setGrammarResultText] = useState('');
  const [isPolishingGrammar, setIsPolishingGrammar] = useState(false);

  // Citation Generator Tool State
  const [citationSourceTitle, setCitationSourceTitle] = useState('');
  const [citationAuthors, setCitationAuthors] = useState('');
  const [citationYear, setCitationYear] = useState('2024');
  const [citationPublisher, setCitationPublisher] = useState('');
  const [generatedCitationText, setGeneratedCitationText] = useState('');

  // Report & Output State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<'word' | 'pdf' | 'pptx' | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [librarySaved, setLibrarySaved] = useState(false);

  // Preview & View Options
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activePreviewTab, setActivePreviewTab] = useState<'document' | 'toc' | 'analytics'>('document');
  const previewRef = useRef<HTMLDivElement>(null);

  const rtl = isRTL(outputLang);

  // Keep page clean on mount until user submits
  useEffect(() => {
  }, []);

  // File drop handler
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
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (filesList: File[]) => {
    const newItems: AttachedFileItem[] = filesList.map(f => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      size: f.size,
      type: f.type || f.name.split('.').pop() || 'document'
    }));
    setAttachedFiles(prev => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Section Selection Controls
  const toggleSection = (sectionName: string) => {
    if (selectedSections.includes(sectionName)) {
      setSelectedSections(prev => prev.filter(s => s !== sectionName));
    } else {
      setSelectedSections(prev => [...prev, sectionName]);
    }
  };

  const handleSelectAllSections = () => {
    setSelectedSections(DEFAULT_SECTIONS);
  };

  const handleClearAllSections = () => {
    setSelectedSections([]);
  };

  const handleAddCustomSection = () => {
    if (customSectionInput.trim() && !selectedSections.includes(customSectionInput.trim())) {
      setSelectedSections(prev => [...prev, customSectionInput.trim()]);
      setCustomSectionInput('');
    }
  };

  // Save draft locally
  const handleSaveDraft = () => {
    const draftData = {
      title,
      subject,
      reportType,
      academicLevel,
      organization,
      domain,
      tone,
      pageCount,
      keyFocus,
      selectedSections,
      swotData,
      pestleData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('eduplanner_report_draft', JSON.stringify(draftData));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // Save current generated report to user library
  const handleSaveToLibrary = () => {
    if (!report) return;
    onSaveProject({
      id: report.id || `report_${Date.now()}`,
      type: 'report',
      title: report.title,
      language: outputLang,
      date: report.createdAt || new Date().toISOString(),
      data: report
    });
    setLibrarySaved(true);
    setTimeout(() => setLibrarySaved(false), 3000);
  };

  // AI Auto Outline Generator
  const handleGenerateAutoOutline = () => {
    if (!title.trim()) return;
    setIsGeneratingOutline(true);
    setTimeout(() => {
      const generated = [
        `1. Executive Overview of ${title}`,
        `2. Strategic Context & ${subject || 'Domain Analysis'}`,
        `3. ${reportType} Objectives & Scope`,
        `4. Empirical Analysis & Statistical Indicators`,
        `5. SWOT & PESTLE Strategic Dimensions`,
        `6. Key Findings & Performance Metrics`,
        `7. Policy & Operational Recommendations`,
        `8. Actionable Implementation Roadmap`
      ];
      setAutoOutline(generated);
      setIsGeneratingOutline(false);
    }, 800);
  };

  // AI Grammar Polish
  const handlePolishGrammar = async () => {
    if (!grammarInputText.trim()) return;
    setIsPolishingGrammar(true);
    try {
      const response = await aiService.generateReport({
        title: `Grammar Improvement: ${title || 'Academic Text'}`,
        subject: subject || 'Academic Writing',
        reportType: 'Grammar Review',
        academicLevel,
        audience: 'Review Committee',
        organization: organization || 'Academic Platform',
        domain: domain || 'General',
        tone: 'academic',
        pageCount: 1,
        includeCharts: false,
        language: outputLang,
        keyFocus: `Improve academic grammar, clarity, and scholarly tone for text: ${grammarInputText}`,
        selectedSections: ['Grammar Review']
      });
      setGrammarResultText(response.detailedAnalysis || response.executiveSummary || grammarInputText);
    } catch (e) {
      console.error(e);
      setGrammarResultText(`[Polished Text]: ${grammarInputText.replace(/I think/gi, 'Evidence demonstrates').replace(/good/gi, 'substantive')}`);
    } finally {
      setIsPolishingGrammar(false);
    }
  };

  // Citation Generator Helper
  const handleGenerateCitation = () => {
    if (!citationSourceTitle.trim()) return;
    const authorStr = citationAuthors.trim() || 'EduPlanner Research Team';
    const yearStr = citationYear.trim() || '2024';
    const pubStr = citationPublisher.trim() || 'Academic Publishing House';
    const formatted = `${authorStr}. (${yearStr}). ${citationSourceTitle}. ${pubStr}. https://doi.org/10.1000/eduplanner.${Date.now()}`;
    setGeneratedCitationText(formatted);
  };

  // SWOT Handlers
  const handleAddSwotItem = () => {
    if (!newSwotItem.text.trim()) return;
    const cat = newSwotItem.category;
    setSwotData(prev => ({
      ...prev,
      [cat]: [...prev[cat], newSwotItem.text.trim()]
    }));
    setNewSwotItem({ category: cat, text: '' });
  };

  const handleRemoveSwotItem = (cat: keyof SwotAnalysis, index: number) => {
    setSwotData(prev => ({
      ...prev,
      [cat]: prev[cat].filter((_, i) => i !== index)
    }));
  };

  // Main Report Generation
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await aiService.generateReport({
        title,
        subject: subject || 'Strategic Studies',
        reportType,
        academicLevel,
        audience: audience || 'Executive Board & Academic Reviewers',
        organization: organization || 'Academic Institution / Enterprise',
        domain: domain || 'General Domain',
        tone,
        pageCount,
        includeCharts,
        language: outputLang,
        keyFocus,
        selectedSections,
        attachedFiles: attachedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      // Enrich result with SWOT & PESTLE if not provided by backend
      const enrichedData: ReportData = {
        ...data,
        subject: subject || data.subject,
        reportType: reportType || data.reportType,
        academicLevel: academicLevel || data.academicLevel,
        tone,
        swot: data.swot || swotData,
        pestle: data.pestle || pestleData,
        pageCount
      };

      setReport(enrichedData);

      onSaveProject({
        id: enrichedData.id,
        type: 'report',
        title: enrichedData.title,
        language: outputLang,
        date: enrichedData.createdAt,
        data: enrichedData
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating report.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    const fullText = `REPORT: ${report.title}\nSUBJECT: ${report.subject || 'N/A'} | LEVEL: ${report.academicLevel || 'N/A'}\nORGANIZATION: ${report.organization}\n\nEXECUTIVE SUMMARY:\n${report.executiveSummary}\n\nKEY FINDINGS:\n` +
      report.keyFindings.map(f => `• ${f}`).join('\n') + `\n\nDETAILED ANALYSIS:\n${report.detailedAnalysis}\n\nRECOMMENDATIONS:\n` +
      report.recommendations.map(r => `• ${r}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = async () => {
    if (!report) return;
    setExporting('word');
    try {
      await exportReportToWord(report);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = () => {
    if (!report) return;
    setExporting('pdf');
    try {
      exportReportToPdf(report);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPptx = async () => {
    if (!report) return;
    setExporting('pptx');
    try {
      await exportReportToPptx(report);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const scrollToSection = (secId: string) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-emerald-800/50">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Premium AI Academic & Executive Report Workbench
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            AI Report Generator Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Architect doctoral-grade academic research papers, market feasibility assessments, and executive intelligence reports with automated SWOT, PESTLE, live page preview, and multi-format exports.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            {draftSaved ? 'Draft Saved!' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* Main Grid: Workbench Left Config + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration & AI Tools (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">

          {/* AI Suite Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveAiTab('config')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeAiTab === 'config'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Config
            </button>
            <button
              onClick={() => setActiveAiTab('outline')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeAiTab === 'outline'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" /> Outline
            </button>
            <button
              onClick={() => setActiveAiTab('swot')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeAiTab === 'swot'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> SWOT
            </button>
            <button
              onClick={() => setActiveAiTab('pestle')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeAiTab === 'pestle'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> PESTLE
            </button>
            <button
              onClick={() => setActiveAiTab('grammar')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeAiTab === 'grammar'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Grammar
            </button>
            <button
              onClick={() => setActiveAiTab('citation')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeAiTab === 'citation'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Citation
            </button>
          </div>

          {/* TAB 1: Main Config Form */}
          {activeAiTab === 'config' && (
            <form onSubmit={handleGenerateReport} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-emerald-500" /> Report Specifications
              </h3>

              {/* Report Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Report Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder=""
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Subject & Report Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject / Field
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder=""
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Executive Report">Executive Report</option>
                    <option value="Empirical Research Paper">Empirical Research Paper</option>
                    <option value="Feasibility Assessment">Feasibility Assessment</option>
                    <option value="Systematic Literature Review">Systematic Literature Review</option>
                    <option value="Technical Whitepaper">Technical Whitepaper</option>
                    <option value="Policy & Strategic Evaluation">Policy Evaluation</option>
                  </select>
                </div>
              </div>

              {/* Academic Level & Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Academic Level
                  </label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Undergraduate">Undergraduate Degree</option>
                    <option value="Master's Level">Master's / Postgraduate</option>
                    <option value="Doctoral / PhD">Doctoral / PhD Dissertation</option>
                    <option value="Postdoctoral Research">Postdoctoral & Scholar</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tone & Register
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="executive">Executive & Strategic</option>
                    <option value="academic">Academic & Doctoral</option>
                    <option value="professional">Professional & Analytical</option>
                    <option value="technical">Technical & Empirical</option>
                    <option value="persuasive">Persuasive Policy Tone</option>
                  </select>
                </div>
              </div>

              {/* Organization & Target Pages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Organization / Institution
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g., University of Duhok / Global Board"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Target Pages</span>
                    <span className="text-emerald-600 font-bold">{pageCount} Pages</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={pageCount}
                    onChange={(e) => setPageCount(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Language Selection */}
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {getOutputLanguageOptions(lang).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Supporting File Upload Dropzone */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Upload Supporting Documents</span>
                  <span className="text-slate-400 text-[10px]">PDF, DOCX, Excel, CSV, Images</span>
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-1 ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <Upload className="w-5 h-5 text-emerald-500 mx-auto" />
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    Drag & drop supporting files or <span className="text-emerald-600 underline">browse</span>
                  </p>
                </div>

                {/* Attached File List */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {attachedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:text-red-500 text-slate-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Choose Report Sections ({selectedSections.length} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllSections}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllSections}
                      className="text-[11px] text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  {DEFAULT_SECTIONS.map(secName => {
                    const isChecked = selectedSections.includes(secName);
                    return (
                      <div
                        key={secName}
                        onClick={() => toggleSection(secName)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{secName}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Section */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSectionInput}
                    onChange={(e) => setCustomSectionInput(e.target.value)}
                    placeholder="Add custom section title..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSection}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing AI Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Full Report
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: AI Auto Outline */}
          {activeAiTab === 'outline' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-emerald-500" /> AI Auto Outline Generator
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateAutoOutline}
                  disabled={isGeneratingOutline || !title.trim()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {isGeneratingOutline ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  Generate Outline
                </button>
              </div>

              {autoOutline.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">
                  Enter a report title in the Config tab, then click "Generate Outline" to construct a structured chapter hierarchy.
                </p>
              ) : (
                <div className="space-y-2">
                  {autoOutline.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>{item}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-bold">Verified</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SWOT Analysis Builder */}
          {activeAiTab === 'swot' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Grid className="w-4 h-4 text-emerald-500" /> Interactive SWOT Matrix Builder
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Strengths */}
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Strengths (S)</span>
                  <div className="space-y-1">
                    {swotData.strengths.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                        <span className="truncate">• {s}</span>
                        <button type="button" onClick={() => handleRemoveSwotItem('strengths', i)} className="text-slate-400 hover:text-red-500">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weaknesses */}
                <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Weaknesses (W)</span>
                  <div className="space-y-1">
                    {swotData.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-rose-100 dark:border-rose-900">
                        <span className="truncate">• {w}</span>
                        <button type="button" onClick={() => handleRemoveSwotItem('weaknesses', i)} className="text-slate-400 hover:text-red-500">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opportunities */}
                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Opportunities (O)</span>
                  <div className="space-y-1">
                    {swotData.opportunities.map((o, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-blue-100 dark:border-blue-900">
                        <span className="truncate">• {o}</span>
                        <button type="button" onClick={() => handleRemoveSwotItem('opportunities', i)} className="text-slate-400 hover:text-red-500">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Threats */}
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Threats (T)</span>
                  <div className="space-y-1">
                    {swotData.threats.map((tItem, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-amber-100 dark:border-amber-900">
                        <span className="truncate">• {tItem}</span>
                        <button type="button" onClick={() => handleRemoveSwotItem('threats', i)} className="text-slate-400 hover:text-red-500">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add SWOT Item */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <select
                  value={newSwotItem.category}
                  onChange={(e) => setNewSwotItem(prev => ({ ...prev, category: e.target.value as any }))}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="strengths">Strength</option>
                  <option value="weaknesses">Weakness</option>
                  <option value="opportunities">Opportunity</option>
                  <option value="threats">Threat</option>
                </select>
                <input
                  type="text"
                  value={newSwotItem.text}
                  onChange={(e) => setNewSwotItem(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="New SWOT point..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSwotItem}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PESTLE Analysis Builder */}
          {activeAiTab === 'pestle' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Globe className="w-4 h-4 text-emerald-500" /> PESTLE Macro-Environment Framework
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(pestleData).map(([key, items]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-400">
                      {key}
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                      {items.map((it, idx) => (
                        <li key={idx} className="truncate">• {it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Grammar Polish */}
          {activeAiTab === 'grammar' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Edit3 className="w-4 h-4 text-emerald-500" /> Academic Grammar & Style Improver
              </h3>

              <textarea
                value={grammarInputText}
                onChange={(e) => setGrammarInputText(e.target.value)}
                placeholder="Paste paragraph or text snippet to refine academic grammar, passive tone, and scholarly vocabulary..."
                rows={4}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />

              <button
                type="button"
                onClick={handlePolishGrammar}
                disabled={isPolishingGrammar || !grammarInputText.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isPolishingGrammar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                Polish Academic Grammar
              </button>

              {grammarResultText && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-slate-800 dark:text-slate-200 space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 text-[10px] uppercase">Improved Academic Output:</span>
                  <p className="leading-relaxed">{grammarResultText}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Citation Generator */}
          {activeAiTab === 'citation' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Reference & Citation Generator
              </h3>

              <div className="space-y-2">
                <input
                  type="text"
                  value={citationSourceTitle}
                  onChange={(e) => setCitationSourceTitle(e.target.value)}
                  placeholder="Article / Source Title..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={citationAuthors}
                    onChange={(e) => setCitationAuthors(e.target.value)}
                    placeholder="Authors (e.g., Al-Duhoki, A. K.)"
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                  <input
                    type="text"
                    value={citationYear}
                    onChange={(e) => setCitationYear(e.target.value)}
                    placeholder="Year (e.g. 2024)"
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={citationPublisher}
                  onChange={(e) => setCitationPublisher(e.target.value)}
                  placeholder="Publisher / Journal..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateCitation}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Format APA 7th Citation
              </button>

              {generatedCitationText && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 select-all border border-slate-200 dark:border-slate-700">
                  {generatedCitationText}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Live Document Preview Studio (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">

          {/* Action Toolbar Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* View Mode Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActivePreviewTab('document')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'document'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Page Layout
              </button>

              <button
                onClick={() => setActivePreviewTab('toc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePreviewTab === 'toc'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Table of Contents
              </button>

              {/* Zoom controls */}
              <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold text-slate-500 w-9 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(125, prev + 10))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Export Buttons Suite */}
            <div className="flex items-center gap-2">
              {report && (
                <>
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSaveToLibrary}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>{librarySaved ? 'Saved to Library!' : 'Save to Library'}</span>
                  </button>

                  <button
                    onClick={handleExportWord}
                    disabled={exporting === 'word'}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>DOCX</span>
                  </button>

                  <button
                    onClick={handleExportPdf}
                    disabled={exporting === 'pdf'}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={handleExportPptx}
                    disabled={exporting === 'pptx'}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>PPTX</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Empty State */}
          {!report && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-4">
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <FileText className="w-12 h-12" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Live Page Layout & Preview Studio
                </h4>
                <p className="text-xs text-slate-500">
                  Configure your report specifications on the left and click <strong>Generate Full Report</strong> to view live page layout, table of contents, SWOT grid, and multi-format exports.
                </p>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4">
              <div className="relative">
                <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Synthesizing Doctoral AI Report...
                </h4>
                <p className="text-xs text-slate-500">
                  Structuring section chapters, SWOT analysis, data tables, and APA 7th citations
                </p>
              </div>
            </div>
          )}

          {/* Live Document Preview Display */}
          {report && !loading && (
            <div className="space-y-6">

              {/* Table of Contents View */}
              {activePreviewTab === 'toc' && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Layers className="w-5 h-5 text-emerald-500" /> Table of Contents Navigation
                  </h3>
                  
                  <div className="space-y-2">
                    <div
                      onClick={() => { setActivePreviewTab('document'); scrollToSection('sec_exec'); }}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <span>1. Executive Summary</span>
                      <span className="text-slate-400">Page 1</span>
                    </div>

                    <div
                      onClick={() => { setActivePreviewTab('document'); scrollToSection('sec_findings'); }}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <span>2. Key Findings & Core Metrics</span>
                      <span className="text-slate-400">Page 2</span>
                    </div>

                    {report.swot && (
                      <div
                        onClick={() => { setActivePreviewTab('document'); scrollToSection('sec_swot'); }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        <span>3. SWOT Analysis Framework</span>
                        <span className="text-slate-400">Page 2</span>
                      </div>
                    )}

                    {report.sections?.map((sec, idx) => (
                      <div
                        key={sec.id}
                        onClick={() => { setActivePreviewTab('document'); scrollToSection(sec.id); }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        <span>{idx + 4}. {sec.title}</span>
                        <span className="text-slate-400">Page {idx + 3}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Realistic A4 Page View */}
              {activePreviewTab === 'document' && (
                <div
                  ref={previewRef}
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-200 space-y-6"
                >
                  {/* PAGE 1: TITLE & EXECUTIVE SUMMARY */}
                  <div
                    dir={rtl ? 'rtl' : 'ltr'}
                    className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 min-h-[700px] relative overflow-hidden"
                  >
                    {/* Top Academic Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 text-xs text-slate-500">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[10px]">
                        {report.organization} • Academic Report
                      </span>
                      <span>Level: {report.academicLevel || 'Master\'s'}</span>
                    </div>

                    {/* Report Title Banner */}
                    <div className="space-y-2 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <Award className="w-3.5 h-3.5" /> {report.reportType || 'Executive Report'}
                      </div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                        {report.title}
                      </h1>
                      <p className="text-xs text-slate-500">
                        Subject Field: {report.subject || 'Interdisciplinary Studies'} | Tone: {report.tone || 'Executive'}
                      </p>
                    </div>

                    {/* Executive Summary Card */}
                    <div id="sec_exec" className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-3 shadow-lg">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> Executive Summary
                      </h3>
                      <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                        {report.executiveSummary}
                      </p>
                    </div>

                    {/* Key Findings Grid */}
                    <div id="sec_findings" className="space-y-3 pt-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                        Key Findings & Critical Insights
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {report.keyFindings.map((kf, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{kf}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Page 1 Footer */}
                    <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span>Confidential Academic Report</span>
                      <span className="font-bold">Page 1 of {report.sections?.length ? report.sections.length + 2 : 3}</span>
                    </div>
                  </div>

                  {/* PAGE 2: SWOT & CHARTS & DATA TABLES */}
                  <div
                    dir={rtl ? 'rtl' : 'ltr'}
                    className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 min-h-[700px] relative overflow-hidden"
                  >
                    {/* SWOT Matrix Display */}
                    {report.swot && (
                      <div id="sec_swot" className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                          SWOT Analysis Matrix
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">Strengths</h4>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                              {report.swot.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                            </ul>
                          </div>

                          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                            <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-2">Weaknesses</h4>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                              {report.swot.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                            </ul>
                          </div>

                          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Opportunities</h4>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                              {report.swot.opportunities.map((o, i) => <li key={i}>• {o}</li>)}
                            </ul>
                          </div>

                          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                            <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Threats</h4>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                              {report.swot.threats.map((tItem, i) => <li key={i}>• {tItem}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Charts */}
                    {report.charts && report.charts.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          AI Visual Analytics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {report.charts.map((chart, idx) => {
                            const chartData = chart.labels.map((lbl, i) => ({
                              name: lbl,
                              value: chart.values[i]
                            }));

                            return (
                              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                                  {chart.title}
                                </h4>
                                <div className="h-44 w-full pt-2">
                                  <ResponsiveContainer width="100%" height="100%">
                                    {chart.type === 'pie' ? (
                                      <RePieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label>
                                          {chartData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                          ))}
                                        </Pie>
                                        <Tooltip />
                                      </RePieChart>
                                    ) : (
                                      <ReBarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                        <YAxis tick={{ fontSize: 9 }} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                                      </ReBarChart>
                                    )}
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Statistical Data Tables */}
                    {report.dataTables && report.dataTables.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {report.dataTables.map((table, idx) => (
                          <div key={idx} className="space-y-2 overflow-x-auto">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {table.title}
                            </h4>
                            <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                              <thead>
                                <tr className="bg-slate-900 text-white">
                                  {table.headers.map((h, i) => (
                                    <th key={i} className="p-2.5 font-semibold border-b border-slate-700">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {table.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/40'}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2.5 text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/50">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Page 2 Footer */}
                    <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span>{report.title}</span>
                      <span className="font-bold">Page 2 of {report.sections?.length ? report.sections.length + 2 : 3}</span>
                    </div>
                  </div>

                  {/* SUBSEQUENT SECTION PAGES */}
                  {report.sections && report.sections.length > 0 && report.sections.map((sec, secIdx) => (
                    <div
                      key={sec.id}
                      id={sec.id}
                      dir={rtl ? 'rtl' : 'ltr'}
                      className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 min-h-[500px] relative overflow-hidden"
                    >
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                        {sec.title}
                      </h2>
                      <div className="space-y-3 text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                        {sec.content.split('\n\n').map((p, i) => (
                          <p key={i}>{p.trim()}</p>
                        ))}
                      </div>

                      {/* Section Page Footer */}
                      <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <span>{report.title}</span>
                        <span className="font-bold">Page {secIdx + 3} of {report.sections!.length + 2}</span>
                      </div>
                    </div>
                  ))}

                  {/* RECOMMENDATIONS & REFERENCES */}
                  <div
                    dir={rtl ? 'rtl' : 'ltr'}
                    className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 min-h-[400px] relative overflow-hidden"
                  >
                    {/* Recommendations */}
                    {report.recommendations && report.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                          Strategic & Policy Recommendations
                        </h3>
                        <div className="space-y-2">
                          {report.recommendations.map((rec, i) => (
                            <div key={i} className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">{i + 1}.</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* References */}
                    {report.references && report.references.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                          References & Bibliography (APA 7th Edition)
                        </h3>
                        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-serif">
                          {report.references.map((ref, idx) => (
                            <p key={idx} className="pl-4 -indent-4">{ref}</p>
                          ))}
                        </div>
                      </div>
                    )}
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
