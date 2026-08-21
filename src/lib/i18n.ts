import { Language } from '../types';

export const isRTL = (lang: Language): boolean => lang === 'ku' || lang === 'bad' || lang === 'ar';

export interface Translations {
  appName: string;
  appDescription: string;
  navDashboard: string;
  navChat: string;
  navResearch: string;
  navLitReview: string;
  navProposal: string;
  navThesis: string;
  navWriting: string;
  navReport: string;
  navSeminar: string;
  navSpss: string;
  navDataAnalysis: string;
  navCitation: string;
  navTranslation: string;
  navSearch: string;
  navPlagiarism: string;
  navCollaboration: string;
  navAdmin: string;
  
  // Hero Banner Keys
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroStartResearch: string;
  heroAnalyzeSpss: string;
  heroCreateSeminar: string;
  heroGenerateReport: string;
  heroAskPlaceholder: string;
  heroAskButton: string;
  
  // Common
  generate: string;
  generating: string;
  exportWord: string;
  exportPdf: string;
  exportPptx: string;
  downloading: string;
  copyText: string;
  copied: string;
  reset: string;
  clear: string;
  sampleData: string;
  language: string;
  darkMode: string;
  lightMode: string;
  quickActions: string;
  recentProjects: string;
  noProjectsYet: string;
  topic: string;
  field: string;
  languageSelect: string;
  wordCountLabel: string;
  
  // File Upload Keys
  uploadZoneTitle: string;
  uploadZoneSubtitle: string;
  dragDropHint: string;
  browseFiles: string;
  parsingFile: string;
  fileParsedSuccess: string;
  fileParseError: string;
  clearFile: string;
  citationStyleLabel: string;
  keywordsLabel: string;
  
  // Research Generator
  researchTitle: string;
  researchSubtitle: string;
  paperType: string;
  empirical: string;
  literatureReview: string;
  caseStudy: string;
  methodological: string;
  theoretical: string;
  abstract: string;
  apa7Formatting: string;
  references: string;
  
  // Report Generator
  reportTitle: string;
  reportSubtitle: string;
  audience: string;
  organization: string;
  domain: string;
  tone: string;
  includeCharts: string;
  keyFocus: string;
  executiveSummary: string;
  keyFindings: string;
  dataTables: string;
  detailedAnalysis: string;
  recommendations: string;
  riskAssessment: string;
  
  // Seminar Generator
  seminarTitle: string;
  seminarSubtitle: string;
  slideCount: string;
  durationMinutes: string;
  keySubtopics: string;
  presentationMode: string;
  speakerNotes: string;
  visualSuggestion: string;
  qAndAPrompts: string;
  prevSlide: string;
  nextSlide: string;
  slideOf: string;
  
  // SPSS
  spssTitle: string;
  spssSubtitle: string;
  uploadFile: string;
  uploadHint: string;
  datasetPreview: string;
  rowsCount: string;
  colsCount: string;
  analysisType: string;
  descriptiveStats: string;
  correlationMatrix: string;
  linearRegression: string;
  anovaTest: string;
  selectVariables: string;
  dependentVar: string;
  independentVars: string;
  groupingVar: string;
  runAnalysis: string;
  aiScholarlyInterpretation: string;
  apa7ReportingText: string;
  hypothesisDecision: string;
  statisticalSummary: string;
  mean: string;
  stdDev: string;
  median: string;
  variance: string;
  minMax: string;
  skewness: string;
  kurtosis: string;
  rSquared: string;
  fStatistic: string;
  pValue: string;
  dataVisualizer: string;
  dataVisualizerSubtitle: string;
  chartType: string;
  barChart: string;
  lineChart: string;
  pieChart: string;
  scatterPlot: string;
  xAxisVar: string;
  yAxisVar: string;
  statChartsTitle: string;
  
  // Goal-Driven Research Analysis Keys
  goalDrivenAnalysisTitle: string;
  goalDrivenAnalysisSubtitle: string;
  researchObjectivesLabel: string;
  researchObjectivesPlaceholder: string;
  goalDrivenToggleLabel: string;
  generalFindingsTab: string;
  goalDrivenTab: string;
  objectiveHeader: string;
  statusHeader: string;
  evidenceHeader: string;
  interpretationHeader: string;
  apaThesisHeader: string;
  
  // Quick Actions Dashboard Keys
  chatTitle: string;
  chatSubtitle: string;
  litReviewTitle: string;
  litReviewSubtitle: string;
  proposalTitle: string;
  proposalSubtitle: string;
  thesisTitle: string;
  thesisSubtitle: string;
  citationTitle: string;
  citationSubtitle: string;
  translationTitle: string;
  translationSubtitle: string;

  // Nav Group Titles
  navGroupGeneral: string;
  navGroupResearch: string;
  navGroupWriting: string;
  navGroupDataAnalysis: string;
  navGroupEducation: string;
  navGroupAiTools: string;
  navGroupSettings: string;

  // Generator Shared Form Labels & Buttons
  coreResearchTitle: string;
  academicField: string;
  academicLevelLabel: string;
  synthesisDepth: string;
  citationFormatLabel: string;
  outputLanguageLabel: string;
  optionalResearchQuestions: string;
  optionalResearchObjectives: string;
  academicSourcesHub: string;
  searchScholar: string;
  addAbstractMetadata: string;
  generateLitReviewBtn: string;
  generateResearchBtn: string;
  generateProposalBtn: string;
  generateThesisBtn: string;
  workspaceTitle: string;
  litReviewWorkspaceTitle: string;
  papersQueued: string;

  // Banner Titles, Taglines & Descriptions
  litReviewSuiteTagline: string;
  litReviewWorkspaceDesc: string;
  researchSuiteTagline: string;
  researchWorkspaceTitle: string;
  researchWorkspaceDesc: string;
  proposalSuiteTagline: string;
  proposalWorkspaceTitle: string;
  proposalWorkspaceDesc: string;
  thesisSuiteTagline: string;
  thesisWorkspaceTitle: string;
  thesisWorkspaceDesc: string;

  // Academic Search Engine Keys
  searchEngineTitle: string;
  searchEngineSubtitle: string;
  personalLibrary: string;
  searchPlaceholder: string;
  searchPapersBtn: string;
  academicSearchFilters: string;
  openAccessPdfOnly: string;
  sortByRelevance: string;
  sortByNewest: string;
  sortByMostCited: string;
  yearRange: string;
  authorNameLabel: string;
  journalPublisherLabel: string;
  subjectFieldLabel: string;
  viewPaperBtn: string;
  pdfNotAvailableBtn: string;
  summarizeBtn: string;
  citeBtn: string;
  readFullAbstractBtn: string;
  showLessBtn: string;
  savePaperBtn: string;
  savedPaperBtn: string;
  copyBtn: string;
  copiedBtn: string;

  // AI Writing Assistant Keys
  writingAssistantSuiteTagline: string;
  writingAssistantTitle: string;
  writingAssistantDesc: string;
  citationPreservedTitle: string;
  citationPreservedDesc: string;
  writingToneRegister: string;
  selectTransformationTool: string;
  originalManuscriptText: string;
  sourceDocument: string;
  improvedAcademicOutput: string;
  refinedCopy: string;
  summaryOfAiEnhancements: string;
  writingDisclaimerTitle: string;
  writingDisclaimerDesc: string;
  aiGenerationEngine: string;
  customDirectivesLabel: string;
  customDirectivesPlaceholder: string;
  researchSetupTitle: string;
  researchSetupDesc: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'EduPlanner AI',
    appDescription: 'AI Academic Research, Professional Reports, Seminar Slides & SPSS Analyzer',
    navDashboard: 'Dashboard',
    navChat: 'AI Research Assistant',
    navResearch: 'AI Research Paper',
    navLitReview: 'Literature Review',
    navProposal: 'Research Proposal',
    navThesis: 'Thesis Architect',
    navWriting: 'AI Writing Assistant',
    navReport: 'AI Report Generator',
    navSeminar: 'AI Seminar Generator',
    navSpss: 'SPSS Data Analysis',
    navDataAnalysis: 'Data Analysis',
    navCitation: 'Citation Formatter',
    navTranslation: 'Academic Translation',
    navSearch: 'AI Academic Search & DOI',
    navPlagiarism: 'Plagiarism & AI Detector',
    navCollaboration: 'Collaboration & Team',
    navAdmin: 'Admin & Analytics',
    
    heroTagline: 'Plan Smarter • Research Faster • Learn Better',
    heroTitle: 'EduPlanner AI',
    heroSubtitle: 'The premier AI platform for Academic Research, SPSS Data Analysis, Literature Review, Thesis Writing, APA 7 Citations & Seminar Presentations.',
    heroStartResearch: 'Start Research',
    heroAnalyzeSpss: 'Analyze SPSS',
    heroCreateSeminar: 'Create Seminar',
    heroGenerateReport: 'Generate Report',
    heroAskPlaceholder: 'Ask EduPlanner AI assistant (e.g. "Synthesize literature review for microgrids", "Explain ANOVA output")...',
    heroAskButton: 'Ask AI',
    
    generate: 'Generate with AI',
    generating: 'Generating Content...',
    exportWord: 'Export to Word (.docx)',
    exportPdf: 'Export to PDF',
    exportPptx: 'Export PowerPoint (.pptx)',
    downloading: 'Exporting...',
    copyText: 'Copy Text',
    copied: 'Copied!',
    reset: 'Reset',
    clear: 'Clear',
    sampleData: 'Load Sample Dataset',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    quickActions: 'Quick Generators',
    recentProjects: 'Recent History & Drafts',
    noProjectsYet: 'No saved items yet. Start by generating a paper, report, seminar, or SPSS analysis!',
    topic: 'Topic / Title',
    field: 'Academic Field / Domain',
    languageSelect: 'Output Language',
    wordCountLabel: 'Target Length (Words)',
    
    // File Upload Keys
    uploadZoneTitle: 'Document & Dataset Upload',
    uploadZoneSubtitle: 'Support for PDF, Word (.docx), Excel (.xlsx, .xls), and CSV (.csv)',
    dragDropHint: 'Drag & drop your document or dataset here, or click to browse',
    browseFiles: 'Browse Files',
    parsingFile: 'Extracting document text and dataset rows...',
    fileParsedSuccess: 'File parsed successfully!',
    fileParseError: 'Error parsing file. Please verify format.',
    clearFile: 'Clear File',
    
    citationStyleLabel: 'Citation Style',
    keywordsLabel: 'Keywords (Comma Separated)',
    
    researchTitle: 'Academic Research Generator',
    researchSubtitle: 'Generate fully formatted academic research papers with APA 7 citations and references',
    paperType: 'Paper Type',
    empirical: 'Empirical Study',
    literatureReview: 'Systematic Literature Review',
    caseStudy: 'Case Study Analysis',
    methodological: 'Methodological Paper',
    theoretical: 'Theoretical / Conceptual Paper',
    abstract: 'Abstract',
    apa7Formatting: 'APA 7th Edition Standard Format',
    references: 'References & Citations',
    
    reportTitle: 'Professional Report Generator',
    reportSubtitle: 'Create executive reports complete with findings, recommendations, charts, and tables',
    audience: 'Target Audience',
    organization: 'Organization / Institution',
    domain: 'Industry / Domain',
    tone: 'Tone of Report',
    includeCharts: 'Generate Visual Charts & Data Tables',
    keyFocus: 'Key Objectives & Scope',
    executiveSummary: 'Executive Summary',
    keyFindings: 'Key Findings',
    dataTables: 'Analytical Data Tables',
    detailedAnalysis: 'Detailed Sectional Analysis',
    recommendations: 'Strategic Recommendations',
    riskAssessment: 'Risk & Limitations Assessment',
    
    seminarTitle: 'AI Seminar & Presentation Generator',
    seminarSubtitle: 'Produce presentation slides, speaker notes, and PowerPoint files automatically',
    slideCount: 'Number of Slides',
    durationMinutes: 'Duration (Minutes)',
    keySubtopics: 'Key Subtopics / Modules',
    presentationMode: 'Interactive Slide Show',
    speakerNotes: 'Speaker Notes',
    visualSuggestion: 'Slide Visual & Graphic Suggestion',
    qAndAPrompts: 'Anticipated Q&A & Answers',
    prevSlide: 'Previous',
    nextSlide: 'Next',
    slideOf: 'Slide',
    
