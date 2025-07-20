import { IRecurrentTransaction } from 'shared/entities/recurrent-transaction.interface';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const addRecurrenceTransaction = async (recurrence: Omit<IRecurrentTransaction, 'id'>): Promise<IRecurrentTransaction> => {
  delete recurrence.transactionData.category;
  delete recurrence.transactionData.type;
  
  const payload = {
    ...recurrence,
    startDate: recurrence.startDate instanceof Date
      ? format(recurrence.startDate, 'yyyy-MM-dd')
      : (typeof recurrence.startDate === 'string' ? (recurrence.startDate as string).slice(0, 10) : undefined),
    endDate: recurrence.endDate instanceof Date
      ?  format(recurrence.endDate, 'yyyy-MM-dd')
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

export const deleteRecurrenceTransaction = async (id: string): Promise<IRecurrentTransaction> => {
  const res = await fetch(`${API_BASE}/recurrent-transaction/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete recurrence transaction');
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


export const patchRecurrenceTransactionDates = async (
  id: string,
  dates: { startDate?: string | Date; endDate?: string | Date }
): Promise<{ message: string; transaction: IRecurrentTransaction }> => {
  const payload: { startDate?: string; endDate?: string } = {};
  if (dates.startDate) {
    payload.startDate = dates.startDate instanceof Date
      ? format(dates.startDate, 'yyyy-MM-dd')
      : (typeof dates.startDate === 'string' ? dates.startDate.slice(0, 10) : undefined);
  }
  if (dates.endDate) {
    payload.endDate = dates.endDate instanceof Date
      ? format(dates.endDate, 'yyyy-MM-dd')
      : (typeof dates.endDate === 'string' ? dates.endDate.slice(0, 10) : undefined);
  }
  const res = await fetch(`${API_BASE}/recurrent-transaction/${id}/dates`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to patch recurrence transaction dates');
  return res.json();
};
