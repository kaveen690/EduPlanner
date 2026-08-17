import React, { useState } from 'react';
import {
  LayoutDashboard,
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
  Search,
  ShieldAlert,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wand2,
  FolderOpen
} from 'lucide-react';
import { AppMode, Language } from '../types';
import { t, isRTL } from '../lib/i18n';
import { EduPlannerLogo } from './EduPlannerLogo';

interface SidebarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  lang: Language;
}

interface NavGroup {
  title: string;
  items: { mode: AppMode; labelKey: any; icon: React.ReactNode; color: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onSelectMode, lang }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navGroups: NavGroup[] = [
    {
      title: 'General',
      items: [
        { mode: 'dashboard', labelKey: 'navDashboard', icon: <LayoutDashboard className="w-4 h-4" />, color: 'text-blue-500' }
      ]
    },
    {
      title: 'Research',
      items: [
        { mode: 'research', labelKey: 'navResearch', icon: <BookOpen className="w-4 h-4" />, color: 'text-indigo-500' },
        { mode: 'litreview', labelKey: 'navLitReview', icon: <BookOpenCheck className="w-4 h-4" />, color: 'text-cyan-500' },
        { mode: 'proposal', labelKey: 'navProposal', icon: <FileCode className="w-4 h-4" />, color: 'text-purple-500' },
        { mode: 'thesis', labelKey: 'navThesis', icon: <GraduationCap className="w-4 h-4" />, color: 'text-blue-500' },
        { mode: 'search', labelKey: 'navSearch', icon: <Search className="w-4 h-4" />, color: 'text-teal-400' }
      ]
    },
    {
      title: 'Writing',
      items: [
        { mode: 'writing', labelKey: 'navWriting', icon: <Wand2 className="w-4 h-4" />, color: 'text-purple-400' },
        { mode: 'report', labelKey: 'navReport', icon: <FileText className="w-4 h-4" />, color: 'text-emerald-500' },
        { mode: 'citation', labelKey: 'navCitation', icon: <Quote className="w-4 h-4" />, color: 'text-orange-500' },
        { mode: 'translation', labelKey: 'navTranslation', icon: <Languages className="w-4 h-4" />, color: 'text-teal-500' }
      ]
    },
    {
      title: 'Data Analysis & SPSS',
      items: [
        { mode: 'data-analysis', labelKey: 'navDataAnalysis', icon: <BarChart3 className="w-4 h-4" />, color: 'text-blue-400' },
        { mode: 'spss', labelKey: 'navSpss', icon: <Activity className="w-4 h-4" />, color: 'text-sky-500' }
      ]
    },
    {
      title: 'Education',
      items: [
        { mode: 'seminar', labelKey: 'navSeminar', icon: <Presentation className="w-4 h-4" />, color: 'text-amber-500' }
      ]
    },
    {
      title: 'AI Tools',
      items: [
        { mode: 'chat', labelKey: 'navChat', icon: <MessageSquare className="w-4 h-4" />, color: 'text-pink-500' },
        { mode: 'plagiarism', labelKey: 'navPlagiarism', icon: <ShieldAlert className="w-4 h-4" />, color: 'text-rose-400' }
      ]
    },
    {
      title: 'Settings & Team',
      items: [
        { mode: 'collaboration', labelKey: 'navCollaboration', icon: <Users className="w-4 h-4" />, color: 'text-blue-400' },
        { mode: 'admin', labelKey: 'navAdmin', icon: <Activity className="w-4 h-4" />, color: 'text-purple-400' }
      ]
    }
  ];

  const rtl = isRTL(lang);

  return (
    <aside
      className={`relative z-20 flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-16 md:w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <EduPlannerLogo collapsed={collapsed} showTagline={!collapsed} />

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            rtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            rtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {group.title}
              </h3>
            )}

            {group.items.map((item) => {
              const isActive = currentMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => onSelectMode(item.mode)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                  title={t(item.labelKey, lang)}
                >
                  <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.color}`}>
                    {item.icon}
                  </div>
                  {!collapsed && (
                    <span className="truncate flex-1 text-start font-semibold">
                      {t(item.labelKey, lang)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info / Badge */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <p className="font-bold text-slate-200 text-[11px]">EduPlanner AI Pro</p>
              <p className="text-[10px] text-slate-400">Academic & SPSS Suite</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
