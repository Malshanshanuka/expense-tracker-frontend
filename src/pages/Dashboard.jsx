import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getAllExpenses, getMonthlySummary } from '../api/expenseApi';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // JavaScript months 0 idan patan gannawa, ehema nisa +1 karanna one

        const [summaryData, expenseData] = await Promise.all([
          getMonthlySummary(year, month),
          getAllExpenses(),
        ]);

        setSummary(summaryData);
        setExpenses(expenseData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex bg-slate-950 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 text-white">Loading...</main>
      </div>
    );
  }

  const recentExpenses = expenses.slice(-5).reverse();

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-white text-2xl font-bold mb-8">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-2">This Month's Spending</p>
            <p className="text-white text-3xl font-bold">
              Rs. {summary?.totalSpent?.toFixed(2) ?? '0.00'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-2">Total Transactions</p>
            <p className="text-white text-3xl font-bold">{expenses.length}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {summary?.categoryBreakdown?.length > 0 ? (
              summary.categoryBreakdown.map((cat) => (
                <div key={cat.categoryName} className="flex justify-between text-sm">
                  <span className="text-slate-400">{cat.categoryName}</span>
                  <span className="text-white font-medium">Rs. {cat.totalAmount.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No expenses this month yet</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Recent Transactions</h2>
          {recentExpenses.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-800">
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-slate-800 last:border-0">
                    <td className="py-3 text-white">{exp.description}</td>
                    <td className="py-3 text-slate-400">{exp.categoryName}</td>
                    <td className="py-3 text-slate-400">{exp.expenseDate}</td>
                    <td className="py-3 text-right text-red-400">-Rs. {exp.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-sm">No transactions yet</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;