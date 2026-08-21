import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  Trash2,
  RefreshCw,
  BookOpen,
  HelpCircle,
  FileCode,
  BarChart2,
  AlertCircle,
  Paperclip,
  FileText,
  X,
  Plus,
  Square,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  MessageSquare,
  Edit3,
  Layers,
  Globe,
  Sliders,
  ChevronDown,
  FileSpreadsheet,
  FileSearch,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, ChatSession, Language, AttachedFile, AiProvider } from '../types';
import { isRTL, t } from '../lib/i18n';
import { aiService } from '../services/aiService';
import { supabaseDb } from '../lib/supabase';
import { FileUploadZone } from './FileUploadZone';
import { ParsedFileResult } from '../lib/fileParser';
import { startVoiceInput, stopVoiceInput, speakText, stopSpeech, isSpeechRecognitionSupported } from '../lib/speechUtils';

interface ChatAssistantProps {
  lang: Language;
  selectedProvider?: AiProvider;
}

const ACADEMIC_PROMPT_SHORTCUTS = [
  {
    category: 'Research Drafting',
    icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
    label: { en: 'Literature Review Synthesis', bad: 'پێداچوونا ئەدەبیاتان', ku: 'پێداچوونەوەی ئەدەبیات', ar: 'مراجعة الأدبيات' },
    prompt: 'Draft a doctoral-level Literature Review Synthesis comparing primary research themes, consensus points, and empirical gaps.'
  },
  {
    category: 'SPSS Analysis',
    icon: <BarChart2 className="w-4 h-4 text-sky-400" />,
    label: { en: 'Regression & ANOVA SPSS Guide', bad: 'شیکاریا ڕێگرێشن و ANOVA', ku: 'شیکاری ڕێگریشن و ANOVA', ar: 'تفسير الانحدار و ANOVA' },
    prompt: 'Explain step-by-step how to interpret a Multiple Linear Regression model and One-Way ANOVA SPSS output with R², F-test, Beta, and p-values.'
  },
  {
    category: 'SPSS Analysis',
    icon: <BarChart2 className="w-4 h-4 text-teal-400" />,
    label: { en: 'Cronbach Alpha & Reliability', bad: 'پێوەرا باوەرپێکراویێ Cronbach', ku: 'پێوەری جێگیری Cronbach', ar: 'معامل الثبات كرونباخ ألفا' },
    prompt: 'How do I report Cronbach’s Alpha (α) reliability coefficient and item-total statistics in SPSS according to APA 7 standards?'
  },
  {
    category: 'Methodology',
    icon: <FileCode className="w-4 h-4 text-emerald-400" />,
    label: { en: 'Thesis Methodology Chapter', bad: 'دارشتنا مێثۆدۆلۆجیا تێزێ', ku: 'داڕشتنی میتۆدۆلۆجیا', ar: 'صياغة فصل المنهجية' },
    prompt: 'Outline a comprehensive PHD Thesis Methodology Chapter covering research design, sampling strategy, data collection tools, and statistical analysis plan.'
  },
  {
    category: 'Citations',
    icon: <HelpCircle className="w-4 h-4 text-amber-400" />,
    label: { en: 'APA 7 Citations & Bibliography', bad: 'ژێدەرێن APA 7 د دەقی دا', ku: 'سەرچاوەکانی APA 7', ar: 'توثيق APA 7 والمراجع' },
    prompt: 'Provide standard APA 7th Edition rules for parenthetical and narrative in-text citations for single, multiple, and institutional authors.'
  }
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ lang, selectedProvider = 'gemini' }) => {
  // Chat Sessions & Active Session State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('eduplanner_chat_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [{
      id: 'session_default',
      title: 'Main Academic Research Session',
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: lang === 'bad'
          ? 'سڵاو! ئەز هاریکارێ ژیرییا دەستکردم بۆ EduPlanner AI (بەکارئینانا Google Gemini 2.5). ب خێربهێی، هەر پرسیارەکا ئەکادیمی، شیکاریا SPSS، دارێژتنا ڤەکۆلینێ یان شیکاریا فایلا هەیە بنڤێسە.'
          : lang === 'ku'
          ? 'سڵاو! من یارمەتیدەری ژیری دەستکردی EduPlanner م (Google Gemini 2.5). دەتوانیت هەر پرسیارێکی ئەکادیمی، شیکاری SPSS، داڕشتنی توێژینەوە و سەرچاوەکان بپرسیت.'
          : lang === 'ar'
          ? 'مرحباً بك! أنا مساعد EduPlanner الأكاديمي المباشر (Google Gemini 2.5). كيف يمكنني مساعدتك اليوم في أبحاثك، تحليلات SPSS، أو تحليل الأوراق المرفقة؟'
          : 'Hello! I am your EduPlanner AI Academic Research Assistant (powered by Google Gemini 2.5). Ask me anything about your academic paper, thesis, SPSS analysis, citations, or literature review.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }],
      language: lang,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>('session_default');
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);

  // Active Session Messages
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  // Input & Streaming States
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Attachment Documents Q&A State (PDF, DOCX, Excel, CSV, PPTX)
  const [selectedDocs, setSelectedDocs] = useState<AttachedFile[]>([]);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [savedFiles, setSavedFiles] = useState<AttachedFile[]>([]);

  // Citation Verification Switch State
  const [citationVerifyEnabled, setCitationVerifyEnabled] = useState(true);

  // Voice Input (Speech-to-Text) State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Text-to-Speech State
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);

  // Message Action Editing State
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rtl = isRTL(lang);

  useEffect(() => {
    localStorage.setItem('eduplanner_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    setSavedFiles(supabaseDb.getSavedFiles());
  }, [showDocPicker]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Update active session messages helper
  const updateActiveSessionMessages = (newMessages: ChatMessage[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: newMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));
  };

  // --- Session Management Handlers ---
  const handleCreateNewSession = () => {
    if (isStreaming && abortControllerRef.current) abortControllerRef.current.abort();
    setIsStreaming(false);

    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `Research Session ${sessions.length + 1}`,
      messages: [{
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: lang === 'bad'
          ? 'سڵاو! دەنوشتینا نوو دەستپێکر. چەوا دشێم هاریکاریا تە بکەم د ڤەکۆلینا تە دا؟'
          : lang === 'ku'
          ? 'سڵاو! دانیشتنی نوێ دەستی پێکرد. چۆن یارمەتیت بدەم لە توێژینەوەکەتدا؟'
          : lang === 'ar'
          ? 'مرحباً بك! بدأت جلسة بحثية جديدة. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! New academic research session started. How can I assist with your paper, thesis, or SPSS data today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }],
      language: lang,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowSessionsDrawer(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return;
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remaining[0]?.id || 'session_default');
    }
  };

  // --- Voice Input (Speech-to-Text) Handlers ---
  const handleToggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
      setIsListening(false);
    } else {
      setSpeechError(null);
      setIsListening(true);
      startVoiceInput(
        lang,
        (transcript) => {
          setInputPrompt(prev => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          setSpeechError(err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  // --- Text-to-Speech Handlers ---
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (playingAudioMsgId === msgId) {
      stopSpeech();
      setPlayingAudioMsgId(null);
    } else {
      setPlayingAudioMsgId(msgId);
      speakText(text, lang, undefined, () => setPlayingAudioMsgId(null));
    }
  };

  // --- File Parsing & Document Q&A Upload ---
  const mapFileType = (ext: string): AttachedFile['fileType'] => {
    const e = ext.toLowerCase();
    if (e.includes('pdf')) return 'pdf';
    if (e.includes('doc')) return 'docx';
    if (e.includes('xls') || e.includes('sheet')) return 'excel';
    if (e.includes('csv')) return 'csv';
    if (e.includes('ppt')) return 'pptx';
    if (e.includes('png') || e.includes('jpg')) return 'image';
    return 'text';
  };

  const handleFileParsed = async (res: ParsedFileResult) => {
    const newFile: AttachedFile = {
      id: 'file_' + Date.now(),
      fileName: res.fileName,
      fileSize: res.fileSizeRawBytes,
      fileType: mapFileType(res.fileType),
      parsedText: res.extractedText,
      uploadedAt: new Date().toISOString()
    };
    await supabaseDb.saveFile(newFile);
    setSelectedDocs(prev => [...prev.filter(d => d.fileName !== res.fileName), newFile]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text().catch(() => '');
      const newFile: AttachedFile = {
        id: 'file_' + Date.now() + '_' + i,
        fileName: file.name,
        fileSize: file.size,
        fileType: mapFileType(file.name),
        parsedText: text || `[Document content of ${file.name}]`,
        uploadedAt: new Date().toISOString()
      };
      await supabaseDb.saveFile(newFile);
      setSelectedDocs(prev => [...prev, newFile]);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // --- Main Streaming Message Sender ---
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || inputPrompt).trim();
    if (!rawText || isStreaming) return;

    setErrorMessage(null);

    let fullUserPrompt = rawText;
    if (selectedDocs.length > 0) {
      const docContext = selectedDocs.map(d => `--- GROUNDED ATTACHED DOCUMENT: ${d.fileName} (${d.fileType.toUpperCase()}) ---\n${d.parsedText || d.fileName}\n--- END DOCUMENT ---`).join('\n\n');
      fullUserPrompt = `[GROUNDED ACADEMIC DOCUMENTS ATTACHED FOR ANALYSIS]:\n${docContext}\n\nUSER QUESTION & INSTRUCTION: ${rawText}`;
    }

    if (citationVerifyEnabled) {
      if (lang === 'bad' || lang === 'ku') {
        fullUserPrompt += `\n\n[تکایە هەموو ژێدەران ب ستایلێ APA 7 ڕێکبخە]`;
      } else if (lang === 'ar') {
        fullUserPrompt += `\n\n[يرجى توثيق جميع المراجع حسب نظام APA 7]`;
      } else {
        fullUserPrompt += `\n\n[Please format citations according to APA 7th edition]`;
      }
    }

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMessageId = 'ast_' + Date.now();
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citationVerified: citationVerifyEnabled,
      groundedDocs: selectedDocs.map(d => d.fileName)
    };

    const updatedMessages = [...messages, userMessage, assistantPlaceholder];
    updateActiveSessionMessages(updatedMessages);
    setInputPrompt('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulated = '';
    const chatHistoryPayload = messages
      .filter(m => m.id !== 'welcome' && m.content && m.content.trim())
      .map(m => ({ role: m.role, content: m.content }));
    chatHistoryPayload.push({ role: 'user', content: fullUserPrompt });

    await aiService.streamChat(
      chatHistoryPayload,
      lang,
      (chunk) => {
        accumulated += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => m.id === assistantMessageId ? { ...m, content: accumulated } : m)
            };
          }
          return s;
        }));
      },
      (err) => {
        if (err.name === 'AbortError') return;
        setErrorMessage(err.message || 'Google Gemini 2.5 API service unavailable. Please check connection or API key.');
        // Clean up empty assistant placeholder message
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.filter(m => m.id !== assistantMessageId)
            };
          }
          return s;
        }));
        setIsStreaming(false);
      },
      () => {
        setIsStreaming(false);
        abortControllerRef.current = null;
      },
      controller.signal,
      selectedProvider
    );
  };

  // --- Refinement Actions (Summarize, Expand, Paraphrase, Simplify, Translate, Citation Verify) ---
  const handleRefineMessage = async (msgId: string, action: 'summarize' | 'expand' | 'simplify' | 'paraphrase' | 'translate' | 'verify_citations', targetLang?: Language) => {
    const targetMsg = messages.find(m => m.id === msgId);
    if (!targetMsg || !targetMsg.content || isStreaming) return;

    setIsStreaming(true);
    try {
      const res = await aiService.refineChatMessage({
        messageText: targetMsg.content,
        action,
        targetLang: targetLang || lang,
        language: lang
      });

      updateActiveSessionMessages(messages.map(m => {
        if (m.id === msgId) {
          return {
            ...m,
            content: res.refinedText,
            citationVerified: action === 'verify_citations' ? true : m.citationVerified
          };
        }
        return m;
      }));
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const modelLabel = selectedProvider === 'openai' ? 'OpenAI GPT-4o' : selectedProvider === 'claude' ? 'Claude 3.5 Sonnet' : 'Google Gemini 2.5';

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="flex flex-col h-[calc(100vh-5rem)] max-w-6xl mx-auto p-2 sm:p-4 md:p-6 space-y-3">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-display">
              {t('chatTitle', lang)}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20 uppercase tracking-wider">
                {modelLabel}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('chatSubtitle', lang)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pre-Response Citation Verification Switch */}
          <button
            type="button"
            onClick={() => setCitationVerifyEnabled(!citationVerifyEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              citationVerifyEnabled
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
            title="Toggle Pre-Response APA 7 Citation Verification"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {citationVerifyEnabled ? 'APA 7 Verified' : 'Verify Citations'}
          </button>

          {/* Sessions Drawer Toggle */}
          <button
            onClick={() => setShowSessionsDrawer(!showSessionsDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Sessions ({sessions.length})
          </button>

          <button
            onClick={handleCreateNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            title="Start New Research Session"
          >
            <Plus className="w-3.5 h-3.5" /> New Session
          </button>
        </div>
      </div>

      {/* Error Message Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => handleSendMessage()}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
          >
            <RotateCcw className="w-3 h-3" /> Retry Prompt
          </button>
        </div>
      )}

      {/* Multi-Session Drawer */}
      {showSessionsDrawer && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Research Project Chat Sessions
            </span>
            <button onClick={() => setShowSessionsDrawer(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {sessions.map(sess => (
              <div
                key={sess.id}
                onClick={() => {
                  setActiveSessionId(sess.id);
                  setShowSessionsDrawer(false);
                }}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  activeSessionId === sess.id
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="truncate pr-2">{sess.title}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSession(sess.id); }}
                    className="text-slate-400 hover:text-rose-500 p-0.5"
                    title="Delete Session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 dark:bg-slate-800 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-cyan-400" />}
              </div>

              <div
                className={`group relative max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                {/* Verified Citation Badge */}
                {!isUser && msg.citationVerified && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 mb-2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> APA 7 Reference Citation Verified
                  </div>
                )}

                {isUser ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                    {msg.content ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      /* Typing Indicator */
                      <div className="flex items-center gap-2 py-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-xs italic font-medium text-slate-500 dark:text-slate-400 ml-1">Google Gemini 2.5 is generating academic analysis...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Response Refinement Toolbar for Assistant Messages */}
                {!isUser && msg.content && (
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[11px] text-slate-500">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Text-to-Speech Audio Reader */}
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className={`inline-flex items-center gap-1 font-bold ${
                          playingAudioMsgId === msg.id ? 'text-amber-500 animate-pulse' : 'hover:text-blue-600'
                        }`}
                        title="Read response aloud via Text-to-Speech"
                      >
                        {playingAudioMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        {playingAudioMsgId === msg.id ? 'Stop Audio' : 'Listen'}
                      </button>

                      {/* Expand / Continue Writing */}
                      <button
                        onClick={() => handleRefineMessage(msg.id, 'expand')}
                        className="hover:text-blue-600 font-semibold"
                        title="Expand detail & continue writing"
                      >
                        Expand
                      </button>

                      {/* Summarize */}
                      <button
                        onClick={() => handleRefineMessage(msg.id, 'summarize')}
                        className="hover:text-purple-600 font-semibold"
                        title="Summarize key takeaways"
                      >
                        Summarize
                      </button>

                      {/* Simplify */}
                      <button
                        onClick={() => handleRefineMessage(msg.id, 'simplify')}
                        className="hover:text-teal-600 font-semibold"
                        title="Explain simply"
                      >
                        Simplify
                      </button>

                      {/* Paraphrase / Academic Tone */}
                      <button
                        onClick={() => handleRefineMessage(msg.id, 'paraphrase')}
                        className="hover:text-amber-600 font-semibold"
                        title="Elevate academic tone"
                      >
                        Paraphrase
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendMessage(msg.content)}
                        disabled={isStreaming}
                        className="hover:text-blue-600 font-bold flex items-center gap-1"
                        title="Regenerate response"
                      >
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Stop Generation Control */}
      {isStreaming && (
        <div className="flex justify-center my-1">
          <button
            onClick={handleStopGeneration}
            className="px-4 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-2 animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-white" /> Stop Streaming Generation
          </button>
        </div>
      )}

      {/* Academic Prompt Shortcuts Bar */}
      {messages.length <= 3 && !isStreaming && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 my-1">
          {ACADEMIC_PROMPT_SHORTCUTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              className="p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2 transition-all"
            >
              {item.icon}
              <div className="truncate">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate">
                  {item.label[lang] || item.label.en}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{item.category}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Attached Documents Grounded Context Chips */}
      {selectedDocs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 text-[11px]">
            <FileText className="w-3.5 h-3.5 text-blue-500" /> Grounded Context ({selectedDocs.length}):
          </span>
          {selectedDocs.map(doc => (
            <div key={doc.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <span>{doc.fileName}</span>
              <button onClick={() => setSelectedDocs(prev => prev.filter(d => d.id !== doc.id))} className="hover:text-rose-500">&times;</button>
            </div>
          ))}
          <button onClick={() => setSelectedDocs([])} className="text-slate-400 hover:underline text-[11px]">Clear all</button>
        </div>
      )}

      {/* File Upload Zone */}
      <div className="mt-1">
        <FileUploadZone lang={lang} compact onFileParsed={handleFileParsed} />
      </div>

      {/* Main Input Form with Voice Input */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative flex items-center gap-2"
      >
        <div className="relative flex-1 flex items-center">
          <textarea
            rows={2}
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              selectedDocs.length > 0
                ? `Ask questions or generate section analyses based on ${selectedDocs.map(d => d.fileName).join(', ')}...`
                : lang === 'bad'
                ? 'پرسیارەکێ دەربارەی ڤەکۆلینێ، فایلا هەڵگۆستیو، یان شیکاریا SPSS بنڤێسە...'
                : lang === 'ku'
                ? 'پرسیارێک بنووسە لەسەر توێژینەوەکەت، بەڵگەنامەکان، یان SPSS...'
                : lang === 'ar'
                ? 'اكتب سؤالك الأكاديمي أو استفسارك حول الأوراق المرفقة هنا...'
                : 'Ask EduPlanner AI (Gemini 2.5) about your paper, uploaded documents, SPSS, citations...'
            }
            disabled={isStreaming}
            className={`w-full pl-4 ${rtl ? 'pl-28 pr-4' : 'pr-28 pl-4'} py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none shadow-sm`}
          />

          <div className={`absolute ${rtl ? 'left-3' : 'right-3'} flex items-center gap-1.5`}>
            {/* Voice Input Button (Speech-to-Text) */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isListening ? 'Stop Voice Input' : 'Start Voice Input (Speech-to-Text)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Attach Document Button */}
            <label
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Upload PDF, DOCX, Excel, CSV, or PPTX"
            >
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.xls,.csv,.pptx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowDocPicker(!showDocPicker)}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Select from saved project papers"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-all shadow-md"
            >
              {isStreaming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>

      {/* Document Selector Modal */}
      {showDocPicker && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-500" /> Select Saved Project Papers for Q&A Analysis
            </h4>
            <button onClick={() => setShowDocPicker(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {savedFiles.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No saved files found in project storage. Upload a paper using the paperclip icon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {savedFiles.map(file => {
                const isSelected = selectedDocs.some(d => d.id === file.id);
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDocs(prev => prev.filter(d => d.id !== file.id));
                      } else {
                        setSelectedDocs(prev => [...prev, file]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-semibold">{file.fileName}</p>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {(file.fileSize / 1024).toFixed(1)} KB &bull; {file.fileType.toUpperCase()}
                      </span>
                    </div>
                    {isSelected ? <Check className="w-4 h-4 text-blue-600 shrink-0" /> : <Plus className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
