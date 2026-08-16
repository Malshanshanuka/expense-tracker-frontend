import { useState, useEffect } from 'react';
import { getAllCategories, createCategory } from '../api/categoryApi';

function ExpenseForm({ onSubmit, onCancel, initialData }) {
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [expenseDate, setExpenseDate] = useState(initialData?.expenseDate || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const loadCategories = async () => {
    const data = await getAllCategories();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const created = await createCategory(newCategoryName);
    await loadCategories(); // List eka refresh karanawa
    setCategoryId(created.id); // Aluthin hadapu category ekama auto-select karanawa
    setNewCategoryName('');
    setShowNewCategory(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(amount),
      description,
      expenseDate,
      categoryId: parseInt(categoryId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <label className="text-slate-400 text-sm">Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full mt-1 p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-400 text-sm">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1 p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-400 text-sm">Date</label>
        <input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
          className="w-full mt-1 p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="text-slate-400 text-sm">Category</label>
          <button
            type="button"
            onClick={() => setShowNewCategory(!showNewCategory)}
            className="text-blue-400 text-xs hover:underline"
          >
            {showNewCategory ? 'Cancel' : '+ New category'}
          </button>
        </div>

        {showNewCategory ? (
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Food, Transport"
              className="flex-1 p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-sm font-semibold"
            >
              Add
            </button>
          </div>
        ) : (
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full mt-1 p-3 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;