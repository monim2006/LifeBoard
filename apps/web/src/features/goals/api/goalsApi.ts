import api from '../../../shared/lib/api';

export const getGoals = () => api.get('/goals').then((r) => r.data.data);
export const getGoal = (id: string) => api.get(`/goals/${id}`).then((r) => r.data.data);
export const createGoal = (data: any) => api.post('/goals', data).then((r) => r.data.data);
export const updateGoal = (id: string, data: any) => api.put(`/goals/${id}`, data).then((r) => r.data.data);
export const deleteGoal = (id: string) => api.delete(`/goals/${id}`).then((r) => r.data.data);

export const addMilestone = (goalId: string, data: any) => api.post(`/goals/${goalId}/milestones`, data).then((r) => r.data.data);
export const toggleMilestone = (milestoneId: string) => api.patch(`/goals/milestones/${milestoneId}/toggle`).then((r) => r.data.data);
export const deleteMilestone = (milestoneId: string) => api.delete(`/goals/milestones/${milestoneId}`).then((r) => r.data.data);
