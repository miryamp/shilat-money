import { ICategory } from 'shared/entities/category.interface';

const API_BASE = 'http://192.168.1.107:3000';

export const fetchCategories = async (): Promise<ICategory[]> => {
  const res = await fetch(`${API_BASE}/category`, {
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const addCategory = async (category: Omit<ICategory, 'id'>): Promise<ICategory> => {
  const res = await fetch(`${API_BASE}/category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error('Failed to add category');
  return res.json();
};

export const updateCategory = async (id: string, update: Partial<ICategory>): Promise<ICategory> => {
  const res = await fetch(`${API_BASE}/category/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Failed to update category');
  return res.json();
};

export const deleteCategory = async (id: string, logical = true): Promise<ICategory> => {
  const res = await fetch(`${API_BASE}/category/${id}?logical=${logical}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return res.json();
};