    spssTitle: 'SPSS Statistical Analysis & AI Interpretation',
    spssSubtitle: 'Upload Excel or CSV data to compute precise statistics and generate APA scholarly insights',
    uploadFile: 'Upload CSV or Excel Dataset (.csv, .xlsx, .xls)',
    uploadHint: 'Drag and drop your statistical data file here, or click to browse files',
    datasetPreview: 'Dataset Preview',
    rowsCount: 'Rows',
    colsCount: 'Columns',
    analysisType: 'Select Statistical Analysis',
    descriptiveStats: 'Descriptive Statistics (Mean, SD, Skewness, Kurtosis)',
    correlationMatrix: 'Pearson & Spearman Correlation Matrix',
    linearRegression: 'Linear Regression Analysis (OLS)',
    anovaTest: 'One-Way ANOVA & T-Test',
    selectVariables: 'Variable Selection',
    dependentVar: 'Dependent Variable (Y)',
    independentVars: 'Independent Variables (X)',
    groupingVar: 'Grouping Variable (Categorical Factor)',
    runAnalysis: 'Run Statistical Calculation & AI Writeup',
    aiScholarlyInterpretation: 'Scholarly SPSS Interpretation & Discussion',
    apa7ReportingText: 'APA 7 Statistical Reporting Statement',
    hypothesisDecision: 'Hypothesis Testing & Decisions',
    statisticalSummary: 'Statistical Summary Tables',
    mean: 'Mean',
    stdDev: 'Std. Deviation',
    median: 'Median',
    variance: 'Variance',
    minMax: 'Min / Max',
    skewness: 'Skewness',
    kurtosis: 'Kurtosis',
    rSquared: 'R-Squared (R²)',
    fStatistic: 'F-Statistic',
    pValue: 'p-Value (Sig.)',
    dataVisualizer: 'Interactive Data Visualizer',
    dataVisualizerSubtitle: 'Dynamically render interactive Bar, Line, Pie, and Scatter plots for any dataset variable',
    chartType: 'Chart Type',
    barChart: 'Bar Chart',
    lineChart: 'Line Chart',
    pieChart: 'Pie Chart',
    scatterPlot: 'Scatter Plot',
    xAxisVar: 'Category / X-Axis Variable',
    yAxisVar: 'Metric / Y-Axis Variable',
    statChartsTitle: 'Interactive Statistical Charts & Data Distributions',
    goalDrivenAnalysisTitle: 'Goal-Driven Research Analysis',
    goalDrivenAnalysisSubtitle: 'Map statistical outputs (regressions, correlations, t-tests) directly to answer your specific research objectives and hypotheses',
    researchObjectivesLabel: 'Research Objectives & Hypotheses (Optional)',
    researchObjectivesPlaceholder: 'Enter your specific research objectives or hypotheses (e.g., "RO1: To determine the impact of social media on student productivity", "H1: Study hours positively predict exam performance")...',
    goalDrivenToggleLabel: 'Goal-Driven Research Alignment',
    generalFindingsTab: 'General Statistical Findings',
    goalDrivenTab: 'Goal-Driven Breakdown',
    objectiveHeader: 'Research Objective / Hypothesis',
    statusHeader: 'Hypothesis Status',
    evidenceHeader: 'Statistical Evidence',
    interpretationHeader: 'Academic Interpretation',
    apaThesisHeader: 'APA 7 Thesis Integration Statement',
    chatTitle: 'AI Research Assistant',
    chatSubtitle: 'Interactive chat for brainstorming, methodologies, and academic queries',
    litReviewTitle: 'Literature Review',
    litReviewSubtitle: 'Synthesize empirical papers into thematic matrices and identify research gaps',
    proposalTitle: 'Research Proposal',
    proposalSubtitle: 'Architect M.Sc, Ph.D, or Capstone proposals with problem statements and design',
    thesisTitle: 'Thesis Architect',
    thesisSubtitle: 'Comprehensive structural framework and chapter-by-chapter outline generator',
    citationTitle: 'Citation Formatter',
    citationSubtitle: 'Format sources into flawless APA 7, MLA, Chicago, and Harvard standards',
    translationTitle: 'Academic Translation',
    translationSubtitle: 'Translate scholarly texts preserving academic register and domain terminology',

    navGroupGeneral: 'General',
    navGroupResearch: 'Research',
    navGroupWriting: 'Writing',
    navGroupDataAnalysis: 'Data Analysis & SPSS',
    navGroupEducation: 'Education',
    navGroupAiTools: 'AI Tools',
    navGroupSettings: 'Settings & Team',

    coreResearchTitle: 'Core Research Title / Topic *',
    academicField: 'Academic Field / Discipline',
    academicLevelLabel: 'Academic Level',
    synthesisDepth: 'Synthesis Depth & Length',
    citationFormatLabel: 'Citation Format',
    outputLanguageLabel: 'Output Language (100% Lock)',
    optionalResearchQuestions: 'Optional Research Questions',
    optionalResearchObjectives: 'Optional Research Objectives',
    academicSourcesHub: 'Academic Sources Hub',
    searchScholar: 'Search Scholar / CrossRef',
    addAbstractMetadata: 'Add Abstract Metadata',
    generateLitReviewBtn: 'Generate Academic Literature Review',
    generateResearchBtn: 'Generate Academic Research Paper',
    generateProposalBtn: 'Generate Research Proposal',
    generateThesisBtn: 'Generate Thesis Architecture',
    workspaceTitle: 'Academic Research Paper Workspace',
    litReviewWorkspaceTitle: 'Literature Review, Gap & Methodology Workspace',
    papersQueued: 'Papers Queued',

    litReviewSuiteTagline: 'Academic Systematic Literature Review & Methodology Suite',
    litReviewWorkspaceDesc: 'Generate continuous academic paragraphs with clickable in-text citations, verified APA 7 references, evidence-based Research Gap, and complete Academic Methodology chapter.',
    researchSuiteTagline: 'EduPlanner AI Research Paper Suite',
    researchWorkspaceTitle: 'AI Academic Research Paper Generator',
    researchWorkspaceDesc: 'Generate peer-reviewed quality doctoral research papers, master thesis chapters, and journal manuscripts with 100% single-language consistency and zero fake statistics.',
    proposalSuiteTagline: 'Academic & Research Proposal Suite',
    proposalWorkspaceTitle: 'Research Proposal Generator & Alignment Engine',
    proposalWorkspaceDesc: 'Build exhaustive, 22-section academic research proposals reusing your verified literature, gap analysis, questions, and methodology.',
    thesisSuiteTagline: 'Thesis Architecture & Defense Suite',
    thesisWorkspaceTitle: 'Master & PhD Thesis Architecture Generator',
    thesisWorkspaceDesc: 'Formulate thesis statements, structure chapters, draft outlines, and prepare defense committee Q&A.',

    searchEngineTitle: 'Google Scholar Search Engine',
    searchEngineSubtitle: 'Search millions of peer-reviewed papers across Google Scholar, CrossRef, PubMed, OpenAlex, and IEEE.',
    personalLibrary: 'Personal Library',
    searchPlaceholder: 'Search papers by Title, Author, Keyword, DOI, or Topic...',
    searchPapersBtn: 'Search Papers',
    academicSearchFilters: 'Academic Search Filters',
    openAccessPdfOnly: 'Open Access PDF Only',
    sortByRelevance: 'Sort by Relevance',
    sortByNewest: 'Sort by Newest',
    sortByMostCited: 'Sort by Most Cited',
    yearRange: 'Year Range',
    authorNameLabel: 'Author Name',
    journalPublisherLabel: 'Journal / Publisher',
    subjectFieldLabel: 'Subject Field',
    viewPaperBtn: 'View Paper',
    pdfNotAvailableBtn: 'Download PDF',
    summarizeBtn: 'Summarize',
    citeBtn: 'Cite',
    readFullAbstractBtn: 'Read full abstract',
    showLessBtn: 'Show less',
    savePaperBtn: 'Save',
    savedPaperBtn: 'Saved',
    copyBtn: 'Copy',
    copiedBtn: 'Copied!',

