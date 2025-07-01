import { ICategory } from 'shared/entities/category.interface';
import { TransactionType } from 'shared/entities/transaction-type.enum.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const fetchCategories = async (categoryType?: TransactionType): Promise<
  [ICategory[], Record<string, ICategory[]>]
> => {
  let url = `${API_BASE}/category`;
  if (categoryType) {
    url += `?type=${encodeURIComponent(categoryType)}`;
  }
  const res = await fetch(url, {
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const categories: ICategory[] = await res.json();
  const subcategoriesMap = categories.reduce((acc, cat) => {
    if (cat.fatherId) {
      if (!acc[cat.fatherId]) {
        acc[cat.fatherId] = [];
      }
      acc[cat.fatherId].push(cat);
    }
    return acc;
  }, {} as Record<string, ICategory[]>);
  return [categories, subcategoriesMap];
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
