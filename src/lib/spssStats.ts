import {
  DescriptiveResult,
  CorrelationResult,
  RegressionResult,
  AnovaResult,
  AnovaGroupStats,
  CorrelationCell,
  RegressionCoeff,
  CrosstabResult,
  TTestResult,
  TwoWayAnovaResult,
  ColumnAudit,
  DataAuditResult,
  SpssDataset,
  FrequencyResult,
  ReliabilityResult
} from '../types';

// Helper: Normal CDF approximation for p-values
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x >= 0 ? 1 - p : p;
}

// Helper: Student's t-distribution p-value (two-tailed) approximation
function tPValue(tStat: number, df: number): number {
  if (isNaN(tStat) || df <= 0) return 1;
  const absT = Math.abs(tStat);
  // Normal approximation adjusted for small df
  const z = absT * Math.sqrt((df - 0.5) / df);
  const pOneTail = normalCdf(-z);
  return Math.min(1, Math.max(0, pOneTail * 2));
}

// Helper: F-distribution p-value approximation
function fPValue(fStat: number, df1: number, df2: number): number {
  if (isNaN(fStat) || fStat <= 0 || df1 <= 0 || df2 <= 0) return 1;
  // Approximation transform F to Z
  const x = Math.pow(2 / (9 * df1), 0.5);
  const y = Math.pow(2 / (9 * df2), 0.5);
  const fPow = Math.pow(fStat, 1 / 3);
  const num = fPow * (1 - y * y) - (1 - x * x);
  const den = Math.sqrt(fPow * fPow * y * y + x * x);
  const z = num / den;
  return Math.min(1, Math.max(0, normalCdf(-z) * 2));
}

/**
 * Calculate Descriptive Statistics
 */
