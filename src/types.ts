export type Language = 'en' | 'ku' | 'bad' | 'ar';

export type AppMode =
  | 'dashboard'
  | 'chat'
  | 'research'
  | 'litreview'
  | 'proposal'
  | 'thesis'
  | 'seminar'
  | 'report'
  | 'writing'
  | 'spss'
  | 'data-analysis'
  | 'citation'
  | 'translation'
  | 'search'
  | 'plagiarism'
  | 'collaboration'
  | 'admin';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citationVerified?: boolean;
  groundedDocs?: string[];
  audioPlaying?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  projectFolderId?: string;
  messages: ChatMessage[];
  model?: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface LitReviewPaperMeta {
  id: string;
  title: string;
  author: string;
  year: number;
  journalOrSource?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  abstractText: string;
  keywords?: string[];
  citationCount?: number;
  publisher?: string;
  sourceUrl?: string;
  verified?: boolean;
  sourceDatabase?: string;
  verificationStatus?: 'verified' | 'partially_verified' | 'unverified';
  relevanceScore?: number;
  sourceType?: 'Google Scholar' | 'CrossRef' | 'OpenAlex' | 'PDF Upload' | 'User Metadata';
}

export interface LitReviewQualityScores {
  topicAlignment: number;
  evidenceQuality: number;
  criticalSynthesis: number;
  theoreticalRelevance: number;
  methodologicalAnalysis: number;
  researchGapSupport: number;
  citationReliability: number;
  languageConsistency: number;
  academicDepth: number;
  overallQuality: number;
  status: 'Excellent' | 'Satisfactory' | 'Needs Improvement';
  improvementFeedback: string[];
}

export interface LitReviewStructuredSubsections {
  introduction?: string;
  conceptDefinitions?: string;
  thematicLiterature?: string;
  empiricalSynthesis?: string;
  internationalLit?: string;
  regionalLit?: string;
  localContext?: string;
  methodologicalPatterns?: string;
  theoreticalPerspectives?: string;
  gapSummary?: string;
}

export interface LitReviewData {
  id: string;
  researchId?: string;
  topic?: string;
  title: string;
  field: string;
  executiveSynthesis: string;
  themes: {
    themeName: string;
    synthesis: string;
    keyStudies: string[];
    researchGap: string;
    methodologicalFocus?: string;
  }[];
  similaritiesAndConsensus: string;
  methodologicalDifferences: string;
  researchGaps: string;
  futureResearchDirections: string;
  criticalAppraisal: string;
  methodologyInsights?: string;
  references: string[];
  papers?: LitReviewPaperMeta[];
  verifiedSources?: LitReviewPaperMeta[];
  structuredSubsections?: LitReviewStructuredSubsections;
  qualityScores?: LitReviewQualityScores;
  wordCount?: number;
  language: Language;
  researchGapDetails?: ResearchGapOutput;
  methodologyDetails?: MethodologyOutput;
  createdAt: string;
}

export interface AlignmentMatrixRow {
  researchQuestion: string;
  objective: string;
  dataRequired: string;
  instrument: string;
  analysisMethod: string;
}

export interface MethodologyOutput {
  id: string;
  studyStatus: 'Proposal / Planned Study' | 'Data Collection in Progress' | 'Completed Study';
  researchDesign: string;
  designJustification: string;
  researchApproach: string;
  targetPopulation: string;
  populationSizeNote: string;
  samplingStrategy: string;
  sampleRecommendation: string;
  researchParticipants: string;
  recommendedInstruments: string[];
  questionnaireStructure?: { section: string; construct: string; itemsDescription: string }[];
  validityProcedures: string;
  reliabilityProcedures: string;
  dataCollectionProcedure: string[];
  ethicalConsiderations: string;
  recommendedDataAnalysis: string;
  preferredSoftware?: string;
  alignmentMatrix: AlignmentMatrixRow[];
  fullMethodologyChapter: string;
  language: Language;
  createdAt: string;
}

export interface ResearchGapOutput {
  id: string;
  evidenceStrength: 'Strong' | 'Moderate' | 'Limited';
  gapTypes: string[];
  detailedGapParagraphs: string;
  howCurrentStudyAddressesGap: string;
  language: Language;
  createdAt: string;
}


