import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import type { PerformanceData, ComparisonData, ComparisonType, ThrottleType } from '../types';
import { loadComparisonData } from '../utils/csvParser';

interface ComparisonOption {
  id: string;
  label: string;
  comparisonType: ComparisonType;
  throttleType: ThrottleType;
  isAllComparisons?: boolean;
}

const METRICS = [
  { key: 'TTRL', name: 'Time to Request Loaded (TTRL)' },
  { key: 'TTSBI', name: 'Time to Search Box Interaction (TTSBI)' },
  { key: 'TTRS', name: 'Time to Results Shown (TTRS)' },
  { key: 'TTRR', name: 'Time to Results Rendered (TTRR)' },
];

export default function PerformanceAnalysisDashboard() {
  const [selectedComparison, setSelectedComparison] = useState<string>('nov24-nov25-normal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nov24vs25Data, setNov24vs25Data] = useState<ComparisonData | null>(null);
  const [oct25vs25Data, setOct25vs25Data] = useState<ComparisonData | null>(null);
  const [jan25vs25Data, setJan25vs25Data] = useState<ComparisonData | null>(null);

  const comparisonOptions: ComparisonOption[] = [
    { id: 'all-comparisons', label: 'All Comparisons (Overview)', comparisonType: 'nov24-nov25', throttleType: 'normal', isAllComparisons: true },
    { id: 'nov24-nov25-normal', label: 'Nov 2024 vs Nov 2025 (Normal Load)', comparisonType: 'nov24-nov25', throttleType: 'normal' },
    { id: 'nov24-nov25-6x', label: 'Nov 2024 vs Nov 2025 (6x CPU)', comparisonType: 'nov24-nov25', throttleType: '6x-cpu' },
    { id: 'oct-nov25-normal', label: 'Oct 2025 vs Nov 2025 (Normal Load)', comparisonType: 'oct-nov25', throttleType: 'normal' },
    { id: 'oct-nov25-6x', label: 'Oct 2025 vs Nov 2025 (6x CPU)', comparisonType: 'oct-nov25', throttleType: '6x-cpu' },
    { id: 'jan-nov25-normal', label: 'Jan 2025 vs Nov 2025 (Normal Load)', comparisonType: 'jan-nov25', throttleType: 'normal' },
    { id: 'jan-nov25-6x', label: 'Jan 2025 vs Nov 2025 (6x CPU)', comparisonType: 'jan-nov25', throttleType: '6x-cpu' },
  ];

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [nov24, oct25, jan25] = await Promise.all([
          loadComparisonData('nov-2024-baseline.csv', 'nov-2025.csv'),
          loadComparisonData('oct-2025-v0_24_0.csv', 'nov-2025.csv'),
          loadComparisonData('jan-2025-v0_19_96.csv', 'nov-2025.csv'),
        ]);
        setNov24vs25Data(nov24);
        setOct25vs25Data(oct25);
        setJan25vs25Data(jan25);
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please check the console for details.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const getDataForComparison = (comparisonType: ComparisonType, throttleType: ThrottleType): PerformanceData[] => {
    let data: ComparisonData | null = null;

    if (comparisonType === 'nov24-nov25') data = nov24vs25Data;
    else if (comparisonType === 'oct-nov25') data = oct25vs25Data;
    else data = jan25vs25Data;

    return data ? data[throttleType] : [];
  };

  const currentOption = comparisonOptions.find(opt => opt.id === selectedComparison);

  const renderAllComparisonsView = () => {
    // For all comparisons, show top 3 tests for each scenario
    const comparisons = [
      { type: 'nov24-nov25' as ComparisonType, label: 'Nov 2024 → 2025' },
      { type: 'oct-nov25' as ComparisonType, label: 'Oct 2025 → Nov 2025' },
      { type: 'jan-nov25' as ComparisonType, label: 'Jan 2025 → Nov 2025' },
    ];

    return (
      <div className="space-y-8">
        {comparisons.map(({ type, label }) => (
          <div key={type} className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{label}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Normal Load */}
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Normal Load (Top 3)</h3>
                {renderMetricCharts(getDataForComparison(type, 'normal').slice(0, 3), true)}
              </div>
              {/* 6x CPU */}
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">6x CPU Throttling (Top 3)</h3>
                {renderMetricCharts(getDataForComparison(type, '6x-cpu').slice(0, 3), true)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMetricCharts = (allData: PerformanceData[], compact = false) => {
    return METRICS.map(({ key, name }) => {
      const metricData = allData.filter(d => d.metric === key);

      if (metricData.length === 0) return null;

      // Transform data for double bars
      const chartData = metricData.map(d => ({
        test: d.test,
        baseline: d.baseline,
        current: d.current,
        changePercent: d.changePercent,
        severity: d.severity,
      }));

      return (
        <div key={key} className={`bg-white rounded-xl shadow-md p-6 border border-slate-200 ${compact ? 'mb-4' : ''}`}>
          <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-slate-900 mb-4`}>
            {name}
          </h3>
          {chartData.length === 0 ? (
            <div className={`${compact ? 'h-48' : 'h-96'} flex items-center justify-center text-slate-500`}>
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={compact ? 250 : 400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: compact ? 60 : 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="test"
                  angle={-45}
                  textAnchor="end"
                  height={compact ? 80 : 120}
                  tick={{ fontSize: compact ? 9 : 11 }}
                />
                <YAxis
                  label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: compact ? 9 : 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'baseline') return [`${value.toFixed(1)} ms`, 'Baseline'];
                    if (name === 'current') return [`${value.toFixed(1)} ms`, 'Current'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Test: ${label}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: compact ? '11px' : '13px' }}
                />
                <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="Current" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const color = entry.changePercent > 0
                      ? (entry.severity === 'Critical' ? '#dc2626' :
                         entry.severity === 'High' ? '#f97316' :
                         entry.severity === 'Medium' ? '#eab308' : '#ef4444')
                      : '#22c55e';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      );
    });
  };

  const renderStandardView = () => {
    if (!currentOption || currentOption.isAllComparisons) return null;

    const allData = getDataForComparison(currentOption.comparisonType, currentOption.throttleType);

    return (
      <div className="space-y-6">
        {renderMetricCharts(allData)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-slate-700">Loading performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Performance Analysis Dashboard</h1>
          <p className="text-slate-600 text-lg">Compare performance metrics across time periods and throttling scenarios</p>
        </div>

        {/* Comparison Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Select Comparison</label>
          <select
            value={selectedComparison}
            onChange={e => setSelectedComparison(e.target.value)}
            className="w-full max-w-xl px-4 py-3 text-base border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            {comparisonOptions.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Charts */}
        {currentOption?.isAllComparisons ? renderAllComparisonsView() : renderStandardView()}

        {/* Legend */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-400 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Baseline</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Improvement</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-red-600 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Critical Regression</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">High Severity</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Medium Severity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
