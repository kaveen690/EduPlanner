import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Activity,
  Sparkles,
  Layers,
  Filter,
  Download,
  Info
} from 'lucide-react';
import { SpssDataset, SpssAnalysisOutput, Language } from '../types';
import { t, isRTL } from '../lib/i18n';

interface SpssChartsProps {
  output: SpssAnalysisOutput;
  dataset?: SpssDataset | null;
  lang: Language;
}

const PALETTE = [
  '#0284c7', // Sky
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ea580c'  // Orange
];

export const AnalysisResultCharts: React.FC<SpssChartsProps> = ({ output, dataset, lang }) => {
  const rtl = isRTL(lang);

  // FREQUENCY CHARTS
  if (output.type === 'frequency' && output.frequencyData) {
    const chartData = output.frequencyData.items.map(item => ({
      category: item.value,
      Count: item.count,
      Percent: item.percent
    }));

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-500" />
          Frequency Distribution Charts ({output.frequencyData.variable})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Category Frequency Counts (f)
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="Count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Percentage Distribution (%)
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="Percent"
                    nameKey="category"
                    label={(entry: any) => `${entry.name || entry.category}: ${entry.value || entry.Percent}%`}
                  >
                    {chartData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RELIABILITY CHARTS
  if (output.type === 'reliability' && output.reliabilityData) {
    const itemData = output.reliabilityData.itemStats.map(item => ({
      item: item.variable,
      'Item-Total Correlation': item.itemTotalCorr,
      'Alpha if Deleted': item.alphaIfDeleted
    }));

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          Scale Reliability Metrics (Cronbach's α = {output.reliabilityData.cronbachAlpha})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Corrected Item-Total Correlations
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="item" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="Item-Total Correlation" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Cronbach's Alpha if Item Deleted
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={itemData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="item" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 0.05', 'dataMax + 0.05']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <ReferenceLine y={output.reliabilityData.cronbachAlpha} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `α = ${output.reliabilityData.cronbachAlpha}`, fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="Alpha if Deleted" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 1. DESCRIPTIVE CHARTS
  if (output.type === 'descriptive' && output.descriptiveData) {
    const meanMedianData = output.descriptiveData.map((d) => ({
      variable: d.variable,
      Mean: d.mean,
      Median: d.median,
      StdDev: d.stdDev
    }));

    const skewnessKurtosisData = output.descriptiveData.map((d) => ({
      variable: d.variable,
      Skewness: d.skewness,
      Kurtosis: d.kurtosis
    }));

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-500" />
          {t('statChartsTitle', lang)}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mean vs Median Chart */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Mean vs. Median Comparison
              </h5>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950">
                Central Tendency
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={meanMedianData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="variable" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Mean" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Median" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skewness & Kurtosis Normality Chart */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Distribution Shape (Skewness & Kurtosis)
              </h5>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950">
                Normality Indicators
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skewnessKurtosisData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="variable" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Bar dataKey="Skewness" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Kurtosis" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CROSSTAB CHARTS
  if (output.type === 'crosstab' && output.crosstabData) {
    const { rowVar, colVar, rowValues, colValues, counts } = output.crosstabData;

    // Build stacked bar chart data
    const barData = rowValues.map((rv, rIdx) => {
      const item: Record<string, any> = { category: rv };
      colValues.forEach((cv, cIdx) => {
        item[cv] = counts[rIdx]?.[cIdx] || 0;
      });
      return item;
    });

    // Pie chart for column total counts
    const pieData = colValues.map((cv, cIdx) => {
      let total = 0;
      rowValues.forEach((_, rIdx) => {
        total += counts[rIdx]?.[cIdx] || 0;
      });
      return { name: String(cv), value: total };
    });

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-500" />
          {t('statChartsTitle', lang)}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stacked Crosstab Bar Chart */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Cross-Categorical Stacked Breakdown ({rowVar} vs. {colVar})
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {colValues.map((cv, idx) => (
                    <Bar key={String(cv)} dataKey={String(cv)} stackId="a" fill={PALETTE[idx % PALETTE.length]} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart of Column Variable proportions */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {colVar} Proportional Share
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. CORRELATION CHARTS
  if (output.type === 'correlation' && output.correlationData) {
    const { variables, matrix } = output.correlationData;

    // Pairs array for bar chart
    const pairs: { pair: string; r: number; p: number }[] = [];
    for (let i = 0; i < variables.length; i++) {
      for (let j = i + 1; j < variables.length; j++) {
        const v1 = variables[i];
        const v2 = variables[j];
        const cell = matrix[v1]?.[v2];
        if (cell) {
          pairs.push({ pair: `${v1} ↔ ${v2}`, r: cell.r, p: cell.p });
        }
      }
    }

    // Prepare scatter data for top pair if dataset exists
    let topPairScatter: { x: number; y: number }[] = [];
    let topV1 = variables[0] || '';
    let topV2 = variables[1] || '';
    if (dataset && dataset.data && dataset.data.length > 0 && topV1 && topV2) {
      topPairScatter = dataset.data
        .filter(r => typeof r[topV1] === 'number' && typeof r[topV2] === 'number')
        .map(r => ({ x: Number(r[topV1]), y: Number(r[topV2]) }));
    }

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-500" />
          {t('statChartsTitle', lang)}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correlation Coefficients Bar Chart */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Pearson Correlation Strengths (r)
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pairs} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="pair" type="category" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <ReferenceLine x={0} stroke="#94a3b8" />
                  <Bar dataKey="r" fill="#0284c7" radius={[0, 4, 4, 0]}>
                    {pairs.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.r >= 0 ? '#10b981' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bivariate Scatter Plot for primary variables */}
          {topPairScatter.length > 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Bivariate Scatter Plot ({topV1} vs. {topV2})
              </h5>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="x" name={topV1} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="y" name={topV2} tick={{ fontSize: 10 }} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Scatter name="Observations" data={topPairScatter} fill="#0284c7" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // 4. LINEAR REGRESSION CHARTS
  if (output.type === 'regression' && output.regressionData) {
    const { dv, ivs, coefficients } = output.regressionData;
    const primaryIv = ivs[0] || '';

    let scatterWithLine: { x: number; yActual: number; yPredicted: number }[] = [];
    if (dataset && dataset.data && primaryIv && dv) {
      const b0Obj = coefficients.find(c => c.variable.includes('Constant') || c.variable.includes('(Intercept)'));
      const b1Obj = coefficients.find(c => c.variable === primaryIv);
      const b0 = b0Obj ? b0Obj.b : 0;
      const b1 = b1Obj ? b1Obj.b : 0;

      scatterWithLine = dataset.data
        .filter(r => typeof r[primaryIv] === 'number' && typeof r[dv] === 'number')
        .map(r => {
          const xVal = Number(r[primaryIv]);
          const yVal = Number(r[dv]);
          const predY = b0 + b1 * xVal;
          return { x: xVal, yActual: yVal, yPredicted: Number(predY.toFixed(2)) };
        })
        .sort((a, b) => a.x - b.x);
    }

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <LineIcon className="w-4 h-4 text-sky-500" />
          {t('statChartsTitle', lang)}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OLS Regression Trend & Scatter Plot */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              OLS Fitted Regression Trendline ({primaryIv} ➔ {dv})
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={scatterWithLine}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="x" name={primaryIv} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Scatter name="Actual Observations" dataKey="yActual" fill="#0284c7" />
                  <Line name="OLS Predicted Line" type="monotone" dataKey="yPredicted" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actual vs Predicted Bar/Line Comparison */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Actual vs. Predicted Model Fit (Sample Cases)
            </h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scatterWithLine.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="x" label={{ value: primaryIv, position: 'insideBottom', offset: -5, fontSize: 10 }} tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="yActual" name="Actual Y" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="yPredicted" name="Predicted Y" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. T-TEST CHARTS
  if (output.type === 'ttest' && output.ttestData) {
    const { group1Name, group1Mean, group2Name, group2Mean, cohensD, meanDiff } = output.ttestData;

    const ttestChartData = [
      { group: group1Name, Mean: group1Mean },
      { group: group2Name, Mean: group2Mean }
    ];

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-500" />
          {t('statChartsTitle', lang)}
        </h4>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Group Means Comparison ({group1Name} vs. {group2Name})
            </h5>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Cohen's d = {cohensD} | Mean Diff = {meanDiff}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ttestChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="group" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="Mean" fill="#0284c7" radius={[6, 6, 0, 0]}>
                  <Cell fill="#0284c7" />
                  <Cell fill="#10b981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // 6. ONE-WAY ANOVA CHARTS
  if (output.type === 'anova' && output.anovaData) {
    const { groups, dv, groupingVar } = output.anovaData;

    const grandMean = groups.length > 0
      ? Number((groups.reduce((acc, g) => acc + g.mean, 0) / groups.length).toFixed(2))
      : 0;

    const anovaChartData = groups.map(g => ({
      group: g.group,
      Mean: g.mean,
      StdDev: g.stdDev
    }));

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-500" />
          {t('statChartsTitle', lang)}
        </h4>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Subgroup Mean Divergence ({dv} by {groupingVar})
            </h5>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950">
              Grand Mean = {grandMean}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anovaChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="group" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <ReferenceLine y={grandMean} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Grand Mean', fill: '#ef4444', fontSize: 10 }} />
                <Bar dataKey="Mean" fill="#0284c7" radius={[6, 6, 0, 0]}>
                  {anovaChartData.map((_, idx) => (
                    <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // 7. TWO-WAY ANOVA CHARTS
  if (output.type === 'twoway_anova' && output.twoWayAnovaData) {
    const { dv, factorA, factorB } = output.twoWayAnovaData;

    let interactionData: any[] = [];
    if (dataset && dataset.data && factorA && factorB && dv) {
      const grouped: Record<string, Record<string, number[]>> = {};
      dataset.data.forEach(row => {
        const valA = String(row[factorA] ?? 'Group A');
        const valB = String(row[factorB] ?? 'Group B');
        const numDV = Number(row[dv]);
        if (!isNaN(numDV)) {
          if (!grouped[valA]) grouped[valA] = {};
          if (!grouped[valA][valB]) grouped[valA][valB] = [];
          grouped[valA][valB].push(numDV);
        }
      });

      const bLevels = Array.from(new Set(dataset.data.map(r => String(r[factorB] ?? '')).filter(Boolean)));

      interactionData = Object.keys(grouped).map(levelA => {
        const rowObj: Record<string, any> = { levelA };
        bLevels.forEach(levelB => {
          const vals = grouped[levelA]?.[levelB] || [];
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          rowObj[levelB] = Number(avg.toFixed(2));
        });
        return rowObj;
      });
    }

    return (
      <div className="space-y-6 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <LineIcon className="w-4 h-4 text-sky-500" />
          {t('statChartsTitle', lang)}
        </h4>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Factor Interaction Plot ({factorA} * {factorB} ➔ {dv})
          </h5>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={interactionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="levelA" tick={{ fontSize: 10 }} label={{ value: factorA, position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {Object.keys(interactionData[0] || {})
                  .filter(k => k !== 'levelA')
                  .map((bKey, idx) => (
                    <Line
                      key={bKey}
                      type="monotone"
                      dataKey={bKey}
                      name={`${factorB}: ${bKey}`}
                      stroke={PALETTE[idx % PALETTE.length]}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ==========================================
// DYNAMIC INTERACTIVE DATA VISUALIZER TAB
// ==========================================
export const InteractiveDataVisualizer: React.FC<{ dataset: SpssDataset; lang: Language }> = ({ dataset, lang }) => {
  const rtl = isRTL(lang);

  const numCols = useMemo(() => {
    if (!dataset || !dataset.data || dataset.data.length === 0) return [];
    return dataset.columns.filter(c => typeof dataset.data[0][c] === 'number');
  }, [dataset]);

  const catCols = useMemo(() => {
    if (!dataset || !dataset.data || dataset.data.length === 0) return [];
    return dataset.columns.filter(c => typeof dataset.data[0][c] !== 'number' || dataset.columns.length <= 10);
  }, [dataset]);

  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xAxisVar, setXAxisVar] = useState<string>(catCols[0] || dataset.columns[0] || '');
  const [yAxisVar, setYAxisVar] = useState<string>(numCols[0] || dataset.columns[1] || dataset.columns[0] || '');
  const [aggMethod, setAggMethod] = useState<'avg' | 'sum' | 'count' | 'min' | 'max'>('avg');

  // Compute aggregated data for Bar/Line/Pie
  const categoryChartData = useMemo(() => {
    if (!dataset || !dataset.data || !xAxisVar || chartType === 'scatter') return [];

    const groups: Record<string, number[]> = {};
    dataset.data.forEach((row) => {
      const rawX = row[xAxisVar];
      const key = rawX !== undefined && rawX !== null ? String(rawX) : 'N/A';
      const numY = Number(row[yAxisVar]);

      if (!groups[key]) groups[key] = [];
      if (!isNaN(numY)) groups[key].push(numY);
    });

    return Object.keys(groups).map((key) => {
      const vals = groups[key];
      let val = 0;
      if (aggMethod === 'count') {
        val = vals.length;
      } else if (vals.length === 0) {
        val = 0;
      } else if (aggMethod === 'sum') {
        val = vals.reduce((a, b) => a + b, 0);
      } else if (aggMethod === 'min') {
        val = Math.min(...vals);
      } else if (aggMethod === 'max') {
        val = Math.max(...vals);
      } else {
        val = vals.reduce((a, b) => a + b, 0) / vals.length;
      }

      return {
        name: key,
        value: Number(val.toFixed(2)),
        count: vals.length
      };
    });
  }, [dataset, xAxisVar, yAxisVar, chartType, aggMethod]);

  // Compute points for Scatter Plot
  const scatterData = useMemo(() => {
    if (!dataset || !dataset.data || !xAxisVar || chartType !== 'scatter') return [];

    return dataset.data
      .filter(r => typeof r[xAxisVar] === 'number' && typeof r[yAxisVar] === 'number')
      .map(r => ({ x: Number(r[xAxisVar]), y: Number(r[yAxisVar]) }))
      .slice(0, 300);
  }, [dataset, xAxisVar, yAxisVar, chartType]);

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Visualizer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            {t('dataVisualizer', lang)}
          </h3>
          <p className="text-xs text-slate-500">
            {t('dataVisualizerSubtitle', lang)} ({dataset.name} — {dataset.rowCount} rows)
          </p>
        </div>

        {/* Chart Type Selection Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              chartType === 'bar' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {t('barChart', lang)}
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              chartType === 'line' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            {t('lineChart', lang)}
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              chartType === 'pie' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            {t('pieChart', lang)}
          </button>
          <button
            onClick={() => setChartType('scatter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              chartType === 'scatter' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {t('scatterPlot', lang)}
          </button>
        </div>
      </div>

      {/* Axis Controls & Aggregation Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-700 dark:text-slate-300">
            {t('xAxisVar', lang)}
          </label>
          <select
            value={xAxisVar}
            onChange={(e) => setXAxisVar(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            {dataset.columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-700 dark:text-slate-300">
            {t('yAxisVar', lang)}
          </label>
          <select
            value={yAxisVar}
            onChange={(e) => setYAxisVar(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            {dataset.columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {chartType !== 'scatter' && (
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Aggregation Metric
            </label>
            <select
              value={aggMethod}
              onChange={(e) => setAggMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="avg">Average (Mean)</option>
              <option value="sum">Sum Total</option>
              <option value="count">Frequency Count</option>
              <option value="min">Minimum Value</option>
              <option value="max">Maximum Value</option>
            </select>
          </div>
        )}
      </div>

      {/* Primary Visual Chart Rendering Area */}
      <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {xAxisVar} vs. {yAxisVar} ({chartType.toUpperCase()})
          </h4>
          <span className="text-[10px] text-slate-400">
            {chartType === 'scatter' ? scatterData.length : categoryChartData.length} Data Groups Rendered
          </span>
        </div>

        <div className="h-80 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="value" name={`${yAxisVar} (${aggMethod.toUpperCase()})`} fill="#0284c7" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((_, idx) => (
                    <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={`${yAxisVar} (${aggMethod.toUpperCase()})`}
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0284c7' }}
                />
              </LineChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((_, idx) => (
                    <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            ) : (
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="x" name={xAxisVar} tick={{ fontSize: 10 }} />
                <YAxis dataKey="y" name={yAxisVar} tick={{ fontSize: 10 }} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Scatter name="Observations" data={scatterData} fill="#0284c7" />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
