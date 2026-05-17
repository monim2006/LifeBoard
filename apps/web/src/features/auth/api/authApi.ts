import api from '../../../shared/lib/api';

export interface AuthPayload {
  user: {
    id: string;
    email: string;
    username: string;
    avatar?: string | null;
    theme: string;
    currency: string;
    weekStartDay: string;
  };
  accessToken: string;
}

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data as AuthPayload;
};

export const register = async (email: string, username: string, password: string) => {
  const response = await api.post('/auth/register', { email, username, password });
  return response.data.data as AuthPayload;
};

export const refreshSession = async () => {
  const response = await api.post('/auth/refresh-token');
  return response.data.data as AuthPayload;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.data as AuthPayload['user'];
};

export const logout = async () => {
  await api.post('/auth/logout');
};
