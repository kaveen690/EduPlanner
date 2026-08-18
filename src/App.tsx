import React, { useState, useEffect } from 'react';
import { AppMode, Language, ProjectItem, UserProfile, ToastNotification } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { ChatAssistant } from './components/ChatAssistant';
import { ResearchGenerator } from './components/ResearchGenerator';
import { LitReviewGenerator } from './components/LitReviewGenerator';
import { ProposalGenerator } from './components/ProposalGenerator';
import { ThesisAssistant } from './components/ThesisAssistant';
import { ReportGenerator } from './components/ReportGenerator';
import { ResearchReportGenerator } from './components/ResearchReportGenerator';
import { AiWritingAssistant } from './components/AiWritingAssistant';
import { SeminarGenerator } from './components/SeminarGenerator';
import { SpssAnalyzer } from './components/SpssAnalyzer';
import { DataAnalysisModule } from './components/DataAnalysis/DataAnalysisModule';
import { CitationGenerator } from './components/CitationGenerator';
import { TranslatorTool } from './components/TranslatorTool';
import { AcademicSearchTool } from './components/AcademicSearchTool';
import { PlagiarismDetector } from './components/PlagiarismDetector';
import { CollaborationHub } from './components/CollaborationHub';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isRTL } from './lib/i18n';
import { supabaseAuth } from './lib/supabase';
import { AiProvider, SubscriptionTier } from './types';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [recentProjects, setRecentProjects] = useState<ProjectItem[]>([]);

  // Phase 3 Auth & Phase 8 Subscription / Provider state
  // Initialized to null to strictly enforce authentication
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('gemini');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Load saved user session on mount with 1.2s timeout fallback
  useEffect(() => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        setLoadingAuth(false);
      }
    }, 1200);

    supabaseAuth.getSessionUser().then((user) => {
      finished = true;
      setCurrentUser(user);
      setLoadingAuth(false);
      if (!user) {
        setIsAuthOpen(true);
      } else if (user.email === 'workingkaveenhussein@gmail.com' || user.name === 'Kaveen Hussein') {
        setCurrentMode('admin');
      }
    }).catch((err) => {
      finished = true;
      console.warn('[EduPlanner Auth Init]: No active session', err);
      setCurrentUser(null);
      setLoadingAuth(false);
      setIsAuthOpen(true);
    });

    const savedProjects = localStorage.getItem('eduplanner_projects') || localStorage.getItem('researchai_projects');
    if (savedProjects) {
      try {
        setRecentProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error('Error parsing saved projects', e);
      }
    }

    const savedLang = localStorage.getItem('eduplanner_lang') || localStorage.getItem('researchai_lang');
    if (savedLang === 'en' || savedLang === 'ku' || savedLang === 'bad' || savedLang === 'ar') {
      setLang(savedLang as Language);
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const handleChatNav = (e: Event) => {
      setCurrentMode('chat');
    };
    window.addEventListener('eduplanner:navigate_chat', handleChatNav);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('eduplanner:navigate_chat', handleChatNav);
    };
  }, []);

  const showToast = (type: ToastNotification['type'], title: string, message?: string) => {
    const id = 'toast_' + Date.now();
    const newToast: ToastNotification = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('eduplanner_lang', newLang);
    showToast('info', 'Language Preference Updated', `Set output dialect to ${newLang.toUpperCase()}`);
  };

  const handleToggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveProject = (item: ProjectItem) => {
    const updated = [item, ...recentProjects.filter(p => p.id !== item.id)].slice(0, 20);
    setRecentProjects(updated);
    localStorage.setItem('eduplanner_projects', JSON.stringify(updated));
    showToast('success', 'Saved to History', `Item "${item.title}" saved.`);
  };

  const handleDeleteProject = (id: string) => {
    const updated = recentProjects.filter(p => p.id !== id);
    setRecentProjects(updated);
    localStorage.setItem('eduplanner_projects', JSON.stringify(updated));
    showToast('info', 'Item Removed', 'Deleted from recent history.');
  };

  const isAdmin = currentUser?.email === 'workingkaveenhussein@gmail.com' || currentUser?.name === 'Kaveen Hussein';

  useEffect(() => {
    if (currentMode === 'admin' && currentUser && !isAdmin) {
      setCurrentMode('dashboard');
      showToast('error', 'Access Restricted', 'Admin & Analytics dashboard is restricted to primary admin accounts only.');
    }
  }, [currentMode, currentUser, isAdmin]);

  const rtl = isRTL(lang);

  // 1. Loading Splash Screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse mb-4">
          <span className="font-extrabold text-xl text-white">EP</span>
        </div>
        <h2 className="text-lg font-bold">EduPlanner AI</h2>
        <p className="text-xs text-slate-400 mt-1">Verifying Academic Credentials & Session...</p>
      </div>
    );
  }

  // 2. Protected Route Gate: Force Authentication if user === null
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 relative overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-md w-full text-center space-y-6 bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
              <span className="font-black text-2xl text-white">EP</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-white">Authentication Required</h1>
              <p className="text-xs text-slate-400">
                Access to EduPlanner AI tools, literature reviews, SPSS analysis, and academic generators requires a verified user account.
              </p>
            </div>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              Sign In or Create Account
            </button>
          </div>

          {/* Mandatory Auth Modal - Always visible when unauthenticated */}
          <AuthModal
            isOpen={true}
            onClose={() => {
              if (currentUser) setIsAuthOpen(false);
            }}
            currentUser={currentUser}
            onUserUpdated={(usr) => {
              setCurrentUser(usr);
              if (usr) setIsAuthOpen(false);
            }}
            lang={lang}
            onShowToast={showToast}
          />

          <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200"
      >
        {/* Sidebar Navigation */}
        <Sidebar
          currentMode={currentMode}
          onSelectMode={(mode) => setCurrentMode(mode)}
          lang={lang}
          currentUser={currentUser}
        />

        {/* Main Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky Header */}
          <Header
            currentMode={currentMode}
            lang={lang}
            onLanguageChange={handleLanguageChange}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenSubscription={() => setIsSubscriptionOpen(true)}
            selectedProvider={selectedProvider}
            onProviderChange={(prov) => {
              setSelectedProvider(prov);
              showToast('info', 'AI Provider Updated', `Switched engine to ${prov.toUpperCase()}`);
            }}
          />

          {/* Dynamic Content Views */}
          <main className="flex-1 overflow-y-auto">
            {currentMode === 'dashboard' && (
              <DashboardHome
                onSelectMode={(mode) => setCurrentMode(mode)}
                lang={lang}
                recentProjects={recentProjects}
                onDeleteProject={handleDeleteProject}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthOpen(true)}
                onShowToast={showToast}
              />
            )}

            {currentMode === 'chat' && (
              <ChatAssistant lang={lang} selectedProvider={selectedProvider} />
            )}

            {currentMode === 'research' && (
              <ResearchGenerator
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'litreview' && (
              <LitReviewGenerator
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'proposal' && (
              <ProposalGenerator
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'thesis' && (
              <ThesisAssistant
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'report' && (
              <ResearchReportGenerator
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'writing' && (
              <AiWritingAssistant
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'seminar' && (
              <SeminarGenerator
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'data-analysis' && (
              <DataAnalysisModule
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'spss' && (
              <SpssAnalyzer
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'citation' && (
              <CitationGenerator
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'translation' && (
              <TranslatorTool
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'search' && (
              <AcademicSearchTool
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'plagiarism' && (
              <PlagiarismDetector
                lang={lang}
                onSaveProject={handleSaveProject}
              />
            )}

            {currentMode === 'collaboration' && (
              <CollaborationHub
                lang={lang}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {currentMode === 'admin' && isAdmin && (
              <AdminDashboard
                lang={lang}
              />
            )}
          </main>
        </div>

        {/* Phase 3 Auth Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(usr) => setCurrentUser(usr)}
          lang={lang}
          onShowToast={showToast}
        />

        {/* Phase 8 Subscription Modal */}
        <SubscriptionModal
          isOpen={isSubscriptionOpen}
          onClose={() => setIsSubscriptionOpen(false)}
          currentUser={currentUser}
          onUpdateSubscription={(tier) => {
            if (currentUser) {
              const updated = { ...currentUser, subscriptionTier: tier };
              setCurrentUser(updated);
              supabaseAuth.updateUserProfile({ subscriptionTier: tier });
            }
          }}
          lang={lang}
          onShowToast={showToast}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </ErrorBoundary>
  );
}
