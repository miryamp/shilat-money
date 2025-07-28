import { Transaction } from '@/types/transaction';
import { TransactionType } from 'shared/entities/transaction-type.enum';
import { getAuthHeaders } from '@/utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export interface TransactionFilterParams {
  from?: string; // ISO date string
  to?: string;   // ISO date string
  types?: TransactionType[];
  categoryIds?: string[];
}

export const fetchTransactions = async (filter?: TransactionFilterParams): Promise<Transaction[]> => {
  let url = `${API_BASE}/transaction`;
  const params = new URLSearchParams();
  if (filter) {
    if (filter.from) params.append('from', filter.from);
    if (filter.to) params.append('to', filter.to);
    if (filter.types && filter.types.length == 1) params.append('type', filter.types[0]);
    if (filter.categoryIds && filter.categoryIds.length) filter.categoryIds.forEach(id => params.append('categoryIds', id));
  }
  if ([...params].length) url += `?${params.toString()}`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.map(t => Object.assign(new Transaction(), t));
  }
  return Object.assign(new Transaction(), data);
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const payload = {
    categoryId: transaction.categoryId,
    amount: transaction.amount,
    timestamp: transaction.timestamp,
    comment: transaction.comment,
  }

  const res = await fetch(`${API_BASE}/transaction`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add transaction');
  return res.json();
};

export const updateTransaction = async (id: string, update: Partial<Transaction>): Promise<Transaction> => {
  const res = await fetch(`${API_BASE}/transaction/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Failed to update transaction');
  return res.json();
};

export const deleteTransaction = async (id: string): Promise<Transaction> => {
  const res = await fetch(`${API_BASE}/transaction/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
  return res.json();
};
