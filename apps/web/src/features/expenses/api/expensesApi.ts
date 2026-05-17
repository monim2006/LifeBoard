import api from '../../../shared/lib/api';

export const getExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data.data;
};

export const addExpense = async (payload: any) => {
  const response = await api.post('/expenses', payload);
  return response.data.data;
};

export const getExpenseSummary = async () => {
  const response = await api.get('/expenses/today');
  return response.data.data;
};
