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
  },
};

export function t(key: keyof Translations, lang: Language): string {
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}
