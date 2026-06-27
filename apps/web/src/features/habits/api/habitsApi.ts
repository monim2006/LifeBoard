import api from '../../../shared/lib/api';

export const getHabits = () => api.get('/habits').then((r) => r.data.data);
export const getHabit = (id: string) => api.get(`/habits/${id}`).then((r) => r.data.data);
export const createHabit = (data: any) => api.post('/habits', data).then((r) => r.data.data);
export const updateHabit = (id: string, data: any) => api.put(`/habits/${id}`, data).then((r) => r.data.data);
export const deleteHabit = (id: string) => api.delete(`/habits/${id}`).then((r) => r.data.data);
export const logHabit = (data: any) => api.post('/habits/log', data).then((r) => r.data.data);
export const getHabitStreak = (id: string) => api.get(`/habits/${id}/streak`).then((r) => r.data.data);
