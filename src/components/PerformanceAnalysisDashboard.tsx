import { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PerformanceData, ComparisonData, ComparisonType, ThrottleType } from '../types';
import { loadComparisonData } from '../utils/csvParser';

export default function PerformanceAnalysisDashboard() {
  const [comparison, setComparison] = useState<ComparisonType>('nov24-nov25');
  const [throttleType, setThrottleType] = useState<ThrottleType>('normal');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nov24vs25Data, setNov24vs25Data] = useState<ComparisonData | null>(null);
  const [oct25vs25Data, setOct25vs25Data] = useState<ComparisonData | null>(null);
  const [jan25vs25Data, setJan25vs25Data] = useState<ComparisonData | null>(null);

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

  const getActiveData = (): PerformanceData[] => {
    let data: ComparisonData | null = null;

    if (comparison === 'nov24-nov25') data = nov24vs25Data;
    else if (comparison === 'oct-nov25') data = oct25vs25Data;
    else data = jan25vs25Data;

    return data ? data[throttleType] : [];
  };

  const activeData = getActiveData();
  const metrics = ['all', ...Array.from(new Set(activeData.map(d => d.metric)))];
  const statuses = ['all', ...Array.from(new Set(activeData.filter(d => d.status).map(d => d.status)))];

  const filteredData = useMemo(() => {
    let result = activeData;
    if (selectedMetric !== 'all') {
      result = result.filter(d => d.metric === selectedMetric);
    }
    if (selectedStatus !== 'all' && selectedStatus) {
      result = result.filter(d => d.status === selectedStatus);
    }
    return result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 30);
  }, [activeData, selectedMetric, selectedStatus]);

  const getBarColor = (change: number, severity?: string): string => {
    if (severity) {
      const colors = {
        Critical: '#dc2626',
        High: '#f97316',
        Medium: '#eab308',
        Low: '#84cc16'
      };
      return colors[severity as keyof typeof colors] || '#6b7280';
    }
    return change > 0 ? '#ef4444' : change < 0 ? '#22c55e' : '#94a3b8';
  };

  const comparisonLabels: Record<ComparisonType, { before: string; after: string }> = {
    'nov24-nov25': { before: 'Nov 2024', after: 'Nov 2025' },
    'oct-nov25': { before: 'Oct 2025', after: 'Nov 2025' },
    'jan-nov25': { before: 'Jan 2025', after: 'Nov 2025' },
  };

  const labels = comparisonLabels[comparison];
  const throttleLabel = throttleType === 'normal' ? 'Normal Load' : '6x CPU Throttling';

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
          <p className="text-slate-600 text-lg">Compare performance across time periods and throttling scenarios</p>
        </div>

        {/* Time Period Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Time Period</h3>
          <div className="flex gap-3 flex-wrap">
            {[
              { id: 'nov24-nov25' as ComparisonType, label: 'Nov 2024 vs Nov 2025' },
              { id: 'oct-nov25' as ComparisonType, label: 'Oct 2025 vs Nov 2025' },
              { id: 'jan-nov25' as ComparisonType, label: 'Jan 2025 vs Nov 2025' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setComparison(opt.id);
                  setSelectedMetric('all');
                  setSelectedStatus('all');
                }}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  comparison === opt.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Throttle Type Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Throttling Type</h3>
          <div className="flex gap-3 flex-wrap">
            {[
              { id: 'normal' as ThrottleType, label: 'Normal Load' },
              { id: '6x-cpu' as ThrottleType, label: '6x CPU Throttling' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setThrottleType(opt.id)}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  throttleType === opt.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Metric</label>
              <select
                value={selectedMetric}
                onChange={e => setSelectedMetric(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {metrics.map(m => (
                  <option key={m} value={m}>
                    {m === 'all' ? 'All Metrics' : m}
                  </option>
                ))}
              </select>
            </div>
            {statuses.length > 1 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'All Statuses' : s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Performance Change: {labels.before} vs {labels.after} • {throttleLabel}
          </h2>
          {filteredData.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-slate-500">
              No data available for the selected filters
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="test"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  label={{ value: 'Change (%)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="change" radius={[8, 8, 0, 0]}>
                  {filteredData.map((entry, i) => (
                    <Cell key={i} fill={getBarColor(entry.change, entry.severity)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Regression</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Improvement</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-red-600 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Critical</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">High Severity</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-lime-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Low Severity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
