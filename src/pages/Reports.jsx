import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getMonthlySummary } from '../api/expenseApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Reports() {
  const [summary, setSummary] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  const loadSummary = async (y, m) => {
    setLoading(true);
    const data = await getMonthlySummary(y, m);
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSummary(year, month);
  }, [year, month]);

  const handleDownloadPdf = () => {
    const token = localStorage.getItem('token');
    window.open(
      `http://localhost:8080/api/reports/monthly/pdf?year=${year}&month=${month}&token=${token}`,
      '_blank'
    );
  };

 
  const chartData = summary?.categoryBreakdown?.map((cat) => ({
    name: cat.categoryName,
    amount: cat.totalAmount,
  })) || [];

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-2xl font-bold">Reports</h1>

          <div className="flex gap-3 items-center">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="bg-slate-800 text-white p-2 rounded-lg outline-none"
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
              className="bg-slate-800 text-white p-2 rounded-lg outline-none"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
              <p className="text-slate-400 text-sm mb-2">Total Spent</p>
              <p className="text-white text-3xl font-bold">
                Rs. {summary?.totalSpent?.toFixed(2) ?? '0.00'}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
              <h2 className="text-white font-semibold mb-4">Spending by Category</h2>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-sm">No data for this period</p>
              )}
            </div>

            <button
              onClick={handleDownloadPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
            >
              Download PDF Report
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;