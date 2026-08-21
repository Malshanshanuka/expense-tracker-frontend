import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { SkeletonCard, SkeletonTable } from '../components/SkeletonCard';
import { getAllExpenses, getMonthlySummary } from '../api/expenseApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'];

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('monthly_budget');
    return saved ? parseFloat(saved) : 50000;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const [summaryData, expenseData] = await Promise.all([
          getMonthlySummary(year, month),
          getAllExpenses(),
        ]);

        setSummary(summaryData);
        setExpenses(expenseData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalSpent = summary?.totalSpent ?? 0;
  const totalCount = expenses.length;
  const avgExpense = totalCount > 0 ? (expenses.reduce((acc, curr) => acc + curr.amount, 0) / totalCount) : 0;

  const sortedCategories = summary?.categoryBreakdown
    ? [...summary.categoryBreakdown].sort((a, b) => b.totalAmount - a.totalAmount)
    : [];

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0].categoryName : 'N/A';
  const recentExpenses = expenses.slice(-5).reverse();

  const pieChartData = sortedCategories.map((cat) => ({
    name: cat.categoryName,
    value: cat.totalAmount,
  }));

  const budgetPercentage = Math.min((totalSpent / monthlyBudget) * 100, 100);
  const isBudgetWarning = totalSpent >= monthlyBudget * 0.85;
  const isOverBudget = totalSpent > monthlyBudget;

  const budgetStatusText = isOverBudget
    ? 'Budget Exceeded'
    : isBudgetWarning
    ? 'Nearing Limit'
    : 'On Track';

  const budgetStatusColor = isOverBudget
    ? 'text-rose-400'
    : isBudgetWarning
    ? 'text-amber-400'
    : 'text-emerald-400';

  const progressBgColor = isOverBudget
    ? 'bg-rose-500'
    : isBudgetWarning
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
      localStorage.setItem('monthly_budget', val.toString());
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time summary of your current spending activity</p>
          </div>
          <Link
            to="/expenses"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Expense
          </Link>
        </div>

        {isBudgetWarning && !loading && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition animate-fade-in ${
            isOverBudget
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isOverBudget ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold">
                  {isOverBudget ? 'Monthly Budget Exceeded!' : 'Monthly Budget Alert'}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {isOverBudget
                    ? `You have spent Rs. ${(totalSpent - monthlyBudget).toFixed(2)} over your monthly limit.`
                    : `You have utilized ${budgetPercentage.toFixed(0)}% of your Rs. ${monthlyBudget.toLocaleString()} budget.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTempBudget(monthlyBudget.toString());
                setIsEditingBudget(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold shrink-0 transition"
            >
              Adjust Budget
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <SkeletonTable />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900/90 border border-indigo-500/20 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    This Month
                  </span>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  Rs. {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-2">Total Monthly Expenditure</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900/90 border border-purple-500/20 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Transactions
                  </span>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-white tracking-tight">{totalCount}</p>
                <p className="text-xs text-slate-400 mt-2">Recorded Expenses</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900/90 border border-emerald-500/20 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Avg Expense
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  Rs. {avgExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-2">Average Per Transaction</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900/90 border border-amber-500/20 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Top Category
                  </span>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-white truncate tracking-tight">{topCategory}</p>
                <p className="text-xs text-slate-400 mt-2">Highest Spending Sector</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span>Category Distribution</span>
                </h3>
                {pieChartData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                          formatter={(value) => [`Rs. ${Number(value).toFixed(2)}`, 'Amount']}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {sortedCategories.map((cat, idx) => (
                        <div key={cat.categoryName} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <span className="text-slate-300 font-medium">{cat.categoryName}</span>
                          </div>
                          <span className="text-white font-semibold">
                            Rs. {cat.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm py-12 text-center">No categories to display yet.</p>
                )}
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Monthly Budget</h3>
                    <button
                      onClick={() => {
                        setTempBudget(monthlyBudget.toString());
                        setIsEditingBudget(!isEditingBudget);
                      }}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      {isEditingBudget ? 'Cancel' : 'Edit Limit'}
                    </button>
                  </div>

                  {isEditingBudget ? (
                    <form onSubmit={handleSaveBudget} className="space-y-3 mb-4">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-medium">Rs.</span>
                        <input
                          type="number"
                          step="500"
                          min="1000"
                          value={tempBudget}
                          onChange={(e) => setTempBudget(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                          placeholder="Set budget amount"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                      >
                        Save Budget
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Budget Limit</span>
                          <span className="text-white font-bold">
                            Rs. {monthlyBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Spent So Far</span>
                          <span className="text-slate-200 font-semibold">
                            Rs. {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden mt-2">
                          <div
                            className={`h-full ${progressBgColor} transition-all duration-500 rounded-full`}
                            style={{ width: `${budgetPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span className="text-slate-400">{budgetPercentage.toFixed(1)}% used</span>
                          <span className={`font-bold ${budgetStatusColor}`}>{budgetStatusText}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
                        <span className="text-xs text-slate-400">Total Categories Used</span>
                        <p className="text-xl font-bold text-white">{sortedCategories.length}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/reports"
                  className="mt-6 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs text-center block transition"
                >
                  View Full Analytics Report →
                </Link>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                <Link to="/expenses" className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold">
                  View All ({expenses.length}) →
                </Link>
              </div>

              {recentExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                        <th className="pb-3 font-semibold">Description</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {recentExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-4 text-white font-medium">{exp.description}</td>
                          <td className="py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {exp.categoryName}
                            </span>
                          </td>
                          <td className="py-4 text-slate-400 text-xs">{exp.expenseDate}</td>
                          <td className="py-4 text-right font-semibold text-rose-400">
                            -Rs. {exp.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">No recent transactions recorded.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;