import api from '../../../shared/lib/api';
import type { Backup, Notification } from '@lifeboard/shared-types';

// Profile
export const getProfile = () =>
  api.get<{ success: boolean; data: any }>('/workspace/profile').then(r => r.data.data);

export const updateProfile = (data: any) =>
  api.put<{ success: boolean; data: any }>('/workspace/profile', data).then(r => r.data.data);

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/workspace/change-password', { currentPassword, newPassword });

export const uploadAvatar = (avatar: string) =>
  api.post('/workspace/avatar', { avatar });

// Data Export / Import
export const exportAllData = () =>
  api.get<{ success: boolean; data: any }>('/workspace/export').then(r => r.data.data);

export const importData = (data: any) =>
  api.post('/workspace/import', { data });

// Backups
export const getBackups = () =>
  api.get<{ success: boolean; data: Backup[] }>('/workspace/backups').then(r => r.data.data);

export const createBackup = () =>
  api.post<{ success: boolean; data: Backup }>('/workspace/backups').then(r => r.data.data);

export const getBackup = (id: string) =>
  api.get<{ success: boolean; data: any }>(`/workspace/backups/${id}`).then(r => r.data.data);

export const restoreBackup = (id: string) =>
  api.post(`/workspace/backups/${id}/restore`);

export const deleteBackup = (id: string) =>
  api.delete(`/workspace/backups/${id}`);

// Data Deletion
export const deletePlannerData = () => api.delete('/workspace/data/planner');
export const deleteJournalData = () => api.delete('/workspace/data/journal');
export const deleteFinanceData = () => api.delete('/workspace/data/finance');
export const deleteHabitsData = () => api.delete('/workspace/data/habits');
export const deleteGoalsData = () => api.delete('/workspace/data/goals');
export const deleteProjectsData = () => api.delete('/workspace/data/projects');
export const deleteCategoriesData = () => api.delete('/workspace/data/categories');
export const eraseAllData = () => api.delete('/workspace/data/all');

// Account
export const deleteAccount = (password: string) =>
  api.delete('/workspace/account', { data: { password } });

// Notifications
export const getNotifications = () =>
  api.get<{ success: boolean; data: { notifications: Notification[]; unreadCount: number } }>('/notifications').then(r => r.data.data);

export const markNotificationRead = (id: string) =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.post('/notifications/mark-all-read');

export const deleteNotification = (id: string) =>
  api.delete(`/notifications/${id}`);

export const clearAllNotifications = () =>
  api.delete('/notifications');
