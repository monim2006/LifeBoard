import api from '../../../shared/lib/api';

export const getCurrentWeekPlan = async () => {
  const response = await api.get('/plans/current-week');
  return response.data.data;
};

export const addTimeBlock = async (planId: string, payload: any) => {
  const response = await api.post(`/plans/${planId}/blocks`, payload);
  return response.data.data;
};

export const toggleTimeBlock = async (blockId: string) => {
  const response = await api.patch(`/plans/blocks/${blockId}/toggle`);
  return response.data.data;
};
