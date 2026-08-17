import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  BookOpen,
  BookOpenCheck,
  FileCode,
  GraduationCap,
  FileText,
  Presentation,
  BarChart3,
  Quote,
  Languages,
  Sparkles,
  ArrowRight,
  Globe,
  Clock,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Search,
  Plus,
  Star,
  Folder,
  Tag,
  Copy,
  Edit,
  HardDrive,
  Activity,
  Zap,
  Cpu,
  Database,
  ShieldCheck,
  Filter,
  Calendar,
  CalendarDays,
  Pin,
  CheckSquare
} from 'lucide-react';
import { AppMode, Language, ProjectItem, Project, ProjectCategory, UserProfile, UserStatistics, AttachedFile, ActivityTimelineItem } from '../types';
import { t, isRTL } from '../lib/i18n';
import { supabaseDb, supabaseAuth } from '../lib/supabase';
import { ProjectManagerModal } from './ProjectManager';
import { FileStorageManager } from './FileStorageManager';
import { DashboardSkeleton } from './LoadingSkeleton';
import { EduPlannerLogo } from './EduPlannerLogo';

interface DashboardHomeProps {
  onSelectMode: (mode: AppMode) => void;
  lang: Language;
  recentProjects: ProjectItem[];
  onDeleteProject: (id: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onSelectMode,
  lang,
  recentProjects,
  onDeleteProject,
  currentUser,
  onOpenAuth,
  onShowToast
}) => {
  const rtl = isRTL(lang);
  const [activeTab, setActiveTab] = useState<'tools' | 'projects' | 'files' | 'timeline' | 'calendar'>('tools');
  const [loading, setLoading] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Stats & Files State
  const [stats, setStats] = useState<UserStatistics>(supabaseDb.getUserStats());
  const [savedFiles, setSavedFiles] = useState<AttachedFile[]>([]);
  const [activities, setActivities] = useState<ActivityTimelineItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const loadedProjects = await supabaseDb.getProjects();
    setProjects(loadedProjects || []);
    setStats(supabaseDb.getUserStats());
    setSavedFiles(supabaseDb.getSavedFiles() || []);
    setActivities(supabaseDb.getActivities() || []);
    setLoading(false);
  };

  const handleSaveProject = async (proj: Partial<Project>) => {
    const saved = await supabaseDb.saveProject(proj);
    onShowToast('success', 'Project Saved', `Project "${saved.title}" updated.`);
    loadDashboardData();
  };

  const handleDeleteProject = async (id: string) => {
    await supabaseDb.deleteProject(id);
    onShowToast('info', 'Project Deleted', 'Project removed from database.');
    loadDashboardData();
  };

  const handleDuplicateProject = async (id: string) => {
    const dup = await supabaseDb.duplicateProject(id);
    if (dup) {
      onShowToast('success', 'Project Duplicated', `Created copy "${dup.title}"`);
      loadDashboardData();
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await supabaseDb.toggleFavorite(id);
    loadDashboardData();
  };

  const filteredProjects = (projects || []).filter((p) => {
    if (!p) return false;
    const title = p.title || '';
    const description = p.description || '';
    const tags = p.tags || [];

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some(t => (t || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesFav = !showFavoritesOnly || Boolean(p.isFavorite);

    return matchesSearch && matchesCategory && matchesFav;
  });

  const modules = [
    {
      mode: 'chat' as AppMode,
      title: t('chatTitle', lang),
      subtitle: t('chatSubtitle', lang),
      icon: <MessageSquare className="w-7 h-7 text-pink-500" />,
      bg: 'from-pink-500/10 via-pink-500/5 to-transparent border-pink-200 dark:border-pink-900',
      btnBg: 'bg-pink-600 hover:bg-pink-700 text-white',
      badge: 'Streaming Gemini AI'
    },
    {
      mode: 'research' as AppMode,
      title: t('researchTitle', lang),
      subtitle: t('researchSubtitle', lang),
      icon: <BookOpen className="w-7 h-7 text-indigo-500" />,
      bg: 'from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200 dark:border-indigo-900',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      badge: 'APA 7th Format'
    },
    {
      mode: 'litreview' as AppMode,
      title: t('litReviewTitle', lang),
      subtitle: t('litReviewSubtitle', lang),
      icon: <BookOpenCheck className="w-7 h-7 text-cyan-500" />,
      bg: 'from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-200 dark:border-cyan-900',
      btnBg: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      badge: 'Thematic Matrix'
    },
    {
      mode: 'proposal' as AppMode,
      title: t('proposalTitle', lang),
      subtitle: t('proposalSubtitle', lang),
      icon: <FileCode className="w-7 h-7 text-purple-500" />,
      bg: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-200 dark:border-purple-900',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
      badge: 'Grant & Thesis'
    },
    {
      mode: 'thesis' as AppMode,
      title: t('thesisTitle', lang),
      subtitle: t('thesisSubtitle', lang),
      icon: <GraduationCap className="w-7 h-7 text-blue-500" />,
      bg: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-200 dark:border-blue-900',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      badge: 'Defense Prep & Q&A'
    },
    {
      mode: 'report' as AppMode,
      title: t('reportTitle', lang),
      subtitle: t('reportSubtitle', lang),
      icon: <FileText className="w-7 h-7 text-emerald-500" />,
      bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200 dark:border-emerald-900',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'Charts & Tables'
    },
    {
      mode: 'seminar' as AppMode,
      title: t('seminarTitle', lang),
      subtitle: t('seminarSubtitle', lang),
      icon: <Presentation className="w-7 h-7 text-amber-500" />,
      bg: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-200 dark:border-amber-900',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'PowerPoint .PPTX'
    },
    {
      mode: 'data-analysis' as AppMode,
      title: lang === 'ku' ? 'شیکردنەوەی داتا' : lang === 'bad' ? 'شیکارکرنا داتایان' : lang === 'ar' ? 'تحليل البيانات' : 'Data Analysis',
      subtitle: 'Complete 8-Step Dataset Analysis, Hypothesis Testing, Cleaning & Chapter 4 Generator',
      icon: <BarChart3 className="w-7 h-7 text-blue-400" />,
      bg: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-200 dark:border-blue-900',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      badge: 'Chapter 4 & Hypotheses'
    },
    {
      mode: 'spss' as AppMode,
      title: t('spssTitle', lang),
      subtitle: t('spssSubtitle', lang),
      icon: <BarChart3 className="w-7 h-7 text-sky-500" />,
      bg: 'from-sky-500/10 via-sky-500/5 to-transparent border-sky-200 dark:border-sky-900',
      btnBg: 'bg-sky-600 hover:bg-sky-700 text-white',
      badge: 'ANOVA & Regression'
    },
    {
      mode: 'citation' as AppMode,
      title: t('citationTitle', lang),
      subtitle: t('citationSubtitle', lang),
      icon: <Quote className="w-7 h-7 text-orange-500" />,
      bg: 'from-orange-500/10 via-orange-500/5 to-transparent border-orange-200 dark:border-orange-900',
      btnBg: 'bg-orange-600 hover:bg-orange-700 text-white',
      badge: 'APA 7, MLA, Chicago'
    },
    {
      mode: 'translation' as AppMode,
      title: t('translationTitle', lang),
      subtitle: t('translationSubtitle', lang),
      icon: <Languages className="w-7 h-7 text-teal-500" />,
      bg: 'from-teal-500/10 via-teal-500/5 to-transparent border-teal-200 dark:border-teal-900',
      btnBg: 'bg-teal-600 hover:bg-teal-700 text-white',
      badge: 'Badini &bull; Sorani &bull; English &bull; Arabic'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6">
      {/* Premium Modern Enterprise Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 md:p-10 text-white shadow-2xl border border-blue-500/20">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold text-cyan-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-display">Plan Smarter. Research Faster. Learn Better.</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight font-display">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-300">
              EduPlanner AI
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium max-w-3xl">
            The Complete AI Platform for Research, SPSS Analysis, Academic Writing, Seminar Creation, APA 7 Citation, Literature Review, Thesis Writing, and Intelligent Educational Planning.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectMode('research')}
              className="px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/35 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4 text-cyan-200" /> Start Research
            </button>
            <button
              onClick={() => onSelectMode('spss')}
              className="px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/35 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <BarChart3 className="w-4 h-4 text-purple-200" /> Analyze SPSS
            </button>
            <button
              onClick={() => onSelectMode('seminar')}
              className="px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-600/35 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Presentation className="w-4 h-4 text-cyan-100" /> Create Seminar
            </button>
            <button
              onClick={() => onSelectMode('report')}
              className="px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-600/35 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4 text-emerald-100" /> Generate Report
            </button>
          </div>

          {/* Quick Academic AI Assistant Widget Bar */}
          <div className="pt-3">
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <MessageSquare className="w-4 h-4 text-pink-300 ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Ask EduPlanner AI assistant (e.g. 'Synthesize literature review for microgrids', 'Explain ANOVA output')..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSelectMode('chat');
                  }
                }}
                className="w-full bg-transparent text-xs text-white placeholder-slate-300 focus:outline-none px-2 font-medium"
              />
              <button
                onClick={() => onSelectMode('chat')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-xs shadow-md shrink-0 transition-all flex items-center gap-1.5"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>AI Calls</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{stats.aiCallsCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Tokens</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{(stats.tokensUsed / 1000).toFixed(1)}k</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Papers</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{stats.papersGenerated}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Seminars</span>
            <Presentation className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{stats.seminarsCreated}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>SPSS Runs</span>
            <BarChart3 className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{stats.spssRuns}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Files Storage</span>
            <HardDrive className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">{(stats.storageUsedBytes / 1024 / 1024).toFixed(1)} MB</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Academic AI Suite
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Folder className="w-4 h-4" /> Projects & Database ({(projects || []).length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'files'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-4 h-4" /> Saved Files ({(savedFiles || []).length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" /> Activity Timeline
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Academic Calendar
          </button>
        </div>

        {activeTab === 'projects' && (
          <button
            onClick={() => {
              setProjectToEdit(null);
              setIsProjectModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* TAB 1: ACADEMIC AI SUITE MODULES */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {modules.map((mod) => (
              <div
                key={mod.mode}
                className={`group relative p-6 rounded-2xl bg-gradient-to-b ${mod.bg} bg-white dark:bg-slate-900 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800">
                      {mod.icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {mod.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    onClick={() => onSelectMode(mod.mode)}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${mod.btnBg}`}
                  >
                    {t('generate', lang)}
                    {rtl ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS & SUPABASE DATABASE MANAGEMENT */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, keywords, or tags..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Academic Research">Academic Research</option>
                <option value="Seminar Presentations">Seminar Presentations</option>
                <option value="Executive Reports">Executive Reports</option>
                <option value="Literature Reviews">Literature Reviews</option>
                <option value="SPSS Statistics">SPSS Statistics</option>
                <option value="Thesis Writing">Thesis Writing</option>
                <option value="General">General</option>
              </select>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                  showFavoritesOnly
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-300 dark:border-amber-800'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
                Favorites
              </button>
            </div>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <Folder className="w-12 h-12 mx-auto text-slate-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Matching Projects Found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Create a new project or adjust search filters to locate stored academic records.
                </p>
              </div>
              <button
                onClick={() => {
                  setProjectToEdit(null);
                  setIsProjectModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase">
                        {project.category}
                      </span>
                      <button
                        onClick={() => handleToggleFavorite(project.id)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                      >
                        <Star className={`w-4 h-4 ${project.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {project.title}
                      </h4>
                      {project.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-4 text-xs">
                    <span className="text-[10px] text-slate-400">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateProject(project.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        title="Duplicate project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setProjectToEdit(project);
                          setIsProjectModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        title="Edit project details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500"
                        title="Delete project"
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
      )}

      {/* TAB 3: SAVED FILES STORAGE */}
      {activeTab === 'files' && (
        <FileStorageManager
          files={savedFiles}
          onFileUploaded={(f) => {
            setSavedFiles([f, ...savedFiles]);
            setStats(supabaseDb.getUserStats());
          }}
          onFileDeleted={(id) => {
            supabaseDb.deleteFile(id);
            setSavedFiles(savedFiles.filter(f => f.id !== id));
          }}
          lang={lang}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 4: ACTIVITY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Real-time System Audit & Event Stream
            </h3>
            <span className="text-xs text-slate-400">Phase 3 RLS Security Enabled</span>
          </div>

          <div className="space-y-3">
            {(activities || []).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60"
              >
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</h4>
                    <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ACADEMIC CALENDAR & PLANNER */}
      {activeTab === 'calendar' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <Calendar className="w-5 h-5 text-blue-500" /> Academic Calendar & Milestones
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track thesis submission deadlines, SPSS data runs, seminar reviews, and paper revisions.
              </p>
            </div>
            <button
              onClick={() => onShowToast('info', 'Calendar Sync', 'Synced with Google & Outlook academic calendars.')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4" /> Sync Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                <span>Thesis Chapter 3 Review</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-[10px]">Due Aug 12</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Methodology & Empirical Data Analysis section completion.</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-blue-200/50">
                <span>Status: In Progress</span>
                <span className="font-bold text-blue-600">80% Done</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>SPSS Regression Run</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-[10px]">Due Aug 18</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Multi-factor ANOVA & Linear Regression Model interpretation.</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-purple-200/50">
                <span>Dataset: Uploaded</span>
                <span className="font-bold text-purple-600">Scheduled</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span>Faculty Seminar Slides</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-[10px]">Due Aug 25</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Create 12 presentation slides with Speaker Notes & References.</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-emerald-200/50">
                <span>Template: Academic</span>
                <span className="font-bold text-emerald-600">Ready to Export</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global EduPlanner AI Footer */}
      <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <EduPlannerLogo size="sm" showTagline={true} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 font-medium">
          <button onClick={() => onSelectMode('research')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Research Paper</button>
          <button onClick={() => onSelectMode('spss')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">SPSS Analyzer</button>
          <button onClick={() => onSelectMode('seminar')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Seminar Creator</button>
          <button onClick={() => onSelectMode('citation')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">APA 7 Citations</button>
        </div>
        <div className="text-center md:text-right text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} EduPlanner AI Platform. All rights reserved.</span>
        </div>
      </footer>

      {/* Project Modal */}
      <ProjectManagerModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectToEdit={projectToEdit}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        onDuplicate={handleDuplicateProject}
        lang={lang}
      />
    </div>
  );
};
