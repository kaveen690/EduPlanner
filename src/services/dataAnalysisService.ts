import {
  SpssDataset,
  DescriptiveResult,
  CorrelationResult,
  RegressionResult,
  AnovaResult,
  CrosstabResult,
  TTestResult,
  FrequencyResult,
  ReliabilityResult,
  DataCleaningOptions,
  ResearchQuestionItem
} from '../types';
import {
  computeDescriptives,
  computeCorrelationMatrix,
  computeSpearmanCorrelation,
  computeRegression,
  computeAnova,
  computeCrosstab,
  computeIndependentTTest,
  computePairedTTest,
  computeFrequencyAnalysis,
  computeReliabilityAnalysis,
  auditDataset,
  cleanDataset
} from '../lib/spssStats';
import { parseUploadedFile, ParsedFileResult } from '../lib/fileParser';
import { aiService } from './aiService';

export interface VariableMetaInfo {
  name: string;
  dataType: 'numeric' | 'categorical';
  measurementLevel: 'Scale' | 'Nominal' | 'Ordinal';
  missingCount: number;
  missingPercent: number;
  uniqueValuesCount: number;
  sampleValues: any[];
}

export interface DatasetAuditSummary {
  totalRows: number;
  totalColumns: number;
  totalCells: number;
  totalMissingCells: number;
  missingCellPercent: number;
  duplicateRowsCount: number;
  outlierCount: number;
  variables: VariableMetaInfo[];
}

/**
 * Data Analysis Calculation & Service Layer
 * Decouples the UI components from statistical logic and enables easy integration
 * with external Python statistical engines (pandas, scipy, statsmodels).
 */
