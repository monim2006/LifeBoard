import api from '../../../shared/lib/api';

export const getAnalyticsOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response.data.data;
};
