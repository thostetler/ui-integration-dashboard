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
  group: string;
}

const METRICS = [
  {
    key: 'TTRL',
    name: 'Time to Request Loaded (TTRL)',
    description: 'How long until page loads and is usable',
    details: 'Total time from initial page load until the page is fully rendered and interactive. Includes HTML parsing, CSS processing, and JS execution for initial render.'
  },
  {
    key: 'TTSBI',
    name: 'Time to Search Box Interaction (TTSBI)',
    description: 'How long until search bar is ready',
    details: 'Time from page load until the search input field is ready to accept input. First interaction point for users.'
  },
  {
    key: 'TTRS',
    name: 'Time to Results Shown (TTRS)',
    description: 'How long to get initial search results',
    details: 'Time from clicking the search button until the first set of results appears on screen. Includes network request, API processing, and DOM rendering.'
  },
  {
    key: 'TTRR',
    name: 'Time to Results Rendered (TTRR)',
    description: 'How long to get refined search results',
    details: 'Time from entering a refinement query until refined results appear. Should typically be faster than TTRS due to smaller result sets.'
  },
];

export default function PerformanceAnalysisDashboard() {
  const [selectedComparison, setSelectedComparison] = useState<string>('nov24-nov25-normal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nov24vs25Data, setNov24vs25Data] = useState<ComparisonData | null>(null);
  const [nov24vsOct25Data, setNov24vsOct25Data] = useState<ComparisonData | null>(null);
  const [oct25vs25Data, setOct25vs25Data] = useState<ComparisonData | null>(null);
  const [jan25vsOct25Data, setJan25vsOct25Data] = useState<ComparisonData | null>(null);
  const [jan25vs25Data, setJan25vs25Data] = useState<ComparisonData | null>(null);

  const comparisonOptions: ComparisonOption[] = [
    // Nov 2024 comparisons
    { id: 'nov24-oct25-normal', label: 'Normal Load', comparisonType: 'nov24-oct25', throttleType: 'normal', group: 'Nov 2024 → Oct 2025' },
    { id: 'nov24-oct25-6x', label: '6x CPU Throttling', comparisonType: 'nov24-oct25', throttleType: '6x-cpu', group: 'Nov 2024 → Oct 2025' },

    { id: 'nov24-nov25-normal', label: 'Normal Load', comparisonType: 'nov24-nov25', throttleType: 'normal', group: 'Nov 2024 → Nov 2025' },
    { id: 'nov24-nov25-6x', label: '6x CPU Throttling', comparisonType: 'nov24-nov25', throttleType: '6x-cpu', group: 'Nov 2024 → Nov 2025' },

    // Jan 2025 comparisons
    { id: 'jan25-oct25-normal', label: 'Normal Load', comparisonType: 'jan25-oct25', throttleType: 'normal', group: 'Jan 2025 → Oct 2025' },
    { id: 'jan25-oct25-6x', label: '6x CPU Throttling', comparisonType: 'jan25-oct25', throttleType: '6x-cpu', group: 'Jan 2025 → Oct 2025' },

    { id: 'jan25-nov25-normal', label: 'Normal Load', comparisonType: 'jan25-nov25', throttleType: 'normal', group: 'Jan 2025 → Nov 2025' },
    { id: 'jan25-nov25-6x', label: '6x CPU Throttling', comparisonType: 'jan25-nov25', throttleType: '6x-cpu', group: 'Jan 2025 → Nov 2025' },

    // Oct 2025 comparison
    { id: 'oct25-nov25-normal', label: 'Normal Load', comparisonType: 'oct-nov25', throttleType: 'normal', group: 'Oct 2025 → Nov 2025' },
    { id: 'oct25-nov25-6x', label: '6x CPU Throttling', comparisonType: 'oct-nov25', throttleType: '6x-cpu', group: 'Oct 2025 → Nov 2025' },
  ];

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [nov24vs25, nov24vsOct25, oct25vs25, jan25vsOct25, jan25vs25] = await Promise.all([
          loadComparisonData('nov-2024-baseline.csv', 'nov-2025.csv'),
          loadComparisonData('nov-2024-baseline.csv', 'oct-2025-v0_24_0.csv'),
          loadComparisonData('oct-2025-v0_24_0.csv', 'nov-2025.csv'),
          loadComparisonData('jan-2025-v0_19_96.csv', 'oct-2025-v0_24_0.csv'),
          loadComparisonData('jan-2025-v0_19_96.csv', 'nov-2025.csv'),
        ]);
        setNov24vs25Data(nov24vs25);
        setNov24vsOct25Data(nov24vsOct25);
        setOct25vs25Data(oct25vs25);
        setJan25vsOct25Data(jan25vsOct25);
        setJan25vs25Data(jan25vs25);
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
    else if (comparisonType === 'nov24-oct25') data = nov24vsOct25Data;
    else if (comparisonType === 'oct-nov25') data = oct25vs25Data;
    else if (comparisonType === 'jan25-oct25') data = jan25vsOct25Data;
    else if (comparisonType === 'jan25-nov25') data = jan25vs25Data;

    return data ? data[throttleType] : [];
  };

  const currentOption = comparisonOptions.find(opt => opt.id === selectedComparison);

  const renderMetricCharts = (allData: PerformanceData[]) => {
    return METRICS.map(({ key, name, description, details }) => {
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
        <div key={key} className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {name}
            </h3>
            <p className="text-sm text-slate-600 mb-1">{description}</p>
            <p className="text-xs text-slate-500">{details}</p>
          </div>
          {chartData.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-slate-500">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="test"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
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
                  wrapperStyle={{ fontSize: '13px' }}
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

  const allData = currentOption
    ? getDataForComparison(currentOption.comparisonType, currentOption.throttleType)
    : [];

  // Group options by their group property
  const groupedOptions = comparisonOptions.reduce((acc, option) => {
    if (!acc[option.group]) {
      acc[option.group] = [];
    }
    acc[option.group].push(option);
    return acc;
  }, {} as Record<string, ComparisonOption[]>);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Performance Analysis Dashboard</h1>
          <p className="text-slate-600 text-lg">Compare performance metrics across time periods and throttling scenarios</p>
        </div>

        {/* Additional Reports */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/ui-integration-dashboard/new-metrics-comparison/performance-dashboard.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg p-4 border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Performance Dashboard</h3>
                <p className="text-sm text-slate-600">Jan 2025 → Nov 2025 detailed comparison</p>
              </div>
              <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <a
            href="/ui-integration-dashboard/new-metrics-comparison/measurement-comparison-charts.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg p-4 border-2 border-purple-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Measurement Framework Comparison</h3>
                <p className="text-sm text-slate-600">Cross-framework metric analysis</p>
              </div>
              <svg className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>

        {/* Comparison Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Select Comparison</label>
          <select
            value={selectedComparison}
            onChange={e => setSelectedComparison(e.target.value)}
            className="w-full max-w-xl px-4 py-3 text-base border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            {Object.entries(groupedOptions).map(([groupName, options]) => (
              <optgroup key={groupName} label={groupName}>
                {options.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Current Selection Display */}
        {currentOption && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {currentOption.group}
                </h2>
                <p className="text-lg text-slate-700">
                  <span className="font-semibold">{currentOption.label}</span>
                  <span className="text-slate-500 mx-2">•</span>
                  <span className="text-slate-600">{allData.length} performance changes detected</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="space-y-6">
          {renderMetricCharts(allData)}
        </div>

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
