import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  Sparkles,
  Upload,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  RefreshCw,
  Table,
  CheckCircle2,
  AlertCircle,
  BarChart,
  PieChart,
  HelpCircle,
  Calculator,
  ShieldCheck,
  Wand2,
  FileText,
  Activity,
  Grid,
  Layers,
  FileCode,
  Sliders,
  BookOpen,
  Info,
  ChevronRight,
  ExternalLink,
  Zap,
  RotateCcw,
  Tag,
  ArrowRight,
  CheckSquare,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { SpssDataset, SpssAnalysisOutput, Language, DataAuditResult } from '../types';
import { t, isRTL } from '../lib/i18n';
import {
  computeDescriptives,
  computeCorrelationMatrix,
  computeRegression,
  computeAnova,
  computeCrosstab,
  computeIndependentTTest,
  computePairedTTest,
  computeTwoWayAnova,
  computeFrequencyAnalysis,
  computeReliabilityAnalysis,
  computeSpearmanCorrelation,
  auditDataset,
  cleanDataset,
  getSampleUniversityDataset
} from '../lib/spssStats';
import {
  exportSpssToWord,
  exportSpssToPdf,
  exportSpssToExcel,
  exportSpssToPptx
} from '../lib/exportUtils';
import { aiService } from '../services/aiService';
import { AnalysisResultCharts, InteractiveDataVisualizer } from './SpssCharts';

interface SpssAnalyzerProps {
  lang: Language;
  onSaveProject: (item: any) => void;
}

export type VariableType = 'Scale' | 'Nominal' | 'Ordinal';

export interface VariableMetadata {
  id: string; // Internal id (never exposed to user)
  originalColumnName: string; // The exact original column header from the file
  displayName: string; // Exact original column header used everywhere in UI & output
  dataType: 'numeric' | 'categorical';
  measurementLevel: VariableType;
  values: string[];
  uniqueCount: number;
  missingCount: number;
}

// Local Fallback Academic Writeup Generator (Guarantees zero dependency on Google Cloud Credentials)
function generateFrontendLocalWriteup(
  analysisType: string,
  datasetName: string,
  computedData: any,
  getDisplayName: (name: string) => string
) {
  let scholarlyWriteup = `Statistical analysis (${analysisType.toUpperCase()}) was successfully calculated for dataset "${datasetName}". The computed sample values demonstrate clear empirical properties suitable for peer-reviewed academic reporting.`;
  let apaReportingText = `Statistical test (${analysisType.toUpperCase()}) executed cleanly on sample dataset "${datasetName}".`;
  let hypothesisTesting = 'Hypothesis evaluated against standard alpha = 0.05 significance threshold.';
  let recommendations = 'Formulate academic discussion based on empirical cell distributions and effect size magnitude.';

  if (analysisType === 'reliability') {
    const alpha = computedData?.cronbachAlpha ?? 0;
    const itemCount = computedData?.itemCount ?? 0;
    const rawItems = computedData?.variables || computedData?.itemStats?.map((i: any) => i.variable) || [];
    const items = rawItems.map(getDisplayName).join(', ') || 'selected scale items';
    const isGood = alpha >= 0.7;

    apaReportingText = `A Cronbach's alpha reliability analysis was conducted on ${itemCount} scale items (${items}). The scale demonstrated ${isGood ? 'acceptable' : 'low'} internal consistency, α = ${alpha}.`;
    hypothesisTesting = isGood
      ? `Acceptable Scale Reliability (α = ${alpha} ≥ 0.70 threshold).`
      : `Questionable Scale Reliability (α = ${alpha} < 0.70 threshold).`;
    scholarlyWriteup = `An internal consistency reliability analysis was performed across ${itemCount} items (${items}). The resulting Cronbach's alpha coefficient of α = ${alpha} indicates ${isGood ? 'strong scale reliability and item covariance' : 'insufficient internal consistency across items'}.`;
  } else if (analysisType === 'crosstab' || analysisType === 'chisquare') {
    const rowVar = getDisplayName(computedData?.rowVar || 'Row Variable');
    const colVar = getDisplayName(computedData?.colVar || 'Column Variable');
    const chiSquare = computedData?.chiSquare?.stat ?? 0;
    const df = computedData?.chiSquare?.df ?? 1;
    const pVal = computedData?.chiSquare?.pValue ?? 1;
    const cramersV = computedData?.chiSquare?.cramersV ?? 0;
    const isSig = pVal < 0.05;

    apaReportingText = `A Chi-Square Test of Independence was conducted between ${rowVar} and ${colVar}. The association was ${isSig ? 'statistically significant' : 'not statistically significant'}, χ²(${df}) = ${chiSquare}, p = ${pVal}, Cramér's V = ${cramersV}.`;
    hypothesisTesting = isSig
      ? `Reject Null Hypothesis (H₀): Significant association detected between ${rowVar} and ${colVar} (p < 0.05).`
      : `Fail to Reject Null Hypothesis (H₀): No statistically significant association detected between ${rowVar} and ${colVar} (p ≥ 0.05).`;
    scholarlyWriteup = `A Pearson Chi-Square Test of Independence evaluated cross-tabulated contingency cell frequencies for ${rowVar} across categories of ${colVar}. The test yielded χ²(${df}) = ${chiSquare} with p = ${pVal}, demonstrating that the two categorical variables are ${isSig ? 'statistically dependent' : 'independent'}. Cramér's V effect size of ${cramersV} reflects a ${cramersV > 0.3 ? 'strong' : cramersV > 0.1 ? 'moderate' : 'weak'} association.`;
  } else if (analysisType === 'ind_ttest' || analysisType === 'ttest') {
    const dv = getDisplayName(computedData?.variableName || 'Dependent Variable');
    const g1 = computedData?.group1Name || 'Group 1';
    const g2 = computedData?.group2Name || 'Group 2';
    const m1 = computedData?.group1Mean ?? 0;
    const sd1 = computedData?.group1Sd ?? 0;
    const m2 = computedData?.group2Mean ?? 0;
    const sd2 = computedData?.group2Sd ?? 0;
    const tStat = computedData?.tStat ?? 0;
    const df = computedData?.df ?? 1;
    const pVal = computedData?.pValue ?? 1;
    const d = computedData?.cohensD ?? 0;
    const isSig = pVal < 0.05;

    apaReportingText = `An independent-samples t-test was conducted to compare ${dv} between ${g1} (M = ${m1}, SD = ${sd1}) and ${g2} (M = ${m2}, SD = ${sd2}). The difference was ${isSig ? 'statistically significant' : 'not statistically significant'}, t(${df}) = ${tStat}, p = ${pVal}, Cohen's d = ${d}.`;
    hypothesisTesting = isSig
      ? `Reject Null Hypothesis (H₀): Group means differ significantly (p < 0.05).`
      : `Fail to Reject Null Hypothesis (H₀): No significant mean difference (p ≥ 0.05).`;
    scholarlyWriteup = `An independent-samples t-test compared ${dv} scores between ${g1} (M = ${m1}, SD = ${sd1}) and ${g2} (M = ${m2}, SD = ${sd2}). The resulting t-statistic of t(${df}) = ${tStat} with p = ${pVal} demonstrates ${isSig ? 'a significant distinction' : 'insufficient statistical evidence of a difference'} between groups.`;
  } else if (analysisType === 'anova') {
    const dv = getDisplayName(computedData?.dv || 'Dependent Variable');
    const groupVar = getDisplayName(computedData?.groupingVar || 'Factor');
    const fStat = computedData?.fStat ?? 0;
    const bDf = computedData?.betweenDf ?? 1;
    const wDf = computedData?.withinDf ?? 1;
    const pVal = computedData?.pValue ?? 1;
    const isSig = pVal < 0.05;

    apaReportingText = `A one-way ANOVA evaluated the effect of ${groupVar} on ${dv}. The main effect was ${isSig ? 'statistically significant' : 'not statistically significant'}, F(${bDf}, ${wDf}) = ${fStat}, p = ${pVal}.`;
    hypothesisTesting = isSig
      ? `Reject Null Hypothesis (H₀): Group means differ significantly across categories.`
      : `Fail to Reject Null Hypothesis (H₀): Equal group means across categories.`;
    scholarlyWriteup = `A One-Way ANOVA was conducted to compare the effect of ${groupVar} on ${dv}. There was a ${isSig ? 'statistically significant' : 'non-significant'} difference between group means, F(${bDf}, ${wDf}) = ${fStat}, p = ${pVal}.`;
  }

  return {
    scholarlyWriteup,
    apaReportingText,
    hypothesisTesting,
    recommendations
  };
}

