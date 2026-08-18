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
      const isBad = lang === 'bad' || lang === 'ku';
      const prompt = `You are a senior university professor and expert biostatistician writing an exhaustive, doctoral-level Chapter 4 Results & Detailed Interpretation (Statistical Discussion).
Language of writeup: ${isBad ? 'Kurdish (Badini dialect - Duhok phrasing ONLY)' : lang === 'ar' ? 'Arabic' : 'English'}.
Dataset Name: ${datasetName}
Statistical Test: ${testType.toUpperCase()}
Empirical Calculations: ${JSON.stringify(resultData, null, 2)}

STRICT REQUIREMENT: Provide an exhaustive, academically rigorous statistical discussion (600-800 words target depth) with these EXACT four components:

1. Descriptive Analysis (شیکارکرنا وەسفی):
   - Report exact empirical means (M), standard deviations (SD), and mean differences.
   - Detail central tendencies and sample characteristics without summary shortcuts.

2. Inferential Breakdown (دەستنیشانکرنا ئیستنتاجی):
   - Evaluate exact test statistics: t-value or F-value, degrees of freedom (df), exact 2-tailed p-value (Sig.), and effect size (Cohen's d, Eta Squared, or Cramér's V).
   - Detail statistical precision and error margins.

3. Hypothesis Decision (بڕیارا گریمانەیێ):
   - Explicitly state whether to Reject H0 (Null Hypothesis) or Retain H0 based on alpha = 0.05.
   - State the academic decision clearly.

4. Contextual & Empirical Discussion (دەنگڤەدانا ئاماری و توێژینەوێ):
   - Thoroughly connect findings to the core research context and discuss theoretical and pedagogical implications.
   - Compare results with literature.

${isBad ? `DIALECT LOCK: Use BADINI KURDISH ONLY (Duhok dialect terms like "دەستنیشانکرنا ئاماری", "جوداهیا تێکڕایان", "کاریگەرییا ئاماری", "ئەنجامێن سەرەکی", "پێشنیارێن ستراتیژی"). Absolutely NO Sorani words ("دەکات", "لە سەر", "ئەم بەشە", "دەبێت", "کردووە").` : ''}

Do NOT invent fake numbers. Only interpret the actual empirical figures provided above. Target 600-800 words of deep academic writing.`;

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
    const isSig = (data.pValue ?? 1) < 0.05;

    if (testType === 'paired_ttest') {
      const v1 = data.group1Name || 'Variable 1';
      const v2 = data.group2Name || 'Variable 2';
      const m1 = data.group1Mean ?? 0;
      const sd1 = data.group1Sd ?? 0;
      const m2 = data.group2Mean ?? 0;
      const sd2 = data.group2Sd ?? 0;
      const tStat = data.tStat ?? 0;
      const df = data.df ?? 1;
      const pVal = data.pValue ?? 1;
      const d = data.cohensD ?? 0;
      const meanDiff = data.meanDiff ?? 0;

      return `أ) شیکارکرنا وەسفی (Descriptive Analysis):
ل سەر بنەمایێ ئەنجامێن ئاماری یێن کۆمکری ژ تاقیکرنا t ییا جفت (Paired Samples T-Test)، تێکڕایا ژمارەیی (Mean) بۆ گۆڕاوێ یەکەم (${v1}) بەگەهشتە M = ${m1} گەل دوورکەوتنا پێوانەیی (SD = ${sd1}). ل لایەکێ دی، گۆڕاوێ دووەم (${v2}) تێکڕایا ژمارەیی M = ${m2} گەل دوورکەوتنا پێوانەیی SD = ${sd2} تۆمارکر. جوداهیا تێکڕایان د ناڤبەرا هەردوو پێڤانان دا بەگەهشتە ${meanDiff}.

ب) دەستنیشانکرنا ئیستنتاجی (Inferential Breakdown):
شیکارکرنا ئاماری نیشان ددەت کو بهایێ t ڕاستەوخۆ بەگەهشتە t(${df}) = ${tStat} گەل پلێن ئازادیێ (Degrees of Freedom: df = ${df}) و ئاستێ ڕامانداریا ئاماری پێکبهێت ژ p = ${pVal} (Sig. 2-tailed). قەبارەیێ کاریگەریێ (Cohen's d) بەگەهشتە d = ${d} کو دەستنیشانا کاریگەرییا ئاماری دکەت.

ج) بڕیارا گریمانەیێ (Hypothesis Decision):
سەر بنەمایێ ئاستێ ڕامانداریێ (alpha = 0.05)، ژبەر کو بهایێ p بەگەهشتە ${pVal} (${isSig ? 'p < 0.05' : 'p ≥ 0.05'})، بڕیارا ئەکادیمی پێکبهێت ژ ${isSig ? 'ڕەتکرنا گریمانەیا بەتاڵ (Reject Null Hypothesis H₀) و پەسەندکرنا گریمانەیا جێگر' : 'قەبولکرنا گریمانەیا بەتاڵ (Retain Null Hypothesis H₀)'}.

د) دەنگڤەدانا ئاماری و توێژینەوێ (Contextual & Empirical Discussion):
ئەڤ ئەنجامە دەستنیشان دکەن کو تێگەهشتن و ڕەفتارا پێڤانکری د ناڤبەرا قۆناغا ئێکەم و دووەم دا تووشی جوداهیا ${isSig ? 'ڕاماندار و کاریگەر' : 'نە-ڕاماندار'} بوویە. ئەڤ پێشهاتە ل گەل توێژینەوێن ئەکادیمی یێن پێشتر دگونجیت و ئاماژێ ددەتە گرنگیا پێشخستنا میکانیزمێن زانستی د پەروەردە و فێرکرنێ دا.`;
    }

    if (testType === 'independent_ttest') {
      return `أ) شیکارکرنا وەسفی (Descriptive Analysis):
شیکارکرنا ئاماری بۆ گۆڕاوێ سەربەخۆ نیشان ددەت کو تێکڕایا ژمارەیی (Mean) بۆ گرۆپێ ئێکەم (${data.group1Name || 'Group 1'}) بەگەهشتە M = ${data.group1Mean ?? 0} (SD = ${data.group1Sd ?? 0})، د دەمەکێ دا تێکڕایا ژمارەیی بۆ گرۆپێ دووەم (${data.group2Name || 'Group 2'}) بەگەهشتە M = ${data.group2Mean ?? 0} (SD = ${data.group2Sd ?? 0}). جوداهیا تێکڕایان د ناڤبەرا هەردوو گرۆپان دا بەگەهشتە ${data.meanDiff ?? 0}.

ب) دەستنیشانکرنا ئیستنتاجی (Inferential Breakdown):
تاسکێ تاقیکرنا t ییا سەربەخۆ (Independent Samples T-Test) بهایێ t بەگەهشتە t(${data.df ?? 1}) = ${data.tStat ?? 0} گەل پلێن ئازادیێ df = ${data.df ?? 1} و ئاستێ ڕامانداریا ئاماری p = ${data.pValue ?? 1}. قەبارەیێ کاریگەریێ Cohen's d بەگەهشتە d = ${data.cohensD ?? 0}.

ج) بڕیارا گریمانەیێ (Hypothesis Decision):
ل سەر بنەمایێ ئاستێ دڵنیاییێ (alpha = 0.05)، بڕیارا ئەکادیمی پێکبهێت ژ ${isSig ? 'ڕەتکرنا گریمانەیا بەتاڵ (Reject Null Hypothesis H₀)' : 'قەبولکرنا گریمانەیا بەتاڵ (Retain Null Hypothesis H₀)'}.

د) دەنگڤەدانا ئاماری و توێژینەوێ (Contextual & Empirical Discussion):
ئەنجام دسلێن کو جوداهیا د ناڤبەرا هەردوو گرۆپان دا ${isSig ? 'ب شێوەیەکێ ئاماری یا ڕاماندارە' : 'نە-ڕاماندارە'} و پەیوەندیەکا ئێکەوخۆ ل گەل چوارچۆڤەیێ تێگەهشتنا ئەکادیمی هەیە.`;
    }

    if (testType === 'anova') {
      return `أ) شیکارکرنا وەسفی (Descriptive Analysis):
شیکارکرنا ئاماری یا واریانسێ (One-Way ANOVA) هاتیە ئەنجامدان بۆ هەلسەنگاندنا کاریگەرییا گۆڕاوێ سەربەخۆ (${data.groupingVar || 'Factor'}) ل سەر گۆڕاوێ تێوەگراو (${data.dv || 'Dependent Variable'}).

ب) دەستنیشانکرنا ئیستنتاجی (Inferential Breakdown):
ئەنجامێن تاقیکرنا ANOVA بهایێ F بەگەهشتە F(${data.betweenDf ?? 1}, ${data.withinDf ?? 1}) = ${data.fStat ?? 0} گەل پلێن ئازادیێ ناوەکی و دەرەکی و ئاستێ ڕامانداریێ p = ${data.pValue ?? 1}.

ج) بڕیارا گریمانەیێ (Hypothesis Decision):
سەر بنەمایێ alpha = 0.05، بڕیار پێکبهێت ژ ${isSig ? 'ڕەتکرنا گریمانەیا بەتاڵ (Reject H₀)' : 'قەبولکرنا گریمانەیا بەتاڵ (Retain H₀)'}.

د) دەنگڤەدانا ئاماری و توێژینەوێ (Contextual & Empirical Discussion):
جوداهیا تێکڕایان د ناڤبەرا کۆمەڵان دا نیشان ددەت کو گۆڕاوێ سەربەخۆ کاریگەرییا ڕاستەوخۆ ل سەر بەرسڤێن توێژینەوێ هەیە.`;
    }

    if (testType === 'regression') {
      return `أ) شیکارکرنا وەسفی (Descriptive Analysis):
شیکارکرنا ڕاگرتنا هێڵی (Linear Multiple Regression) هاتیە خەملاندن بۆ پێشبینیکرنا گۆڕاوێ تێوەگراو (${data.dv || 'DV'}).

ب) دەستنیشانکرنا ئیستنتاجی (Inferential Breakdown):
مودێلا ڕاگرتنێ ڕێژەیا R² = ${data.r2 ?? 0} (Adjusted R² = ${data.adjR2 ?? 0}) تۆمارکر، گەل بهایێ F = ${data.fStat ?? 0} و ئاستێ ڕامانداریێ p = ${data.pValue ?? 1}.

ج) بڕیارا گریمانەیێ (Hypothesis Decision):
ل سەر بنەمایێ alpha = 0.05، مودێل بەگەهشتە بڕیارا ${isSig ? 'ڕەتکرنا گریمانەیا بەتاڵ (Reject H₀)' : 'قەبولکرنا گریمانەیا بەتاڵ (Retain H₀)'}.

د) دەنگڤەدانا ئاماری و توێژینەوێ (Contextual & Empirical Discussion):
گۆڕاوێن پێشبینیکەر رێژەیا ${(Number(data.r2 || 0) * 100).toFixed(1)}% ژ گۆڕانکاریێن کلیی یێن گۆڕاوێ تێوەگراو ڕوون دکەن.`;
    }

    if (testType === 'reliability') {
      const alpha = data.cronbachAlpha ?? 0;
      const isGood = alpha >= 0.7;
      return `أ) شیکارکرنا وەسفی (Descriptive Analysis):
شیکارکرنا جێگیرییا ناوەکی (Cronbach's Alpha Reliability) بۆ ${data.itemCount || 0} بڕگێن پێڤانێ هاتیە ئەنجامدان.

ب) دەستنیشانکرنا ئیستنتاجی (Inferential Breakdown):
هاوکێشەیا جێگیریێ ئاستێ alpha = ${alpha} تۆمارکر.

ج) بڕیارا گریمانەیێ (Hypothesis Decision):
سەر بنەمایێ پێڤانا 0.70، ئاستێ جێگیریێ پێکبهێت ژ ${isGood ? 'جێگیرییا پەسەندکری (α ≥ 0.70)' : 'جێگیرییا کەم (α < 0.70)'}.

د) دەنگڤەدانا ئاماری و توێژینەوێ (Contextual & Empirical Discussion):
ئەنجامێن جێگیریێ دڵنیاییێ ددنە بەکارهێنانا پێڤانێ د توێژینەوێن ئەکادیمی دا.`;
    }

    return `أ) شیکارکرنا وەسفی: شیکارکرنا ئاماری بۆ تاقیکرنا (${testType}) ب سەرکەوتوویی هاتیە ئەنجامدان.
ب) دەستنیشانکرنا ئیستنتاجی: ئامارێن هەژمارکری بهایێن هەقیقی یێن داتایێ نیشان ددن.
ج) بڕیارا گریمانەیێ: بەرسڤ سەر بنەمایێ alpha = 0.05 هاتیە دەستنیشانکرن.
د) دەنگڤەدانا ئاماری: ئەنجام ل گەل ئارمانجێن توێژینەوێ دگونجن.`;
  }

  /**
   * Research Question-Driven Academic Interpretation Generator
   */
  async generateRqAcademicInterpretation(
    rqNumber: number,
    rqText: string,
    testType: string,
    resultData: any,
    coreResearchTitle: string,
    lang: string,
    userProvidedTemplate?: string,
    visualTemplateImage?: string | null
  ): Promise<string> {
    try {
      const isBad = lang === 'bad';
      const isSorani = lang === 'ku';
      const isAr = lang === 'ar';

      const langLockDirective = isBad
        ? 'LANGUAGE LOCK: Write 100% of the response in Academic Badini Kurdish (Duhok phrasing: "ئاراستەیا کەرەستێن ئاماری", "جوداهیا دناڤبەرا تێکڕایان دا", "ئاستێ واتا داریا ئاماری", "دەستنیشانکرنا سەرەکی", "ڕەتکرنا گریمانەیا بەتاڵ H₀"). Absolutely NO Sorani Kurdish words ("دەکات", "لە سەر", "ئەم بەشە", "دەبێت", "کردووە").'
        : isSorani
        ? 'LANGUAGE LOCK: Write 100% of the response in Academic Sorani Kurdish ("دیاریکردنی ئاماری", "وەڵامی ڕاستەوخۆ", "بەڵگەی ئاماری وەسفی و ئیستنتاجی", "بڕیاری گریمانەی H₀", "ڕەتکردنەوەی گریمانەی بەتاڵ H₀").'
        : isAr
        ? 'LANGUAGE LOCK: Write 100% of the response in Formal Academic Arabic (اللغة العربية الأكاديمية الفصحى: "التحليل الإحصائي التوصيفي والأنماط الاستدلالية", "الأدلة الإحصائية الاستدلالية", "قرار الفرضية الإحصائية (H₀)", "المناقشة الأكاديمية والسياقية").'
        : 'LANGUAGE LOCK: Write 100% of the response in Professional Academic English (APA 7th edition style).';

      const templateInstructionBlock = userProvidedTemplate && userProvidedTemplate.trim() ? `
USER-PROVIDED EXAMPLE TEXT TEMPLATE ({{USER_PROVIDED_TEMPLATE}}):
"""
${userProvidedTemplate.trim()}
"""

FEW-SHOT TEMPLATE REPLICATION DIRECTIVES:
1. Analyze the structural pattern, academic depth, section headings, and interpretation style of the provided {{USER_PROVIDED_TEMPLATE}}.
2. Replicate that exact structure, section layout, and sentence depth for Research Question ${rqNumber}, using current empirical dataset calculations.
3. Write 100% of the narrative strictly in the chosen target language. Do NOT mix languages.
` : '';

      const visualInstructionBlock = visualTemplateImage ? `
MULTI-MODAL IMAGE-TO-IMAGE VISUAL REPLICATION DIRECTIVES ({{USER_PROVIDED_VISUAL_TEMPLATE_IMAGE}}):
1. VISUAL PATTERN ANALYSIS: Analyze the visual structure, layout components, graphical boxes, chart elements, typography, color palette, and layout complexity of the attached visual template image.
2. CONTENT SYNTHESIS & GRAPHICAL CHART REPLICATION: Map the current empirical dataset output and Badini Kurdish academic narrative strictly onto the analyzed visual structure. Replicate any specific graphical charts or SPSS comparison plots using current data while maintaining the visual style of the template image.
3. UNIFIED OUTPUT COMPONENT: Render a single, cohesive visual report layout component (using HTML/SVG styled cards, graphical charts, and color-coded metrics) replicating the template image structure.
4. EXPLANATION: Directly under the visual output component, provide a short 100-word academic justification in Badini Kurdish (Duhok dialect) titled "دەستنیشانکرنا ئەکادیمی یا شێوازێ وێنەیی" explaining why this specific visual format was replicated for this research topic ("${coreResearchTitle || 'Academic Study'}").
` : '';

      const prompt = `You are a Senior University Professor and Lead Academic Statistician writing Chapter 4 Results & Discussion.
Target Research Question ${rqNumber}: "${rqText}".
Core Research Title: "${coreResearchTitle || 'Academic Quantitative Research Study'}"
Statistical Test Type: ${testType.toUpperCase()}
Empirical Test Calculation Output (JSON):
${JSON.stringify(resultData, null, 2)}
${templateInstructionBlock}
${visualInstructionBlock}

${langLockDirective}

STRICT REQUIREMENT: Provide a dense, academically rigorous narrative (minimum 400-600 words per RQ) formatted strictly in the target language.

Do NOT mix languages. 100% of section titles, headings, and analytical prose must be strictly in the selected language. Do NOT invent fake numbers.`;

      const aiResponse = await aiService.postGeminiChat({
        prompt,
        language: lang as any,
        visualTemplateImage: visualTemplateImage || null
      });

      if (aiResponse && aiResponse.reply) {
        return aiResponse.reply;
      }
    } catch (e) {
      console.warn('AI RQ Interpretation call fallback:', e);
    }

    return this.generateRqInterpretationFallback(rqNumber, rqText, testType, resultData, coreResearchTitle, lang);
  }

  /**
   * Deterministic Fallback for Research Question Academic Interpretation (Multi-Language)
   */
  generateRqInterpretationFallback(
    rqNumber: number,
    rqText: string,
    testType: string,
    data: any,
    coreResearchTitle: string = '',
    lang: string = 'bad'
  ): string {
    const isSig = (data?.pValue ?? 1) < 0.05;
    const isSorani = lang === 'ku';
    const isAr = lang === 'ar';
    const isEn = lang === 'en';

    if (isAr) {
      return `### تحليل السؤال البحثي (${rqNumber}): "${rqText}"

أ) الإجابة المباشرة والنتيجة الرئيسية:
تظهر النتائج المحسوبة من اختبار (${testType.toUpperCase()}) وجود فروق إحصائية ${isSig ? 'ذات دلالة معنوية مؤكدة (p < 0.05)' : 'غير دالة إحصائياً (p ≥ 0.05)'} تغطي الإجابة عن السؤال البحثي رقم (${rqNumber}).

ب) الأدلة الإحصائية الوصفية والاستدلالية:
بلغت القيمة المتوسطة (Mean) والإنحراف المعياري (SD) والقيمة المحسوبة للاختبار الإحصائي درجات دقة عالية (t/F = ${data.tStat || data.fStat || 0}, df = ${data.df || 1}, p = ${data.pValue || 1}).

ج) قرار الفرضية الإحصائية (H₀):
بناءً على مستوى الدلالة (alpha = 0.05)، تم الوصول إلى قرار ${isSig ? 'رفض الفرضية الصفرية (Reject H₀)' : 'قبول الفرضية الصفرية (Retain H₀)'}.

د) المناقشة الأكاديمية والسياقية:
تتطابق الأنماط الإحصائية الميدانية مع السياق الأكاديمي للدراسة "${coreResearchTitle || 'البحث العلمي'}" وتؤكد دقة النتائج المحسوبة.`;
    }

    if (isSorani) {
      return `### شیکاری پرسیاری توێژینەوە (${rqNumber}): "${rqText}"

أ) وەڵامی ڕاستەوخۆ و دۆزینەوەی سەرەکی:
ئەنجامە ئەژمارکراوەکانی تاقیکردنەوەی ئاماری (${testType.toUpperCase()}) ڕاستەوخۆ دەردەخەن کە جیاوازییەکی ${isSig ? 'واتاداری ئاماری (p < 0.05)' : 'نە-واتادار (p ≥ 0.05)'} هەیە کە وەڵامی پرسیاری توێژینەوەی ژمارە (${rqNumber}) دەداتەوە.

ب) بەڵگەی ئاماری وەسفی و ئیستنتاجی:
تێکڕای ژمارەیی (Mean) و لادانی پێوانەیی (SD) و بەهای تاقیکردنەوەی ئاماری بە شێوەیەکی دروست ئەژمارکراون (t/F = ${data.tStat || data.fStat || 0}, df = ${data.df || 1}, p = ${data.pValue || 1}).

ج) بڕیاری گریمانەی ئاماری (H₀):
لە سەر بنەمای ئاستی واتاداری (alpha = 0.05)، بڕیارەکە بریتییە لە ${isSig ? 'ڕەتکردنەوەی گریمانەی بەتاڵ (Reject H₀)' : 'قبوڵکردنی گریمانەی بەتاڵ (Retain H₀)'}.

د) دەنگدانەوەی ئاماری و هەڵسەنگاندنی ئەکادیمی:
ئەم دۆزینەوانە لە گەڵ چوارچێوەی گشتی توێژینەوەکەدا لە سەر "${coreResearchTitle || 'توێژینەوەی ئەکادیمی'}" دەگونجێن.`;
    }

    if (isEn) {
      return `### Analysis of Research Question (${rqNumber}): "${rqText}"

a) Direct Answer / Core Finding:
The empirical calculations derived from the ${testType.toUpperCase()} test demonstrate a statistically ${isSig ? 'significant relationship/difference (p < 0.05)' : 'non-significant outcome (p >= 0.05)'} directly answering Research Question ${rqNumber}.

b) Descriptive & Inferential Evidence:
Descriptive baseline indices yielded valid central tendencies and dispersion metrics (t/F = ${data.tStat || data.fStat || 0}, df = ${data.df || 1}, p = ${data.pValue || 1}).

c) Hypothesis Testing Decision:
Based on standard alpha threshold (alpha = 0.05), the formal decision is to ${isSig ? 'Reject Null Hypothesis H₀' : 'Retain Null Hypothesis H₀'}.

d) Contextual & Empirical Discussion:
These statistical findings provide empirical evidence addressing the core study titled "${coreResearchTitle || 'Academic Quantitative Research'}".`;
    }

    // Default Badini Kurdish Fallback
    return `### شلۆڤەکرنا پرسیارا (${rqNumber}) یا توێژینەوێ: "${rqText}"

a) بەرسڤا ئێکەوخۆ و دەستنیشانکرنا سەرەکی (Direct Answer / Core Finding):
ل سەر بنەمایێ شیکارکرنا ئاماری بۆ پرسیارا توێژینەوێ يا ژمارە (${rqNumber})، ئەنجامێن هەژمارکری ژ تاقیکرنا ئاماری (${testType.toUpperCase()}) ڕاستەوخۆ دیار دکەن کو جوداهیەکا ${isSig ? 'ئاماری یا واتا دار و کاریگەر (p < 0.05)' : 'نە-واتادار (p ≥ 0.05)'} هەبوویە.

b) بەڵگەیێن ئاماری یێن وەسفی و ئیستنتاجی (Descriptive & Inferential Evidence):
تێکڕایا ژمارەیی (Mean) و دوورکەوتنا پێوانەیی (SD) گەل پلێن ئازادیێ و بهایێ ئاماری (t/F = ${data.tStat || data.fStat || 0}, df = ${data.df || 1}, p = ${data.pValue || 1}) هاتینە تومارکرن.

c) بڕیارا ئاماری و هەلسەنگاندنا گریمانەیێ (Statistical Decision & Hypothesis Testing):
سەر بنەمایێ ئاستێ واتا داریا ئاماری (alpha = 0.05)، بڕیارا ئەکادیمی پێکبهێت ژ ${isSig ? 'ڕەتکرنا گریمانەیا بەتاڵ (Reject Null Hypothesis H₀)' : 'قەبولکرنا گریمانەیا بەتاڵ (Retain Null Hypothesis H₀)'}.

d) دەنگڤەدانا ئاماری و هەڤبەرکرنا ئەکادیمی (Contextual & Empirical Discussion):
ئەڤ دەستنیشانکرنا ئاماری د چوارچۆڤەیێ توێژینەوێ دا ل سەر "${coreResearchTitle || 'ڤەکۆلینا ئەکادیمی'}" ئەنجامێن هەقیقی سەلماندن.`;
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
      sections.push(`\n4.3.${rqNum} Research Question ${rqNum}: ${rq.rqText || `Evaluation of target variables [${rq.selectedVars.join(', ')}]`}`);
      if (rq.resultSummary) {
        sections.push(rq.resultSummary);
      } else {
        const fallbackNarrative = this.generateRqInterpretationFallback(
          rqNum,
          rq.rqText || `Research Question ${rqNum}`,
          rq.selectedTest,
          rq.computedOutput || {},
          ''
        );
        sections.push(fallbackNarrative);
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
