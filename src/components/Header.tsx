import React, { useState } from 'react';
import { Crown, Cpu, Sparkles, Wand2, Languages, Moon, Sun, BookOpen, BarChart3, Presentation, FileText, LayoutDashboard, UserCheck, Shield, Bell, CheckCircle2 } from 'lucide-react';
import { AppMode, Language, AiProvider, UserProfile } from '../types';
import { t, isRTL } from '../lib/i18n';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  currentMode: AppMode;
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenSubscription?: () => void;
  selectedProvider?: AiProvider;
  onProviderChange?: (prov: AiProvider) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  lang,
  onLanguageChange,
  darkMode,
  onToggleDarkMode,
  currentUser,
  onOpenAuth,
  onOpenSubscription,
  selectedProvider = 'gemini',
  onProviderChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const modeTitles: Record<AppMode, string> = {
    dashboard: t('navDashboard', lang),
    chat: t('navChat', lang),
    research: t('navResearch', lang),
    litreview: t('navLitReview', lang),
    proposal: t('navProposal', lang),
    thesis: t('navThesis', lang),
    report: t('navReport', lang),
    writing: 'AI Writing Assistant',
    seminar: t('navSeminar', lang),
    spss: t('navSpss', lang),
    'data-analysis': t('navDataAnalysis', lang),
    citation: t('navCitation', lang),
    translation: t('navTranslation', lang),
    search: t('navSearch', lang),
    plagiarism: t('navPlagiarism', lang),
    collaboration: t('navCollaboration', lang),
    admin: t('navAdmin', lang)
  };

  const getModeIcon = () => {
    switch (currentMode) {
      case 'research': return <BookOpen className="w-5 h-5 text-indigo-500" />;
      case 'report': return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'writing': return <Wand2 className="w-5 h-5 text-purple-500" />;
      case 'seminar': return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'spss': return <BarChart3 className="w-5 h-5 text-sky-500" />;
      case 'data-analysis': return <BarChart3 className="w-5 h-5 text-blue-500" />;
      default: return <LayoutDashboard className="w-5 h-5 text-blue-500" />;
    }
  };

  const notificationsList = [
    { id: 'n1', title: 'APA 7 Engine Ready', desc: 'Citation generator synced with APA 7th edition standard.', time: '2m ago' },
    { id: 'n2', title: 'SPSS Module Online', desc: 'Regression, ANOVA & Hypothesis testing engine initialized.', time: '1h ago' }
  ];

  return (
    <header className="sticky top-0 z-30 border-b bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Mode Title & Indicator */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            {getModeIcon()}
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 font-display">
              {modeTitles[currentMode]}
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3 h-3 text-cyan-500" /> Enterprise AI
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              {t('appName', lang)} &bull; {lang === 'bad' ? 'بادینی' : lang === 'ku' ? 'سۆرانی' : lang === 'ar' ? 'العربية' : 'English'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* AI Model Switcher */}
          {onProviderChange && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <select
                value={selectedProvider}
                onChange={(e) => onProviderChange(e.target.value as AiProvider)}
                className="bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer font-bold text-xs"
              >
                <option value="gemini">Google Gemini 2.5</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="claude">Claude 3.5 Sonnet</option>
              </select>
            </div>
          )}

          {/* Notifications Bell Button & Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 relative"
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-500" /> Notifications
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold">2 New</span>
                </div>
                <div className="space-y-2.5">
                  {notificationsList.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subscription Upgrade Button */}
          {onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs shadow-sm transition-all shrink-0"
              title="Upgrade Academic Plan"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {currentUser?.subscriptionTier ? currentUser.subscriptionTier.toUpperCase() : 'PRO'}
              </span>
            </button>
          )}

          {/* User Profile / Supabase Auth Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-all text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm"
            title="Manage Academic Auth & Supabase Profile"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-blue-500"
              />
            ) : (
              <UserCheck className="w-4 h-4 text-blue-500" />
            )}
            <span className="hidden sm:inline max-w-[120px] truncate">
              {currentUser?.name || 'Sign In / Profile'}
            </span>
          </button>

          {/* Language Switcher Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('bad')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                lang === 'bad'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Kurdish Badini (بادینی)"
            >
              بادینی
            </button>
            <button
              onClick={() => onLanguageChange('ku')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                lang === 'ku'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Kurdish Sorani (سۆرانی)"
            >
              سۆرانی
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                lang === 'ar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Arabic (العربية)"
            >
              عربي
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            title={darkMode ? t('lightMode', lang) : t('darkMode', lang)}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
