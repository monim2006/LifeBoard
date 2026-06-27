import api from '../../../shared/lib/api';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@lifeboard/shared-types';

export const getCategories = (type?: string) =>
  api.get<{ success: boolean; data: Category[] }>('/categories', { params: { type } }).then(r => r.data.data);

export const getCategory = (id: string) =>
  api.get<{ success: boolean; data: Category }>(`/categories/${id}`).then(r => r.data.data);

export const createCategory = (data: CreateCategoryInput) =>
  api.post<{ success: boolean; data: Category }>('/categories', data).then(r => r.data.data);

export const updateCategory = (id: string, data: UpdateCategoryInput) =>
  api.put<{ success: boolean; data: Category }>(`/categories/${id}`, data).then(r => r.data.data);

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`);

export const toggleArchiveCategory = (id: string) =>
  api.patch<{ success: boolean; data: Category }>(`/categories/${id}/archive`).then(r => r.data.data);

export const reorderCategories = (items: { id: string; order: number }[]) =>
  api.post('/categories/reorder', { items });