export interface ProposalData {
  id: string;
  title: string;
  field: string;
  problemStatement: string;
  researchQuestions: string[];
  significance: string;
  methodology: string;
  expectedOutcomes: string[];
  timelineAndBudget: {
    phase: string;
    duration: string;
    cost: string;
  }[];
  preliminaryReferences: string[];
  language: Language;
  createdAt: string;
}

export interface ProposalSectionItem {
  id: string;
  title: string;
  code: string;
  content: string;
  status: 'complete' | 'needs_review' | 'not_started';
  isEditable?: boolean;
}

export interface ProposalConceptualFramework {
  independentVariables: string[];
  mediatingVariables?: string[];
  dependentVariables: string[];
  textualExplanation: string;
  diagramSvgSnippet?: string;
}

export interface ProposalTimelinePhase {
  phase: string;
  startDate?: string;
  endDate?: string;
  duration: string;
  tasks: string[];
}

export interface ProposalResearchContext {
  title: string;
  field: string;
  academicLevel: 'Undergraduate' | "Master's" | 'PhD / Doctoral' | 'Journal Research Proposal' | 'Grant / Research Project';
  researchType: 'Quantitative' | 'Qualitative' | 'Mixed Methods' | 'Experimental' | 'Survey' | 'Case Study';
  proposalDepth: 'Short' | 'Standard' | 'Detailed' | 'Doctoral / Comprehensive';
  language: Language;
  outputLanguage?: Language | string;
}

export type ResearchContext = ProposalResearchContext;

export interface LanguageValidationResult {
  isValid: boolean;
  score: number;
  detectedLanguage: string;
  contaminationPercentage: number;
  mixedParagraphCount: number;
  details: string;
  mixedSections?: string[];
}

export interface ProposalConsistencyCheckResult {
  score: 'Excellent Alignment' | 'Good Alignment' | 'Needs Revision';
  scorePercentage: number;
  checks: {
    rule: string;
    passed: boolean;
    issueDescription?: string;
    fixSuggestion?: string;
  }[];
}

export interface FullResearchProposalData {
  id: string;
  title: string;
  field: string;
  academicLevel: 'Undergraduate' | "Master's" | 'PhD / Doctoral' | 'Journal Research Proposal' | 'Grant / Research Project';
  researchType: 'Quantitative' | 'Qualitative' | 'Mixed Methods' | 'Experimental' | 'Survey' | 'Case Study';
  language: Language;
  
  // Title Page Metadata
  researcherName?: string;
  department?: string;
  college?: string;
  university?: string;
  supervisorName?: string;
  submissionDate?: string;

  // 22 Core Proposal Sections Text
  titlePageText: string;
  abstractText: string;
  introductionText: string;
  backgroundText: string;
  problemStatementText: string;
  purposeText: string;
  objectivesText: string;
  questionsText: string;
  hypothesesText?: string;
  significanceText: string;
  scopeDelimitationsText: string;
  definitionTermsText: string;
  literatureReviewText: string;
  researchGapText: string;
  theoreticalFrameworkText: string;
  conceptualFramework: ProposalConceptualFramework;
  methodologyChapterText: string;
  expectedResultsText: string;
  limitationsText: string;
  timelinePhases: ProposalTimelinePhase[];
  referencesText: string[];
  appendicesText: string;

  // Consistency Engine, Language Validation & Navigation
  proposalDepth?: 'Short' | 'Standard' | 'Detailed' | 'Doctoral / Comprehensive';
  validationStatus?: 'Complete' | 'Needs Attention';
  consistencyResult: ProposalConsistencyCheckResult;
  languageValidation?: LanguageValidationResult;
  sections: ProposalSectionItem[];
  
  // Connected Source Papers
  papers?: LitReviewPaperMeta[];
  createdAt: string;
  updatedAt: string;
}

export interface ThesisData {
  id: string;
  thesisTitle: string;
  academicLevel: string;
  field: string;
  centralThesisStatement: string;
  abstract: string;
  chapters: {
    chapterNumber: number;
    chapterTitle: string;
    objective: string;
    outline: string[];
    keyArguments: string[];
  }[];
  defensePreparation: {
    question: string;
    sampleAnswer: string;
  }[];
  language: Language;
  createdAt: string;
}

