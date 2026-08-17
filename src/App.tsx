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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('gemini');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Load saved user, dark mode, language, and projects on mount
  useEffect(() => {
    supabaseAuth.getSessionUser().then((user) => {
      if (user) setCurrentUser(user);
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
    return () => window.removeEventListener('eduplanner:navigate_chat', handleChatNav);
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

  const rtl = isRTL(lang);

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

            {currentMode === 'admin' && (
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
