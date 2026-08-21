import { useState, useEffect } from 'react';
import { getAllCategories, createCategory } from '../api/categoryApi';
import { useToast } from '../context/ToastContext';

function ExpenseForm({ onSubmit, onCancel, initialData }) {
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [expenseDate, setExpenseDate] = useState(
    initialData?.expenseDate || new Date().toISOString().split('T')[0]
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      error('Failed to load categories');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const created = await createCategory(newCategoryName.trim());
      await loadCategories();
      setCategoryId(created.id);
      setNewCategoryName('');
      setShowNewCategory(false);
      success(`Category "${created.name}" created`);
    } catch (err) {
      error('Failed to create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        description: description.trim(),
        expenseDate,
        categoryId: parseInt(categoryId),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white">
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Amount (Rs.)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-slate-500 font-medium text-sm">Rs.</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Expense Date
          </label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Grocery shopping, Electricity bill"
          required
          className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
            Category
          </label>
          <button
            type="button"
            onClick={() => setShowNewCategory(!showNewCategory)}
            className="text-indigo-400 text-xs hover:text-indigo-300 font-semibold transition"
          >
            {showNewCategory ? 'Select Existing' : '+ Create Category'}
          </button>
        </div>

        {showNewCategory ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Subscriptions, Fuel"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
            >
              Save
            </button>
          </div>
        ) : (
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initialData ? 'Update Expense' : 'Create Expense'}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;