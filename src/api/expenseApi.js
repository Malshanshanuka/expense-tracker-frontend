import api from './axios';

export const getAllExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data;
};

export const getMonthlySummary = async (year, month) => {
  const response = await api.get(`/reports/monthly?year=${year}&month=${month}`);
  return response.data;
};
export const createExpense = async (data) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  await api.delete(`/expenses/${id}`);
};