export function computeDescriptives(data: number[], varName: string): DescriptiveResult {
  const valid = data.filter(n => typeof n === 'number' && !isNaN(n));
  const N = valid.length;
  if (N === 0) {
    return {
      variable: varName, count: 0, mean: 0, stdDev: 0, median: 0,
      variance: 0, min: 0, max: 0, skewness: 0, kurtosis: 0, seMean: 0
    };
  }

  const sorted = [...valid].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const sum = valid.reduce((acc, val) => acc + val, 0);
  const mean = sum / N;

  const median = N % 2 === 0
    ? (sorted[N / 2 - 1] + sorted[N / 2]) / 2
    : sorted[Math.floor(N / 2)];

  const sqDiffs = valid.map(val => Math.pow(val - mean, 2));
  const sumSqDiffs = sqDiffs.reduce((a, b) => a + b, 0);
  const variance = N > 1 ? sumSqDiffs / (N - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const seMean = stdDev / Math.sqrt(N);

  let skewness = 0;
  let kurtosis = 0;

  if (N > 2 && stdDev > 0) {
    const cubeDiffs = valid.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
    skewness = (N / ((N - 1) * (N - 2))) * cubeDiffs;
  }

  if (N > 3 && stdDev > 0) {
    const quadDiffs = valid.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
    const term1 = (N * (N + 1)) / ((N - 1) * (N - 2) * (N - 3));
    const term2 = (3 * Math.pow(N - 1, 2)) / ((N - 2) * (N - 3));
    kurtosis = term1 * quadDiffs - term2;
  }

  return {
    variable: varName,
    count: N,
    mean: Number(mean.toFixed(3)),
    stdDev: Number(stdDev.toFixed(3)),
    median: Number(median.toFixed(3)),
    variance: Number(variance.toFixed(3)),
    min: Number(min.toFixed(3)),
    max: Number(max.toFixed(3)),
    skewness: Number(skewness.toFixed(3)),
    kurtosis: Number(kurtosis.toFixed(3)),
    seMean: Number(seMean.toFixed(3))
  };
}

/**
 * Calculate Pearson Correlation Matrix
 */
export function computeCorrelationMatrix(dataset: Record<string, any>[], variables: string[]): CorrelationResult {
  const matrix: Record<string, Record<string, CorrelationCell>> = {};

  for (const v1 of variables) {
    matrix[v1] = {};
    for (const v2 of variables) {
      if (v1 === v2) {
        matrix[v1][v2] = { r: 1.0, p: 0.0, n: dataset.length };
        continue;
      }

      const pairs = dataset
        .map(row => ({ x: Number(row[v1]), y: Number(row[v2]) }))
        .filter(p => !isNaN(p.x) && !isNaN(p.y));

      const n = pairs.length;
      if (n < 3) {
        matrix[v1][v2] = { r: 0, p: 1, n };
        continue;
      }

      const meanX = pairs.reduce((acc, p) => acc + p.x, 0) / n;
      const meanY = pairs.reduce((acc, p) => acc + p.y, 0) / n;

      let num = 0, denX = 0, denY = 0;
      for (const p of pairs) {
        const dx = p.x - meanX;
        const dy = p.y - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }

      const den = Math.sqrt(denX * denY);
      const r = den === 0 ? 0 : num / den;
      const df = n - 2;
      const tStat = Math.abs(r) === 1 ? 999 : (r * Math.sqrt(df)) / Math.sqrt(1 - r * r);
      const p = tPValue(tStat, df);

      matrix[v1][v2] = {
        r: Number(r.toFixed(3)),
        p: Number(p.toFixed(4)),
        n
      };
    }
  }

  return { variables, matrix };
}

/**
 * Matrix inversion helper for OLS Regression
 */
function invertMatrix(M: number[][]): number[][] {
  const n = M.length;
  const A = M.map(row => [...row]);
  const I: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let i = 0; i < n; i++) {
    let pivot = A[i][i];
    if (Math.abs(pivot) < 1e-12) {
      // Find row swap
      let swapRow = i + 1;
      while (swapRow < n && Math.abs(A[swapRow][i]) < 1e-12) swapRow++;
      if (swapRow === n) throw new Error('Singular matrix');
      [A[i], A[swapRow]] = [A[swapRow], A[i]];
      [I[i], I[swapRow]] = [I[swapRow], I[i]];
      pivot = A[i][i];
    }

    for (let j = 0; j < n; j++) {
      A[i][j] /= pivot;
      I[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }

  return I;
}

/**
 * Compute OLS Linear Regression
 */
export function computeRegression(dataset: Record<string, any>[], dv: string, ivs: string[]): RegressionResult {
  const validRows = dataset.filter(row => {
    const yVal = Number(row[dv]);
    if (isNaN(yVal)) return false;
    return ivs.every(x => !isNaN(Number(row[x])));
  });

  const N = validRows.length;
  const k = ivs.length;

  if (N <= k + 1) {
    throw new Error(`Insufficient valid cases (${N}) for ${k} predictors.`);
  }

  // Construct Y vector and X matrix (with intercept column)
  const Y = validRows.map(r => Number(r[dv]));
  const X = validRows.map(r => [1, ...ivs.map(iv => Number(r[iv]))]);

  // X^T
  const Xt: number[][] = Array.from({ length: k + 1 }, (_, i) =>
    X.map(row => row[i])
  );

  // XtX = X^T * X
  const XtX: number[][] = Array.from({ length: k + 1 }, (_, i) =>
    Array.from({ length: k + 1 }, (_, j) =>
      Xt[i].reduce((sum, val, idx) => sum + val * X[idx][j], 0)
    )
  );

  // XtY = X^T * Y
  const XtY: number[] = Xt.map(row =>
    row.reduce((sum, val, idx) => sum + val * Y[idx], 0)
  );

  const XtXInv = invertMatrix(XtX);

  // B = XtXInv * XtY
  const B: number[] = XtXInv.map(row =>
    row.reduce((sum, val, idx) => sum + val * XtY[idx], 0)
  );

  // Predictions & Residuals
  const yMean = Y.reduce((a, b) => a + b, 0) / N;
  let ssTotal = 0;
  let ssResidual = 0;
  let ssReg = 0;

  for (let i = 0; i < N; i++) {
    const yObs = Y[i];
    let yHat = 0;
    for (let j = 0; j <= k; j++) {
      yHat += B[j] * X[i][j];
    }
    ssTotal += Math.pow(yObs - yMean, 2);
    ssResidual += Math.pow(yObs - yHat, 2);
    ssReg += Math.pow(yHat - yMean, 2);
  }

  const r2 = Math.max(0, Math.min(1, 1 - (ssResidual / (ssTotal || 1))));
  const r = Math.sqrt(r2);
  const df1 = k;
  const df2 = N - k - 1;
  const adjR2 = 1 - ((1 - r2) * (N - 1)) / df2;

  const msReg = ssReg / df1;
  const msRes = ssResidual / df2;
  const fStat = msRes === 0 ? 999 : msReg / msRes;
  const pValue = fPValue(fStat, df1, df2);
  const stdErrEst = Math.sqrt(msRes);

  // Standard Deviations for standardized Beta
  const sdY = Math.sqrt(ssTotal / (N - 1));

  const coefficients: RegressionCoeff[] = [];

  for (let j = 0; j <= k; j++) {
    const varName = j === 0 ? '(Constant)' : ivs[j - 1];
    const b = B[j];
    const varB = msRes * XtXInv[j][j];
    const stdErr = Math.sqrt(Math.max(0, varB));
    const tStat = stdErr === 0 ? 0 : b / stdErr;
    const pVal = tPValue(tStat, df2);

    let beta = 0;
    if (j > 0) {
      const ivVals = validRows.map(r => Number(r[ivs[j - 1]]));
      const meanIv = ivVals.reduce((a, b) => a + b, 0) / N;
      const sdX = Math.sqrt(ivVals.reduce((acc, val) => acc + Math.pow(val - meanIv, 2), 0) / (N - 1));
      beta = sdY === 0 ? 0 : b * (sdX / sdY);
    }

    coefficients.push({
      variable: varName,
      b: Number(b.toFixed(3)),
      stdErr: Number(stdErr.toFixed(3)),
      beta: Number(beta.toFixed(3)),
      tStat: Number(tStat.toFixed(3)),
      pValue: Number(pVal.toFixed(4))
    });
  }

  return {
    dv,
    ivs,
    r: Number(r.toFixed(3)),
    r2: Number(r2.toFixed(3)),
    adjR2: Number(adjR2.toFixed(3)),
    stdErrEst: Number(stdErrEst.toFixed(3)),
    fStat: Number(fStat.toFixed(3)),
    pValue: Number(pValue.toFixed(4)),
    coefficients
  };
}

/**
 * Compute One-Way ANOVA
 */
export function computeAnova(dataset: Record<string, any>[], dv: string, groupingVar: string): AnovaResult {
  const groupsMap: Record<string, number[]> = {};

  for (const row of dataset) {
    const g = String(row[groupingVar] ?? 'Unknown');
    const y = Number(row[dv]);
    if (!isNaN(y)) {
      if (!groupsMap[g]) groupsMap[g] = [];
      groupsMap[g].push(y);
    }
  }

  const groupKeys = Object.keys(groupsMap).filter(g => groupsMap[g].length > 0);
  const k = groupKeys.length;

  let totalN = 0;
  let grandSum = 0;
  const groupsStats: AnovaGroupStats[] = [];

  for (const g of groupKeys) {
    const vals = groupsMap[g];
    const n = vals.length;
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const varG = n > 1 ? vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1) : 0;
    const sd = Math.sqrt(varG);

    totalN += n;
    grandSum += sum;

    groupsStats.push({
      group: g,
      count: n,
      mean: Number(mean.toFixed(3)),
      stdDev: Number(sd.toFixed(3)),
      se: Number((sd / Math.sqrt(n)).toFixed(3))
    });
  }

  const grandMean = grandSum / totalN;

  let betweenSS = 0;
  let withinSS = 0;

  for (const g of groupKeys) {
    const vals = groupsMap[g];
    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;

    betweenSS += n * Math.pow(mean - grandMean, 2);
    withinSS += vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  }

  const totalSS = betweenSS + withinSS;
  const betweenDf = k - 1;
  const withinDf = totalN - k;
  const totalDf = totalN - 1;

  const betweenMS = betweenDf > 0 ? betweenSS / betweenDf : 0;
  const withinMS = withinDf > 0 ? withinSS / withinDf : 0;

  const fStat = withinMS === 0 ? 0 : betweenMS / withinMS;
  const pValue = fPValue(fStat, betweenDf, withinDf);

  return {
    dv,
    groupingVar,
    groups: groupsStats,
    betweenSS: Number(betweenSS.toFixed(3)),
    betweenDf,
    betweenMS: Number(betweenMS.toFixed(3)),
    fStat: Number(fStat.toFixed(3)),
    pValue: Number(pValue.toFixed(4)),
    withinSS: Number(withinSS.toFixed(3)),
    withinDf,
    withinMS: Number(withinMS.toFixed(3)),
    totalSS: Number(totalSS.toFixed(3)),
    totalDf
  };
}

/**
 * Compute Cross Tabulation & Chi-Square Test of Independence
 */
export function computeCrosstab(dataset: Record<string, any>[], rowVar: string, colVar: string): CrosstabResult {
  const rowValsSet = new Set<string>();
  const colValsSet = new Set<string>();

  for (const row of dataset) {
    if (row[rowVar] !== undefined && row[rowVar] !== null) rowValsSet.add(String(row[rowVar]));
    if (row[colVar] !== undefined && row[colVar] !== null) colValsSet.add(String(row[colVar]));
  }

  const rowValues = Array.from(rowValsSet);
  const colValues = Array.from(colValsSet);

  const counts: number[][] = rowValues.map(() => colValues.map(() => 0));

  for (const row of dataset) {
    const rVal = String(row[rowVar]);
    const cVal = String(row[colVar]);
    const rIdx = rowValues.indexOf(rVal);
    const cIdx = colValues.indexOf(cVal);
    if (rIdx >= 0 && cIdx >= 0) {
      counts[rIdx][cIdx] += 1;
    }
  }

  const rowTotals = counts.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = colValues.map((_, cIdx) => counts.reduce((sum, row) => sum + row[cIdx], 0));
  const totalN = rowTotals.reduce((a, b) => a + b, 0);

  const rowPercents = counts.map((row, rIdx) =>
    row.map(c => (rowTotals[rIdx] > 0 ? Number(((c / rowTotals[rIdx]) * 100).toFixed(1)) : 0))
  );

  const colPercents = counts.map(row =>
    row.map((c, cIdx) => (colTotals[cIdx] > 0 ? Number(((c / colTotals[cIdx]) * 100).toFixed(1)) : 0))
  );

  let chiSquareStat = 0;
  for (let r = 0; r < rowValues.length; r++) {
    for (let c = 0; c < colValues.length; c++) {
      const observed = counts[r][c];
      const expected = totalN > 0 ? (rowTotals[r] * colTotals[c]) / totalN : 0;
      if (expected > 0) {
        chiSquareStat += Math.pow(observed - expected, 2) / expected;
      }
    }
  }

  const df = (rowValues.length - 1) * (colValues.length - 1);
  const pValue = fPValue(chiSquareStat, df, totalN || 1);
  const minDim = Math.min(rowValues.length - 1, colValues.length - 1);
  const cramersV = totalN > 0 && minDim > 0 ? Math.sqrt(chiSquareStat / (totalN * minDim)) : 0;

  return {
    rowVar,
    colVar,
    rowValues,
    colValues,
    counts,
    rowPercents,
    colPercents,
    chiSquare: {
      stat: Number(chiSquareStat.toFixed(3)),
      df,
      pValue: Number(pValue.toFixed(4)),
      cramersV: Number(cramersV.toFixed(3))
    }
  };
}

/**
 * Compute Independent Samples T-Test
 */
export function computeIndependentTTest(
  dataset: Record<string, any>[],
  dv: string,
  groupingVar: string
): TTestResult {
  const groups: Record<string, number[]> = {};

  for (const row of dataset) {
    const g = String(row[groupingVar] ?? 'Unknown');
    const y = Number(row[dv]);
    if (!isNaN(y)) {
      if (!groups[g]) groups[g] = [];
      groups[g].push(y);
    }
  }

  const groupKeys = Object.keys(groups).filter(k => groups[k].length > 0);
  if (groupKeys.length < 2) {
    throw new Error(`Independent Samples T-Test requires a grouping variable with 2 distinct groups. Column '${groupingVar}' only contains ${groupKeys.length} group (${groupKeys.join(', ')}).`);
  }
  if (groupKeys.length > 2) {
    throw new Error(`Independent Samples T-Test requires a grouping variable with exactly 2 groups. Column '${groupingVar}' contains ${groupKeys.length} groups: [${groupKeys.slice(0, 5).join(', ')}]. Please select a 2-group variable (e.g. Gender) or use One-Way ANOVA.`);
  }

  const g1 = groupKeys[0];
  const g2 = groupKeys[1];

  const v1 = groups[g1];
  const v2 = groups[g2];

  const n1 = v1.length;
  const n2 = v2.length;

  const m1 = v1.reduce((a, b) => a + b, 0) / (n1 || 1);
  const m2 = v2.reduce((a, b) => a + b, 0) / (n2 || 1);

  const var1 = n1 > 1 ? v1.reduce((acc, v) => acc + Math.pow(v - m1, 2), 0) / (n1 - 1) : 0;
  const var2 = n2 > 1 ? v2.reduce((acc, v) => acc + Math.pow(v - m2, 2), 0) / (n2 - 1) : 0;

  const sd1 = Math.sqrt(var1);
  const sd2 = Math.sqrt(var2);

  const meanDiff = m1 - m2;
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / Math.max(1, n1 + n2 - 2);
  const seDiff = Math.sqrt(pooledVar * (1 / Math.max(1, n1) + 1 / Math.max(1, n2)));

  const tStat = seDiff === 0 ? 0 : meanDiff / seDiff;
  const df = Math.max(1, n1 + n2 - 2);
  const pValue = tPValue(tStat, df);

  const pooledSd = Math.sqrt(pooledVar);
  const cohensD = pooledSd === 0 ? 0 : meanDiff / pooledSd;
  const ci95Lower = meanDiff - 1.96 * seDiff;
  const ci95Upper = meanDiff + 1.96 * seDiff;

  return {
    testType: 'independent',
    variableName: dv,
    group1Name: g1,
    group1Count: n1,
    group1Mean: Number(m1.toFixed(3)),
    group1Sd: Number(sd1.toFixed(3)),
    group2Name: g2,
    group2Count: n2,
    group2Mean: Number(m2.toFixed(3)),
    group2Sd: Number(sd2.toFixed(3)),
    meanDiff: Number(meanDiff.toFixed(3)),
    tStat: Number(tStat.toFixed(3)),
    df,
    pValue: Number(pValue.toFixed(4)),
    cohensD: Number(cohensD.toFixed(3)),
    ci95Lower: Number(ci95Lower.toFixed(3)),
    ci95Upper: Number(ci95Upper.toFixed(3))
  };
}

/**
 * Compute Paired Samples T-Test
 */
export function computePairedTTest(dataset: Record<string, any>[], var1: string, var2: string): TTestResult {
  const diffs: number[] = [];
  const v1List: number[] = [];
  const v2List: number[] = [];

  for (const row of dataset) {
    const x1 = Number(row[var1]);
    const x2 = Number(row[var2]);
    if (!isNaN(x1) && !isNaN(x2)) {
      v1List.push(x1);
      v2List.push(x2);
      diffs.push(x1 - x2);
    }
  }

  const N = diffs.length;
  const m1 = N > 0 ? v1List.reduce((a, b) => a + b, 0) / N : 0;
  const m2 = N > 0 ? v2List.reduce((a, b) => a + b, 0) / N : 0;
  const sd1 = N > 1 ? Math.sqrt(v1List.reduce((acc, v) => acc + Math.pow(v - m1, 2), 0) / (N - 1)) : 0;
  const sd2 = N > 1 ? Math.sqrt(v2List.reduce((acc, v) => acc + Math.pow(v - m2, 2), 0) / (N - 1)) : 0;

  const meanDiff = N > 0 ? diffs.reduce((a, b) => a + b, 0) / N : 0;
  const varDiff = N > 1 ? diffs.reduce((acc, d) => acc + Math.pow(d - meanDiff, 2), 0) / (N - 1) : 0;
  const sdDiff = Math.sqrt(varDiff);
  const seDiff = sdDiff / Math.sqrt(Math.max(1, N));

  const tStat = seDiff === 0 ? 0 : meanDiff / seDiff;
  const df = Math.max(1, N - 1);
  const pValue = tPValue(tStat, df);
  const cohensD = sdDiff === 0 ? 0 : meanDiff / sdDiff;

  return {
    testType: 'paired',
    variableName: `${var1} - ${var2}`,
    group1Name: var1,
    group1Count: N,
    group1Mean: Number(m1.toFixed(3)),
    group1Sd: Number(sd1.toFixed(3)),
    group2Name: var2,
    group2Count: N,
    group2Mean: Number(m2.toFixed(3)),
    group2Sd: Number(sd2.toFixed(3)),
    meanDiff: Number(meanDiff.toFixed(3)),
    tStat: Number(tStat.toFixed(3)),
    df,
    pValue: Number(pValue.toFixed(4)),
    cohensD: Number(cohensD.toFixed(3))
  };
}

/**
 * Compute Two-Way ANOVA
 */
export function computeTwoWayAnova(
  dataset: Record<string, any>[],
  dv: string,
  factorA: string,
  factorB: string
): TwoWayAnovaResult {
  const valid = dataset.filter(r => !isNaN(Number(r[dv])) && r[factorA] !== undefined && r[factorB] !== undefined);
  const N = valid.length;

  const grandMean = N > 0 ? valid.reduce((sum, r) => sum + Number(r[dv]), 0) / N : 0;

  const levelA = Array.from(new Set(valid.map(r => String(r[factorA]))));
  const levelB = Array.from(new Set(valid.map(r => String(r[factorB]))));

  const aCount = levelA.length;
  const bCount = levelB.length;

  let factorA_SS = 0;
  for (const a of levelA) {
    const sub = valid.filter(r => String(r[factorA]) === a);
    const meanA = sub.length > 0 ? sub.reduce((s, r) => s + Number(r[dv]), 0) / sub.length : 0;
    factorA_SS += sub.length * Math.pow(meanA - grandMean, 2);
  }

  let factorB_SS = 0;
  for (const b of levelB) {
    const sub = valid.filter(r => String(r[factorB]) === b);
    const meanB = sub.length > 0 ? sub.reduce((s, r) => s + Number(r[dv]), 0) / sub.length : 0;
    factorB_SS += sub.length * Math.pow(meanB - grandMean, 2);
  }

  let cellSS = 0;
  let total_SS = 0;

  for (const r of valid) {
    total_SS += Math.pow(Number(r[dv]) - grandMean, 2);
  }

  for (const a of levelA) {
    for (const b of levelB) {
      const sub = valid.filter(r => String(r[factorA]) === a && String(r[factorB]) === b);
      if (sub.length > 0) {
        const cellMean = sub.reduce((s, r) => s + Number(r[dv]), 0) / sub.length;
        cellSS += sub.length * Math.pow(cellMean - grandMean, 2);
      }
    }
  }

  const interaction_SS = Math.max(0, cellSS - factorA_SS - factorB_SS);
  const error_SS = Math.max(0, total_SS - cellSS);

  const factorA_df = Math.max(1, aCount - 1);
  const factorB_df = Math.max(1, bCount - 1);
  const interaction_df = Math.max(1, factorA_df * factorB_df);
  const error_df = Math.max(1, N - aCount * bCount);
  const total_df = Math.max(1, N - 1);

  const factorA_MS = factorA_SS / factorA_df;
  const factorB_MS = factorB_SS / factorB_df;
  const interaction_MS = interaction_SS / interaction_df;
  const error_MS = error_SS / error_df;

  const factorA_F = error_MS > 0 ? factorA_MS / error_MS : 0;
  const factorB_F = error_MS > 0 ? factorB_MS / error_MS : 0;
  const interaction_F = error_MS > 0 ? interaction_MS / error_MS : 0;

  return {
    dv,
    factorA,
    factorB,
    factorA_SS: Number(factorA_SS.toFixed(3)),
    factorA_df,
    factorA_MS: Number(factorA_MS.toFixed(3)),
    factorA_F: Number(factorA_F.toFixed(3)),
    factorA_p: Number(fPValue(factorA_F, factorA_df, error_df).toFixed(4)),

    factorB_SS: Number(factorB_SS.toFixed(3)),
    factorB_df,
    factorB_MS: Number(factorB_MS.toFixed(3)),
    factorB_F: Number(factorB_F.toFixed(3)),
    factorB_p: Number(fPValue(factorB_F, factorB_df, error_df).toFixed(4)),

    interaction_SS: Number(interaction_SS.toFixed(3)),
    interaction_df,
    interaction_MS: Number(interaction_MS.toFixed(3)),
    interaction_F: Number(interaction_F.toFixed(3)),
    interaction_p: Number(fPValue(interaction_F, interaction_df, error_df).toFixed(4)),

    error_SS: Number(error_SS.toFixed(3)),
    error_df,
    error_MS: Number(error_MS.toFixed(3)),

    total_SS: Number(total_SS.toFixed(3)),
    total_df
  };
}

/**
 * Audit and Profile Dataset
 */
export function auditDataset(dataset: SpssDataset): DataAuditResult {
  const rowCount = dataset.data.length;
  const colCount = dataset.columns.length;

  const columnsProfile: ColumnAudit[] = [];
  let totalMissingCells = 0;

  for (const col of dataset.columns) {
    let missing = 0;
    const samples: any[] = [];
    const uniqueVals = new Set<any>();

    let isNumeric = true;
    let isDate = true;

    for (const row of dataset.data) {
      const val = row[col];
      if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
        missing++;
        totalMissingCells++;
      } else {
        uniqueVals.add(val);
        if (samples.length < 5) samples.push(val);

        if (isNaN(Number(val))) isNumeric = false;
        if (isNaN(Date.parse(String(val)))) isDate = false;
      }
    }

    let dataType: 'numeric' | 'categorical' | 'string' | 'binary' | 'date' = 'string';
    if (uniqueVals.size === 2) dataType = 'binary';
    else if (isNumeric && uniqueVals.size > 0) dataType = 'numeric';
    else if (uniqueVals.size <= Math.min(15, rowCount / 2)) dataType = 'categorical';
    else if (isDate) dataType = 'date';

    columnsProfile.push({
      name: col,
      dataType,
      missingCount: missing,
      missingPct: rowCount > 0 ? Number(((missing / rowCount) * 100).toFixed(1)) : 0,
      uniqueCount: uniqueVals.size,
      sampleValues: samples
    });
  }

  // Duplicate Row Detection
  const rowStrings = new Set<string>();
  let duplicateRows = 0;
  for (const row of dataset.data) {
    const s = JSON.stringify(row);
    if (rowStrings.has(s)) duplicateRows++;
    else rowStrings.add(s);
  }

  const totalCells = Math.max(1, rowCount * colCount);
  const missingPct = (totalMissingCells / totalCells) * 100;
  const dupPct = (duplicateRows / Math.max(1, rowCount)) * 100;
  const qualityScore = Math.max(0, Math.min(100, Number((100 - missingPct * 0.7 - dupPct * 0.3).toFixed(1))));

  return {
    rowCount,
    colCount,
    qualityScore,
    duplicateRows,
    columnsProfile
  };
}

