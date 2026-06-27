import api from '../../../shared/lib/api';

export const getExpenses = (params?: any) => api.get('/expenses', { params }).then((r) => r.data);
export const addExpense = (data: any) => api.post('/expenses', data).then((r) => r.data.data);
export const updateExpense = (id: string, data: any) => api.put(`/expenses/${id}`, data).then((r) => r.data.data);
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`).then((r) => r.data.data);

export const getIncomes = (params?: any) => api.get('/income', { params }).then((r) => r.data.data);
export const addIncome = (data: any) => api.post('/income', data).then((r) => r.data.data);
export const updateIncome = (id: string, data: any) => api.put(`/income/${id}`, data).then((r) => r.data.data);
export const deleteIncome = (id: string) => api.delete(`/income/${id}`).then((r) => r.data.data);

export const getMonthlyIncome = (year: number, month: number) => api.get(`/income/monthly/${year}/${month}`).then((r) => r.data.data);

export const getTodayTotal = () => api.get('/expenses/today').then((r) => r.data.data);
export const getWeeklyTotal = () => api.get('/expenses/weekly-total').then((r) => r.data.data);
export const getBreakdown = (startDate: string, endDate: string) => api.get('/expenses/breakdown', { params: { startDate, endDate } }).then((r) => r.data.data);
