import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CategoryCard from './CategoryCard';
import AddCategoryModal from './AddCategoryModal';
import { fetchCategories, addCategory } from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
    try {
      if (editingCategory) {
        // Update existing category (not implemented)
        toast({
          title: "Update not implemented",
          description: "Category update is not yet supported.",
          duration: 3000,
        });
        setEditingCategory(null);
      } else {
        // Add new category via backend
        const createdCategory = await addCategory(newCategory);
        setCategories(prev => [...prev, createdCategory]);
        toast({
          title: "Category added",
          description: `${createdCategory.name} has been added successfully.`,
          duration: 3000,

        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
        duration: 3000,
      });
    }
    setIsModalOpen(false);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string, keepTransactions: boolean) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));

    toast({
      title: "Category deleted",
      description: keepTransactions
        ? `${categoryToDelete?.name} has been deleted. Associated transactions have been kept.`
        : `${categoryToDelete?.name} and all associated transactions have been deleted.`,
            duration: 3000,

      });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-12 h-12 text-gray-300" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-6">Start by creating your first expense category</p>
          </div>
        )}

        <div className="fixed bottom-8 right-8">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleAddCategory}
        editingCategory={editingCategory}
      />
    </>
  );
};

export default Categories;
