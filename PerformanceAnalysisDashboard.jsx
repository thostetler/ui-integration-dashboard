import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function PerformanceAnalysisDashboard() {
  const [comparison, setComparison] = useState('nov24-nov25');
  const [throttleType, setThrottleType] = useState('normal');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Nov 2024 vs Nov 2025
  const nov24vs25Data = {
    normal: [
      { test: 'pub-date', metric: 'TTRR', change: 412.2, status: 'SLOW' },
      { test: 'cited-by-author', metric: 'TTRR', change: 198.7, status: 'SLOW' },
      { test: 'first-author', metric: 'TTRR', change: 188.1, status: 'SLOW' },
      { test: 'journal-search', metric: 'TTRR', change: 180.4, status: 'SLOW' },
      { test: 'title-keyword', metric: 'TTRR', change: 169.7, status: 'SLOW' },
      { test: 'year-range', metric: 'TTRR', change: 167.3, status: 'SLOW' },
      { test: 'citations', metric: 'TTRR', change: 162.3, status: 'SLOW' },
      { test: 'pub-date', metric: 'TTRS', change: 59.1, status: 'SLOW' },
      { test: 'and-search', metric: 'TTRS', change: 57.6, status: 'SLOW' },
      { test: 'full-text', metric: 'TTRL', change: -13.0, status: 'OK' },
      { test: 'arxiv-citations', metric: 'TTRL', change: -13.8, status: 'OK' },
      { test: 'journal-search', metric: 'TTSBI', change: -21.4, status: 'OK' },
    ],
    '6x-cpu': [
      { test: 'pub-date', metric: 'TTRR', change: 99.3, status: 'SLOW' },
      { test: 'cited-by-author', metric: 'TTRR', change: 69.5, status: 'SLOW' },
      { test: 'first-author', metric: 'TTRR', change: 74.2, status: 'SLOW' },
      { test: 'journal-search', metric: 'TTRR', change: 55.6, status: 'SLOW' },
      { test: 'title-keyword', metric: 'TTRR', change: 44.2, status: 'SLOW' },
      { test: 'year-range', metric: 'TTRR', change: 43.9, status: 'SLOW' },
      { test: 'full-text', metric: 'TTRL', change: -6.0, status: 'OK' },
      { test: 'arxiv-citations', metric: 'TTRL', change: -6.1, status: 'OK' },
      { test: 'journal-search', metric: 'TTSBI', change: -17.1, status: 'OK' },
    ],
  };

  // Oct 2025 vs Nov 2025
  const oct25vs25Data = {
    normal: [
      { test: 'year-range', metric: 'TTRL', change: 30.8, severity: 'Critical' },
      { test: 'year-range', metric: 'TTRS', change: 33.3, severity: 'Critical' },
      { test: 'journal-search', metric: 'TTRL', change: 54.1, severity: 'Critical' },
      { test: 'journal-search', metric: 'TTSBI', change: 36.7, severity: 'Critical' },
      { test: 'journal-search', metric: 'TTRS', change: 52.9, severity: 'Critical' },
      { test: 'pub-date', metric: 'TTRL', change: 44.4, severity: 'Critical' },
      { test: 'pub-date', metric: 'TTSBI', change: 21.7, severity: 'Medium' },
      { test: 'cited-by-author', metric: 'TTRL', change: 32.8, severity: 'Critical' },
      { test: 'first-author', metric: 'TTRL', change: 14.9, severity: 'Low' },
      { test: 'bibcode-search', metric: 'TTRL', change: 5.6, severity: 'Low' },
    ],
    '6x-cpu': [
      { test: 'year-range', metric: 'TTRL', change: 36.1, severity: 'Critical' },
      { test: 'year-range', metric: 'TTRS', change: 45.1, severity: 'Critical' },
      { test: 'journal-search', metric: 'TTRL', change: 51.7, severity: 'Critical' },
      { test: 'journal-search', metric: 'TTSBI', change: 49.3, severity: 'Critical' },
      { test: 'pub-date', metric: 'TTRL', change: 45.3, severity: 'Critical' },
      { test: 'first-author', metric: 'TTRL', change: 13.2, severity: 'Low' },
      { test: 'first-author', metric: 'TTSBI', change: 15.2, severity: 'Low' },
      { test: 'bibcode-search', metric: 'TTRL', change: 9.7, severity: 'Low' },
      { test: 'bibcode-search', metric: 'TTSBI', change: 13.2, severity: 'Low' },
    ],
  };

  // Jan 2025 vs Nov 2025
  const jan25vs25Data = {
    normal: [
      { test: 'bibcode-search', metric: 'TTRL', change: 21.17, severity: 'Medium' },
      { test: 'bibcode-search', metric: 'TTSBI', change: 25.62, severity: 'High' },
      { test: 'affiliation', metric: 'TTRL', change: 20.66, severity: 'Medium' },
      { test: 'title-keyword', metric: 'TTRL', change: 23.17, severity: 'Medium' },
      { test: 'title-keyword', metric: 'TTSBI', change: 24.80, severity: 'Medium' },
      { test: 'full-text', metric: 'TTRL', change: 24.14, severity: 'Medium' },
      { test: 'full-text', metric: 'TTSBI', change: 21.81, severity: 'Medium' },
      { test: 'year-range', metric: 'TTRL', change: 21.37, severity: 'Medium' },
      { test: 'year-range', metric: 'TTSBI', change: 23.38, severity: 'Medium' },
      { test: 'citations', metric: 'TTRL', change: 24.47, severity: 'Medium' },
    ],
    '6x-cpu': [
      { test: 'bibcode-search', metric: 'TTRL', change: 27.82, severity: 'Medium' },
      { test: 'bibcode-search', metric: 'TTSBI', change: 27.26, severity: 'Medium' },
      { test: 'affiliation', metric: 'TTRL', change: 30.57, severity: 'Medium' },
      { test: 'affiliation', metric: 'TTRR', change: 40.08, severity: 'Critical' },
      { test: 'title-keyword', metric: 'TTRL', change: 33.79, severity: 'Medium' },
      { test: 'full-text', metric: 'TTRL', change: 33.49, severity: 'Medium' },
      { test: 'year-range', metric: 'TTRL', change: 37.09, severity: 'High' },
      { test: 'year-range', metric: 'TTSBI', change: 33.84, severity: 'Medium' },
      { test: 'year-range', metric: 'TTRS', change: 35.36, severity: 'High' },
    ],
  };

  const getActiveData = () => {
    if (comparison === 'nov24-nov25') return nov24vs25Data[throttleType];
    if (comparison === 'oct-nov25') return oct25vs25Data[throttleType];
    return jan25vs25Data[throttleType];
  };

  const activeData = getActiveData();
  const metrics = ['all', ...new Set(activeData.map(d => d.metric))];
  const statuses = ['all', ...new Set(activeData.filter(d => d.status).map(d => d.status))];

  const filteredData = useMemo(() => {
    let result = activeData;
    if (selectedMetric !== 'all') result = result.filter(d => d.metric === selectedMetric);
    if (selectedStatus !== 'all' && selectedStatus) result = result.filter(d => d.status === selectedStatus);
    return result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [activeData, selectedMetric, selectedStatus]);

  const getBarColor = (change, severity) => {
    if (severity) {
      const colors = { Critical: '#dc2626', High: '#f97316', Medium: '#eab308', Low: '#84cc16' };
      return colors[severity] || '#6b7280';
    }
    return change > 0 ? '#ef4444' : change < 0 ? '#22c55e' : '#94a3b8';
  };

  const comparisonLabels = {
    'nov24-nov25': { before: 'Nov 2024', after: 'Nov 2025' },
    'oct-nov25': { before: 'Oct 2025', after: 'Nov 2025' },
    'jan-nov25': { before: 'Jan 2025', after: 'Nov 2025' },
  };

  const labels = comparisonLabels[comparison];
  const throttleLabel = throttleType === 'normal' ? 'Normal Load' : '6x CPU Throttling';

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Performance Analysis Dashboard</h1>
          <p className="text-slate-600 text-lg">Compare across time periods and throttling scenarios</p>
        </div>

        {/* Time Period Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Time Period</h3>
          <div className="flex gap-3 flex-wrap">
            {[
              { id: 'nov24-nov25', label: 'Nov 2024 vs Nov 2025' },
              { id: 'oct-nov25', label: 'Oct 2025 vs Nov 2025' },
              { id: 'jan-nov25', label: 'Jan 2025 vs Nov 2025' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => { setComparison(opt.id); setSelectedMetric('all'); setSelectedStatus('all'); }}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  comparison === opt.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-200'
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
              { id: 'normal', label: 'Normal Load' },
              { id: '6x-cpu', label: '6x CPU Throttling' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setThrottleType(opt.id)}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  throttleType === opt.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-200'
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
                {metrics.map(m => (<option key={m} value={m}>{m === 'all' ? 'All Metrics' : m}</option>))}
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
                  {statuses.map(s => (<option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>))}
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
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="test" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 11 }} />
              <YAxis label={{ value: 'Change (%)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value) => `${value.toFixed(1)}%`} />
              <Bar dataKey="change" radius={[8, 8, 0, 0]}>
                {filteredData.map((entry, i) => (<Cell key={i} fill={getBarColor(entry.change, entry.severity)} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Slowdown</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Improvement</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded"></div>
            <span className="text-sm font-medium text-slate-700">High Severity</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-400 rounded"></div>
            <span className="text-sm font-medium text-slate-700">Low Severity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
