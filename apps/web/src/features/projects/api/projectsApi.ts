import api from '../../../shared/lib/api';

export const getProjects = () => api.get('/projects').then((r) => r.data.data);
export const getProject = (id: string) => api.get(`/projects/${id}`).then((r) => r.data.data);
export const createProject = (data: any) => api.post('/projects', data).then((r) => r.data.data);
export const updateProject = (id: string, data: any) => api.put(`/projects/${id}`, data).then((r) => r.data.data);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`).then((r) => r.data.data);

export const addTask = (projectId: string, data: any) => api.post(`/projects/${projectId}/tasks`, data).then((r) => r.data.data);
export const updateTask = (taskId: string, data: any) => api.put(`/projects/tasks/${taskId}`, data).then((r) => r.data.data);
export const deleteTask = (taskId: string) => api.delete(`/projects/tasks/${taskId}`).then((r) => r.data.data);