export class DataAnalysisService {
  /**
   * Send file via multipart/form-data to /api/data-analysis/upload
   */
  async uploadFileToServer(file: File): Promise<{
    success: boolean;
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    isSavFormat?: boolean;
    rows?: any[];
    headers?: string[];
    rowsCount?: number;
    colsCount?: number;
    message?: string;
    error?: string;
  }> {
    // 1. File Validation
    const ext = file.name.slice(((file.name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
    const validExts = ['xlsx', 'xls', 'csv', 'sav'];

    if (!validExts.includes(ext)) {
      return {
        success: false,
        error: `Unsupported file type '.${ext}'. Allowed formats: .xlsx, .xls, .csv, .sav`
      };
    }

    if (file.size === 0) {
      return {
        success: false,
        error: 'File is empty.'
      };
    }

    if (file.size > 25 * 1024 * 1024) {
      return {
        success: false,
        error: 'File is too large (maximum size is 25MB).'
      };
    }

    // 2. Perform Real Multipart/Form-Data API Call
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/data-analysis/upload', {
        method: 'POST',
        body: formData // Browser automatically manages multipart Content-Type header with boundary
      });

      if (!response.ok) {
        let errMsg = `Upload failed with HTTP status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch (e) {}
        return { success: false, error: errMsg };
      }

      const resData = await response.json();
      return resData;
    } catch (err: any) {
      console.error('[Upload API Error]:', err);
      // Fallback: If backend route is not reachable, execute client-side parser cleanly
      try {
        const parsed = await parseUploadedFile(file);
        if (!parsed.success) {
          return { success: false, error: parsed.error || 'Upload failed. Please try again.' };
        }
        const rows = parsed.structuredRows || [];
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        return {
          success: true,
          fileId: `client_${Date.now()}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: ext,
          rows,
          headers,
          rowsCount: rows.length,
          colsCount: headers.length
        };
      } catch (clientErr: any) {
        return {
          success: false,
          error: clientErr?.message || 'Upload failed. Please try again.'
        };
      }
    }
  }

  /**
   * Parse uploaded data files (.csv, .xlsx, .xls) and return structured rows
   */
  async parseFile(file: File): Promise<ParsedFileResult> {
    // Validate file type
    const ext = file.name.slice(((file.name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
    const validExts = ['csv', 'xlsx', 'xls', 'sav'];
    if (!validExts.includes(ext)) {
      return {
        success: false,
        fileName: file.name,
        fileSizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
        fileSizeRawBytes: file.size,
        fileType: ext.toUpperCase(),
        extractedText: '',
        wordCount: 0,
        error: `Unsupported file format '.${ext}'. Supported formats: .xlsx, .xls, .csv, .sav.`
      };
    }

    // Limit file size (e.g. 25MB max)
    if (file.size > 25 * 1024 * 1024) {
      return {
        success: false,
        fileName: file.name,
        fileSizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileSizeRawBytes: file.size,
        fileType: ext.toUpperCase(),
        extractedText: '',
        wordCount: 0,
        error: 'File size exceeds maximum limit of 25MB.'
      };
    }

    if (ext === 'sav') {
      return {
        success: true,
        fileName: file.name,
        fileSizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
        fileSizeRawBytes: file.size,
        fileType: 'SAV',
        extractedText: 'SPSS Dataset (.sav) file uploaded.',
        wordCount: 0,
        error: undefined
      };
    }

    return await parseUploadedFile(file);
  }

  /**
   * Audit dataset for data cleaning: count missing values, duplicates, outliers, data types
   */
  audit(dataset: Record<string, any>[]): DatasetAuditSummary {
    if (!dataset || dataset.length === 0) {
      return {
        totalRows: 0,
        totalColumns: 0,
        totalCells: 0,
        totalMissingCells: 0,
        missingCellPercent: 0,
        duplicateRowsCount: 0,
        outlierCount: 0,
        variables: []
      };
    }

    const columns = Object.keys(dataset[0]);
    const totalRows = dataset.length;
    const totalColumns = columns.length;
    const totalCells = totalRows * totalColumns;

    let totalMissingCells = 0;
    const variables: VariableMetaInfo[] = [];

    // Duplicate detection
    const rowStrings = new Set<string>();
    let duplicateRowsCount = 0;
    for (const row of dataset) {
      const s = JSON.stringify(row);
      if (rowStrings.has(s)) {
        duplicateRowsCount++;
      } else {
        rowStrings.add(s);
      }
    }

    let outlierCount = 0;

    for (const col of columns) {
      const vals = dataset.map(r => r[col]);
      let missingInCol = 0;
      const uniqueVals = new Set<any>();
      const numericVals: number[] = [];

      for (const v of vals) {
        if (v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))) {
          missingInCol++;
        } else {
          uniqueVals.add(v);
          const num = Number(v);
          if (!isNaN(num)) {
            numericVals.push(num);
          }
        }
      }

      totalMissingCells += missingInCol;
      const isNumeric = numericVals.length / Math.max(1, vals.length - missingInCol) > 0.7;

      // IQR outlier detection for numeric variables
      if (isNumeric && numericVals.length > 4) {
        const sorted = [...numericVals].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        for (const num of numericVals) {
          if (num < lowerBound || num > upperBound) {
            outlierCount++;
          }
        }
      }

      // Infer measurement level
      let measurementLevel: 'Scale' | 'Nominal' | 'Ordinal' = 'Scale';
      if (!isNumeric) {
        measurementLevel = 'Nominal';
      } else if (uniqueVals.size <= 7) {
        measurementLevel = 'Ordinal';
      }

      variables.push({
        name: col,
        dataType: isNumeric ? 'numeric' : 'categorical',
        measurementLevel,
        missingCount: missingInCol,
        missingPercent: Number(((missingInCol / totalRows) * 100).toFixed(1)),
        uniqueValuesCount: uniqueVals.size,
        sampleValues: Array.from(uniqueVals).slice(0, 5)
      });
    }

    return {
      totalRows,
      totalColumns,
      totalCells,
      totalMissingCells,
      missingCellPercent: Number(((totalMissingCells / Math.max(1, totalCells)) * 100).toFixed(1)),
      duplicateRowsCount,
      outlierCount,
      variables
    };
  }

  /**
   * Apply data cleaning operations
   */
  applyCleaning(dataset: Record<string, any>[], options: DataCleaningOptions): Record<string, any>[] {
    if (!dataset || dataset.length === 0) return [];

    let cleaned = [...dataset];

    // 1. Remove duplicate rows
    if (options.removeDuplicates) {
      const seen = new Set<string>();
      cleaned = cleaned.filter(row => {
        const s = JSON.stringify(row);
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
      });
    }

    // 2. Remove specified columns
    if (options.removeColumns && options.removeColumns.length > 0) {
      cleaned = cleaned.map(row => {
        const newRow = { ...row };
        options.removeColumns.forEach(col => delete newRow[col]);
        return newRow;
      });
    }

    // 3. Rename columns
    if (options.columnRenames && Object.keys(options.columnRenames).length > 0) {
      cleaned = cleaned.map(row => {
        const newRow: Record<string, any> = {};
        for (const key of Object.keys(row)) {
          const newName = options.columnRenames[key] || key;
          newRow[newName] = row[key];
        }
        return newRow;
      });
    }

    // 4. Missing value handling
    if (options.missingValueAction === 'remove_rows') {
      cleaned = cleaned.filter(row => {
        return Object.values(row).every(v => v !== null && v !== undefined && v !== '' && !Number.isNaN(v));
      });
    } else if (['mean', 'median', 'mode'].includes(options.missingValueAction)) {
      const columns = Object.keys(cleaned[0] || {});
      const imputeMap: Record<string, any> = {};

      for (const col of columns) {
        const validVals = cleaned
          .map(r => r[col])
          .filter(v => v !== null && v !== undefined && v !== '' && !Number.isNaN(v));

        const numericVals = validVals.map(v => Number(v)).filter(v => !isNaN(v));

        if (numericVals.length > 0) {
          if (options.missingValueAction === 'mean') {
            const sum = numericVals.reduce((a, b) => a + b, 0);
            imputeMap[col] = Number((sum / numericVals.length).toFixed(3));
          } else if (options.missingValueAction === 'median') {
            const sorted = [...numericVals].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            imputeMap[col] = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
          } else if (options.missingValueAction === 'mode') {
            const freq: Record<string, number> = {};
            validVals.forEach(v => {
              freq[v] = (freq[v] || 0) + 1;
            });
            const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
            imputeMap[col] = top ? top[0] : '';
          }
        }
      }

      cleaned = cleaned.map(row => {
        const newRow = { ...row };
        for (const col of Object.keys(newRow)) {
          const val = newRow[col];
          if (val === null || val === undefined || val === '' || Number.isNaN(val)) {
            if (imputeMap[col] !== undefined) {
              newRow[col] = imputeMap[col];
            }
          }
        }
        return newRow;
      });
    }

    return cleaned;
  }

  /**
   * Recommend appropriate statistical test based on variable properties
   */
  recommendTestForRQ(
    varInfo: VariableMetaInfo[],
    selectedVarNames: string[]
  ): { recommendedTest: string; reason: string } {
    if (selectedVarNames.length === 0) {
      return { recommendedTest: 'descriptive', reason: 'Select variables to receive statistical test recommendation.' };
    }

    const selectedMetas = varInfo.filter(v => selectedVarNames.includes(v.name));

    if (selectedVarNames.length === 1) {
      const meta = selectedMetas[0];
      if (!meta || meta.dataType === 'categorical' || meta.measurementLevel === 'Nominal') {
        return { recommendedTest: 'frequency', reason: 'Single categorical/nominal variable selected -> Frequency Analysis.' };
      }
      return { recommendedTest: 'descriptive', reason: 'Single continuous scale variable selected -> Descriptive Statistics.' };
    }

    if (selectedVarNames.length === 2) {
      const [v1, v2] = selectedMetas;
      if (!v1 || !v2) return { recommendedTest: 'descriptive', reason: 'Insufficient variable metadata.' };

      // Categorical + Scale -> T-Test or ANOVA
      if (
        (v1.dataType === 'categorical' || v1.uniqueValuesCount <= 10) &&
        v2.dataType === 'numeric'
      ) {
        if (v1.uniqueValuesCount === 2) {
          return { recommendedTest: 'independent_ttest', reason: '1 Grouping variable (2 categories) + 1 Scale DV -> Independent Samples T-Test.' };
        }
        return { recommendedTest: 'anova', reason: '1 Grouping variable (>2 categories) + 1 Scale DV -> One-Way ANOVA.' };
      }
      if (
        (v2.dataType === 'categorical' || v2.uniqueValuesCount <= 10) &&
        v1.dataType === 'numeric'
      ) {
        if (v2.uniqueValuesCount === 2) {
          return { recommendedTest: 'independent_ttest', reason: '1 Grouping variable (2 categories) + 1 Scale DV -> Independent Samples T-Test.' };
        }
        return { recommendedTest: 'anova', reason: '1 Grouping variable (>2 categories) + 1 Scale DV -> One-Way ANOVA.' };
      }

      // Categorical + Categorical -> Chi-Square
      if (v1.dataType === 'categorical' && v2.dataType === 'categorical') {
        return { recommendedTest: 'chisquare', reason: '2 Categorical variables -> Chi-Square Test of Independence.' };
      }

      // Numeric + Numeric -> Pearson / Spearman Correlation
      if (v1.dataType === 'numeric' && v2.dataType === 'numeric') {
        if (v1.measurementLevel === 'Ordinal' || v2.measurementLevel === 'Ordinal') {
          return { recommendedTest: 'spearman', reason: '2 Ordinal/Ranked numeric variables -> Spearman Rank Correlation.' };
        }
        return { recommendedTest: 'pearson', reason: '2 Continuous Scale numeric variables -> Pearson Correlation.' };
      }
    }

    // >2 variables
    const allNumeric = selectedMetas.every(v => v.dataType === 'numeric');
    if (allNumeric) {
      if (selectedMetas.every(v => v.measurementLevel === 'Scale')) {
        return { recommendedTest: 'regression', reason: 'Multiple numeric variables selected -> Linear Multiple Regression.' };
      }
      return { recommendedTest: 'reliability', reason: 'Multiple questionnaire Likert items selected -> Cronbach’s Alpha Reliability.' };
    }

    return { recommendedTest: 'pearson', reason: 'Multiple variables selected -> Correlation Matrix or Regression.' };
  }

  /**
   * Run descriptive statistics
   */
  runDescriptives(dataset: Record<string, any>[], variables: string[]): DescriptiveResult[] {
    return variables.map(v => {
      const data = dataset.map(row => Number(row[v])).filter(n => !isNaN(n));
      return computeDescriptives(data, v);
    });
  }

  /**
   * Run categorical frequency analysis
   */
  runFrequencies(dataset: Record<string, any>[], variables: string[]): FrequencyResult[] {
    return variables.map(v => computeFrequencyAnalysis(dataset, v));
  }

  /**
   * Run statistical test by type
   */
  runStatisticalTest(
    testType: string,
    dataset: Record<string, any>[],
    options: {
      dv?: string;
      ivs?: string[];
      groupingVar?: string;
      rowVar?: string;
      colVar?: string;
      var1?: string;
      var2?: string;
      variables?: string[];
    }
  ): any {
    switch (testType) {
      case 'independent_ttest': {
        if (!options.dv || !options.groupingVar) {
          throw new Error('Independent Samples T-Test requires a Dependent Variable and a Grouping Variable.');
        }
        return computeIndependentTTest(dataset, options.dv, options.groupingVar);
      }
      case 'paired_ttest': {
        if (!options.var1 || !options.var2) {
          throw new Error('Paired Samples T-Test requires two paired variables (Pre vs Post).');
        }
        return computePairedTTest(dataset, options.var1, options.var2);
      }
      case 'anova': {
        if (!options.dv || !options.groupingVar) {
          throw new Error('One-Way ANOVA requires a Dependent Variable and a Grouping Variable.');
        }
        return computeAnova(dataset, options.dv, options.groupingVar);
      }
      case 'chisquare': {
        if (!options.rowVar || !options.colVar) {
          throw new Error('Chi-Square Test requires a Row Variable and a Column Variable.');
        }
        return computeCrosstab(dataset, options.rowVar, options.colVar);
      }
      case 'pearson': {
        const vars = options.variables && options.variables.length > 0 ? options.variables : [options.var1, options.var2].filter(Boolean) as string[];
        if (vars.length < 2) {
          throw new Error('Pearson Correlation requires at least 2 variables.');
        }
        return computeCorrelationMatrix(dataset, vars);
      }
      case 'spearman': {
        const vars = options.variables && options.variables.length > 0 ? options.variables : [options.var1, options.var2].filter(Boolean) as string[];
        if (vars.length < 2) {
          throw new Error('Spearman Correlation requires at least 2 variables.');
        }
        return computeSpearmanCorrelation(dataset, vars);
      }
      case 'regression': {
        if (!options.dv || !options.ivs || options.ivs.length === 0) {
          throw new Error('Linear Regression requires 1 Dependent Variable and at least 1 Independent Variable.');
        }
        return computeRegression(dataset, options.dv, options.ivs);
      }
      case 'reliability': {
        const vars = options.variables || [];
        if (vars.length < 2) {
          throw new Error('Cronbach’s Alpha Reliability Analysis requires at least 2 scale items.');
        }
        return computeReliabilityAnalysis(dataset, vars);
      }
      default:
        throw new Error(`Unknown statistical test type '${testType}'.`);
    }
  }

  /**
   * Academic AI Interpretation Generator
   */
  async generateAcademicInterpretation(
    testType: string,
    resultData: any,
    datasetName: string,
    lang: string
  ): Promise<string> {
    try {
      const prompt = `You are a senior university professor and biostatistician reviewing empirical statistical outputs.
Language of writeup: ${lang === 'ku' || lang === 'bad' ? 'Kurdish' : lang === 'ar' ? 'Arabic' : 'English'}.
Dataset Name: ${datasetName}
Statistical Test: ${testType.toUpperCase()}
Empirical Calculations: ${JSON.stringify(resultData, null, 2)}

Provide an academic APA 7th edition writeup with the exact format:
Finding: (Report exact sample values, means, test statistics, and p-values)
Interpretation: (What this statistical result means conceptually and practically)
Statistical Significance: (Explicitly state if p < 0.05 or p >= 0.05 without fabricating)
Conclusion: (Academic conclusions for research report)

CRITICAL: Do NOT invent numbers. Only interpret the actual calculated results provided above.`;

      const aiResponse = await aiService.postGeminiChat({
        prompt,
        language: lang as any
      });

      if (aiResponse && aiResponse.reply) {
        return aiResponse.reply;
      }
    } catch (e) {
      console.warn('AI Interpretation call fallback:', e);
    }

    // Local Academic Fallback Generator
    return this.generateLocalInterpretationFallback(testType, resultData);
  }

  /**
   * Deterministic Local Academic Interpretation Fallback
   */
  generateLocalInterpretationFallback(testType: string, data: any): string {
    if (testType === 'independent_ttest') {
      const isSig = (data.pValue ?? 1) < 0.05;
      return `Finding: An independent samples t-test was conducted comparing ${data.group1Name} (M = ${data.group1Mean}, SD = ${data.group1Sd}) and ${data.group2Name} (M = ${data.group2Mean}, SD = ${data.group2Sd}). The mean difference was ${data.meanDiff}, t(${data.df}) = ${data.tStat}, p = ${data.pValue}.
Interpretation: The data demonstrates ${isSig ? 'a significant difference' : 'no statistically significant difference'} between the two groups.
Statistical Significance: ${isSig ? 'Statistically Significant (p < 0.05).' : 'Not Statistically Significant (p >= 0.05).'}`;
    }

    if (testType === 'anova') {
      const isSig = (data.pValue ?? 1) < 0.05;
      return `Finding: A One-Way ANOVA was executed for '${data.dv}' across groups of '${data.groupingVar}'. The test yielded F(${data.betweenDf}, ${data.withinDf}) = ${data.fStat}, p = ${data.pValue}.
Interpretation: There is ${isSig ? 'a statistically significant variance' : 'no significant variance'} across the group means.
Statistical Significance: ${isSig ? 'Statistically Significant (p < 0.05).' : 'Not Statistically Significant (p >= 0.05).'}`;
    }

    if (testType === 'regression') {
      const isSig = (data.pValue ?? 1) < 0.05;
      return `Finding: A Linear Regression analysis predicting '${data.dv}' from predictors [${data.ivs.join(', ')}] yielded R² = ${data.r2}, Adjusted R² = ${data.adjR2}, F = ${data.fStat}, p = ${data.pValue}.
Interpretation: The predictor variables account for ${(data.r2 * 100).toFixed(1)}% of the total variance in '${data.dv}'.
Statistical Significance: ${isSig ? 'Statistically Significant Model (p < 0.05).' : 'Not Statistically Significant Model (p >= 0.05).'}`;
    }

    if (testType === 'reliability') {
      const alpha = data.cronbachAlpha ?? 0;
      const isGood = alpha >= 0.7;
      return `Finding: Cronbach's Alpha reliability analysis across ${data.itemCount} items yielded α = ${alpha}.
Interpretation: The survey scale demonstrates ${isGood ? 'acceptable internal consistency and scale reliability' : 'low internal consistency across items'}.
Statistical Significance: ${isGood ? 'Acceptable Reliability (α >= 0.70).' : 'Insufficient Reliability (α < 0.70).'}`;
    }

    return `Finding: Analysis (${testType}) computed cleanly with valid empirical statistics.
Interpretation: Results reflect actual calculated dataset distributions.`;
  }

  /**
   * Build structured Chapter 4 Results & Findings text
   */
  buildChapter4Text(
    datasetName: string,
    rqs: ResearchQuestionItem[],
    auditSummary: DatasetAuditSummary
  ): string {
    const sections: string[] = [];

    sections.push(`CHAPTER FOUR\nRESULTS AND FINDINGS\n\n4.1 Introduction\nThis chapter presents the empirical results derived from the quantitative data analysis of dataset "${datasetName}". The sample consists of ${auditSummary.totalRows} observations across ${auditSummary.totalColumns} variables. The data was subjected to data cleaning, descriptive statistics, and appropriate inferential statistical testing in accordance with standard academic research methodologies.`);

    sections.push(`\n4.2 Demographic Information & Descriptive Characteristics\nThe dataset encompasses ${auditSummary.totalColumns} variables. Baseline descriptive metrics were evaluated for all measured variables to assess central tendency, dispersion, and missing data distributions.`);

    sections.push(`\n4.3 Analysis of Research Questions`);

    rqs.forEach((rq, idx) => {
      const rqNum = idx + 1;
      sections.push(`\n4.3.${rqNum} Research Question ${rqNum}: ${rq.rqText || `Evaluation of target variables [${rq.selectedVars.join(', ')}]`}\nTo address Research Question ${rqNum}, a ${rq.selectedTest.toUpperCase()} test was conducted with significance threshold alpha = ${rq.alphaLevel}.`);
      if (rq.resultSummary) {
        sections.push(rq.resultSummary);
      } else {
        sections.push(`Statistical testing for Research Question ${rqNum} completed. Detailed empirical values are presented in the corresponding SPSS-style results tables.`);
      }
    });

    sections.push(`\n4.4 Summary of Findings\nIn summary, the empirical analysis provided quantitative evidence addressing the primary research objectives. All statistical tests were calculated strictly from observed data without fabrication.`);

    return sections.join('\n\n');
  }

  /**
   * Clean Interface Hook for External Backend Integration (e.g. Python microservice)
   */
  async connectBackendStatisticalEngine(
    endpointUrl: string,
    payload: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: `Backend Statistical Engine connection error: ${err.message || 'Service unavailable'}`
      };
    }
  }
}

export const dataAnalysisService = new DataAnalysisService();
