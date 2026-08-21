import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { SkeletonCard } from '../components/SkeletonCard';
import { getMonthlySummary, downloadPdfReport } from '../api/expenseApi';
import { useToast } from '../context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'];

function Reports() {
  const [summary, setSummary] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  const { error } = useToast();

  const loadSummary = async (y, m) => {
    setLoading(true);
    try {
      const data = await getMonthlySummary(y, m);
      setSummary(data);
    } catch (err) {
      error('Failed to load report summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(year, month);
  }, [year, month]);

  const handleDownloadPdf = async () => {
    try {
      await downloadPdfReport(year, month);
    } catch (err) {
      error('Failed to download PDF report');
    }
  };

  const chartData = summary?.categoryBreakdown?.map((cat) => ({
    name: cat.categoryName,
    amount: cat.totalAmount,
  })) || [];

  const totalSpent = summary?.totalSpent ?? 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  const avgDailySpent = totalSpent / daysInMonth;

  const sortedCategories = summary?.categoryBreakdown
    ? [...summary.categoryBreakdown].sort((a, b) => b.totalAmount - a.totalAmount)
    : [];

  const highestCat = sortedCategories.length > 0 ? sortedCategories[0] : null;

  const handleExportCsv = () => {
    if (!summary?.categoryBreakdown?.length) return;

    const headers = ['Category', 'Amount Spent (Rs)'];
    const rows = summary.categoryBreakdown.map((cat) => [
      `"${(cat.categoryName || '').replace(/"/g, '""')}"`,
      cat.totalAmount,
    ]);

    rows.push(['Total Spent', summary.totalSpent]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Monthly_Summary_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial Reports</h1>
            <p className="text-slate-400 text-sm mt-1">Export monthly statements and analyze category trends</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-indigo-500 text-sm font-medium transition"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-indigo-500 text-sm font-medium transition"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={handleExportCsv}
              disabled={!summary?.categoryBreakdown?.length}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition duration-200 disabled:opacity-40"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>

            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-900/90 border border-indigo-500/20 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Total Month Spend
                </p>
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  Rs. {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(2026, month - 1).toLocaleString('default', { month: 'long' })} {year}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-slate-900/90 border border-emerald-500/20 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Average Daily Spend
                </p>
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  Rs. {avgDailySpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-2">Based on {daysInMonth} days</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/50 to-slate-900/90 border border-purple-500/20 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                  Highest Expense Sector
                </p>
                <p className="text-2xl font-extrabold text-white truncate tracking-tight">
                  {highestCat ? highestCat.categoryName : 'None'}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {highestCat ? `Rs. ${highestCat.totalAmount.toFixed(2)}` : 'No expenses recorded'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-6">Bar Analysis by Category</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                        formatter={(value) => [`Rs. ${Number(value).toFixed(2)}`, 'Amount']}
                      />
                      <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-20">No report data for this period.</p>
                )}
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-6">Percentage Breakdown</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="amount"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                        formatter={(value) => [`Rs. ${Number(value).toFixed(2)}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-20">No report data for this period.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;