export interface CitationOutput {
  id: string;
  sourceType: string;
  identifierType?: 'DOI' | 'PMID' | 'ISBN' | 'URL' | 'CrossRef' | 'Manual';
  identifierValue?: string;
  title: string;
  authors: string;
  year: string;
  journalOrPublisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  publisherUrl?: string;
  doi?: string;
  pmid?: string;
  isbn?: string;
  abstract?: string;
  keywords?: string[];
  citations: {
    apa7: string;
    apa6: string;
    mla9: string;
    chicago17: string;
    harvard: string;
    ieee: string;
    vancouver: string;
    bibtex: string;
    apa?: string;
    mla?: string;
    chicago?: string;
  };
  inTextCitations: {
    apa7Parenthetical: string;
    apa7Narrative: string;
    mla9: string;
    chicago17: string;
    harvard: string;
    ieee: string;
    vancouver: string;
  };
  exports: {
    ris: string;
    bibtex: string;
    endnote: string;
  };
  language: Language;
  createdAt: string;
}
export interface ReferenceFolder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface ReferenceItem {
  id: string;
  title: string;
  authors: string;
  year: string;
  journalOrPublisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  publisherUrl?: string;
  doi?: string;
  pmid?: string;
  isbn?: string;
  abstract?: string;
  keywords?: string[];
  folderId?: string;
  tags?: string[];
  notes?: string;
  isFavorite?: boolean;
  sourceType: 'journal' | 'book' | 'website' | 'conference' | 'dataset';
  importedFrom?: 'Google Scholar' | 'DOI' | 'CrossRef' | 'PubMed' | 'BibTeX' | 'RIS' | 'EndNote XML' | 'Manual';
  isDuplicate?: boolean;
  duplicateOfId?: string;
  citations: {
    apa7: string;
    apa6: string;
    mla9: string;
    chicago17: string;
    harvard: string;
    ieee: string;
    vancouver: string;
    bibtex: string;
  };
  inTextCitations: {
    apa7Parenthetical: string;
    apa7Narrative: string;
    mla9: string;
    chicago17: string;
    harvard: string;
    ieee: string;
    vancouver: string;
  };
  exports: {
    ris: string;
    bibtex: string;
    endnote: string;
  };
  createdAt: string;
  updatedAt: string;
}



export type AiEditorAction =
  | 'rewrite'
  | 'summarize'
  | 'expand'
  | 'shorten'
  | 'improve_grammar'
  | 'academic_tone'
  | 'humanize';

export interface AiEditorRequest {
  text: string;
  action: AiEditorAction;
  customInstruction?: string;
  language?: Language;
}

export interface AiEditorResponse {
  editedText: string;
  summaryOfChanges: string;
}

export interface TranslationOutput {
  id: string;
  originalText: string;
  sourceLang: string;
  targetLang: string;
  translatedText: string;
  scholarlyNotes: string;
  createdAt: string;
}

export interface ResearchRequest {
  topic: string;
  field: string;
  paperType: 'empirical' | 'literature_review' | 'case_study' | 'methodological' | 'theoretical';
  wordCount: number;
  citationStyle: string; // 'APA 7', 'MLA', 'Chicago', 'Harvard'
  language: Language;
  keywords?: string;
  customInstructions?: string;
  academicLevel?: string;
  regionalContext?: string;
  theoreticalFramework?: string;
  variables?: {
    independent?: string;
    dependent?: string;
    moderating?: string;
  };
  customSubsections?: string;
  depthLevel?: 'standard' | 'exhaustive_doctoral';
  // Guided Prompt Fields
  researchTitle?: string;
  researchProblem?: string;
  objectives?: string;
  researchQuestions?: string;
  methodology?: string;
  sampleSize?: string;
  country?: string;
  university?: string;
  department?: string;
}

export interface SectionIterationRequest {
  paperId?: string;
  sectionId: string;
  sectionTitle: string;
  currentContent: string;
  action: 'expand' | 'rewrite' | 'academic_tone' | 'localized_context' | 'custom';
  customInstruction?: string;
  academicLevel?: string;
  regionalContext?: string;
  theoreticalFramework?: string;
  language?: Language;
}

export interface SectionIterationResponse {
  newContent: string;
  summaryOfChanges: string;
}

