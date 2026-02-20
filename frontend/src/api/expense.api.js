import api from './axios';

export const getExpenses = (params) => api.get('/expenses', { params });
export const createExpense = (data) => api.post('/expenses', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getAccountantStats = () => api.get('/expenses/stats');