    writingAssistantSuiteTagline: 'AI Academic Writing & Style Workbench',
    writingAssistantTitle: 'AI Academic Writing Assistant',
    writingAssistantDesc: 'Paraphrase manuscript paragraphs, enhance academic clarity, elevate peer-reviewed style, and compare side-by-side versions while strictly preserving citations, DOI links, and empirical facts.',
    citationPreservedTitle: 'Citation & Meaning Preserved',
    citationPreservedDesc: 'Factual claims, citations, DOI links, references, and specialized terminology are strictly retained.',
    writingToneRegister: 'Writing Tone & Register:',
    selectTransformationTool: 'Select Transformation Tool:',
    originalManuscriptText: 'ORIGINAL MANUSCRIPT TEXT',
    sourceDocument: 'Source Document',
    improvedAcademicOutput: 'IMPROVED ACADEMIC OUTPUT',
    refinedCopy: 'Refined Copy',
    summaryOfAiEnhancements: 'Summary of AI Enhancements:',
    writingDisclaimerTitle: 'AI Writing Assistant Transparency Disclaimer',
    writingDisclaimerDesc: 'This tool enhances sentence clarity, vocabulary precision, and academic tone while preserving factual claims and citations. It does NOT claim to bypass AI detectors or guarantee that AI-generated text will not be flagged. Use this assistant responsibly to polish your original scholarly research.',
    aiGenerationEngine: 'AI Generation Engine',
    customDirectivesLabel: 'Custom Research Directives',
    customDirectivesPlaceholder: 'Add specific research questions, theoretical framework guidelines, or institutional requirements...',
    researchSetupTitle: 'Research Parameters & Setup',
    researchSetupDesc: 'Specify academic parameters, language, and target page length.',
  },
  ku: {
    appName: 'EduPlanner AI',
    appDescription: 'سیستەمی ژیری دەستکرد بۆ توێژینەوەی ئەکادیمی، ڕاپۆرت، سێمینار و شیکاری SPSS',
    navDashboard: 'داشبۆرد',
    navChat: 'یارمەتیدەری ژیری دەستکرد',
    navResearch: 'توێژینەوەی ئەکادیمی',
    navLitReview: 'پێداچوونەوەی ئەدەبیات',
    navProposal: 'پێشنیازی توێژینەوە',
    navThesis: 'دارێژەری تێز',
    navWriting: 'یاوەرێ نوسینی AI',
    navReport: 'دروستکەری ڕاپۆرت',
    navSeminar: 'دروستکەری سێمینار',
    navSpss: 'شیکاری SPSS',
    navDataAnalysis: 'شیکردنەوەی داتا',
    navCitation: 'داڕێژەری ژێدەر',
    navTranslation: 'وەرگێڕانی زانستی',
    navSearch: 'گەڕانی زانستی AI',
    navPlagiarism: 'پشکنینی ڕەسەنایەتی و AI',
    navCollaboration: 'هاوکاری و تیمی کار',
    navAdmin: 'بەڕێوەبردن و ئاماری سیستەم',
    
    heroTagline: 'پلاندانانی زیرەکانەتر • توێژینەوەی خێراتر • فێربوونی باشتر',
    heroTitle: 'EduPlanner AI',
    heroSubtitle: 'پلاتفۆرمی پێشەنگی ژیریی دەستکرد بۆ توێژینەوەی ئەکادیمی، شیکاریی ئاماریی SPSS، پێداچوونەوەی ئەدەبیات، داڕشتنی تێز و سێمینار.',
    heroStartResearch: 'دەستپێکردنی توێژینەوە',
    heroAnalyzeSpss: 'شیکاریی SPSS',
    heroCreateSeminar: 'دروستکردنی سێمینار',
    heroGenerateReport: 'دروستکردنی ڕاپۆرت',
    heroAskPlaceholder: 'پرسیار لە یاریدەدەری AI بکە (بۆ نموونە: "پێداچوونەوەی ئەدەبیات بۆ توێژینەوەکەم ئامادە بکە")...',
    heroAskButton: 'پرسیارکردن لە AI',
    
    generate: 'دروستکردن بە AI',
    generating: 'لەپڕۆسەی دروستکردندایە...',
    exportWord: 'داگرتن بۆ وۆرد (.docx)',
    exportPdf: 'داگرتن بۆ پی دی ئێف',
    exportPptx: 'داگرتن بۆ پاوەرپۆینت (.pptx)',
    downloading: 'لەپڕۆسەی داگرتندایە...',
    copyText: 'کۆپیکردنی دەق',
    copied: 'کۆپی کرا!',
    reset: 'ڕێکخستنەوە',
    clear: 'سڕینەوە',
    sampleData: 'بارکردنی داتای نموونەیی',
    language: 'زمان',
    darkMode: 'دۆخی تاریک',
    lightMode: 'دۆخی ڕووناک',
    quickActions: 'دروستکەرە خێراکان',
    recentProjects: 'مێژووی پڕۆژەکان و ڕەشنووسەکان',
    noProjectsYet: 'هیچ ئەنجامێک پاشەکەوت نەکراوە. دەستپێبکە بە دروستکردنی توێژینەوە، ڕاپۆرت، سێمینار یان شیکاری داتا!',
    topic: 'بابەت / سەردێڕ',
    field: 'بواری ئەکادیمی / پسپۆڕی',
    languageSelect: 'زمانی ئەنجام',
    wordCountLabel: 'ژمارەی وشەی ئامانج',
    
    uploadZoneTitle: 'بارکردنی فایلی بەڵگەنامە و داتا',
    uploadZoneSubtitle: 'پشتگیری لە فایلی PDF و Word (.docx) و Excel (.xlsx) و CSV (.csv)',
    dragDropHint: 'فایلەکەت لێرە دابنێ یان کلیک بکە بۆ هەڵبژاردن',
    browseFiles: 'هەڵبژاردنی فایل',
    parsingFile: 'خوێندنەوە و دەرهێنانی تێکستی فایلەکە...',
    fileParsedSuccess: 'فایلەکە بە سەرکەوتوویی خوێندرایەوە!',
    fileParseError: 'هەڵە لە خوێندنەوەی فایل. تکایە لە جۆرەکەی دڵنیا ببەرەوە.',
    clearFile: 'سڕینەوەی فایل',
    
    citationStyleLabel: 'شێوازی سەرچاوە هێنانەوە',
    keywordsLabel: 'وشە کلیلییەکان (بە فاریزە جیاکراوە)',
    
    researchTitle: 'دروستکەری توێژینەوەی ئەکادیمی',
    researchSubtitle: 'دروستکردنی توێژینەوەی زانستی ته‌واو ڕێکخراو بە شێوازی APA 7 لەگەڵ سەرچاوەکان',
    paperType: 'جۆری توێژینەوە',
    empirical: 'توێژینەوەی مەیدانی (Empirical)',
    literatureReview: 'پێداچوونەوەی ئەدەبیات (Literature Review)',
    caseStudy: 'شیکاری کەیس (Case Study)',
    methodological: 'توێژینەوەی میتۆدۆلۆجی',
    theoretical: 'توێژینەوەی تیۆری',
    abstract: 'پوختە (Abstract)',
    apa7Formatting: 'شێوازی ستانداری APA 7th Edition',
    references: 'سەرچاوەکان و ژێدەرەکان',
    
    reportTitle: 'دروستکەری ڕاپۆرتی پیشەیی',
    reportSubtitle: 'دروستکردنی ڕاپۆرتی بەڕێوەبردن لەگەڵ خشتە، دیاریکردنی ئامانج، خشتەی داتا و گرافی گرافیکی',
    audience: 'بینەران / ئامانج',
    organization: 'دامەزراوە / زانکۆ / کۆمپانیا',
    domain: 'بوار / پیشەسازی',
    tone: 'ئاوازی دەق (Tone)',
    includeCharts: 'زیادکردنی خشتە و چارتە گرافیکییەکان',
    keyFocus: 'ئامانجە سەرەکییەکان',
    executiveSummary: 'پوختەی بەڕێوەبردن (Executive Summary)',
    keyFindings: 'دۆزراوە سەرەکییەکان',
    dataTables: 'خشتەی داتاکان',
    detailedAnalysis: 'شیکاری وردی بەشەکان',
    recommendations: 'پێشنیارە ستراتیژییەکان',
    riskAssessment: 'هەڵسەنگاندنی مەترسی و سنووردارکردنەکان',
    
    seminarTitle: 'دروستکەری سێمینار و سلایدی پاوەرپۆینت',
    seminarSubtitle: 'دروستکردنی ناوەڕۆکی سێمینار، سلایدەکان، تێبینی قسەکەر و داگرتنی ڕاستەوخۆی پاوەرپۆینت',
    slideCount: 'ژمارەی سلایدەکان',
    durationMinutes: 'ماوە (بە خولەک)',
    keySubtopics: 'تەوەر و بەشە سەرەکییەکان',
    presentationMode: 'نمایشکردنی کاتیی سلایدەکان',
    speakerNotes: 'تێبینی قسەکەر (Speaker Notes)',
    visualSuggestion: 'پێشنیاری دیزاینی visual',
    qAndAPrompts: 'پڕسیار و وەڵامە چاوەڕوانکراوەکان',
    prevSlide: 'پێشوو',
    nextSlide: 'دواتر',
    slideOf: 'سلایدی',
    
    spssTitle: 'شیکاری ئاماری SPSS و لێکدانەوەی AI',
    spssSubtitle: 'بارکردنی فایلی Excel یان CSV بۆ ئەنجامدانی شیکاری ئاماری ورد و نووسینی لێکدانەوەی زانستی',
    uploadFile: 'بارکردنی فایلی Excel یان CSV (.csv, .xlsx, .xls)',
    uploadHint: 'فایلەکەت لێرە دابنێ یان کلیک بکە بۆ هەڵبژاردن',
    datasetPreview: 'پێشاندانی داتاکان',
    rowsCount: 'ڕیزەکان',
    colsCount: 'ستوونەکان',
    analysisType: 'هەڵبژاردنی جۆری شیکاری ئاماری',
    descriptiveStats: 'ئاماری وەسفی (Mean, SD, Skewness, Kurtosis)',
    correlationMatrix: 'ماتریسی پەیوەندی (Pearson & Spearman Correlation)',
    linearRegression: 'شیکاری ڕێگری هێڵی (Linear Regression)',
    anovaTest: 'تاقیکردنەوەی ANOVA و T-Test',
    selectVariables: 'دیاریکردنی گۆڕاوەکان',
    dependentVar: 'گۆڕاوی پاشکۆ (Dependent Y)',
    independentVars: 'گۆڕاوە سەربەخۆکان (Independent X)',
    groupingVar: 'گۆڕاوی گروپ (Grouping Factor)',
    runAnalysis: 'ئەنجامدانی هەژمارکردن و بنووسە لێکدانەوەی زانستی',
    aiScholarlyInterpretation: 'لێکدانەوەی ئاماری زانستی SPSS',
    apa7ReportingText: 'شێوازی ڕاپۆرتدانی ئاماری بە APA 7',
    hypothesisDecision: 'تاقیکردنەوەی فەرزsettەکان و بڕیار',
    statisticalSummary: 'خشتەی ئاماری پوختکراو',
    mean: 'ناوەند (Mean)',
    stdDev: 'لایەنگری ستاندارد (SD)',
    median: 'میانی (Median)',
    variance: 'جیاوازی (Variance)',
    minMax: 'کەمترین / زۆرترین',
    skewness: 'لاربوونەوە (Skewness)',
    kurtosis: 'قۆقزبوونەوە (Kurtosis)',
    rSquared: 'هاوکۆڵەی دیاریکردن R²',
    fStatistic: 'بڕی ئاماری F',
    pValue: 'ئاستی واتاداری p-value',
    dataVisualizer: 'دیاریکەری گرافیکی ڕاستەوخۆ (Data Visualizer)',
    dataVisualizerSubtitle: 'نمایشکردنی دیاریکەری گرافیی ڕاستەوخۆ بە شێوازی بار، هێڵ، بازنەیی و نیشاندانی خاڵەکان',
    chartType: 'جۆری چارت',
    barChart: 'چارتی ستوونی (Bar Chart)',
    lineChart: 'چارتی هێڵی (Line Chart)',
    pieChart: 'چارتی بازنەیی (Pie Chart)',
    scatterPlot: 'چارتی خاڵبەندی (Scatter Plot)',
    xAxisVar: 'گۆڕاوی کاتۆگۆری / تەوەری X',
    yAxisVar: 'گۆڕاوی ژمارەیی / تەوەری Y',
    statChartsTitle: 'چارتە ئامارییەکان و دابەشبوونی گرافیکی داتا',
    goalDrivenAnalysisTitle: 'شیکاری ئاماری بەپێی ئامانجەکانی توێژینەوە',
    goalDrivenAnalysisSubtitle: 'وەڵامدانەوەی ڕاستەوخۆی ئامانج و فەرزیەکانی توێژینەوە بە بەڵگەی ئاماری و تەفسیری ئەکادیمی',
    researchObjectivesLabel: 'ئامانج و فەرزیەکانی توێژینەوە (ئارەزوومەندانە)',
    researchObjectivesPlaceholder: 'ئامانج یان فەرزیەکانی توێژینەوەکەت بنووسە (بۆ نموونە: "دیاریکردنی کاریگەری کاتژمێرەکانی خوێندن لەسەر نمرەی تاقیکردنەوە")...',
    goalDrivenToggleLabel: 'بەستنەوە بە ئامانجەکان',
    generalFindingsTab: 'ئەنجامە گشتییەکانی ئامار',
    goalDrivenTab: 'وەڵامدانەوەی ئامانجەکان',
    objectiveHeader: 'ئامانج / فەرزیەی توێژینەوە',
    statusHeader: 'دۆخی فەرزیە',
    evidenceHeader: 'بەڵگەی ئاماری (p-value, R², Beta)',
    interpretationHeader: 'تەفسیری ئەکادیمی',
    apaThesisHeader: 'ڕستەی ئامادەکراوی APA 7 بۆ تێز',
    chatTitle: 'یارمەتیدەری ژیری دەستکرد',
    chatSubtitle: 'وه‌ڵامدانه‌وه‌ی پرسیاره‌کان و یارمه‌تیدانی توێژینه‌وه‌',
    litReviewTitle: 'پێداچوونەوەی ئەدەبیات',
    litReviewSubtitle: 'پێداچوونەوەی وردی توێژینەوەکان و دۆزینەوەی بۆشایی زانستی',
    proposalTitle: 'پێشنیازی توێژینەوە',
    proposalSubtitle: 'داڕشتنی پڕۆپۆزەڵی ماستەر، دکتۆرا و بەکالۆریۆس',
    thesisTitle: 'دارێژەری تێز',
    thesisSubtitle: 'ڕێکخستنی بەشەکان و چوارچێوەی گشتی ماستەر و دکتۆرا',
    citationTitle: 'داڕێژەری ژێدەر',
    citationSubtitle: 'ڕێکخستنی سەرچاوەکان بە شێوازی APA 7 و MLA و سەرچاوەی تر',
    translationTitle: 'وەرگێڕانی زانستی',
    translationSubtitle: 'وەرگێڕانی تێکستە زانستییەکان بە پاراستنی زاراوەکان',

    navGroupGeneral: 'گشتی',
    navGroupResearch: 'توێژینەوە',
    navGroupWriting: 'نووسین',
    navGroupDataAnalysis: 'شیکاری داتا و SPSS',
    navGroupEducation: 'پەروەردە',
    navGroupAiTools: 'ئامرازەکانی ژیریی دەستکرد',
    navGroupSettings: 'رێکخستن و تیم',

    coreResearchTitle: 'عنوان / بابەتی سەرەکی توێژینەوە *',
    academicField: 'بواری ئەکادیمی / پسپۆڕی',
    academicLevelLabel: 'ئاستی ئەکادیمی',
    synthesisDepth: 'قووڵایی و درێژی شیکاری زانستی',
    citationFormatLabel: 'شێوازی سەرچاوەهێنانەوە',
    outputLanguageLabel: 'زمانی بەرهەمهێنان (داخستنی ١٠٠٪)',
    optionalResearchQuestions: 'پرسیارەکانی توێژینەوە (ئارەزوومەندانە)',
    optionalResearchObjectives: 'ئامانجەکانی توێژینەوە (ئارەزوومەندانە)',
    academicSourcesHub: 'مەڵبەندی سەرچاوە ئەکادیمییەکان',
    searchScholar: 'گەڕان لە Scholar / CrossRef',
    addAbstractMetadata: 'زیادکردنی داتای پوختە',
    generateLitReviewBtn: 'بەرهەمهێنانی پێداچوونەوەی ئەدەبیات',
    generateResearchBtn: 'بەرهەمهێنانی توێژینەوەی ئەکادیمی',
    generateProposalBtn: 'بەرهەمهێنانی پڕۆپۆزەڵی توێژینەوە',
    generateThesisBtn: 'بەرهەمهێنانی داڕشتنی تێز',
    workspaceTitle: 'لاپەڕەی کاری توێژینەوەی ئەکادیمی',
    litReviewWorkspaceTitle: 'لاپەڕەی کاری پێداچوونەوەی ئەدەبیات، درز و میتۆدۆلۆجیا',
    papersQueued: 'سەرچاوەی ڕیزکراو',

    litReviewSuiteTagline: 'سەنتەری پێداچوونەوەی ئەدەبیات و میتۆدۆلۆجیای ئەکادیمی',
    litReviewWorkspaceDesc: 'بەرهەمهێنانی ڕستەی ئەکادیمی بەسراوە بە هێنانەوەی سەرچاوەی کلیککراو، سەرچاوەی ستانداردی APA 7، دیاریکردنی درزی زانستی و بەشی میتۆدۆلۆجیا.',
    researchSuiteTagline: 'سیستەمی ژیریی دەستکرد بۆ توێژینەوەی ئەکادیمی',
    researchWorkspaceTitle: 'سیستەمی بەرهەمهێنانی توێژینەوەی ئەکادیمی',
    researchWorkspaceDesc: 'داڕشتنی توێژینەوەی ئەکادیمی لە ئاستی دکتۆرا و ماستەر بەپێی ستانداردە نێودەوڵەتییەکان بەبێ ژمارەی ئاماری دەستکرد بە یەک زمانی دروست.',
    proposalSuiteTagline: 'سەنتەری دروستکردنی پڕۆپۆزەڵی ئەکادیمی',
    proposalWorkspaceTitle: 'دروستکەری پڕۆپۆزەڵی توێژینەوە و ڕێکخستنی زانستی',
    proposalWorkspaceDesc: 'داڕشتنی پڕۆپۆزەڵی ته‌واوی ٢٢ بەشی بە بەستنەوەی پێداچوونەوەی ئەدەبیات، پرسیار، ئامانج و میتۆدۆلۆجیا.',
    thesisSuiteTagline: 'سەنتەری ڕێکخستنی تێزە ئەکادیمییەکان',
    thesisWorkspaceTitle: 'ڕێکخەری چوارچێوەی تێزەکانی ماستەر و دکتۆرا',
    thesisWorkspaceDesc: 'داڕشتنی فەرزیەکانی تێز، ڕێکخستنی بەشەکان، داڕشتنی هێڵی گشتی و ئامادەکردنی پرسیارەکانی لیژنەی مناقشە.',

    searchEngineTitle: 'گەڕیانی زانستیی AI (Google Scholar & CrossRef)',
    searchEngineSubtitle: 'گەڕان لە ملیۆنان توێژینەوەی ئەکادیمی هەڵسەنگێندراو لە Google Scholar, CrossRef, PubMed.',
    personalLibrary: 'کتێبخانەی کەسی',
    searchPlaceholder: 'گەڕان بۆ توێژینەوە بە نیشان، توێژەر، وشەی کلیلی، DOI یان بابەت...',
    searchPapersBtn: 'گەڕانی توێژینەوەکان',
    academicSearchFilters: 'فلتەرەکانی گەڕانی ئەکادیمی',
    openAccessPdfOnly: 'تەنها فایلی PDFی ئازاد (Open Access)',
    sortByRelevance: 'ڕێکخستن بەپێی پەیوەندیداری',
    sortByNewest: 'ڕێکخستن بەپێی نوێترین',
    sortByMostCited: 'ڕێکخستن بەپێی زۆرترین سەرچاوە',
    yearRange: 'مەودای ساڵەکان',
    authorNameLabel: 'ناوی توێژەر',
    journalPublisherLabel: 'گۆڤاری زانستی / بڵاوکەرەوە',
    subjectFieldLabel: 'بواری ئەکادیمی',
    viewPaperBtn: 'نیشاندانی توێژینەوە',
    pdfNotAvailableBtn: 'داگرتنی فایلی PDF',
    summarizeBtn: 'پوختەکردن بە AI',
    citeBtn: 'سەرچاوەهێنانەوە (Cite)',
    readFullAbstractBtn: 'خوێندنەوەی پوختەی تەواو',
    showLessBtn: 'نیشاندانی کەمتری',
    savePaperBtn: 'پاشەکەوتکردن',
    savedPaperBtn: 'پاشەکەوت کرا',
    copyBtn: 'کۆپیکردن',
    copiedBtn: 'کۆپی کرا!',

    writingAssistantSuiteTagline: 'سەنتەری داڕشتنی نووسینی ئەکادیمی بە AI',
    writingAssistantTitle: 'یاوەرێ نووسینی ئەکادیمی بە AI',
    writingAssistantDesc: 'دووبارە داڕشتنی تێکستەکان، بەرزکردنەوەی ئاستی دەقی زانستی بە پاراستنی تەواوی سەرچاوەکان و بەستەرەکانی DOI.',
    citationPreservedTitle: 'پاراستنی سەرچاوە و مانا',
    citationPreservedDesc: 'بەڵگەکان، سەرچاوەکان، بەستەرەکانی DOI و زاراوە پسپۆڕییەکان بەیەکجاری دەپارێزرێن.',
    writingToneRegister: 'ئاواز و جۆری نووسین:',
    selectTransformationTool: 'هەڵبژاردنی ئامرازی گۆڕانکاری:',
    originalManuscriptText: 'دەقی سەرەکیی توێژینەوە',
    sourceDocument: 'بەڵگەنامەی سەرچاوە',
    improvedAcademicOutput: 'ئەنجامی باشترکراوی زانستی',
    refinedCopy: 'کۆپیی ڕێکخراو',
    summaryOfAiEnhancements: 'پوختەی گۆڕانکارییەکانی AI:',
    writingDisclaimerTitle: 'ئاگاداریی ڕوونیی یاوەرێ نووسینی AI',
    writingDisclaimerDesc: 'ئەم ئامرازە ڕوونیی ڕستەکان و کووڵایی زاراوەکان باشتر دەکات بە پاراستنی سەرچاوەکان. گەرەنتیی تێپەڕاندنی پشکنینی AI ناکات. بە بەرپرسیاریاری بەکاریبهێنە.',
    aiGenerationEngine: 'ماتۆڕی ژیریی دەستکرد',
    customDirectivesLabel: 'ڕێنمایی و داواکارییە تایبەتەکانی توێژینەوە',
    customDirectivesPlaceholder: 'پرسیاری تایبەت، ڕێنمایی چوارچێوەی تیۆری، یان مەرجەکانی زانکۆ و دامەزراوەکەت بنووسە...',
    researchSetupTitle: 'ڕێکخستن و هەڵبژاردنەکانی توێژینەوە',
    researchSetupDesc: 'پێوەرە ئەکادیمییەکان، زمان، و ژمارەی پەڕەی ئامانج دیاری بکە.',
  },
  ar: {
    appName: 'EduPlanner AI',
    appDescription: 'منصة الذكاء الاصطناعي للبحوث الأكاديمية والتقارير والسيمينارات وتحليل SPSS',
    navDashboard: 'لوحة التحكم',
    navChat: 'مساعد البحث الذكي',
    navResearch: 'بحث أكاديمي',
    navLitReview: 'مراجعة الأدبيات',
    navProposal: 'مقترح البحث',
    navThesis: 'مساعد الأطروحة',
    navWriting: 'مساعد الكتابة الأكاديمية',
    navReport: 'مولّد التقارير',
    navSeminar: 'مولّد السيمينار',
    navSpss: 'تحليل البيانات SPSS',
    navDataAnalysis: 'تحليل البيانات',
    navCitation: 'صانع المراجع والتوثيق',
    navTranslation: 'الترجمة الأكاديمية',
    navSearch: 'البحث الأكاديمي والـ DOI',
    navPlagiarism: 'فحص الانتحال والذكاء الاصطناعي',
    navCollaboration: 'التعاون وفريق العمل',
    navAdmin: 'إدارة النظام والإحصائيات',
    
    heroTagline: 'تخطيط أذكى • بحث أسرع • تعلم أفضل',
    heroTitle: 'EduPlanner AI',
    heroSubtitle: 'المنصة الرائدة للذكاء الاصطناعي للبحوث الأكاديمية، وتحليل البيانات الإحصائية SPSS، ومراجعة الأدبيات، وإعداد الأطروحات والسيمينارات.',
    heroStartResearch: 'بدء البحث',
    heroAnalyzeSpss: 'تحليل SPSS',
    heroCreateSeminar: 'إنشاء سيمينار',
    heroGenerateReport: 'إنشاء تقرير',
    heroAskPlaceholder: 'اسأل مساعد الذكاء الاصطناعي (مثال: "تلخيص مراجعة الأدبيات"، "شرح مخرجات اختبار ANOVA")...',
    heroAskButton: 'اسأل الذكاء الاصطناعي',
    
    generate: 'إنشاء بواسطة الذكاء الاصطناعي',
    generating: 'جاري الإنشاء...',
    exportWord: 'تصدير إلى Word (.docx)',
    exportPdf: 'تصدير إلى PDF',
    exportPptx: 'تصدير إلى PowerPoint (.pptx)',
    downloading: 'جاري التصدير...',
    copyText: 'نسخ النص',
    copied: 'تم النسخ!',
    reset: 'إعادة ضبط',
    clear: 'مسح',
    sampleData: 'تحميل عينة بيانات',
    language: 'اللغة',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع المضيء',
    quickActions: 'أدوات الإنشاء السريعة',
    recentProjects: 'السجل والمشاريع المحفوظة',
    noProjectsYet: 'لا توجد مشاريع محفوظة بعد. ابدأ بإنشاء بحث، تقرير، سيمينار، أو تحليل SPSS!',
    topic: 'الموضوع / العنوان',
    field: 'المجال الأكاديمي / التخصص',
    languageSelect: 'لغة المخرجات',
    wordCountLabel: 'عدد الكلمات المستهدف',
    
    uploadZoneTitle: 'رفع المستندات ومجموعات البيانات',
    uploadZoneSubtitle: 'يدعم ملفات PDF و Word (.docx) و Excel (.xlsx, .xls) و CSV (.csv)',
    dragDropHint: 'قم بسحب وإفلات المستند هنا، أو انقر للاختيار',
    browseFiles: 'استعراض الملفات',
    parsingFile: 'جاري استخراج واستخلاص النصوص والبيانات...',
    fileParsedSuccess: 'تمت قراءة الملف واستخراج البيانات بنجاح!',
    fileParseError: 'خطأ في قراءة الملف. يرجى التحقق من صيغة الملف.',
    clearFile: 'حذف الملف',
    
    citationStyleLabel: 'أسلوب التوثيق والأسناد',
    keywordsLabel: 'الكلمات المفتاحية (مفصولة بفواصل)',
    
    researchTitle: 'مولّد البحوث الأكاديمية',
    researchSubtitle: 'إنشاء أوراق بحثية أكاديمية متكاملة وفق تنسيق APA 7 مع المراجع والمصادر',
    paperType: 'نوع الورقة البحثية',
    empirical: 'دراسة ميدانية (Empirical)',
    literatureReview: 'مراجعة أدبيات (Literature Review)',
    caseStudy: 'دراسة حالة (Case Study)',
    methodological: 'ورقة منهجية (Methodological)',
    theoretical: 'ورقة نظرية (Theoretical)',
    abstract: 'الملخص (Abstract)',
    apa7Formatting: 'التنسيق القياسي APA Standard 7th Edition',
    references: 'المراجع والمصادر',
    
    reportTitle: 'مولّد التقارير الاحترافية',
    reportSubtitle: 'إنشاء تقارير تنفيذية شاملة مع التوصيات والرسوم البيانية والجداول الإحصائية',
    audience: 'الجمهور المستهدف',
    organization: 'المؤسسة / الشركة / الجامعة',
    domain: 'المجال / القطاع',
    tone: 'نبرة التقرير (Tone)',
    includeCharts: 'تضمين المخططات والرسوم البيانية',
    keyFocus: 'الأهداف والنطاق الرئيسي',
    executiveSummary: 'الملخص التنفيذي',
    keyFindings: 'النتائج الرئيسية',
    dataTables: 'الجداول التحليلية',
    detailedAnalysis: 'التحليل التفصيلي للأقسام',
    recommendations: 'التوصيات الاستراتيجية',
    riskAssessment: 'تقييم المخاطر والمحددات',
    
    seminarTitle: 'مولّد السيمينار والعروض التقديمية',
    seminarSubtitle: 'إنشاء محتوى السيمينارات، شرائح العرض، ملاحظات المحاضر وتصدير ملفات PPTX',
    slideCount: 'عدد الشرائح',
    durationMinutes: 'المدة (بالدقائق)',
    keySubtopics: 'المحاور والمواضيع الفرعية',
    presentationMode: 'عروض الشرائح التفاعلية',
    speakerNotes: 'ملاحظات المحاضر (Speaker Notes)',
    visualSuggestion: 'اقتراحات التصميم البصري',
    qAndAPrompts: 'أسئلة وأجوبة متوقعة',
    prevSlide: 'السابق',
    nextSlide: 'التالي',
    slideOf: 'شريحة',
    
    spssTitle: 'تحليل البيانات SPSS والتفسير الأكاديمي',
    spssSubtitle: 'رفع ملفات Excel أو CSV لحساب الإحصاءات الدقيقة وكتابة التقرير الأكاديمي',
    uploadFile: 'رفع ملف البيانات Excel أو CSV (.csv, .xlsx, .xls)',
    uploadHint: 'قم بسحب وإفلات ملف البيانات هنا، أو انقر للاختيار',
    datasetPreview: 'معاينة مجموعة البيانات',
    rowsCount: 'الصفوف',
    colsCount: 'الأعمدة',
    analysisType: 'اختر نوع التحليل الإحصائي',
    descriptiveStats: 'الإحصاء الوصفي (Mean, SD, Skewness, Kurtosis)',
    correlationMatrix: 'مصفوفة الارتباط (Pearson & Spearman Correlation)',
    linearRegression: 'تحليل الانحدار الخطي (Linear Regression)',
    anovaTest: 'تحليل التباين الأحادي ANOVA واختبار T-Test',
    selectVariables: 'تحديد المتغيرات',
    dependentVar: 'المتغير التابع (Dependent Y)',
    independentVars: 'المتغيرات المستقلة (Independent X)',
    groupingVar: 'متغير التجميع (Grouping Factor)',
    runAnalysis: 'إجراء الحسابات الإحصائية وكتابة التقرير',
    aiScholarlyInterpretation: 'التفسير الأكاديمي نتائج SPSS',
    apa7ReportingText: 'صياغة النتائج بأسلوب APA 7',
    hypothesisDecision: 'اختبار الفرضيات والقرارات',
    statisticalSummary: 'الجداول الإحصائية المُلخّصة',
    mean: 'المتوسط الحسابي',
    stdDev: 'الانحراف المعياري',
    median: 'الوسيط',
    variance: 'التباين',
    minMax: 'أدنى / أقصى',
    skewness: 'الالتواء (Skewness)',
    kurtosis: 'التفرطح (Kurtosis)',
    rSquared: 'معامل التحديد R²',
    fStatistic: 'قيمة اختبار F',
    pValue: 'مستوى الدلالة p-value',
    dataVisualizer: 'المُصوّر البياني التفاعلي (Data Visualizer)',
    dataVisualizerSubtitle: 'عرض الرسوم البيانية التفاعلية للأعمدة، الخطوط، الدوائر، والمخططات النقطية لأي متغير',
    chartType: 'نوع الرسم البياني',
    barChart: 'مخطط الأشرطة (Bar Chart)',
    lineChart: 'مخطط الخطوط (Line Chart)',
    pieChart: 'مخطط دائري (Pie Chart)',
    scatterPlot: 'مخطط الانتشار (Scatter Plot)',
    xAxisVar: 'متغير الفئات / المحور X',
    yAxisVar: 'المتغير الرقمي / المحور Y',
    statChartsTitle: 'المخططات الإحصائية التفاعلية وتوزيعات البيانات',
    goalDrivenAnalysisTitle: 'التحليل الإحصائي الموجه بالأهداف والفرضيات',
    goalDrivenAnalysisSubtitle: 'ربط النتائج الإحصائية مباشرة بإجابة أهداف البحث وفرضياته المحددة',
    researchObjectivesLabel: 'أهداف البحث والفرضيات (اختياري)',
    researchObjectivesPlaceholder: 'أدخل أهداف أو فرضيات البحث (مثال: "تحديد أثر شبكات التواصل الاجتماعي على الإنتاجية الأكاديمية للطلاب")...',
    goalDrivenToggleLabel: 'ربط النتائج بالأهداف',
    generalFindingsTab: 'النتائج الإحصائية العامة',
    goalDrivenTab: 'تفصيل الإجابة حسب الأهداف',
    objectiveHeader: 'هدف البحث / الفرضية',
    statusHeader: 'حالة الفرضية',
    evidenceHeader: 'الأدلة الإحصائية (p-value, R², Beta)',
    interpretationHeader: 'التفسير الأكاديمي',
    apaThesisHeader: 'صياغة APA 7 الجاهزة للرسالة العلمية',
    chatTitle: 'مساعد البحث الذكي',
    chatSubtitle: 'محادثة تفاعلية للعصف الذهني والمنهجيات والاستفسارات الأكاديمية',
    litReviewTitle: 'مراجعة الأدبيات',
    litReviewSubtitle: 'تجميع الدراسات وتشكيل مصفوفات المفاهيم وتحديد الفجوات',
    proposalTitle: 'مقترح البحث (Proposal)',
    proposalSubtitle: 'صياغة مقترحات الماجستير والدكتوراه والبحوث الأكاديمية',
    thesisTitle: 'مساعد الأطروحة',
    thesisSubtitle: 'إعداد الهيكل العام وفصول الأطروحات العلمية',
    citationTitle: 'صانع المراجع والتوثيق',
    citationSubtitle: 'توثيق المصادر بدقة قياسية وفق شروط APA 7 وMLA وChicago',
    translationTitle: 'الترجمة الأكاديمية',
    translationSubtitle: 'ترجمة النصوص العلمية مع الحفاظ على المصطلحات الدقيقة',

    navGroupGeneral: 'عام',
    navGroupResearch: 'الأبحاث',
    navGroupWriting: 'الكتابة الأكاديمية',
    navGroupDataAnalysis: 'تحليل البيانات و SPSS',
    navGroupEducation: 'التعليم والندوات',
    navGroupAiTools: 'أدوات الذكاء الاصطناعي',
    navGroupSettings: 'الإعدادات والفريق',

    coreResearchTitle: 'عنوان البحث / الموضوع الرئيسي *',
    academicField: 'المجال الأكاديمي / التخصص',
    academicLevelLabel: 'المستوى الأكاديمي',
    synthesisDepth: 'عمق وطول التحليل الأكاديمي',
    citationFormatLabel: 'صيغة التوثيق والمراجع',
    outputLanguageLabel: 'لغة المخرجات (تأكيد ١٠٠٪)',
    optionalResearchQuestions: 'أسئلة البحث (اختياري)',
    optionalResearchObjectives: 'أهداف البحث (اختياري)',
    academicSourcesHub: 'مركز المصادر والأبحاث الأكاديمية',
    searchScholar: 'البحث في Scholar / CrossRef',
    addAbstractMetadata: 'إضافة بيانات الملخص',
    generateLitReviewBtn: 'توليد مراجعة الأدبيات الأكاديمية',
    generateResearchBtn: 'توليد البحث الأكاديمي الشامل',
    generateProposalBtn: 'توليد المقترح البحثي (Proposal)',
    generateThesisBtn: 'توليد هيكل وهندسة الأطروحة',
    workspaceTitle: 'مساحة عمل الأوراق والبحوث الأكاديمية',
    litReviewWorkspaceTitle: 'مساحة عمل مراجعة الأدبيات والفجوة والمنهجية',
    papersQueued: 'أوراق جاهزة في القائمة',

    litReviewSuiteTagline: 'منظومة مراجعة الأدبيات والمنهجية الأكاديمية',
    litReviewWorkspaceDesc: 'توليد فقرات أكاديمية مترابطة مع توثيق قابل للنقر، ومراجع APA 7 موثوقة، وفجوة بحثية قائمة على الأدلة، وفصل منهجية كاملاً.',
    researchSuiteTagline: 'منظومة كتابة البحوث والأوراق الأكاديمية',
    researchWorkspaceTitle: 'منظومة كتابة البحوث الأكاديمية',
    researchWorkspaceDesc: 'إعداد وتطوير أوراق علمية وأطروحات ماجستير ودكتوراه وفق المعايير الدولية بدقة منهجية وتوثيق خالي من الأرقام الوهمية.',
    proposalSuiteTagline: 'منظومة المقترحات والبحوث الأكاديمية',
    proposalWorkspaceTitle: 'مولد المقترحات البحثية ومحرك الاتساق المنهجي',
    proposalWorkspaceDesc: 'بناء مقترحات بحثية أكاديمية شاملة من 22 قسماً مع ربط الأدبيات والفجوة والأهداف والمنهجية.',
    thesisSuiteTagline: 'منظومة هيكلة الأطروحات ومناقشتها',
    thesisWorkspaceTitle: 'مولد هيكل أطروحات الماجستير والدكتوراه',
    thesisWorkspaceDesc: 'صياغة فرضيات الأطروحة، وهيكلة الفصول، وإعداد الخطوط العريضة، وتجهيز أسئلة لجنة المناقشة.',

    searchEngineTitle: 'محرك البحث الأكاديمي الشامل',
    searchEngineSubtitle: 'البحث في ملايين الأوراق العلمية المحكمة عبر Google Scholar وCrossRef وPubMed وIEEE.',
    personalLibrary: 'المكتبة الشخصية',
    searchPlaceholder: 'البحث عن الأوراق حسب العنوان، المؤلف، الكلمات المفتاحية، DOI...',
    searchPapersBtn: 'بحث في المصادر',
    academicSearchFilters: 'فلترة البحث الأكاديمي',
    openAccessPdfOnly: 'أوراق مفتوحة المصدر PDF فقط',
    sortByRelevance: 'ترتيب حسب الصلة',
    sortByNewest: 'ترتيب حسب الأحدث',
    sortByMostCited: 'ترتيب حسب الأكثر استشهاداً',
    yearRange: 'النطاق الزمني',
    authorNameLabel: 'اسم المؤلف',
    journalPublisherLabel: 'المجلة / دار النشر',
    subjectFieldLabel: 'المجال الأكاديمي',
    viewPaperBtn: 'عرض الورقة',
    pdfNotAvailableBtn: 'تحميل ملف PDF',
    summarizeBtn: 'تلخيص بالذكاء الاصطناعي',
    citeBtn: 'توثيق والمراجع',
    readFullAbstractBtn: 'قراءة الملخص كاملاً',
    showLessBtn: 'عرض أقل',
    savePaperBtn: 'حفظ في المكتبة',
    savedPaperBtn: 'محفوظ',
    copyBtn: 'نسخ',
    copiedBtn: 'تم النسخ!',

    writingAssistantSuiteTagline: 'منظومة الكتابة والأسلوب الأكاديمي',
    writingAssistantTitle: 'مساعد الكتابة الأكاديمية بالذكاء الاصطناعي',
    writingAssistantDesc: 'إعادة صياغة الفقرات الأكاديمية وتحسين الوضوح والأسلوب العلمية مع الحفاظ التام على الاقتباسات وروابط DOI والمعلومات الدقيقة.',
    citationPreservedTitle: 'حفظ الاقتباسات والمعاني',
    citationPreservedDesc: 'الحقائق والأدلة، الاقتباسات، روابط DOI والمصطلحات الدقيقة يتم الحفاظ عليها بدقة تامة.',
    writingToneRegister: 'نبرة وأسلوب الكتابة:',
    selectTransformationTool: 'اختر أداة التحسين:',
    originalManuscriptText: 'النص الأصلي للبحث',
    sourceDocument: 'الوثيقة المصدر',
    improvedAcademicOutput: 'المخرجات الأكاديمية المحسنة',
    refinedCopy: 'النسخة المحسنة',
    summaryOfAiEnhancements: 'ملخص تحسينات الذكاء الاصطناعي:',
    writingDisclaimerTitle: 'إخلاء مسؤولية الشفافية لمساعد الكتابة',
    writingDisclaimerDesc: 'هذه الأداة تحسّن وضوح الجمل ودقة المصطلحات والأسلوب الأكاديمي مع الحفاظ على المراجع. لا تضمن الأداة تجاوز كواشف الذكاء الاصطناعي. يرجى الاستخدام بمسؤولية لتلميع أبحاثك.',
    aiGenerationEngine: 'محرك الذكاء الاصطناعي',
    customDirectivesLabel: 'توجيهات ومتطلبات البحث الخاصة',
    customDirectivesPlaceholder: 'أضف أسئلة بحثية خاصة، أو توجيهات للإطار النظرى، أو متطلبات المؤسسة والجامعة...',
    researchSetupTitle: 'إعدادات ومعايير البحث الأكاديمي',
    researchSetupDesc: 'حدد المعايير الأكاديمية واللغة وعدد الصفحات المستهدفة.',
  },
  bad: {
    appName: 'EduPlanner AI',
    appDescription: 'سیستەمێ ژیرییا دەستکرد بۆ ڤەکۆلینێن ئەکادیمی، راپۆرتان، سەمیناران و شیکارکرنا ئامارییا SPSS',
    navDashboard: 'داشبۆرد',
    navChat: 'هاریکارێ ژیرییا دەستکرد',
    navResearch: 'ڤەکۆلینا ئەکادیمی',
    navLitReview: 'پێداچوونا ئەدەبیاتان',
    navProposal: 'پێشنیازا ڤەکۆلینێ',
    navThesis: 'دارێژەرێ تێزێ',
    navWriting: 'هاریکارێ نڤیسینا AI',
    navReport: 'دروستکەرێ راپۆرتان',
    navSeminar: 'دروستکەرێ سەمیناران',
    navSpss: 'شیکارکرنا داتایێن SPSS',
    navDataAnalysis: 'شیکارکرنا داتایان',
    navCitation: 'ڕێکخستنا ژێدەران',
    navTranslation: 'وەرگێڕانا ئەکادیمی',
    navSearch: 'گەڕیانا زانستی یا AI',
    navPlagiarism: 'پشکنینا ڕەسەنایەتی و AI',
    navCollaboration: 'هاوکاری و تیمی کار',
    navAdmin: 'کارگێڕی و ئامارێن سیستەمی',
    
    heroTagline: 'بەرهەڤبوونا زیرەکترا لێکۆڵینێ • شیکاریا خێراترا دانەیان • فێربوونا باشتر',
    heroTitle: 'EduPlanner AI',
    heroSubtitle: 'پلاتفۆڕما ئێکێ یا ژیرییا دەستکرد بۆ ڤەکۆڵینێن ئەکادیمی، شیکاریا ئاماری SPSS، پێداچوونا ئەدەبیاتان، نڤیسینا تێزان و سەمیناران.',
    heroStartResearch: 'دەستپێکرنا ڤەکۆلینێ',
    heroAnalyzeSpss: 'شیکارکرنا SPSS',
    heroCreateSeminar: 'دروستکرنا سەمینارێ',
    heroGenerateReport: 'دروستکرنا راپۆرتێ',
    heroAskPlaceholder: 'پرسیارێ ژ هاریکارێ AI بکە (بۆ نموونە: "پێداچوونا ئەدەبیاتان چێکە", "شیکاریا ئاماری دیار بکە")...',
    heroAskButton: 'پرسیار ل AI بکە',
    
    generate: 'دروستکرن ب AI',
    generating: 'د دروستکرنێ دا یە...',
    exportWord: 'داگرتن بۆ وۆرد (.docx)',
    exportPdf: 'داگرتن بۆ پی دی ئێف',
    exportPptx: 'داگرتن بۆ پاوەرپۆینت (.pptx)',
    downloading: 'د داگرتنێ دا یە...',
    copyText: 'کۆپیکرنا دەقی',
    copied: 'کۆپی بوو!',
    reset: 'ڤەگەڕاندن',
    clear: 'ژێبرن',
    sampleData: 'بارکرنا داتایا نموونەیی',
    language: 'زمان',
    darkMode: 'دۆخێ تاری',
    lightMode: 'دۆخێ ڕووناهی',
    quickActions: 'دروستکەرێن لەزگین',
    recentProjects: 'مێژوویا پروژەیان و ڕەش نڤیس',
    noProjectsYet: 'هیچ پروژەیەک نەهاتیە پاشەکەوتکرن. دەستپێبکە ب دروستکرنا ڤەکۆلین، راپۆرت، سەمینار یان شیکارکرنا داتایان!',
    topic: 'بابەت / ناڤنیشان',
    field: 'بوارێ ئەکادیمی / پسپۆڕی',
    languageSelect: 'زمانێ دەرئەنجامی',
    wordCountLabel: 'ژمارا پەیڤێن ئارمانجکراو',
    
    uploadZoneTitle: 'بارکرنا فایلا بەڵگەنامە و داتایان',
    uploadZoneSubtitle: 'پشتگیرییا فایلا PDF و Word (.docx) و Excel (.xlsx) و CSV (.csv)',
    dragDropHint: 'فایلا خۆ لێرە دابنێ یان کلیک بکە بۆ هەڵبژارتنێ',
    browseFiles: 'سەردانیکردنا فایلا',
    parsingFile: 'خوێندنەڤە و دەرئینانا تێکستێ فایلی...',
    fileParsedSuccess: 'فایل ب سەرکەفتیانە هاتە خوێندنەڤە!',
    fileParseError: 'شاشیا خوێندنەڤەیا فایلی. هیڤییە ژ جۆرێ وێ پشتڕاست ببە.',
    clearFile: 'ژێبرنا فایلی',
    
    citationStyleLabel: 'شێوازێ ژێدەرئینانێ',
    keywordsLabel: 'پەیڤێن کلیلی (ب فاریزە جوداکرن)',
    
    researchTitle: 'دروستکەرێ ڤەکۆلینێن ئەکادیمی',
    researchSubtitle: 'دروستکرنا ڤەکۆلینێن زانستی یێن تەمام ڕێکخستی ب شێوازێ APA 7 دگەل ژێدەران',
    paperType: 'جۆرێ ڤەکۆلینێ',
    empirical: 'ڤەکۆلینا مەیدانی (Empirical)',
    literatureReview: 'پێداچوونا ئەدەبیاتان (Literature Review)',
    caseStudy: 'شیکارکرنا کەیسی (Case Study)',
    methodological: 'ڤەکۆلینا میتۆدۆلۆجی',
    theoretical: 'ڤەکۆلینا تیۆری',
    abstract: 'پوختە (Abstract)',
    apa7Formatting: 'شێوازێ ستانداردێ APA 7th Edition',
    references: 'ژێدەر و سەرچاوە',
    
    reportTitle: 'دروستکەرێ راپۆرتێن پیشەیی',
    reportSubtitle: 'دروستکرنا راپۆرتێن ڕێڤەبرنێ دگەل خشتەیان، دۆزینەڤەیان، پێشنیاران و چارتا',
    audience: 'ئارمانج / گوهدار',
    organization: 'دامەزراوە / زانکۆ / کۆمپانی',
    domain: 'بوار / پیشەسازی',
    tone: 'ئاوازێ دەقی',
    includeCharts: 'زێدەکرنا چارتا و خشتەیێن داتایان',
    keyFocus: 'ئارمانجێن سەرەکی',
    executiveSummary: 'پوختەیا ڕێڤەبرنێ (Executive Summary)',
    keyFindings: 'دۆزینەڤەیێن سەرەکی',
    dataTables: 'خشتەیێن داتایان',
    detailedAnalysis: 'شیکارکرنا ورد یا بەشان',
    recommendations: 'پێشنیارێن ستراتیجی',
    riskAssessment: 'هەڵسەنگاندنا مەترسییان و سنووردارکرنان',
    
    seminarTitle: 'دروستکەرێ سەمیناران و سلایدان',
    seminarSubtitle: 'دروستکرنا ناڤەرۆکا سەمینارێ، سلایدان، تێبینیێن ئاخڤتکەری و داگرتنا ڕاستەوخۆ یا پاوەرپۆینتی',
    slideCount: 'ژمارا سلایدان',
    durationMinutes: 'ماوە (ب خولەک)',
    keySubtopics: 'تەوەرێن سەرەکی',
    presentationMode: 'نیشاندانا سلایدان',
    speakerNotes: 'تێبینیێن ئاخڤتکەری (Speaker Notes)',
    visualSuggestion: 'پێشنیارا دیزاینا بصری',
    qAndAPrompts: 'پرسیار و بەرسڤێن چاڤەڕێکراو',
    prevSlide: 'بەرێ',
    nextSlide: 'پاشتر',
    slideOf: 'سلایدا',
    
    spssTitle: 'شیکارکرنا ئامارییا SPSS و لێکدانەڤە ب AI',
    spssSubtitle: 'بارکرنا فایلا Excel یان CSV بۆ ئەنجامدانا شیکارا ئامارییا ورد و نڤیسینا راپۆرتا زانستی',
    uploadFile: 'بارکرنا فایلا Excel یان CSV (.csv, .xlsx, .xls)',
    uploadHint: 'فایلا خۆ لێرە دابنێ یان کلیک بکە بۆ هەڵبژارتنێ',
    datasetPreview: 'پێشاندانا داتایان',
    rowsCount: 'ڕێزیک',
    colsCount: 'ستوون',
    analysisType: 'هەڵبژارتنا جۆرێ شیکارکرنا ئاماری',
    descriptiveStats: 'ئامارا وەسفی (Mean, SD, Skewness, Kurtosis)',
    correlationMatrix: 'ماتریسا پەیوەندیێ (Pearson & Spearman Correlation)',
    linearRegression: 'شیکارکرنا ڕێگریا هێڵی (Linear Regression)',
    anovaTest: 'تاقیکرنا ANOVA و T-Test',
    selectVariables: 'دیاریکرنا گۆڕاوان',
    dependentVar: 'گۆڕاوێ پاشکۆ (Dependent Y)',
    independentVars: 'گۆڕاوێن سەربەخۆ (Independent X)',
    groupingVar: 'گۆڕاوێ گروپکرنێ (Grouping Factor)',
    runAnalysis: 'ئەنجامدانا شیکارکرنێ و نڤیسینا راپۆرتێ',
    aiScholarlyInterpretation: 'لێکدانەڤەیا زانستی یا ئەنجامێن SPSS',
    apa7ReportingText: 'دارێژتنا ئەنجامان ب شێوازێ APA 7',
    hypothesisDecision: 'تاقیکرنا فەرزیا و بڕیاردان',
    statisticalSummary: 'خشتەیێ ئاماری یێ پوختەکری',
    mean: 'ناڤنجی (Mean)',
    stdDev: 'لادانا ستاندارد (SD)',
    median: 'ناڤین (Median)',
    variance: 'جوداهی (Variance)',
    minMax: 'کێمتری / پترترین',
    skewness: 'لاربوون (Skewness)',
    kurtosis: 'قۆپبوون (Kurtosis)',
    rSquared: 'هاوکۆلکێ دیاریکرنێ R²',
    fStatistic: 'بڕێ ئاماری F',
    pValue: 'ئاستێ واتاداریێ p-value',
    dataVisualizer: 'دیاریکەرێ گرافیکی یێ ڕاستەوخۆ (Data Visualizer)',
    dataVisualizerSubtitle: 'نیشاندانا دیاریکەرێن گرافی ب شێوازێ ستوونی، هێڵی، بازنەیی و خاڵبەندی بۆ هەمی گۆڕاوان',
    chartType: 'جۆرێ چارتێ',
    barChart: 'چارتێ ستوونی (Bar Chart)',
    lineChart: 'چارتێ هێڵی (Line Chart)',
    pieChart: 'چارتێ بازنەیی (Pie Chart)',
    scatterPlot: 'چارتێ خاڵبەندی (Scatter Plot)',
    xAxisVar: 'گۆڕاوێ کاتۆگۆری / تەوەرێ X',
    yAxisVar: 'گۆڕاوێ ئاماری / تەوەرێ Y',
    statChartsTitle: 'چارتێن ئاماری یێن ڕاستەوخۆ و دابەشبوونا داتایان',
    goalDrivenAnalysisTitle: 'شیکاریا ئاماری ب پێی ئارمانجێن توێژینەوەیێ',
    goalDrivenAnalysisSubtitle: 'بەرسڤدانا ڕاستەوخۆ یا ئارمانج و فەرزیەیێن توێژینەوەیێ ب ڕێیا بەڵگە یێن ئاماری و تەفسیرا ئەکادیمی ب زمانێ بادینی',
    researchObjectivesLabel: 'ئارمانج و فەرزیەیێن توێژینەوەیێ (ئارەزوومەندانه)',
    researchObjectivesPlaceholder: 'ئارمانج یان فەرزیەیێن توێژینەوەیا خۆ بنڤێسە (بۆ منوونە: "دیاریکرنا کاریگەڕیا سەعاتێن خوێندنێ ل سەر نمرەیا ئەزموونێ"، "پەیوەندیا ئەرێنی د نێڤبەرا ئامادەبوونێ و GPA")...',
    goalDrivenToggleLabel: 'تێکەڵکرن ب ئارمانجان',
    generalFindingsTab: 'ئەنجامێن گشتی یێن ئاماری',
    goalDrivenTab: 'بەرسڤدانا ئارمانجان',
    objectiveHeader: 'ئارمانج / فەرزیا توێژینەوەیێ',
    statusHeader: 'بارودۆخێ فەرزیێ',
    evidenceHeader: 'بەڵگەیا ئاماری (p-value, R², Beta)',
    interpretationHeader: 'تەفسیرا ئەکادیمی ب زمانێ بادینی',
    apaThesisHeader: 'ڕستەیا ئامادەکری یا APA 7 بۆ تێزێ',
    chatTitle: 'هاریکارێ ژیرییا دەستکرد',
    chatSubtitle: 'بەرسڤدانا پرسیاران و هاریکارییا ڤەکۆلینێن زانستی ب تێگەهێن ئەکادیمی',
    litReviewTitle: 'پێداچوونا ئەدەبیاتان',
    litReviewSubtitle: 'پێداچوونا وێژەییا ڤەکۆلینان و دۆزینەڤەیا بۆشاییێن زانستی',
    proposalTitle: 'پێشنیازا ڤەکۆلینێ',
    proposalSubtitle: 'دارێژتنا پڕۆپۆزەلێن ماستەر، دکتۆرا و بەکالۆریۆس',
    thesisTitle: 'دارێژەرێ تێزێ',
    thesisSubtitle: 'ڕێکخستنا بەشان و چوارچۆڤەیێ گشتی یێ تێزێن ماستەر و دکتۆرا',
    citationTitle: 'ڕێکخستنا ژێدەران',
    citationSubtitle: 'ڕێکخستنا ژێدەران ب شێوازێ APA 7 و MLA و شێوازێن دی',
    translationTitle: 'وەرگێڕانا ئەکادیمی',
    translationSubtitle: 'وەرگێڕانا دەقێن زانستی ب پاراستنا زاراڤێن ئەکادیمی یێن زانکۆیا دهۆک',

    navGroupGeneral: 'گشتی',
    navGroupResearch: 'ڤەکۆلین',
    navGroupWriting: 'نڤیسین',
    navGroupDataAnalysis: 'شیکاریا داتایان و SPSS',
    navGroupEducation: 'پەروەردە و سەمینار',
    navGroupAiTools: 'ئامرازێن ژیرییا دەستکرد',
    navGroupSettings: 'ڕێکخستن و تیم',

    coreResearchTitle: 'ناڤنیشان / بابەتێ سەرەکی یێ ڤەکۆلینێ *',
    academicField: 'بوارێ ئەکادیمی / پسپۆڕی',
    academicLevelLabel: 'ئاستێ ئەکادیمی',
    synthesisDepth: 'کووراتی و درێژیا شیکاریا زانستی',
    citationFormatLabel: 'شێوازێ ژێدەرئینانێ',
    outputLanguageLabel: 'زمانێ بەرهەمهێنانێ (داخستنا ١٠٠٪)',
    optionalResearchQuestions: 'پرسیارێن ڤەکۆلینێ (ئارەزوومەندانە)',
    optionalResearchObjectives: 'ئارمانجێن ڤەکۆلینێ (ئارەزوومەندانە)',
    academicSourcesHub: 'سەنتەرێ ژێدەرێن ئەکادیمی',
    searchScholar: 'گەڕیان د Scholar / CrossRef دا',
    addAbstractMetadata: 'زێدەکرنا داتایا پوختەیێ',
    generateLitReviewBtn: 'بەرهەمهێنانا پێداچوونا ئەدەبیاتان',
    generateResearchBtn: 'بەرهەمهێنانا ڤەکۆلینا ئەکادیمی',
    generateProposalBtn: 'بەرهەمهێنانا پڕۆپۆزەلا ڤەکۆلینێ',
    generateThesisBtn: 'بەرهەمهێنانا دارێژتنا تێزێ',
    workspaceTitle: 'لاپەڕێ کارێ ڤەکۆلینا ئەکادیمی',
    litReviewWorkspaceTitle: 'لاپەڕێ کارێ پێداچوونا ئەدەبیاتان، دروچە و میتۆدۆلۆجیایێ',
    papersQueued: 'ژێدەرێن ل ڕیزێ',

    litReviewSuiteTagline: 'سەنتەرێ پێداچوونا وێژەیی و میتۆدۆلۆجیایا ئەکادیمی',
    litReviewWorkspaceDesc: 'بەرهەمهێنانا دەقێن پێکڤەگرێدای دگەل سیتەیشنێن کلیککراو، ژێدەرێن ستانداردێن APA 7، دیارکرنا دروچەیا زانستی و بەشێ تەمام یێ میتۆدۆلۆجیایێ.',
    researchSuiteTagline: 'مەکۆیا ژیرییا دەستکرد بۆ ڤەکۆلینێن ئەکادیمی',
    researchWorkspaceTitle: 'سیستەمێ بەرهەمهێنانا توێژینەوەیا ئەکادیمی',
    researchWorkspaceDesc: 'داڕشتنا توێژینەوەیا ئەکادیمی د ئاستێ دکتۆرا و ماستەر بەپێی ستانداردێن نێودەوڵەتی، بێ ژمارەیێن ئاماری یێن دەستکرد، دگەل پاراستنا ١٠٠٪ یا زمانی دیارکری.',
    proposalSuiteTagline: 'سەنتەرێ دروستکرنا پڕۆپۆزەلێن ئەکادیمی',
    proposalWorkspaceTitle: 'دروستکەرێ پڕۆپۆزەلا ڤەکۆلینێ و ڕێکخستنا زانستی',
    proposalWorkspaceDesc: 'دارێژتنا پڕۆپۆزەلێن تەمام یێن ٢٢ بەشی دگەل گرێدانا پێداچوونا ئەدەبیاتان، پرسیار، ئارمانج و میتۆدۆلۆجیایێ.',
    thesisSuiteTagline: 'سەنتەرێ ڕێکخستنا تێزێن ئەکادیمی',
    thesisWorkspaceTitle: 'ڕێکخەرێ چوارچۆڤەیێ تێزێن ماستەر و دکتۆرا',
    thesisWorkspaceDesc: 'دارێژتنا فەرزیەیێن تێزێ، ڕێکخستنا بەشان، دارێژتنا هێلا گشتی و ئامادەکرنا پرسیارێن لیجنا گۆتۆبێژێ.',

    searchEngineTitle: 'گەڕیانا زانستی یا AI (Google Scholar & CrossRef)',
    searchEngineSubtitle: 'گەڕیان د مۆلیۆنان ڤەکۆلینێن هەڵسەنگاندیی زانستی دا د ناڤبەرا Google Scholar, CrossRef, PubMed, OpenAlex, IEEE.',
    personalLibrary: 'کتێبخانا کەسی',
    searchPlaceholder: 'گەڕیان بۆ ڤەکۆلینان ب ناڤنیشان، توێژەر، پەیڤێن کلیلی، DOI یان بابەت...',
    searchPapersBtn: 'گەڕیانا ڤەکۆلینان',
    academicSearchFilters: 'فلتەرێن گەڕیانا ئەکادیمی',
    openAccessPdfOnly: 'بتنێ فایلا PDF یێن ئازاد (Open Access)',
    sortByRelevance: 'ڕێکخستن ل سەر بنەمایێ پەیوەندیێ',
    sortByNewest: 'ڕێکخستن ل سەر بنەمایێ نویترین',
    sortByMostCited: 'ڕێکخستن ل سەر بنەمایێ پترترین ژێدەر',
    yearRange: 'ماوەیا ساڵان',
    authorNameLabel: 'ناڤێ توێژەری',
    journalPublisherLabel: 'گۆڤارا زانستی / وەشێنەر',
    subjectFieldLabel: 'بوارێ ئەکادیمی',
    viewPaperBtn: 'نیشاندانا ڤەکۆلینێ',
    pdfNotAvailableBtn: 'داگرتنا فایلا PDF',
    summarizeBtn: 'پوختەکرن ب AI',
    citeBtn: 'ژێدەرئینان (Cite)',
    readFullAbstractBtn: 'خوێندنا پوختەیا تەمام',
    showLessBtn: 'نیشاندانا کێمتری',
    savePaperBtn: 'پاشەکەوتکرن',
    savedPaperBtn: 'پاشەکەوت بوو',
    copyBtn: 'کۆپیکرن',
    copiedBtn: 'کۆپی بوو!',

    writingAssistantSuiteTagline: 'سەنتەرێ دارێژتنا نڤیسینا ئەکادیمی ب AI',
    writingAssistantTitle: 'هاریکارێ نڤیسینا ئەکادیمی یا AI',
    writingAssistantDesc: 'دووبارە دارێژتنا دەقان، بلندکرنا کووراتیا دەقێن زانستی دگەل پاراستنا تەمام یا سیتەیشنان و لینکێن DOI و ژێدەران.',
    citationPreservedTitle: 'پاراستنا سیتەیشن و ڕامانێ',
    citationPreservedDesc: 'بەڵگەنامە، ژێدەر، لینکێن DOI و زاراڤێن پسپۆڕی ب تەواوی دهێنە پاراستن.',
    writingToneRegister: 'ئاواز و جۆرێ نڤیسینێ:',
    selectTransformationTool: 'هەڵبژارتنا ئامرازێ گوهرینێ:',
    originalManuscriptText: 'دەقێ سەرەکی یێ ڤەکۆلینێ',
    sourceDocument: 'بەڵگەنامەیا سەرچاوە',
    improvedAcademicOutput: 'دەرئەنجامێ باشترکری یێ زانستی',
    refinedCopy: 'کۆپیا ڕێکخستی',
    summaryOfAiEnhancements: 'پوختەکردنا گوهرینێن ژیرییا دەستکرد:',
    writingDisclaimerTitle: 'ئاگادارییا ڕووناكییا هاریکارێ نڤیسینا AI',
    writingDisclaimerDesc: 'ئەڤ ئامرازە ڕوونییا ڕستەیان و کووراتیا زاراڤان باشتر دکەت دگەل پاراستنا ژێدەران. ئەو گەرانتیا تێپەڕاندنا سیستەمێن پشکنینا AI ناکەت. هیڤییە ب بەرپرسیاری بکاربینە بۆ باشترکرنا نڤیسینا خۆ.',
    aiGenerationEngine: 'ماتۆڕێ ژیرییا دەستکرد',
    customDirectivesLabel: 'ڕێنمایی و داواکاریێن تایبەت یێن ڤەکۆلینێ',
    customDirectivesPlaceholder: 'پرسیارێن تایبەت، ڕێنماییێن چوارچۆڤەیێ تیۆری، یان مەرجێن زانکۆیێ بنڤێسە...',
    researchSetupTitle: 'ڕێکخستن و هەڵبژارتنێن ڤەکۆلینێ',
    researchSetupDesc: 'پێوەرێن ئەکادیمی، زمان، و ژمارا پەڕێن ئارمانجکراو دەستنیشان بکە.',
  },
};

