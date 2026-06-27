import api from '../../../shared/lib/api';

export const getToday = () => api.get('/daily/today').then((r) => r.data.data);
export const getDay = (date: string) => api.get(`/daily/${date}`).then((r) => r.data.data);
export const updateDay = (date: string, data: any) => api.put(`/daily/${date}`, data).then((r) => r.data.data);

export const createEvent = (data: any) => api.post('/daily/events', data).then((r) => r.data.data);
export const updateEvent = (eventId: string, data: any) => api.put(`/daily/events/${eventId}`, data).then((r) => r.data.data);
export const deleteEvent = (eventId: string) => api.delete(`/daily/events/${eventId}`).then((r) => r.data.data);

export const createMeal = (data: any) => api.post('/daily/meals', data).then((r) => r.data.data);
export const deleteMeal = (mealId: string) => api.delete(`/daily/meals/${mealId}`).then((r) => r.data.data);
