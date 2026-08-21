import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import ExpenseForm from '../components/ExpenseForm';
import Modal from '../components/Modal';
import { SkeletonTable } from '../components/SkeletonCard';
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';
import { getAllCategories } from '../api/categoryApi';
import { useToast } from '../context/ToastContext';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [expenseData, categoryData] = await Promise.all([
        getAllExpenses(),
        getAllCategories(),
      ]);
      setExpenses(expenseData);
      setCategories(categoryData);
    } catch (err) {
      error('Failed to fetch expenses data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddClick = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
        success('Expense updated successfully');
      } else {
        await createExpense(data);
        success('Expense created successfully');
      }
      setShowForm(false);
      setEditingExpense(null);
      loadData();
    } catch (err) {
      error('Failed to save expense');
    }
  };

  const promptDelete = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete.id);
      success('Expense deleted successfully');
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
      loadData();
    } catch (err) {
      error('Failed to delete expense');
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? exp.categoryId === parseInt(selectedCategory) : true;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let valA = sortBy === 'amount' ? a.amount : new Date(a.expenseDate);
        let valB = sortBy === 'amount' ? b.amount : new Date(b.expenseDate);

        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [expenses, searchQuery, selectedCategory, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Expenses Management</h1>
            <p className="text-slate-400 text-sm mt-1">Filter, sort and edit all recorded transactions</p>
          </div>
          {!showForm && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          )}
        </div>

        {showForm && (
          <ExpenseForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingExpense(null);
            }}
            initialData={editingExpense}
          />
        )}

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search by description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 outline-none focus:border-indigo-500 text-sm transition"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white outline-none focus:border-indigo-500 text-sm transition"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white outline-none focus:border-indigo-500 text-sm transition"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition text-xs font-bold"
              >
                {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
              </button>
            </div>
          </div>

          {loading ? (
            <SkeletonTable />
          ) : paginatedExpenses.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold text-right">Amount</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedExpenses.map((exp) => (
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
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(exp)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => promptDelete(exp)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Page {currentPage} of {totalPages} ({filteredExpenses.length} items)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 disabled:opacity-40 transition"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 disabled:opacity-40 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 space-y-3">
              <p className="text-slate-400 text-sm">No expenses found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="text-indigo-400 text-xs hover:underline font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Expense"
          message={`Are you sure you want to delete "${expenseToDelete?.description}"? This action cannot be undone.`}
          confirmText="Confirm Delete"
        />
      </main>
    </div>
  );
}

export default Expenses;