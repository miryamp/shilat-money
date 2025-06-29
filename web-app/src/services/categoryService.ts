
import { Category } from '@/components/Categories';

// Mock categories data - in a real app, this would come from your backend
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Food & Dining',
    color: '#F59E0B',
    icon: '🍔'
  },
  {
    id: '2',
    name: 'Transportation',
    color: '#3B82F6',
    icon: '🚗'
  },
  {
    id: '3',
    name: 'Shopping',
    color: '#EC4899',
    icon: '🛒'
  },
  {
    id: '4',
    name: 'Entertainment',
    color: '#8B5CF6',
    icon: '🎮'
  },
  {
    id: '5',
    name: 'Healthcare',
    color: '#10B981',
    icon: '💊'
  },
  {
    id: '6',
    name: 'Home',
    color: '#F97316',
    icon: '🏠'
  }
];

// Simulate API call with delay
export const fetchCategories = async (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCategories);
    }, 800);
  });
};

// Simulate adding a category to server
export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCategory = {
        ...category,
        id: Date.now().toString(),
      };
      resolve(newCategory);
    }, 500);
  });
};
