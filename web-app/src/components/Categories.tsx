import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CategoryCard from './CategoryCard';
import AddCategoryModal from './AddCategoryModal';
import AddSubcategoryModal from './AddSubcategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ICategory } from 'shared/entities/category.interface';
import { TransactionType } from 'shared/entities/transaction-type.enum';


const Categories = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<ICategory | null>(null);
  const [categoryType, setCategoryType] = useState<TransactionType>(TransactionType.Expense);
  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories(categoryType);
  }, [categoryType]);

  const loadCategories = async (categoryType: TransactionType) => {
    try {
      setLoading(true);
      const fetchedCategories = await fetchCategories(categoryType as any);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (newCategory: Omit<ICategory, 'id'>) => {
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = await updateCategory(editingCategory.id, newCategory);
        setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat));
        toast({
          title: "Category updated",
          description: `${updatedCategory.name} has been updated successfully.`,
          duration: 3000,
        });
        setEditingCategory(null);
      } else {
        // Add new category via backend
        const createdCategory = await addCategory({ ...newCategory, type: categoryType });
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

  const handleAddSubcategory = async (subcategory: Omit<ICategory, 'id'>) => {
    if (!selectedParentCategory) return;

    subcategory.fatherId = selectedParentCategory.id;
    subcategory.type = selectedParentCategory.type;
    subcategory.householdId = selectedParentCategory.householdId;
    subcategory.color = selectedParentCategory.color;

    const newCategory = await addCategory(subcategory);

    setCategories(prev => [...prev, newCategory]);
    toast({
      title: "Subcategory added",
      description: `${subcategory.name} has been added to ${selectedParentCategory.name}.`,
    });
    setIsSubcategoryModalOpen(false);
    setSelectedParentCategory(null);
  };

  const handleEditCategory = (category: ICategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const isSubcategory = (category: ICategory | null) => {
    return !!category?.fatherId;
  };

  const handleAddSubcategoryClick = (parentCategory: ICategory) => {
    setSelectedParentCategory(parentCategory);
    setIsSubcategoryModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string, keepTransactions: boolean) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === categoryId);

      if (!categoryToDelete) {
        throw new Error("Category not found");
      }
      const deletedCategory = await deleteCategory(categoryId, keepTransactions);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));

      toast({
        title: "Category deleted",
        description: keepTransactions
          ? `${deletedCategory.name} has been deleted. Associated transactions have been kept.`
          : `${deletedCategory.name} and all associated transactions have been deleted.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubcategoryModalClose = () => {
    setIsSubcategoryModalOpen(false);
    setSelectedParentCategory(null);
  };

  // Separate main categories and subcategories
  const mainCategories = categories.filter(cat => !cat.fatherId);
  const subcategoriesMap = categories.reduce((acc, cat) => {
    if (cat.fatherId) {
      if (!acc[cat.fatherId]) {
        acc[cat.fatherId] = [];
      }
      acc[cat.fatherId].push(cat);
    }
    return acc;
  }, {} as Record<string, ICategory[]>);

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
        <div className="flex justify-start mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 ${categoryType === TransactionType.Expense ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setCategoryType(TransactionType.Expense)}
            >
              Expense
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 ${categoryType === TransactionType.Income ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setCategoryType(TransactionType.Income)}
            >
              Income
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mainCategories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => {
                if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                setHoveredCategoryId(category.id);
              }}
              onMouseLeave={() => {
                hoverTimeout.current = setTimeout(() => setHoveredCategoryId(null), 100);
              }}
            >
              <CategoryCard
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onAddSubcategory={handleAddSubcategoryClick}
                isMainCategory={true}
              />
              {hoveredCategoryId === category.id && (
                <div
                  className="absolute z-20 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-48"
                  onMouseEnter={() => {
                    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                    setHoveredCategoryId(category.id);
                  }}
                  onMouseLeave={() => {
                    hoverTimeout.current = setTimeout(() => setHoveredCategoryId(null), 100);
                  }}
                >
                  <div className="space-y-2">
                    {subcategoriesMap[category.id] && subcategoriesMap[category.id].map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer group"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: subcategory.color }}
                          onClick={() => handleEditCategory(subcategory)}
                        >
                          <span className="material-icons text-white text-sm">{subcategory.icon}</span>
                        </div>
                        <span
                          className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1"
                          onClick={() => handleEditCategory(subcategory)}
                        >
                          {subcategory.name}
                        </span>
                        <button
                          type="button"
                          className="ml-2 p-1 rounded hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubCategoryToDelete(subcategory);
                          }}
                          title="Delete Subcategory"
                        >
                          <span className="material-icons text-gray-400 group-hover:text-red-600 transition-colors duration-150">delete</span>
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full"
                      onClick={() => handleAddSubcategoryClick(category)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Add Category Card */}
          <div
            className="group relative overflow-hidden rounded-xl p-6 shadow-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 min-h-[140px]"
            onClick={() => setIsModalOpen(true)}
            tabIndex={0}
            role="button"
            aria-label="Add Category"
          >
            <Plus className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
            <span className="text-gray-500 font-medium">Add Category</span>
          </div>
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

        {/* Remove the floating add button */}
      </div>

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleAddCategory}
        editingCategory={editingCategory}
        enableColorPicker={!isSubcategory(editingCategory)}
      />

      <AddSubcategoryModal
        isOpen={isSubcategoryModalOpen}
        onClose={handleSubcategoryModalClose}
        onSubmit={handleAddSubcategory}
        parentCategory={selectedParentCategory}
      />

      <DeleteCategoryModal
        isOpen={!!subCategoryToDelete}
        onClose={() => setSubCategoryToDelete(null)}
        onDeleteKeepTransactions={() => {
          if (subCategoryToDelete) handleDeleteCategory(subCategoryToDelete.id, true);
          setSubCategoryToDelete(null);
        }}
        onDeleteWithTransactions={() => {
          if (subCategoryToDelete) handleDeleteCategory(subCategoryToDelete.id, false);
          setSubCategoryToDelete(null);
        }}
        categoryName={subCategoryToDelete?.name || ''}
      />
    </>
  );
};

export default Categories;