export function t(key: keyof Translations, lang: Language): string {
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PageCountOption {
  pages: number;
  words: number;
  label: string;
}

export function getAcademicLevels(lang: Language): SelectOption[] {
  switch (lang) {
    case 'bad':
      return [
        { value: 'Doctoral Dissertation (Ph.D.)', label: 'تێزا دکتۆرایێ (Ph.D.)' },
        { value: "Master's Thesis (M.Sc. / M.A.)", label: 'تێزا ماستەرێ (M.Sc. / M.A.)' },
        { value: "Bachelor's Thesis (B.Sc. / B.A.)", label: 'تێزا بەکالۆریۆسێ (B.Sc. / B.A.)' },
        { value: 'Peer-Reviewed Journal Article (IEEE/Springer/Elsevier)', label: 'توێژینا گۆڤارا زانستی (IEEE/Springer)' },
        { value: 'Undergraduate Senior Research Paper', label: 'توێژینا ئەکادیمی یا بەکالۆریۆسێ' },
      ];
    case 'ku':
      return [
        { value: 'Doctoral Dissertation (Ph.D.)', label: 'دکتۆرانامە (Ph.D.)' },
        { value: "Master's Thesis (M.Sc. / M.A.)", label: 'نامەی ماستەر (M.Sc. / M.A.)' },
        { value: "Bachelor's Thesis (B.Sc. / B.A.)", label: 'توێژینەوەی بەکالۆریۆس (B.Sc. / B.A.)' },
        { value: 'Peer-Reviewed Journal Article (IEEE/Springer/Elsevier)', label: 'وتاری گۆڤاری زانستی (IEEE/Springer)' },
        { value: 'Undergraduate Senior Research Paper', label: 'توێژینەوەی ئەکادیمی بەکالۆریۆس' },
      ];
    case 'ar':
      return [
        { value: 'Doctoral Dissertation (Ph.D.)', label: 'أطروحة الدكتوراه (Ph.D.)' },
        { value: "Master's Thesis (M.Sc. / M.A.)", label: 'رسالة الماجستير (M.Sc. / M.A.)' },
        { value: "Bachelor's Thesis (B.Sc. / B.A.)", label: 'مشروع التخرج للبكالوريوس (B.Sc. / B.A.)' },
        { value: 'Peer-Reviewed Journal Article (IEEE/Springer/Elsevier)', label: 'ورقة بحثية محكّمة (IEEE/Springer)' },
        { value: 'Undergraduate Senior Research Paper', label: 'بحث أكاديمي جامعي' },
      ];
    default:
      return [
        { value: 'Doctoral Dissertation (Ph.D.)', label: 'Doctoral Dissertation (Ph.D.)' },
        { value: "Master's Thesis (M.Sc. / M.A.)", label: "Master's Thesis (M.Sc. / M.A.)" },
        { value: "Bachelor's Thesis (B.Sc. / B.A.)", label: "Bachelor's Thesis (B.Sc. / B.A.)" },
        { value: 'Peer-Reviewed Journal Article (IEEE/Springer/Elsevier)', label: 'Peer-Reviewed Journal Article (IEEE/Springer/Elsevier)' },
        { value: 'Undergraduate Senior Research Paper', label: 'Undergraduate Senior Research Paper' },
      ];
  }
}

export function getCitationStyles(lang: Language): SelectOption[] {
  switch (lang) {
    case 'bad':
      return [
        { value: 'APA 7th Edition', label: 'شێوازێ APA چاپا 7ێ' },
        { value: 'APA 6th Edition', label: 'شێوازێ APA چاپا 6ێ' },
        { value: 'MLA 9th Edition', label: 'شێوازێ MLA چاپا 9ێ' },
        { value: 'Chicago 17th Edition', label: 'شێوازێ شیکاگۆ چاپا 17ێ' },
        { value: 'Harvard Reference Style', label: 'شێوازێ هارفارد' },
        { value: 'IEEE Format', label: 'شێوازێ IEEE' },
        { value: 'Vancouver Style', label: 'شێوازێ ڤانکۆڤەر' },
      ];
    case 'ku':
      return [
        { value: 'APA 7th Edition', label: 'شێوازی APA چاپی 7ەم' },
        { value: 'APA 6th Edition', label: 'شێوازی APA چاپی 6ەم' },
        { value: 'MLA 9th Edition', label: 'شێوازی MLA چاپی 9ەم' },
        { value: 'Chicago 17th Edition', label: 'شێوازی شیکاگۆ چاپی 17ەم' },
        { value: 'Harvard Reference Style', label: 'شێوازی هارفارد' },
        { value: 'IEEE Format', label: 'شێوازی IEEE' },
        { value: 'Vancouver Style', label: 'شێوازی ڤانکۆڤەر' },
      ];
    case 'ar':
      return [
        { value: 'APA 7th Edition', label: 'أسلوب APA الطبعة السابعة' },
        { value: 'APA 6th Edition', label: 'أسلوب APA الطبعة السادسة' },
        { value: 'MLA 9th Edition', label: 'أسلوب MLA الطبعة التاسعة' },
        { value: 'Chicago 17th Edition', label: 'أسلوب شيكاغو الطبعة 17' },
        { value: 'Harvard Reference Style', label: 'أسلوب هارڤارد' },
        { value: 'IEEE Format', label: 'أسلوب IEEE' },
        { value: 'Vancouver Style', label: 'أسلوب فانكوفر' },
      ];
    default:
      return [
        { value: 'APA 7th Edition', label: 'APA 7th Edition' },
        { value: 'APA 6th Edition', label: 'APA 6th Edition' },
        { value: 'MLA 9th Edition', label: 'MLA 9th Edition' },
        { value: 'Chicago 17th Edition', label: 'Chicago 17th Edition' },
        { value: 'Harvard Reference Style', label: 'Harvard Reference Style' },
        { value: 'IEEE Format', label: 'IEEE Format' },
        { value: 'Vancouver Style', label: 'Vancouver Style' },
      ];
  }
}

export function getResearchTypes(lang: Language): SelectOption[] {
  switch (lang) {
    case 'bad':
      return [
        { value: 'empirical', label: 'ڤەکۆلینا مەیدانی یا چەندایەتی (ڕاپرسی / شیکاریا داتایان)' },
        { value: 'literature_review', label: 'پێداچوونا ئەدەبیاتان یا ڕێکخستی و میتا-ئەنالیز' },
        { value: 'case_study', label: 'شیکارکرنا کەیسی یا چۆنایەتی و کارێ مەیدانی' },
        { value: 'theoretical', label: 'چوارچۆڤەیێ تیۆری و توێژینا چەمکی' },
        { value: 'methodological', label: 'ڤەکۆلینا مەیدانی یا تێکەڵ (Mixed-Methods Empirical Study)' },
      ];
    case 'ku':
      return [
        { value: 'empirical', label: 'توێژینەوەی مەیدانیی چەندێتی (ڕاپرسی / شیکاری داتا)' },
        { value: 'literature_review', label: 'پێداچوونەوەی ئەدەبیاتی شێوەمەند و میتا-ئەنالیز' },
        { value: 'case_study', label: 'شیکاری کەیسی چۆنێتی و کاری مەیدانی' },
        { value: 'theoretical', label: 'چوارچێوەی تیۆری و توێژینەوەی چەمکی' },
        { value: 'methodological', label: 'توێژینەوەی مەیدانیی تێکەڵ (Mixed-Methods)' },
      ];
    case 'ar':
      return [
        { value: 'empirical', label: 'دراسة ميدانية كمية (استبيان / تحليل بيانات)' },
        { value: 'literature_review', label: 'مراجعة أدبيات منهجية وتحليل بعدي' },
        { value: 'case_study', label: 'دراسة حالة نوعية وعمل ميداني' },
        { value: 'theoretical', label: 'إطار نظري وورقة مفاهيمية' },
        { value: 'methodological', label: 'دراسة ميدانية مختلطة (Mixed-Methods)' },
      ];
    default:
      return [
        { value: 'empirical', label: 'Empirical Quantitative Study (Survey / Data Analysis)' },
        { value: 'literature_review', label: 'Systematic Literature Review & Meta-Analysis' },
        { value: 'case_study', label: 'Qualitative Case Study & Field Work' },
        { value: 'theoretical', label: 'Theoretical Framework & Conceptual Paper' },
        { value: 'methodological', label: 'Mixed-Methods Empirical Study' },
      ];
  }
}

export function getPageCountOptions(lang: Language): PageCountOption[] {
  switch (lang) {
    case 'bad':
      return [
        { pages: 5, words: 1500, label: '5 پەڕ (~1,500 پەیڤ - توێژینا کورت)' },
        { pages: 10, words: 3000, label: '10 پەڕ (~3,000 پەیڤ - گۆڤارا ستاندارد)' },
        { pages: 15, words: 5000, label: '15 پەڕ (~5,000 پەیڤ - توێژینا بەرفرەها گۆڤارێ)' },
        { pages: 25, words: 8000, label: '25 پەڕ (~8,000 پەیڤ - بەشێ تێزا ماستەرێ)' },
        { pages: 40, words: 12000, label: '40 پەڕ (~12,000 پەیڤ - تێزا دکتۆرایێ یا تەمام)' },
      ];
    case 'ku':
      return [
        { pages: 5, words: 1500, label: '5 پەڕە (~1,500 وشە - توێژینەوەی کورت)' },
        { pages: 10, words: 3000, label: '10 پەڕە (~3,000 وشە - وتاری گۆڤاری ستاندارد)' },
        { pages: 15, words: 5000, label: '15 پەڕە (~5,000 وشە - توێژینەوەی فراوانی گۆڤار)' },
        { pages: 25, words: 8000, label: '25 پەڕە (~8,000 وشە - بەشی تێزی ماستەر)' },
        { pages: 40, words: 12000, label: '40 پەڕە (~12,000 وشە - دکتۆرانامەی تەواو)' },
      ];
    case 'ar':
      return [
        { pages: 5, words: 1500, label: '5 صفحات (~1,500 كلمة - بحث قصير)' },
        { pages: 10, words: 3000, label: '10 صفحات (~3,000 كلمة - ورقة مجلة قياسية)' },
        { pages: 15, words: 5000, label: '15 صفحة (~5,000 كلمة - دراسة موسعة)' },
        { pages: 25, words: 8000, label: '25 صفحة (~8,000 كلمة - فصل ماجستير)' },
        { pages: 40, words: 12000, label: '40 صفحة (~12,000 كلمة - أطروحة دكتوراه)' },
      ];
    default:
      return [
        { pages: 5, words: 1500, label: '5 Pages (~1,500 Words - Short Paper)' },
        { pages: 10, words: 3000, label: '10 Pages (~3,000 Words - Standard Journal Paper)' },
        { pages: 15, words: 5000, label: '15 Pages (~5,000 Words - Extended Journal Study)' },
        { pages: 25, words: 8000, label: '25 Pages (~8,000 Words - Master Thesis Chapter)' },
        { pages: 40, words: 12000, label: '40 Pages (~12,000 Words - Doctoral Dissertation)' },
      ];
  }
}

export function getAiModels(lang: Language): SelectOption[] {
  switch (lang) {
    case 'bad':
      return [
        { value: 'gemini-2.5-flash', label: 'Google Gemini 2.5 Flash (پێشنیارکری - خێرا)' },
        { value: 'gemini-2.5-pro', label: 'Google Gemini 2.5 Pro (کووراتیا شیکاریێ)' },
        { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
        { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      ];
    case 'ku':
      return [
        { value: 'gemini-2.5-flash', label: 'Google Gemini 2.5 Flash (پێشنیارکراو - خێرا)' },
        { value: 'gemini-2.5-pro', label: 'Google Gemini 2.5 Pro (قووڵایی شیکاری بەرز)' },
        { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
        { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      ];
    case 'ar':
      return [
        { value: 'gemini-2.5-flash', label: 'Google Gemini 2.5 Flash (موصى به - سريع)' },
        { value: 'gemini-2.5-pro', label: 'Google Gemini 2.5 Pro (تحليل عميق شامل)' },
        { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
        { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      ];
    default:
      return [
        { value: 'gemini-2.5-flash', label: 'Google Gemini 2.5 Flash (Recommended - Fast)' },
        { value: 'gemini-2.5-pro', label: 'Google Gemini 2.5 Pro (Exhaustive Depth)' },
        { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
        { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      ];
  }
}

export function getOutputLanguageOptions(lang: Language): SelectOption[] {
  switch (lang) {
    case 'bad':
      return [
        { value: 'bad', label: 'Kurdish Badini (شێوەزارێ بادینی - دهۆک)' },
        { value: 'ku', label: 'Kurdish Sorani (شێوەزارێ سۆرانی)' },
        { value: 'en', label: 'English (Scholarly Academic English)' },
        { value: 'ar', label: 'Arabic (اللغة العربية الفصحى الأكاديمية)' },
      ];
    case 'ku':
      return [
        { value: 'ku', label: 'Kurdish Sorani (شێوەزاری سۆرانی - هەولێر/سلێمانی)' },
        { value: 'bad', label: 'Kurdish Badini (شێوەزارێ بادینی - دهۆک)' },
        { value: 'en', label: 'English (Scholarly Academic English)' },
        { value: 'ar', label: 'Arabic (اللغة العربية الفصحى الأكاديمية)' },
      ];
    case 'ar':
      return [
        { value: 'ar', label: 'العربية (اللغة العربية الفصحى الأكاديمية)' },
        { value: 'bad', label: 'الكردية البادينية (شێوەزارێ بادینی - دهۆك)' },
        { value: 'ku', label: 'الكردية السورانية (شێوەزاری سۆرانی)' },
        { value: 'en', label: 'الإنجليزية (English - Scholarly Academic)' },
      ];
    default:
      return [
        { value: 'en', label: 'English (Scholarly Academic English)' },
        { value: 'bad', label: 'Kurdish Badini (شێوەزارێ بادینی - دهۆک)' },
        { value: 'ku', label: 'Kurdish Sorani (شێوەزاری سۆرانی)' },
        { value: 'ar', label: 'Arabic (اللغة العربية الفصحى الأكاديمية)' },
      ];
  }
}
