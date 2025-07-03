import { IRecurrentTransaction } from 'shared/entities/recurrent-transaction.interface';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const addRecurrenceTransaction = async (recurrence: Omit<IRecurrentTransaction, 'id'>): Promise<IRecurrentTransaction> => {
  // Ensure startDate and endDate are sent as YYYY-MM-DD strings
  const payload = {
    ...recurrence,
    startDate: recurrence.startDate instanceof Date
      ? recurrence.startDate.toISOString().slice(0, 10)
      : (typeof recurrence.startDate === 'string' ? (recurrence.startDate as string).slice(0, 10) : undefined),
    endDate: recurrence.endDate instanceof Date
      ? recurrence.endDate.toISOString().slice(0, 10)
      : (typeof recurrence.endDate === 'string' && recurrence.endDate ? (recurrence.endDate as string).slice(0, 10) : undefined),
  };
  const res = await fetch(`${API_BASE}/recurrent-transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add recurrence transaction');
  return res.json();
};

export const updateRecurrenceTransaction = async (id: string, update: Partial<IRecurrentTransaction>): Promise<IRecurrentTransaction> => {
  const res = await fetch(`${API_BASE}/recurrent-transaction/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Failed to update recurrence transaction');
  return res.json();
};

export const deleteRecurrenceTransaction = async (id: string): Promise<IRecurrentTransaction> => {
  const res = await fetch(`${API_BASE}/recurrent-transaction/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete recurrence transaction');
  return res.json();
};