/**
 * Compute Frequency Analysis
 */
export function computeFrequencyAnalysis(dataset: Record<string, any>[], variable: string): FrequencyResult {
  const countsMap: Record<string, number> = {};
  let totalCount = 0;

  for (const row of dataset) {
    const val = row[variable] !== undefined && row[variable] !== null && String(row[variable]).trim() !== ''
      ? String(row[variable])
      : '(Missing)';
    countsMap[val] = (countsMap[val] || 0) + 1;
    totalCount++;
  }

  let cumCount = 0;
  const items = Object.keys(countsMap).map(val => {
    const count = countsMap[val];
    cumCount += count;
    const percent = totalCount > 0 ? Number(((count / totalCount) * 100).toFixed(1)) : 0;
    const cumPercent = totalCount > 0 ? Number(((cumCount / totalCount) * 100).toFixed(1)) : 0;
    return {
      value: val,
      count,
      percent,
      validPercent: percent,
      cumulativePercent: cumPercent
    };
  });

  return { variable, totalCount, items };
}

/**
 * Compute Reliability Analysis (Cronbach's Alpha)
 */
export function computeReliabilityAnalysis(dataset: Record<string, any>[], variables: string[]): ReliabilityResult {
  const k = variables.length;
  if (k < 2) throw new Error('Reliability analysis requires at least two items.');

  const validRows = dataset.filter(r => variables.every(v => !isNaN(Number(r[v]))));
  const N = validRows.length;
  if (N < 3) throw new Error('Insufficient valid cases for reliability calculation.');

  const itemVars: number[] = [];
  const itemMeans: number[] = [];
  const itemSds: number[] = [];

  for (const v of variables) {
    const vals = validRows.map(r => Number(r[v]));
    const mean = vals.reduce((a, b) => a + b, 0) / N;
    const variance = N > 1 ? vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (N - 1) : 0;
    itemMeans.push(mean);
    itemVars.push(variance);
    itemSds.push(Math.sqrt(variance));
  }

  const totalScores = validRows.map(r => variables.reduce((sum, v) => sum + Number(r[v]), 0));
  const overallMean = totalScores.reduce((a, b) => a + b, 0) / N;
  const overallVariance = N > 1 ? totalScores.reduce((a, b) => a + Math.pow(b - overallMean, 2), 0) / (N - 1) : 0;

  const sumItemVars = itemVars.reduce((a, b) => a + b, 0);
  const cronbachAlpha = overallVariance > 0 ? (k / (k - 1)) * (1 - sumItemVars / overallVariance) : 0;

  const itemStats = variables.map((v, i) => {
    const restScores = validRows.map(r => variables.reduce((sum, item, idx) => idx === i ? sum : sum + Number(r[item]), 0));
    const restMean = restScores.reduce((a, b) => a + b, 0) / N;
    const restVar = N > 1 ? restScores.reduce((a, b) => a + Math.pow(b - restMean, 2), 0) / (N - 1) : 0;

    const kRest = k - 1;
    const restSumItemVars = itemVars.reduce((sum, varVal, idx) => idx === i ? sum : sum + varVal, 0);
    const alphaIfDeleted = restVar > 0 ? (kRest / Math.max(1, kRest - 1)) * (1 - restSumItemVars / restVar) : 0;

    const itemVals = validRows.map(r => Number(r[v]));
    const itemMean = itemMeans[i];
    let num = 0, denX = 0, denY = 0;
    for (let r = 0; r < N; r++) {
      const dx = itemVals[r] - itemMean;
      const dy = restScores[r] - restMean;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const den = Math.sqrt(denX * denY);
    const itemTotalCorr = den === 0 ? 0 : num / den;

    return {
      variable: v,
      itemMean: Number(itemMean.toFixed(2)),
      itemSd: Number(itemSds[i].toFixed(2)),
      itemTotalCorr: Number(itemTotalCorr.toFixed(3)),
      alphaIfDeleted: Number(alphaIfDeleted.toFixed(3))
    };
  });

  return {
    variables,
    itemCount: k,
    cronbachAlpha: Number(cronbachAlpha.toFixed(3)),
    overallMean: Number(overallMean.toFixed(2)),
    overallVariance: Number(overallVariance.toFixed(2)),
    itemStats
  };
}

/**
 * Compute Spearman Rank Correlation
 */
export function computeSpearmanCorrelation(dataset: Record<string, any>[], variables: string[]): CorrelationResult {
  function getRanks(arr: number[]): number[] {
    const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(arr.length);
    let i = 0;
    while (i < sorted.length) {
      let j = i;
      while (j < sorted.length && sorted[j].v === sorted[i].v) j++;
      const avgRank = (i + 1 + j) / 2;
      for (let k = i; k < j; k++) {
        ranks[sorted[k].i] = avgRank;
      }
      i = j;
    }
    return ranks;
  }

  const validRows = dataset.filter(r => variables.every(v => !isNaN(Number(r[v]))));
  const rankedDataset: Record<string, any>[] = validRows.map(() => ({}));

  for (const v of variables) {
    const rawVals = validRows.map(r => Number(r[v]));
    const ranks = getRanks(rawVals);
    ranks.forEach((rk, idx) => {
      rankedDataset[idx][v] = rk;
    });
  }

  return computeCorrelationMatrix(rankedDataset, variables);
}

/**
 * Clean Dataset (Impute missing, drop duplicates, trim string whitespace)
 */
export function cleanDataset(dataset: SpssDataset, options: { imputeMissing?: boolean; dropDuplicates?: boolean; trimWhitespace?: boolean }): SpssDataset {
  let cleaned = dataset.data.map(row => ({ ...row }));

  if (options.trimWhitespace) {
    cleaned = cleaned.map(row => {
      const newRow: Record<string, any> = {};
      for (const k of Object.keys(row)) {
        newRow[k] = typeof row[k] === 'string' ? row[k].trim() : row[k];
      }
      return newRow;
    });
  }

  if (options.dropDuplicates) {
    const seen = new Set<string>();
    cleaned = cleaned.filter(row => {
      const s = JSON.stringify(row);
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
  }

  if (options.imputeMissing) {
    // Calculate mean for numeric columns
    for (const col of dataset.columns) {
      const nums = cleaned.map(r => Number(r[col])).filter(n => !isNaN(n));
      if (nums.length > 0) {
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        cleaned = cleaned.map(r => {
          if (r[col] === undefined || r[col] === null || r[col] === '' || isNaN(Number(r[col]))) {
            return { ...r, [col]: Number(mean.toFixed(2)) };
          }
          return r;
        });
      }
    }
  }

  return {
    ...dataset,
    data: cleaned,
    rowCount: cleaned.length
  };
}

/**
 * Sample Dataset Creator for quick testing in UI
 */
export function getSampleUniversityDataset() {
  return {
    id: 'ds_sample_uod',
    name: 'University_Student_Performance_Survey.xlsx',
    columns: ['Student_ID', 'Study_Hours_Per_Week', 'Attendance_Percentage', 'Gpa_Score', 'Exam_Score', 'Department', 'Stress_Level'],
    rowCount: 20,
    data: [
      { Student_ID: 101, Study_Hours_Per_Week: 22, Attendance_Percentage: 92, Gpa_Score: 3.85, Exam_Score: 91, Department: 'Computer Science', Stress_Level: 4 },
      { Student_ID: 102, Study_Hours_Per_Week: 15, Attendance_Percentage: 85, Gpa_Score: 3.20, Exam_Score: 78, Department: 'Computer Science', Stress_Level: 6 },
      { Student_ID: 103, Study_Hours_Per_Week: 28, Attendance_Percentage: 96, Gpa_Score: 3.95, Exam_Score: 96, Department: 'Medicine', Stress_Level: 8 },
      { Student_ID: 104, Study_Hours_Per_Week: 10, Attendance_Percentage: 70, Gpa_Score: 2.60, Exam_Score: 62, Department: 'Engineering', Stress_Level: 3 },
      { Student_ID: 105, Study_Hours_Per_Week: 18, Attendance_Percentage: 88, Gpa_Score: 3.45, Exam_Score: 84, Department: 'Business Administration', Stress_Level: 5 },
      { Student_ID: 106, Study_Hours_Per_Week: 25, Attendance_Percentage: 94, Gpa_Score: 3.75, Exam_Score: 90, Department: 'Medicine', Stress_Level: 7 },
      { Student_ID: 107, Study_Hours_Per_Week: 12, Attendance_Percentage: 75, Gpa_Score: 2.90, Exam_Score: 70, Department: 'Engineering', Stress_Level: 5 },
      { Student_ID: 108, Study_Hours_Per_Week: 30, Attendance_Percentage: 98, Gpa_Score: 4.00, Exam_Score: 98, Department: 'Medicine', Stress_Level: 9 },
      { Student_ID: 109, Study_Hours_Per_Week: 14, Attendance_Percentage: 80, Gpa_Score: 3.10, Exam_Score: 75, Department: 'Computer Science', Stress_Level: 4 },
      { Student_ID: 110, Study_Hours_Per_Week: 20, Attendance_Percentage: 90, Gpa_Score: 3.55, Exam_Score: 86, Department: 'Business Administration', Stress_Level: 6 },
      { Student_ID: 111, Study_Hours_Per_Week: 8, Attendance_Percentage: 65, Gpa_Score: 2.40, Exam_Score: 58, Department: 'Engineering', Stress_Level: 2 },
      { Student_ID: 112, Study_Hours_Per_Week: 24, Attendance_Percentage: 95, Gpa_Score: 3.80, Exam_Score: 92, Department: 'Computer Science', Stress_Level: 6 },
      { Student_ID: 113, Study_Hours_Per_Week: 16, Attendance_Percentage: 82, Gpa_Score: 3.25, Exam_Score: 79, Department: 'Business Administration', Stress_Level: 5 },
      { Student_ID: 114, Study_Hours_Per_Week: 27, Attendance_Percentage: 97, Gpa_Score: 3.90, Exam_Score: 94, Department: 'Medicine', Stress_Level: 8 },
      { Student_ID: 115, Study_Hours_Per_Week: 11, Attendance_Percentage: 72, Gpa_Score: 2.75, Exam_Score: 66, Department: 'Engineering', Stress_Level: 4 },
      { Student_ID: 116, Study_Hours_Per_Week: 19, Attendance_Percentage: 89, Gpa_Score: 3.50, Exam_Score: 83, Department: 'Business Administration', Stress_Level: 6 },
      { Student_ID: 117, Study_Hours_Per_Week: 21, Attendance_Percentage: 91, Gpa_Score: 3.65, Exam_Score: 88, Department: 'Computer Science', Stress_Level: 5 },
      { Student_ID: 118, Study_Hours_Per_Week: 13, Attendance_Percentage: 78, Gpa_Score: 3.00, Exam_Score: 72, Department: 'Engineering', Stress_Level: 4 },
      { Student_ID: 119, Study_Hours_Per_Week: 26, Attendance_Percentage: 96, Gpa_Score: 3.88, Exam_Score: 93, Department: 'Medicine', Stress_Level: 7 },
      { Student_ID: 120, Study_Hours_Per_Week: 17, Attendance_Percentage: 86, Gpa_Score: 3.35, Exam_Score: 81, Department: 'Business Administration', Stress_Level: 5 }
    ]
  };
}