export const SpssAnalyzer: React.FC<SpssAnalyzerProps> = ({ lang, onSaveProject }) => {
  const [dataset, setDataset] = useState<SpssDataset | null>(getSampleUniversityDataset());
  const [audit, setAudit] = useState<DataAuditResult | null>(auditDataset(getSampleUniversityDataset()));

  // Comprehensive Variable Metadata Mapping System (Preserves exact original column names)
  const [variableMetadataMap, setVariableMetadataMap] = useState<Record<string, VariableMetadata>>({
    Student_ID: { id: 'var_0', originalColumnName: 'Student_ID', displayName: 'Student_ID', dataType: 'categorical', measurementLevel: 'Nominal', values: [], uniqueCount: 0, missingCount: 0 },
    Gender: { id: 'var_1', originalColumnName: 'Gender', displayName: 'Gender', dataType: 'categorical', measurementLevel: 'Nominal', values: ['Male', 'Female'], uniqueCount: 2, missingCount: 0 },
    Department: { id: 'var_2', originalColumnName: 'Department', displayName: 'Department', dataType: 'categorical', measurementLevel: 'Nominal', values: ['Computer Science', 'Software Engineering', 'Information Tech'], uniqueCount: 3, missingCount: 0 },
    Academic_Year: { id: 'var_3', originalColumnName: 'Academic_Year', displayName: 'Academic_Year', dataType: 'categorical', measurementLevel: 'Ordinal', values: ['Year 1', 'Year 2', 'Year 3', 'Year 4'], uniqueCount: 4, missingCount: 0 },
    Study_Hours_Per_Week: { id: 'var_4', originalColumnName: 'Study_Hours_Per_Week', displayName: 'Study_Hours_Per_Week', dataType: 'numeric', measurementLevel: 'Scale', values: [], uniqueCount: 15, missingCount: 0 },
    Attendance_Percentage: { id: 'var_5', originalColumnName: 'Attendance_Percentage', displayName: 'Attendance_Percentage', dataType: 'numeric', measurementLevel: 'Scale', values: [], uniqueCount: 18, missingCount: 0 },
    Exam_Score: { id: 'var_6', originalColumnName: 'Exam_Score', displayName: 'Exam_Score', dataType: 'numeric', measurementLevel: 'Scale', values: [], uniqueCount: 22, missingCount: 0 },
    Gpa_Score: { id: 'var_7', originalColumnName: 'Gpa_Score', displayName: 'Gpa_Score', dataType: 'numeric', measurementLevel: 'Scale', values: [], uniqueCount: 20, missingCount: 0 }
  });
  
  // Custom variable type overrides (Scale, Nominal, Ordinal)
  const [variableTypes, setVariableTypes] = useState<Record<string, VariableType>>({
    Student_ID: 'Nominal',
    Gender: 'Nominal',
    Department: 'Nominal',
    Academic_Year: 'Ordinal',
    Study_Hours_Per_Week: 'Scale',
    Attendance_Percentage: 'Scale',
    Exam_Score: 'Scale',
    Gpa_Score: 'Scale'
  });

  const [activeCategory, setActiveCategory] = useState<
    'preview' | 'questions' | 'descriptive' | 'tests' | 'visualization'
  >('tests');

  const [analysisType, setAnalysisType] = useState<
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
    | 'anova'
    | 'twoway_anova'
    | 'chisquare'
  >('ind_ttest');

  // Selected variables for analysis
  const [selectedNumVars, setSelectedNumVars] = useState<string[]>(['Study_Hours_Per_Week', 'Attendance_Percentage', 'Exam_Score', 'Gpa_Score']);
  const [dependentVar, setDependentVar] = useState<string>('Exam_Score');
  const [independentVars, setIndependentVars] = useState<string[]>(['Study_Hours_Per_Week', 'Attendance_Percentage']);
  const [groupingVar, setGroupingVar] = useState<string>('Gender');
  const [factorA, setFactorA] = useState<string>('Gender');
  const [factorB, setFactorB] = useState<string>('Department');
  const [pairedVar1, setPairedVar1] = useState<string>('Study_Hours_Per_Week');
  const [pairedVar2, setPairedVar2] = useState<string>('Exam_Score');
  const [crosstabRow, setCrosstabRow] = useState<string>('Department');
  const [crosstabCol, setCrosstabCol] = useState<string>('Gender');
  const [researchObjectives, setResearchObjectives] = useState<string>('');

  // Research Questions & Test Advisor state
  const [userResearchQuestion, setUserResearchQuestion] = useState<string>('Is there a significant difference in Exam Score between Male and Female students?');
  const [advisorVar1, setAdvisorVar1] = useState<string>('Exam_Score');
  const [advisorVar2, setAdvisorVar2] = useState<string>('Gender');
  const [advisorRecommendation, setAdvisorRecommendation] = useState<{
    testName: string;
    testId: any;
    reasoning: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [output, setOutput] = useState<SpssAnalysisOutput | null>(null);

  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<'word' | 'pdf' | 'excel' | 'pptx' | null>(null);

  const rtl = isRTL(lang);

  // Helper to resolve exact original column names from dataset
  const getVarDisplayName = (colName: string): string => {
    if (!colName) return '';
    return variableMetadataMap[colName]?.displayName || variableMetadataMap[colName]?.originalColumnName || String(colName);
  };

  // Compute unique groups for the currently selected grouping variable
  const groupingVarGroups = useMemo(() => {
    if (!dataset || !groupingVar) return [];
    const set = new Set<string>();
    dataset.data.forEach(r => {
      const val = r[groupingVar];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        set.add(String(val).trim());
      }
    });
    return Array.from(set);
  }, [dataset, groupingVar]);

  // Build Metadata Mapping directly from uploaded dataset (Preserving original headers)
  const buildVariableMetadataMap = (cols: string[], data: any[]): { metaMap: Record<string, VariableMetadata>; typesMap: Record<string, VariableType> } => {
    const metaMap: Record<string, VariableMetadata> = {};
    const typesMap: Record<string, VariableType> = {};

    cols.forEach((c, idx) => {
      const origName = String(c).trim();
      const samples = data.map(r => r[c]).filter(v => v !== undefined && v !== null && String(v).trim() !== '');
      const isNum = samples.length > 0 && samples.every(v => !isNaN(Number(v)));
      const uniqueVals = Array.from(new Set(samples.map(v => String(v).trim())));
      
      let type: VariableType = 'Nominal';
      if (isNum) {
        type = uniqueVals.length > 5 ? 'Scale' : 'Ordinal';
      }
      typesMap[c] = type;

      const missingCount = data.length - samples.length;

      metaMap[c] = {
        id: `var_${idx}`,
        originalColumnName: origName,
        displayName: origName, // Preserves exact uploaded file header!
        dataType: isNum ? 'numeric' : 'categorical',
        measurementLevel: type,
        values: uniqueVals,
        uniqueCount: uniqueVals.length,
        missingCount
      };
    });

    return { metaMap, typesMap };
  };

  // File parsing (Excel .xlsx, CSV, SPSS .sav)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setAiNotice(null);
    const fileName = file.name;
    const lower = fileName.toLowerCase();

    if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const rawCols = Object.keys(results.data[0] as object);
            const cols = rawCols.map(c => String(c).trim()).filter(c => c && !c.startsWith('__'));
            const ds: SpssDataset = {
              id: 'ds_' + Date.now(),
              name: fileName,
              columns: cols,
              data: results.data as Record<string, any>[],
              rowCount: results.data.length
            };
            setDataset(ds);
            setAudit(auditDataset(ds));
            autoDetectVariableTypes(cols, results.data as any[]);
          }
        },
        error: (err) => {
          setError('Failed to parse CSV file: ' + err.message);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

          if (data && data.length > 0) {
            const rawCols = Object.keys(data[0]);
            const cols = rawCols.map(c => String(c).trim()).filter(c => c && !c.startsWith('__'));
            const ds: SpssDataset = {
              id: 'ds_' + Date.now(),
              name: fileName,
              columns: cols,
              data,
              rowCount: data.length
            };
            setDataset(ds);
            setAudit(auditDataset(ds));
            autoDetectVariableTypes(cols, data);
          } else {
            throw new Error('No valid tabular records found in file.');
          }
        } catch (err: any) {
          setError('Failed to parse binary spreadsheet file: ' + err.message);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const autoDetectVariableTypes = (cols: string[], data: any[]) => {
    const { metaMap, typesMap } = buildVariableMetadataMap(cols, data);
    setVariableMetadataMap(metaMap);
    setVariableTypes(typesMap);

    const numCols = cols.filter(c => typesMap[c] === 'Scale');
    const catCols = cols.filter(c => typesMap[c] !== 'Scale');

    if (numCols.length > 0) {
      setSelectedNumVars(numCols.slice(0, 4));
      setDependentVar(numCols[0]);
      setIndependentVars(numCols.slice(1, 3));
      if (numCols.length >= 2) {
        setPairedVar1(numCols[0]);
        setPairedVar2(numCols[1]);
      }
    }
    if (catCols.length > 0) {
      const binaryCat = catCols.find(c => new Set(data.map(r => r[c])).size === 2);
      setGroupingVar(binaryCat || catCols[0]);
      setFactorA(catCols[0]);
      setCrosstabRow(catCols[0]);
      if (catCols.length >= 2) {
        setFactorB(catCols[1]);
        setCrosstabCol(catCols[1]);
      } else {
        setCrosstabCol(catCols[0]);
      }
    } else if (cols.length >= 2) {
      setCrosstabRow(cols[0]);
      setCrosstabCol(cols[1]);
    }
  };

  const loadSampleDataset = () => {
    const sample = getSampleUniversityDataset();
    setDataset(sample);
    setAudit(auditDataset(sample));

    const { metaMap, typesMap } = buildVariableMetadataMap(sample.columns, sample.data);
    setVariableMetadataMap(metaMap);
    setVariableTypes(typesMap);

    setSelectedNumVars(['Study_Hours_Per_Week', 'Attendance_Percentage', 'Exam_Score', 'Gpa_Score']);
    setDependentVar('Exam_Score');
    setIndependentVars(['Study_Hours_Per_Week', 'Attendance_Percentage']);
    setGroupingVar('Gender');
    setFactorA('Gender');
    setFactorB('Department');
    setCrosstabRow('Department');
    setCrosstabCol('Gender');
    setPairedVar1('Study_Hours_Per_Week');
    setPairedVar2('Exam_Score');
    setError(null);
    setAiNotice(null);
  };

  // Variable Type Modification Handler
  const handleToggleVariableType = (col: string, newType: VariableType) => {
    setVariableTypes(prev => ({
      ...prev,
      [col]: newType
    }));
    setVariableMetadataMap(prev => {
      if (!prev[col]) return prev;
      return {
        ...prev,
        [col]: {
          ...prev[col],
          measurementLevel: newType,
          dataType: newType === 'Scale' ? 'numeric' : 'categorical'
        }
      };
    });
  };

  // Automated Research Question & Test Advisor
  const handleAdvisorEvaluate = () => {
    if (!dataset) return;
    const type1 = variableTypes[advisorVar1] || 'Scale';
    const type2 = variableTypes[advisorVar2] || 'Nominal';
    const name1 = getVarDisplayName(advisorVar1);
    const name2 = getVarDisplayName(advisorVar2);

    let testName = 'Descriptive Statistics';
    let testId: any = 'descriptive';
    let reasoning = '';

    if (type1 === 'Scale' && type2 === 'Scale') {
      testName = 'Pearson Correlation & Scatter Plot';
      testId = 'correlation';
      reasoning = `Both ${name1} and ${name2} are continuous scale variables. Pearson correlation assesses the linear relationship and direction between them.`;
    } else if (type1 === 'Scale' && type2 === 'Nominal') {
      const uniqueVals = new Set(dataset.data.map(r => r[advisorVar2])).size;
      if (uniqueVals <= 2) {
        testName = 'Independent Samples T-Test';
        testId = 'ind_ttest';
        reasoning = `${name1} is a continuous dependent variable and ${name2} has ${uniqueVals} categorical groups (${Array.from(new Set(dataset.data.map(r => r[advisorVar2]))).join(', ')}). An Independent Samples T-Test evaluates if group means differ significantly.`;
      } else {
        testName = 'One-Way ANOVA';
        testId = 'anova';
        reasoning = `${name1} is a continuous dependent variable and ${name2} has ${uniqueVals} categorical groups (> 2 groups). One-Way ANOVA evaluates variance differences across groups.`;
      }
    } else if (type1 === 'Nominal' && type2 === 'Nominal') {
      testName = 'Chi-Square Test of Independence';
      testId = 'crosstab';
      reasoning = `Both ${name1} and ${name2} are categorical variables. A Chi-Square Test of Independence evaluates cross-tabulated frequency counts for statistical association.`;
    } else {
      testName = 'Linear Regression Analysis';
      testId = 'regression';
      reasoning = `Evaluates how predictor variable ${name2} impacts outcome metric ${name1}.`;
    }

    setAdvisorRecommendation({ testName, testId, reasoning });
  };

  // Run Calculations & Request AI Scholarly Interpretation (100% Decoupled from Google Credentials)
  const handleRunAnalysis = async () => {
    if (!dataset || dataset.data.length === 0) {
      setError('Please upload a dataset before running statistical analysis.');
      return;
    }

    setLoading(true);
    setError(null);
    setAiNotice(null);

    try {
      let computedData: any = null;

      // STEP 1: Execute Pure Local Backend Calculations (Zero Google Cloud API Dependency!)
      if (analysisType === 'descriptive') {
        if (selectedNumVars.length === 0) throw new Error('Please select at least one numeric variable for Descriptive Statistics.');
        computedData = selectedNumVars.map(v => {
          const vals = dataset.data.map(r => Number(r[v])).filter(n => !isNaN(n));
          return computeDescriptives(vals, v);
        });
      } else if (analysisType === 'frequency') {
        const targetVar = dependentVar || selectedNumVars[0] || dataset.columns[0];
        computedData = computeFrequencyAnalysis(dataset.data, targetVar);
      } else if (analysisType === 'reliability') {
        if (selectedNumVars.length < 2) throw new Error('Reliability analysis requires at least two numeric scale item variables.');
        computedData = computeReliabilityAnalysis(dataset.data, selectedNumVars);
      } else if (analysisType === 'crosstab' || analysisType === 'chisquare') {
        if (!crosstabRow || !crosstabCol) throw new Error('Please select both Row and Column variables for Cross Tabulation & Chi-Square.');
        computedData = computeCrosstab(dataset.data, crosstabRow, crosstabCol);
      } else if (analysisType === 'correlation') {
        if (selectedNumVars.length < 2) throw new Error('Please select at least two numeric variables for Pearson correlation.');
        computedData = computeCorrelationMatrix(dataset.data, selectedNumVars);
      } else if (analysisType === 'spearman') {
        if (selectedNumVars.length < 2) throw new Error('Please select at least two variables for Spearman Rank correlation.');
        computedData = computeSpearmanCorrelation(dataset.data, selectedNumVars);
      } else if (analysisType === 'regression' || analysisType === 'multiple_regression') {
        if (!dependentVar || independentVars.length === 0) throw new Error('Please select a dependent variable and predictor variables for Linear Regression.');
        computedData = computeRegression(dataset.data, dependentVar, independentVars);
      } else if (analysisType === 'ind_ttest') {
        if (!dependentVar || !groupingVar) throw new Error('Please select a numeric dependent variable and a grouping variable.');
        if (groupingVarGroups.length !== 2) {
          throw new Error(`Independent Samples T-Test requires a grouping variable with exactly 2 groups. Column '${getVarDisplayName(groupingVar)}' contains ${groupingVarGroups.length} groups (${groupingVarGroups.join(', ')}). Please select a binary factor like Gender or use One-Way ANOVA.`);
        }
        computedData = computeIndependentTTest(dataset.data, dependentVar, groupingVar);
      } else if (analysisType === 'paired_ttest') {
        if (!pairedVar1 || !pairedVar2) throw new Error('Please select two paired numeric variables.');
        computedData = computePairedTTest(dataset.data, pairedVar1, pairedVar2);
      } else if (analysisType === 'anova') {
        if (!dependentVar || !groupingVar) throw new Error('Please select a numeric dependent variable and a grouping factor for One-Way ANOVA.');
        computedData = computeAnova(dataset.data, dependentVar, groupingVar);
      } else if (analysisType === 'twoway_anova') {
        if (!dependentVar || !factorA || !factorB) throw new Error('Please select a dependent variable and two categorical factors.');
        computedData = computeTwoWayAnova(dataset.data, dependentVar, factorA, factorB);
      }

      // STEP 2: Attempt AI Interpretation (Wrapped in Isolated Try/Catch so API/Google Cloud errors NEVER break statistical results!)
      let responseData: any = null;
      try {
        responseData = await aiService.interpretSpss({
          analysisType,
          datasetName: dataset.name,
          computedData,
          researchObjectives: researchObjectives.trim() || undefined,
          language: lang
        });
      } catch (aiErr: any) {
        console.warn('AI Interpretation Endpoint Warning: Falling back to local interpretation template.', aiErr);
        setAiNotice('Statistical calculation completed successfully, but external AI interpretation service is temporarily unavailable. Local APA interpretation generated.');
        responseData = generateFrontendLocalWriteup(analysisType, dataset.name, computedData, getVarDisplayName);
      }

      const outputType = (analysisType === 'ind_ttest' || analysisType === 'paired_ttest') ? 'ttest' : analysisType;

      const finalOutput: SpssAnalysisOutput = {
        id: 'spss_' + Date.now(),
        type: outputType,
        datasetName: dataset.name,
        researchObjectives: researchObjectives.trim() || undefined,
        goalDrivenAnalysis: responseData.goalDrivenAnalysis,
        descriptiveData: analysisType === 'descriptive' ? computedData : undefined,
        frequencyData: analysisType === 'frequency' ? computedData : undefined,
        reliabilityData: analysisType === 'reliability' ? computedData : undefined,
        crosstabData: (analysisType === 'crosstab' || analysisType === 'chisquare') ? computedData : undefined,
        correlationData: (analysisType === 'correlation' || analysisType === 'spearman') ? computedData : undefined,
        regressionData: (analysisType === 'regression' || analysisType === 'multiple_regression') ? computedData : undefined,
        anovaData: analysisType === 'anova' ? computedData : undefined,
        ttestData: (analysisType === 'ind_ttest' || analysisType === 'paired_ttest') ? computedData : undefined,
        twoWayAnovaData: analysisType === 'twoway_anova' ? computedData : undefined,
        aiInterpretation: {
          scholarlyWriteup: responseData.scholarlyWriteup || 'Statistical calculation completed.',
          apaReportingText: responseData.apaReportingText || 'Statistical test executed.',
          hypothesisTesting: responseData.hypothesisTesting || 'Evaluated at alpha = 0.05.',
          recommendations: responseData.recommendations || 'Review computed cell frequencies.'
        },
        createdAt: new Date().toLocaleDateString(),
        language: lang
      };

      setOutput(finalOutput);

      onSaveProject({
        id: finalOutput.id,
        type: 'spss',
        title: `SPSS ${analysisType.toUpperCase()} (${dataset.name})`,
        language: lang,
        date: finalOutput.createdAt,
        data: finalOutput
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error running statistical calculation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    const text = `SPSS ${output.type.toUpperCase()} ANALYSIS (${output.datasetName})\n\n` +
      `WRITEUP:\n${output.aiInterpretation.scholarlyWriteup}\n\n` +
      `APA STATEMENT:\n${output.aiInterpretation.apaReportingText}\n\n` +
      `HYPOTHESIS DECISION:\n${output.aiInterpretation.hypothesisTesting}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = async () => {
    if (!output) return;
    setExporting('word');
    try {
      await exportSpssToWord(output);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = () => {
    if (!output) return;
    setExporting('pdf');
    try {
      exportSpssToPdf(output);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = () => {
    if (!output) return;
    setExporting('excel');
    try {
      exportSpssToExcel(output, dataset || undefined);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const isRunDisabled = loading || !dataset || (analysisType === 'ind_ttest' && groupingVarGroups.length !== 2);

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-sky-800/50">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30">
            <Calculator className="w-4 h-4 text-sky-400" /> Professional SPSS & Data Analysis Studio
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            SPSS & Academic Data Analytics Engine
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Upload Excel (.xlsx), CSV, or SPSS (.sav) files to compute Independent T-Tests, Cronbach's alpha, Crosstab Chi-Square, ANOVA, Descriptives, and Regression with original dataset headers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <button
            onClick={loadSampleDataset}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Load Sample University Dataset
          </button>
        </div>
      </div>

      {/* Main 3-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN 1: LEFT SIDEBAR (Category Navigation & Upload / Variable Types) (3 Columns) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Analysis Category Navigation Pill List */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-2">
              Module Navigation
            </span>
            <div className="space-y-1">
              {[
                { id: 'preview', label: 'Data Preview & Types', icon: <Grid className="w-4 h-4 text-sky-500" /> },
                { id: 'questions', label: 'Research Question Advisor', icon: <HelpCircle className="w-4 h-4 text-purple-500" /> },
                { id: 'descriptive', label: 'Descriptive Statistics', icon: <BarChart className="w-4 h-4 text-emerald-500" /> },
                { id: 'tests', label: 'Statistical Tests Suite', icon: <Calculator className="w-4 h-4 text-amber-500" /> },
                { id: 'visualization', label: 'Interactive Data Visualizer', icon: <BarChart3 className="w-4 h-4 text-cyan-500" /> }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`w-full px-3 py-2.5 rounded-2xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                    activeCategory === cat.id
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Upload File Zone */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Upload className="w-4 h-4 text-sky-500" /> Upload Dataset
            </h3>

            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-2xl p-4 text-center transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/40">
              <input
                type="file"
                accept=".csv, .xlsx, .xls, .sav, .txt"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-7 h-7 mx-auto text-sky-500 mb-1" />
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Excel (.xlsx), CSV, SPSS (.sav)
              </p>
              <p className="text-[10px] text-slate-400">Click or drag file to browse</p>
            </div>

            {dataset && (
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-xs text-sky-950 dark:text-sky-200 space-y-1">
                <div className="font-bold truncate">{dataset.name}</div>
                <div className="text-[10px] text-slate-500 flex justify-between font-semibold">
                  <span>{dataset.rowCount} Rows</span>
                  <span>{dataset.columns.length} Variables</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Variable Metadata & Structure Reviewer */}
          {dataset && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-500" /> Variable Metadata & Groups
                </h4>
                <span className="text-[10px] font-bold text-slate-400">Metadata Map</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {dataset.columns.map(col => {
                  const meta = variableMetadataMap[col];
                  const currentType = variableTypes[col] || 'Scale';
                  const origHeader = meta?.originalColumnName || col;
                  const uniqueCount = meta?.uniqueCount || new Set(dataset.data.map(r => r[col])).size;
                  const valsPreview = meta?.values?.slice(0, 3).join(', ') || '';

                  return (
                    <div key={col} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center justify-between">
                        <span>{origHeader}</span>
                        <span className="text-[9px] font-mono text-sky-600 bg-sky-100 dark:bg-sky-950/80 px-1.5 py-0.5 rounded">
                          {currentType}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 font-sans">
                        {currentType !== 'Scale' ? (
                          <p className="truncate font-medium text-purple-700 dark:text-purple-300">
                            <strong>Groups ({uniqueCount}):</strong> {valsPreview}{uniqueCount > 3 ? '...' : ''}
                          </p>
                        ) : (
                          <p className="truncate text-slate-600 dark:text-slate-400">
                            <strong>Scale Metric:</strong> {uniqueCount} unique numeric values
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-1">
                        {(['Scale', 'Nominal', 'Ordinal'] as VariableType[]).map(vt => (
                          <button
                            key={vt}
                            onClick={() => handleToggleVariableType(col, vt)}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all ${
                              currentType === vt
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {vt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: CENTER AREA (Tables, Charts, Config Form) (6 Columns) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* CATEGORY 1: DATA PREVIEW & VARIABLE PROFILE */}
          {activeCategory === 'preview' && dataset && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Grid className="w-4 h-4 text-sky-500" /> Dataset Profile & Table Preview ({dataset.name})
              </h3>

              {/* Quality Metrics Grid */}
              {audit && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Rows</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{audit.rowCount}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Variables</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{audit.colCount}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duplicates</span>
                    <p className="text-lg font-extrabold text-amber-600">{audit.duplicateRows}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data Quality</span>
                    <p className="text-lg font-extrabold text-emerald-600">{audit.qualityScore}%</p>
                  </div>
                </div>
              )}

              {/* Raw Data Preview Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  First 10 Data Rows Preview:
                </span>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-serif">
                        {dataset.columns.map(c => (
                          <th key={c} className="p-2.5 border-b border-slate-800 shrink-0 whitespace-nowrap">
                            {getVarDisplayName(c)} <span className="text-[9px] text-sky-400 font-normal">({variableTypes[c] || 'Scale'})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.data.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                          {dataset.columns.map(c => (
                            <td key={c} className="p-2 border-b border-slate-100 dark:border-slate-800 font-mono text-[11px] whitespace-nowrap">
                              {String(row[c] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 2: RESEARCH QUESTIONS & AUTOMATED TEST ADVISOR */}
          {activeCategory === 'questions' && dataset && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-500" /> Research Question & Test Recommendation Advisor
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Research Question / Hypothesis *
                  </label>
                  <input
                    type="text"
                    value={userResearchQuestion}
                    onChange={e => setUserResearchQuestion(e.target.value)}
                    placeholder="e.g. Is there a significant difference in Exam Score between Male and Female students?"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Variable 1
                    </label>
                    <select
                      value={advisorVar1}
                      onChange={e => setAdvisorVar1(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {dataset.columns.map(c => <option key={c} value={c}>{getVarDisplayName(c)} ({variableTypes[c] || 'Scale'})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Variable 2
                    </label>
                    <select
                      value={advisorVar2}
                      onChange={e => setAdvisorVar2(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {dataset.columns.map(c => <option key={c} value={c}>{getVarDisplayName(c)} ({variableTypes[c] || 'Scale'})</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAdvisorEvaluate}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" /> Recommend Optimal Statistical Test
                </button>
              </div>

              {/* Advisor Recommendation Output Card */}
              {advisorRecommendation && (
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-900 dark:text-purple-300 text-sm">
                      Recommended Test: {advisorRecommendation.testName}
                    </span>
                    <button
                      onClick={() => {
                        setAnalysisType(advisorRecommendation.testId);
                        setActiveCategory('tests');
                      }}
                      className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      Run {advisorRecommendation.testName} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                    <strong>Reasoning:</strong> {advisorRecommendation.reasoning}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CATEGORY 3 & 4: STATISTICAL CALCULATIONS WORKSPACE */}
          {(activeCategory === 'descriptive' || activeCategory === 'tests') && dataset && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-sky-500" /> Statistical Calculation Setup
                </h3>
              </div>

              {/* Analysis Type Radio Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'ind_ttest', label: 'Independent T-Test' },
                  { id: 'reliability', label: "Cronbach's Alpha (α)" },
                  { id: 'crosstab', label: 'Cross Tabulation & Chi-Square' },
                  { id: 'descriptive', label: 'Descriptive Stats' },
                  { id: 'frequency', label: 'Frequency Tables' },
                  { id: 'correlation', label: 'Pearson Correlation' },
                  { id: 'paired_ttest', label: 'Paired T-Test' },
                  { id: 'anova', label: 'One-Way ANOVA' },
                  { id: 'chisquare', label: 'Chi-Square Test' },
                  { id: 'regression', label: 'Linear Regression' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAnalysisType(item.id as any)}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      analysisType === item.id
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Variable Selection Form (Shows exact original column names & grouping structures) */}
              <div className="space-y-4 pt-2">
                {analysisType === 'descriptive' || analysisType === 'correlation' || analysisType === 'reliability' ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Select Numeric Scale Variables *
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      {dataset.columns.map((col) => (
                        <label key={col} className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedNumVars.includes(col)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedNumVars([...selectedNumVars, col]);
                              else setSelectedNumVars(selectedNumVars.filter(v => v !== col));
                            }}
                            className="w-4 h-4 text-sky-600 rounded"
                          />
                          <span className="truncate font-semibold">{getVarDisplayName(col)} <span className="text-[10px] text-slate-400 font-normal">({variableTypes[col] || 'Scale'})</span></span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : analysisType === 'crosstab' || analysisType === 'chisquare' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Row Variable (Categorical) *
                      </label>
                      <select
                        value={crosstabRow}
                        onChange={(e) => setCrosstabRow(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                      >
                        {dataset.columns.map(col => {
                          const gVals = Array.from(new Set(dataset.data.map(r => r[col]))).filter(Boolean);
                          return (
                            <option key={col} value={col}>
                              {getVarDisplayName(col)} ({gVals.length} groups)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Column Variable (Categorical) *
                      </label>
                      <select
                        value={crosstabCol}
                        onChange={(e) => setCrosstabCol(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                      >
                        {dataset.columns.map(col => {
                          const gVals = Array.from(new Set(dataset.data.map(r => r[col]))).filter(Boolean);
                          return (
                            <option key={col} value={col}>
                              {getVarDisplayName(col)} ({gVals.length} groups)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                ) : analysisType === 'ind_ttest' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Dependent Variable (Numeric/Scale) *
                        </label>
                        <select
                          value={dependentVar}
                          onChange={(e) => setDependentVar(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                        >
                          {dataset.columns.map(col => (
                            <option key={col} value={col}>
                              {getVarDisplayName(col)} ({variableTypes[col] || 'Scale'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Grouping Variable (Categorical - Exactly 2 Groups) *
                        </label>
                        <select
                          value={groupingVar}
                          onChange={(e) => setGroupingVar(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                        >
                          {dataset.columns.map(col => {
                            const gVals = Array.from(new Set(dataset.data.map(r => r[col]))).filter(Boolean);
                            const isScale = variableTypes[col] === 'Scale';
                            return (
                              <option key={col} value={col}>
                                {getVarDisplayName(col)} ({isScale ? `${gVals.length} unique values - Scale` : `Groups: ${gVals.slice(0, 2).join(', ')} [${gVals.length} groups]`})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Detected Groups Feedback & Strict Validation Panel */}
                    {groupingVarGroups.length === 2 ? (
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Valid Binary Factor Detected for "{getVarDisplayName(groupingVar)}":
                        </span>
                        <span className="font-mono text-[11px]">
                          Group 1: <strong>"{groupingVarGroups[0]}"</strong> vs Group 2: <strong>"{groupingVarGroups[1]}"</strong>
                        </span>
                      </div>
                    ) : groupingVarGroups.length > 2 ? (
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Invalid Grouping Factor for Independent T-Test ({groupingVarGroups.length} Unique Values)
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Variable <strong>"{getVarDisplayName(groupingVar)}"</strong> contains {groupingVarGroups.length} unique values: <code>[{groupingVarGroups.slice(0, 4).join(', ')}{groupingVarGroups.length > 4 ? '...' : ''}]</code>. Independent Samples T-Test requires <strong>a categorical variable with exactly 2 groups</strong> (e.g., Gender). Please select a binary variable or switch to <strong>One-Way ANOVA</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800">
                        Select a binary grouping variable with 2 categories (e.g. Gender).
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dependent Variable (Continuous) *</label>
                      <select
                        value={dependentVar}
                        onChange={(e) => setDependentVar(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                      >
                        {dataset.columns.map(col => <option key={col} value={col}>{getVarDisplayName(col)}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grouping / Factor Variable *</label>
                      <select
                        value={groupingVar}
                        onChange={(e) => setGroupingVar(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                      >
                        {dataset.columns.map(col => <option key={col} value={col}>{getVarDisplayName(col)}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {aiNotice && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{aiNotice}</span>
                  </div>
                )}

                {/* Main Submit Action Button */}
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={isRunDisabled}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Computing Real Dataset Statistics & AI Interpretation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run SPSS Calculations & AI Interpretation
                    </>
                  )}
                </button>
              </div>

              {/* SPSS-Style Output Tables Center Display (All variable names resolved via getVarDisplayName) */}
              {output && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                      Authentic SPSS Output Tables
                    </h4>
                    <button
                      onClick={() => setOutput(null)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset / Check Again
                    </button>
                  </div>

                  {/* 1. Descriptives Table */}
                  {output.descriptiveData && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                      <table className="w-full text-xs text-left border-collapse font-serif">
                        <thead>
                          <tr className="bg-slate-900 text-white font-bold">
                            <th className="p-2 border-b">Variable</th>
                            <th className="p-2 border-b text-center">N</th>
                            <th className="p-2 border-b text-center">Mean</th>
                            <th className="p-2 border-b text-center">Std. Deviation</th>
                            <th className="p-2 border-b text-center">Std. Error</th>
                            <th className="p-2 border-b text-center">Variance</th>
                            <th className="p-2 border-b text-center">Min</th>
                            <th className="p-2 border-b text-center">Max</th>
                          </tr>
                        </thead>
                        <tbody>
                          {output.descriptiveData.map((d, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                              <td className="p-2 font-bold border-b text-slate-900 dark:text-slate-100">{getVarDisplayName(d.variable)}</td>
                              <td className="p-2 border-b text-center">{d.count}</td>
                              <td className="p-2 border-b text-center font-bold text-sky-600">{d.mean}</td>
                              <td className="p-2 border-b text-center">{d.stdDev}</td>
                              <td className="p-2 border-b text-center">{d.seMean}</td>
                              <td className="p-2 border-b text-center">{d.variance}</td>
                              <td className="p-2 border-b text-center">{d.min}</td>
                              <td className="p-2 border-b text-center">{d.max}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 2. Frequency Table */}
                  {output.frequencyData && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                      <table className="w-full text-xs text-left border-collapse font-serif">
                        <thead>
                          <tr className="bg-slate-900 text-white font-bold">
                            <th className="p-2 border-b">Value / Category ({getVarDisplayName(output.frequencyData.variable)})</th>
                            <th className="p-2 border-b text-center">Frequency (f)</th>
                            <th className="p-2 border-b text-center">Percent (%)</th>
                            <th className="p-2 border-b text-center">Valid Percent (%)</th>
                            <th className="p-2 border-b text-center">Cumulative Percent (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {output.frequencyData.items.map((item, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                              <td className="p-2 font-bold border-b text-slate-900 dark:text-slate-100">{item.value}</td>
                              <td className="p-2 border-b text-center font-bold text-sky-600">{item.count}</td>
                              <td className="p-2 border-b text-center">{item.percent}%</td>
                              <td className="p-2 border-b text-center">{item.validPercent}%</td>
                              <td className="p-2 border-b text-center font-mono text-[11px]">{item.cumulativePercent}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 3. Reliability Statistics Table (Cronbach's Alpha) */}
                  {output.reliabilityData && (
                    <div className="space-y-3">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-serif font-bold text-slate-800 dark:text-slate-200">
                        Reliability Scale Items: {(output.reliabilityData.variables || output.reliabilityData.itemStats?.map(i => i.variable) || []).map(getVarDisplayName).join(', ')}
                      </div>
                      <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                        <table className="w-full text-xs text-left border-collapse font-serif">
                          <thead>
                            <tr className="bg-slate-900 text-white font-bold">
                              <th className="p-2.5 border-b">Cronbach's Alpha (α)</th>
                              <th className="p-2.5 border-b text-center">N of Items</th>
                              <th className="p-2.5 border-b text-center">Internal Consistency Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-slate-900">
                              <td className="p-2.5 font-extrabold border-b text-sky-600 text-sm">{output.reliabilityData.cronbachAlpha}</td>
                              <td className="p-2.5 border-b text-center font-bold">{output.reliabilityData.itemCount}</td>
                              <td className="p-2.5 border-b text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  output.reliabilityData.cronbachAlpha >= 0.7 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {output.reliabilityData.cronbachAlpha >= 0.8 ? 'Excellent Consistency' : output.reliabilityData.cronbachAlpha >= 0.7 ? 'Acceptable Consistency' : 'Low Consistency'}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 4. Pearson Correlation Matrix Table */}
                  {output.correlationData && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                      <table className="w-full text-xs text-left border-collapse font-serif">
                        <thead>
                          <tr className="bg-slate-900 text-white font-bold">
                            <th className="p-2 border-b">Variable</th>
                            {output.correlationData.variables.map(v => (
                              <th key={v} className="p-2 border-b text-center">{getVarDisplayName(v)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {output.correlationData.variables.map((v1, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                              <td className="p-2 font-bold border-b text-slate-900 dark:text-slate-100">{getVarDisplayName(v1)}</td>
                              {output.correlationData!.variables.map(v2 => {
                                const cell = output.correlationData!.matrix[v1]?.[v2];
                                return (
                                  <td key={v2} className="p-2 border-b text-center font-mono text-[11px]">
                                    {cell ? (
                                      <div>
                                        <span className="font-bold text-sky-600">{cell.r}</span>
                                        <span className="text-[10px] text-slate-400 block">p = {cell.p}</span>
                                      </div>
                                    ) : '-'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 5. T-Test Results Tables (Group Statistics + Independent Samples Test) */}
                  {output.ttestData && (
                    <div className="space-y-4">
                      {/* Group Statistics Table */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block font-serif">
                          Group Statistics ({getVarDisplayName(output.ttestData.variableName)})
                        </span>
                        <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                          <table className="w-full text-xs text-left border-collapse font-serif">
                            <thead>
                              <tr className="bg-slate-900 text-white font-bold">
                                <th className="p-2 border-b">Grouping Factor</th>
                                <th className="p-2 border-b text-center">N</th>
                                <th className="p-2 border-b text-center">Mean</th>
                                <th className="p-2 border-b text-center">Std. Deviation</th>
                                <th className="p-2 border-b text-center">Std. Error Mean</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-white dark:bg-slate-900">
                                <td className="p-2 font-bold border-b text-slate-900 dark:text-slate-100">{output.ttestData.group1Name}</td>
                                <td className="p-2 border-b text-center font-bold">{output.ttestData.group1Count}</td>
                                <td className="p-2 border-b text-center font-bold text-sky-600">{output.ttestData.group1Mean}</td>
                                <td className="p-2 border-b text-center">{output.ttestData.group1Sd}</td>
                                <td className="p-2 border-b text-center font-mono">{(output.ttestData.group1Sd / Math.sqrt(output.ttestData.group1Count || 1)).toFixed(3)}</td>
                              </tr>
                              <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td className="p-2 font-bold border-b text-slate-900 dark:text-slate-100">{output.ttestData.group2Name}</td>
                                <td className="p-2 border-b text-center font-bold">{output.ttestData.group2Count}</td>
                                <td className="p-2 border-b text-center font-bold text-sky-600">{output.ttestData.group2Mean}</td>
                                <td className="p-2 border-b text-center">{output.ttestData.group2Sd}</td>
                                <td className="p-2 border-b text-center font-mono">{(output.ttestData.group2Sd / Math.sqrt(output.ttestData.group2Count || 1)).toFixed(3)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Independent Samples Test Table */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block font-serif">
                          Independent Samples Test (Equal Variances Assumed)
                        </span>
                        <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                          <table className="w-full text-xs text-left border-collapse font-serif">
                            <thead>
                              <tr className="bg-slate-900 text-white font-bold">
                                <th className="p-2 border-b">Metric</th>
                                <th className="p-2 border-b text-center">t-Statistic</th>
                                <th className="p-2 border-b text-center">df</th>
                                <th className="p-2 border-b text-center">Sig. (2-tailed p)</th>
                                <th className="p-2 border-b text-center">Mean Difference</th>
                                <th className="p-2 border-b text-center">95% CI Lower</th>
                                <th className="p-2 border-b text-center">95% CI Upper</th>
                                <th className="p-2 border-b text-center">Cohen's d</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-white dark:bg-slate-900">
                                <td className="p-2 font-bold border-b text-slate-900 dark:text-slate-100">{getVarDisplayName(output.ttestData.variableName)}</td>
                                <td className="p-2 border-b text-center font-bold text-sky-600">{output.ttestData.tStat}</td>
                                <td className="p-2 border-b text-center font-mono">{output.ttestData.df}</td>
                                <td className="p-2 border-b text-center font-bold">{output.ttestData.pValue}</td>
                                <td className="p-2 border-b text-center font-mono">{output.ttestData.meanDiff}</td>
                                <td className="p-2 border-b text-center font-mono text-slate-600 dark:text-slate-300">{output.ttestData.ci95Lower ?? '-'}</td>
                                <td className="p-2 border-b text-center font-mono text-slate-600 dark:text-slate-300">{output.ttestData.ci95Upper ?? '-'}</td>
                                <td className="p-2 border-b text-center font-bold text-purple-600">{output.ttestData.cohensD ?? 'N/A'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. One-Way ANOVA Summary Table */}
                  {output.anovaData && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                      <table className="w-full text-xs text-left border-collapse font-serif">
                        <thead>
                          <tr className="bg-slate-900 text-white font-bold">
                            <th className="p-2 border-b">Source of Variation ({getVarDisplayName(output.anovaData.dv)})</th>
                            <th className="p-2 border-b text-center">Sum of Squares (SS)</th>
                            <th className="p-2 border-b text-center">df</th>
                            <th className="p-2 border-b text-center">Mean Square (MS)</th>
                            <th className="p-2 border-b text-center">F-Statistic</th>
                            <th className="p-2 border-b text-center">Sig. (p)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white dark:bg-slate-900">
                            <td className="p-2 font-bold border-b">Between Groups ({getVarDisplayName(output.anovaData.groupingVar)})</td>
                            <td className="p-2 border-b text-center">{output.anovaData.betweenSS}</td>
                            <td className="p-2 border-b text-center">{output.anovaData.betweenDf}</td>
                            <td className="p-2 border-b text-center">{output.anovaData.betweenMS}</td>
                            <td className="p-2 border-b text-center font-bold text-sky-600">{output.anovaData.fStat}</td>
                            <td className="p-2 border-b text-center font-bold">{output.anovaData.pValue}</td>
                          </tr>
                          <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <td className="p-2 font-bold border-b">Within Groups</td>
                            <td className="p-2 border-b text-center">{output.anovaData.withinSS}</td>
                            <td className="p-2 border-b text-center">{output.anovaData.withinDf}</td>
                            <td className="p-2 border-b text-center">{output.anovaData.withinMS}</td>
                            <td className="p-2 border-b text-center">-</td>
                            <td className="p-2 border-b text-center">-</td>
                          </tr>
                          <tr className="bg-white dark:bg-slate-900 font-bold">
                            <td className="p-2 border-b">Total</td>
                            <td className="p-2 border-b text-center">{output.anovaData.totalSS}</td>
                            <td className="p-2 border-b text-center">{output.anovaData.totalDf}</td>
                            <td className="p-2 border-b text-center">-</td>
                            <td className="p-2 border-b text-center">-</td>
                            <td className="p-2 border-b text-center">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 7. Crosstab & Chi-Square Test Tables */}
                  {output.crosstabData && (
                    <div className="space-y-4">
                      {/* Contingency Table */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block font-serif">
                          {getVarDisplayName(output.crosstabData.rowVar)} * {getVarDisplayName(output.crosstabData.colVar)} Crosstabulation (Contingency Table)
                        </span>
                        <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                          <table className="w-full text-xs text-left border-collapse font-serif">
                            <thead>
                              <tr className="bg-slate-900 text-white font-bold">
                                <th className="p-2 border-b">{getVarDisplayName(output.crosstabData.rowVar)}</th>
                                <th className="p-2 border-b text-center">Metric</th>
                                {output.crosstabData.colValues.map(colVal => (
                                  <th key={colVal} className="p-2 border-b text-center">{colVal}</th>
                                ))}
                                <th className="p-2 border-b text-center bg-slate-800">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {output.crosstabData.rowValues.map((rowVal, rIdx) => {
                                const rowTotalCount = output.crosstabData!.counts[rIdx]?.reduce((a, b) => a + b, 0) || 0;
                                return (
                                  <React.Fragment key={rowVal}>
                                    <tr className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                                      <td rowSpan={3} className="p-2 font-bold border-b text-slate-900 dark:text-slate-100 align-top bg-slate-50 dark:bg-slate-800/40">
                                        {rowVal}
                                      </td>
                                      <td className="p-1.5 font-semibold text-slate-600 dark:text-slate-300 text-center">Count (f)</td>
                                      {output.crosstabData!.colValues.map((_, cIdx) => (
                                        <td key={cIdx} className="p-1.5 text-center font-bold text-sky-600">
                                          {output.crosstabData!.counts[rIdx]?.[cIdx] ?? 0}
                                        </td>
                                      ))}
                                      <td className="p-1.5 text-center font-bold bg-slate-100 dark:bg-slate-800">{rowTotalCount}</td>
                                    </tr>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                      <td className="p-1.5 text-[11px] text-slate-500 text-center">% within {getVarDisplayName(output.crosstabData!.rowVar)}</td>
                                      {output.crosstabData!.colValues.map((_, cIdx) => (
                                        <td key={cIdx} className="p-1.5 text-center font-mono text-[11px]">
                                          {output.crosstabData!.rowPercents[rIdx]?.[cIdx] ?? 0}%
                                        </td>
                                      ))}
                                      <td className="p-1.5 text-center font-mono text-[11px] bg-slate-100 dark:bg-slate-800">100.0%</td>
                                    </tr>
                                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                      <td className="p-1.5 text-[11px] text-slate-500 text-center">% within {getVarDisplayName(output.crosstabData!.colVar)}</td>
                                      {output.crosstabData!.colValues.map((_, cIdx) => (
                                        <td key={cIdx} className="p-1.5 text-center font-mono text-[11px]">
                                          {output.crosstabData!.colPercents[rIdx]?.[cIdx] ?? 0}%
                                        </td>
                                      ))}
                                      <td className="p-1.5 text-center font-mono text-[11px] bg-slate-100 dark:bg-slate-800">-</td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Chi-Square Tests Table */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block font-serif">
                          Chi-Square Tests
                        </span>
                        <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                          <table className="w-full text-xs text-left border-collapse font-serif">
                            <thead>
                              <tr className="bg-slate-900 text-white font-bold">
                                <th className="p-2 border-b">Test Statistic</th>
                                <th className="p-2 border-b text-center">Value (χ²)</th>
                                <th className="p-2 border-b text-center">df</th>
                                <th className="p-2 border-b text-center">Asymptotic Sig. (2-sided p)</th>
                                <th className="p-2 border-b text-center">Cramér's V Effect Size</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-white dark:bg-slate-900">
                                <td className="p-2 font-bold border-b text-slate-900 dark:text-slate-100">Pearson Chi-Square</td>
                                <td className="p-2 border-b text-center font-bold text-sky-600">{output.crosstabData.chiSquare?.stat ?? 'N/A'}</td>
                                <td className="p-2 border-b text-center font-mono">{output.crosstabData.chiSquare?.df ?? 'N/A'}</td>
                                <td className="p-2 border-b text-center font-bold">{output.crosstabData.chiSquare?.pValue ?? 'N/A'}</td>
                                <td className="p-2 border-b text-center font-bold text-purple-600">{output.crosstabData.chiSquare?.cramersV ?? 'N/A'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. Linear Regression Summary & Coefficients Tables */}
                  {output.regressionData && (
                    <div className="space-y-4">
                      {/* Model Summary Table */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                        <table className="w-full text-xs text-left border-collapse font-serif">
                          <thead>
                            <tr className="bg-slate-900 text-white font-bold">
                              <th className="p-2 border-b">Model</th>
                              <th className="p-2 border-b text-center">R</th>
                              <th className="p-2 border-b text-center">R Square (R²)</th>
                              <th className="p-2 border-b text-center">Adjusted R²</th>
                              <th className="p-2 border-b text-center">F-Statistic</th>
                              <th className="p-2 border-b text-center">Sig. (p)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white dark:bg-slate-900">
                              <td className="p-2 font-bold border-b">1</td>
                              <td className="p-2 border-b text-center">{output.regressionData.r}</td>
                              <td className="p-2 border-b text-center font-bold text-sky-600">{output.regressionData.r2}</td>
                              <td className="p-2 border-b text-center">{output.regressionData.adjR2}</td>
                              <td className="p-2 border-b text-center font-bold">{output.regressionData.fStat}</td>
                              <td className="p-2 border-b text-center font-bold">{output.regressionData.pValue}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Coefficients Table */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
                        <table className="w-full text-xs text-left border-collapse font-serif">
                          <thead>
                            <tr className="bg-slate-900 text-white font-bold">
                              <th className="p-2 border-b">Predictor Model</th>
                              <th className="p-2 border-b text-center">Unstandardized B</th>
                              <th className="p-2 border-b text-center">Std. Error</th>
                              <th className="p-2 border-b text-center">Standardized Beta (β)</th>
                              <th className="p-2 border-b text-center">t-Statistic</th>
                              <th className="p-2 border-b text-center">Sig. (p)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {output.regressionData.coefficients.map((coeff, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                                <td className="p-2 font-bold border-b text-slate-900 dark:text-slate-100">{getVarDisplayName(coeff.variable)}</td>
                                <td className="p-2 border-b text-center font-mono">{coeff.b}</td>
                                <td className="p-2 border-b text-center">{coeff.stdErr}</td>
                                <td className="p-2 border-b text-center font-bold text-purple-600">{coeff.beta}</td>
                                <td className="p-2 border-b text-center font-bold text-sky-600">{coeff.tStat}</td>
                                <td className="p-2 border-b text-center font-bold">{coeff.pValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CATEGORY 5: VISUALIZATION */}
          {activeCategory === 'visualization' && dataset && (
            <InteractiveDataVisualizer dataset={dataset} lang={lang} />
          )}
        </div>

        {/* COLUMN 3: RIGHT PANEL (AI Interpretation, APA 7 Statements & Export Suite) (3 Columns) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* AI Interpretation Panel */}
          {output ? (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" /> AI Scholarly Interpretation & APA 7 Statement
              </h3>

              {/* Hypothesis Decision Badge */}
              {output.aiInterpretation.hypothesisTesting && (
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs space-y-1">
                  <span className="font-bold text-purple-900 dark:text-purple-300 text-[10px] uppercase block">
                    Hypothesis Test Decision:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed text-[11px]">
                    {output.aiInterpretation.hypothesisTesting}
                  </p>
                </div>
              )}

              {/* APA 7 Formal Reporting Text */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 font-serif">
                <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase block font-sans">
                  APA 7th Edition Reporting Standard:
                </span>
                <p className="italic text-slate-900 dark:text-slate-100 leading-relaxed text-[11px]">
                  "{output.aiInterpretation.apaReportingText}"
                </p>
              </div>

              {/* Full Academic Scholarly Writeup */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Detailed Academic Interpretation:
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-serif whitespace-pre-wrap">
                  {output.aiInterpretation.scholarlyWriteup}
                </p>
              </div>

              {/* Export Suite Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Export Analysis Suite:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    onClick={handleExportWord}
                    disabled={exporting === 'word'}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> DOCX
                  </button>

                  <button
                    onClick={handleExportPdf}
                    disabled={exporting === 'pdf'}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>

                  <button
                    onClick={handleExportExcel}
                    disabled={exporting === 'excel'}
                    className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1 shadow-sm col-span-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Excel & Full Data
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <Info className="w-8 h-8 mx-auto text-slate-400" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  AI Interpretation Panel
                </h4>
                <p className="text-[11px] text-slate-500">
                  Run a statistical test to view APA 7 reporting statements, hypothesis decisions, and effect size writeups here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
