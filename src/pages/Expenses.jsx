import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ExpenseForm from '../components/ExpenseForm';
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    const data = await getAllExpenses();
    setExpenses(data);
    setLoading(false);
  };

  useEffect(() => {
    loadExpenses();
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
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
    } else {
      await createExpense(data);
    }
    setShowForm(false);
    setEditingExpense(null);
    loadExpenses(); // List eka refresh karanawa
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
      loadExpenses();
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-950 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 text-white">Loading...</main>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-2xl font-bold">Expenses</h1>
          {!showForm && (
            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
            >
              + Add Expense
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8">
            <ExpenseForm
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              initialData={editingExpense}
            />
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {expenses.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-800">
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-slate-800 last:border-0">
                    <td className="py-3 text-white">{exp.description}</td>
                    <td className="py-3 text-slate-400">{exp.categoryName}</td>
                    <td className="py-3 text-slate-400">{exp.expenseDate}</td>
                    <td className="py-3 text-right text-red-400">-Rs. {exp.amount.toFixed(2)}</td>
                    <td className="py-3 text-right space-x-3">
                      <button
                        onClick={() => handleEditClick(exp)}
                        className="text-blue-400 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-sm">No expenses yet. Add your first one!</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Expenses;