export interface ResearchSection {
  id: string;
  title: string;
  content: string;
  citations?: string[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  topic: string;
  field: string;
  paperType: string;
  language: Language;
  abstract: string;
  sections: ResearchSection[];
  references: string[];
  keywords: string[];
  createdAt: string;
  academicLevel?: string;
  regionalContext?: string;
  theoreticalFramework?: string;
  citationStyle?: string;
  country?: string;
  university?: string;
  department?: string;
  sampleSize?: string;
  methodology?: string;
  tableOfContents?: { title: string; pageNumber: number }[];
  appendices?: { id: string; title: string; content: string }[];
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface PestleAnalysis {
  political: string[];
  economic: string[];
  social: string[];
  technological: string[];
  legal: string[];
  environmental: string[];
}

export interface ReportSectionItem {
  id: string;
  title: string;
  content: string;
}

export interface ReportRequest {
  title: string;
  subject: string;
  reportType: string;
  academicLevel: string;
  audience: string;
  organization: string;
  domain: string;
  tone: 'professional' | 'executive' | 'academic' | 'technical' | 'persuasive';
  pageCount: number;
  includeCharts: boolean;
  language: Language;
  keyFocus: string;
  selectedSections: string[];
  attachedFiles?: { name: string; size: number; type: string }[];
}

export interface ReportDataTable {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface ReportChartData {
  title: string;
  type: 'bar' | 'line' | 'pie';
  labels: string[];
  values: number[];
}

export interface ReportData {
  id: string;
  title: string;
  subject?: string;
  reportType?: string;
  academicLevel?: string;
  organization: string;
  tone?: string;
  executiveSummary: string;
  sections?: ReportSectionItem[];
  swot?: SwotAnalysis;
  pestle?: PestleAnalysis;
  keyFindings: string[];
  dataTables: ReportDataTable[];
  charts: ReportChartData[];
  detailedAnalysis: string;
  recommendations: string[];
  riskAssessment: string;
  references?: string[];
  language: Language;
  createdAt: string;
  pageCount?: number;
}

export interface SeminarRequest {
  topic: string;
  audience: string;
  slideCount: number;
  durationMinutes: number;
  keySubtopics: string;
  speakerTone: 'engaging' | 'academic' | 'executive' | 'persuasive';
  language: Language;
}

export interface Slide {
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  speakerNotes: string;
  visualSuggestion?: string;
}

export interface SeminarPresentation {
  id: string;
  topic: string;
  audience: string;
  slideCount: number;
  slides: Slide[];
  references: string[];
  qAndA: { question: string; answer: string }[];
  language: Language;
  createdAt: string;
}

export interface SpssDataset {
  id: string;
  name: string;
  columns: string[];
  data: Record<string, any>[];
  rowCount: number;
}

export interface DescriptiveResult {
  variable: string;
  count: number;
  mean: number;
  stdDev: number;
  median: number;
  variance: number;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
  seMean: number;
}

export interface CorrelationCell {
  r: number;
  p: number;
  n: number;
}

export interface CorrelationResult {
  variables: string[];
  matrix: Record<string, Record<string, CorrelationCell>>;
}

export interface RegressionCoeff {
  variable: string;
  b: number;
  stdErr: number;
  beta: number;
  tStat: number;
  pValue: number;
}

export interface RegressionResult {
  dv: string;
  ivs: string[];
  r: number;
  r2: number;
  adjR2: number;
  stdErrEst: number;
  fStat: number;
  pValue: number;
  coefficients: RegressionCoeff[];
}

export interface AnovaGroupStats {
  group: string;
  count: number;
  mean: number;
  stdDev: number;
  se: number;
}

export interface AnovaResult {
  dv: string;
  groupingVar: string;
  groups: AnovaGroupStats[];
  betweenSS: number;
  betweenDf: number;
  betweenMS: number;
  fStat: number;
  pValue: number;
  withinSS: number;
  withinDf: number;
  withinMS: number;
  totalSS: number;
  totalDf: number;
}

export interface CrosstabResult {
  rowVar: string;
  colVar: string;
  rowValues: string[];
  colValues: string[];
  counts: number[][];
  rowPercents: number[][];
  colPercents: number[][];
  chiSquare: {
    stat: number;
    df: number;
    pValue: number;
    cramersV: number;
  };
}

export interface TTestResult {
  testType: 'independent' | 'paired';
  variableName: string;
  group1Name: string;
  group1Count: number;
  group1Mean: number;
  group1Sd: number;
  group2Name: string;
  group2Count: number;
  group2Mean: number;
  group2Sd: number;
  meanDiff: number;
  tStat: number;
  df: number;
  pValue: number;
  cohensD: number;
  ci95Lower?: number;
  ci95Upper?: number;
}

export interface TwoWayAnovaResult {
  dv: string;
  factorA: string;
  factorB: string;
  factorA_SS: number;
  factorA_df: number;
  factorA_MS: number;
  factorA_F: number;
  factorA_p: number;
  factorB_SS: number;
  factorB_df: number;
  factorB_MS: number;
  factorB_F: number;
  factorB_p: number;
  interaction_SS: number;
  interaction_df: number;
  interaction_MS: number;
  interaction_F: number;
  interaction_p: number;
  error_SS: number;
  error_df: number;
  error_MS: number;
  total_SS: number;
  total_df: number;
}

export interface ColumnAudit {
  name: string;
  dataType: 'numeric' | 'categorical' | 'string' | 'binary' | 'date';
  missingCount: number;
  missingPct: number;
  uniqueCount: number;
  sampleValues: any[];
}

export interface DataAuditResult {
  rowCount: number;
  colCount: number;
  qualityScore: number;
  duplicateRows: number;
  columnsProfile: ColumnAudit[];
}

export interface GoalAnalysisItem {
  objective: string;
  status: 'Supported' | 'Not Supported' | 'Partially Supported' | 'Inconclusive';
  statisticalEvidence: string;
  academicInterpretation: string;
  apaFormattedResult: string;
}

export interface FrequencyItem {
  value: string;
  count: number;
  percent: number;
  validPercent: number;
  cumulativePercent: number;
}

export interface FrequencyResult {
  variable: string;
  totalCount: number;
  items: FrequencyItem[];
}

export interface ReliabilityItemStat {
  variable: string;
  itemMean: number;
  itemSd: number;
  itemTotalCorr: number;
  alphaIfDeleted: number;
}

export interface ReliabilityResult {
  variables: string[];
  itemCount: number;
  cronbachAlpha: number;
  overallMean: number;
  overallVariance: number;
  itemStats: ReliabilityItemStat[];
}

export interface SpssAnalysisOutput {
  id: string;
  type:
    | 'descriptive'
    | 'frequency'
    | 'crosstab'
    | 'reliability'
    | 'correlation'
    | 'spearman'
    | 'regression'
    | 'multiple_regression'
    | 'ind_ttest'
    | 'paired_ttest'
    | 'ttest'
    | 'anova'
    | 'twoway_anova'
    | 'chisquare'
    | 'audit';
  datasetName: string;
  researchObjectives?: string;
  goalDrivenAnalysis?: GoalAnalysisItem[];
  descriptiveData?: DescriptiveResult[];
  frequencyData?: FrequencyResult;
  reliabilityData?: ReliabilityResult;
  crosstabData?: CrosstabResult;
  correlationData?: CorrelationResult;
  regressionData?: RegressionResult;
  ttestData?: TTestResult;
  anovaData?: AnovaResult;
  twoWayAnovaData?: TwoWayAnovaResult;
  auditData?: DataAuditResult;
  aiInterpretation: {
    scholarlyWriteup: string;
    apaReportingText: string;
    hypothesisTesting: string;
    recommendations: string;
  };
  createdAt: string;
  language: Language;
}

export interface ProjectItem {
  id: string;
  type: 'research' | 'report' | 'seminar' | 'spss' | 'litreview' | 'proposal' | 'thesis' | 'citation' | 'translation' | 'chat';
  title: string;
  language: Language;
  date: string;
  data: any;
}

export type ProjectCategory = 
  | 'Academic Research'
  | 'Seminar Presentations'
  | 'Executive Reports'
  | 'Literature Reviews'
  | 'SPSS Statistics'
  | 'Thesis Writing'
  | 'General';

export type AiProvider = 'gemini' | 'openai' | 'claude';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number; // in USD
  priceYearly: number;
  features: string[];
  maxAiCallsPerDay: number;
  maxStorageGB: number;
  spssAdvanced: boolean;
  teamWorkspaces: boolean;
  dedicatedApiKeys: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  institution?: string;
  academicLevel?: string;
  subscriptionTier?: SubscriptionTier;
  selectedProvider?: AiProvider;
  aiCalls?: number;
  status?: string;
  createdAt: string;
}

export interface AttachedFile {
  id: string;
  projectId?: string;
  userId?: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'pptx' | 'excel' | 'csv' | 'image' | 'text';
  parsedText?: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ProjectCategory;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  items?: ProjectItem[];
  files?: AttachedFile[];
}

export interface UserStatistics {
  aiCallsCount: number;
  tokensUsed: number;
  papersGenerated: number;
  seminarsCreated: number;
  reportsCreated: number;
  spssRuns: number;
  storageUsedBytes: number;
}

export interface ActivityTimelineItem {
  id: string;
  type: 'project_created' | 'ai_generated' | 'file_uploaded' | 'auth_event' | 'spss_run';
  title: string;
  description: string;
  timestamp: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface AcademicSearchResultItem {
  id: string;
  title: string;
  authors: string | string[];
  journal?: string;
  journalOrConference?: string;
  year: number;
  doi?: string;
  citationCount: number;
  url?: string;
  abstract: string;
  pdfUrl?: string;
  source: 'Google Scholar' | 'CrossRef' | 'OpenAlex' | 'Semantic Scholar';
  isOpenAccess?: boolean;
  subject?: string;
  language?: string;
  relevanceScore?: number;
  peerReviewed?: boolean;
  verificationStatus?: 'verified' | 'partially_verified' | 'unverified';
}

export interface PlagiarismMatchedSource {
  sourceTitle: string;
  sourceUrl: string;
  matchPercentage: number;
  matchedSnippet: string;
}

export interface PlagiarismCheckResult {
  id: string;
  documentTitle: string;
  overallSimilarityScore: number; // 0-100%
  similarityLevel: 'Low' | 'Medium' | 'High';
  aiGeneratedProbability: number; // 0-100%
  totalWordsScanned: number;
  matchedSources: PlagiarismMatchedSource[];
  flaggedPassages: {
    text: string;
    reason: 'Exact Match' | 'Paraphrased Similarity' | 'AI Writing Pattern';
    similarityScore: number;
    suggestion: string;
    matchedSourceUrl?: string;
  }[];
  citationIssues?: {
    passage: string;
    issue: string;
    suggestion: string;
  }[];
  recommendations?: string[];
  fullDocumentText?: string;
  scannedAt: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ProjectVersionHistory {
  id: string;
  projectId: string;
  versionName: string;
  updatedBy: string;
  timestamp: string;
  changesSummary: string;
  snapshotData: any;
}

export interface TeamWorkspace {
  id: string;
  name: string;
  ownerId: string;
  members: {
    userId: string;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer';
  }[];
  projectsCount: number;
  createdAt: string;
}

export interface AdminSystemMetrics {
  totalUsersCount: number;
  activeUsers24h: number;
  monthlyAiCallsCount: number;
  totalStorageUsedGB: number;
  apiSuccessRate: number;
  systemHealth: 'Optimal' | 'Degraded' | 'Maintenance';
}

// Data Analysis Module Types
export type DataAnalysisStep =
  | 'upload'
  | 'preview'
  | 'clean'
  | 'descriptive'
  | 'tests'
  | 'rq-analysis'
  | 'visualization'
  | 'interpretation'
  | 'chapter4';

export interface ResearchQuestionItem {
  id: string;
  rqNumber: number;
  rqText: string;
  selectedVars: string[];
  selectedTest: string;
  alphaLevel: number;
  recommendedTest?: string;
  resultSummary?: string;
  status: 'draft' | 'configured' | 'computed';
  computedOutput?: any;
}

export interface DataCleaningOptions {
  removeDuplicates: boolean;
  missingValueAction: 'leave' | 'remove_rows' | 'mean' | 'median' | 'mode';
  columnRenames: Record<string, string>;
  typeOverrides: Record<string, 'Scale' | 'Nominal' | 'Ordinal'>;
  removeColumns: string[];
}

export interface DataAnalysisHistoryItem {
  id: string;
  datasetName: string;
  timestamp: string;
  rowsCount: number;
  varsCount: number;
  missingPercentage: number;
  analysesRun: string[];
  lastStep: DataAnalysisStep;
  snapshotData?: any;
}

