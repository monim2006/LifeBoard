import api from '../../../shared/lib/api';

export const getAnalyticsOverview = () => api.get('/analytics/overview').then((r) => r.data.data);

export const getAchievements = () => api.get('/achievements').then((r) => r.data.data);
export const checkAchievements = () => api.post('/achievements/check').then((r) => r.data.data);
export const getUserStats = () => api.get('/achievements/stats').then((r) => r.data.data);
