
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Category } from '@/components/Categories';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  selectedSubcategory: Category | null;
  expandedCategories: Set<string>;
  loading: boolean;
  onCategorySelect: (category: Category) => void;
  onSubcategorySelect: (subcategory: Category) => void;
  onToggleExpansion: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  expandedCategories,
  loading,
  onCategorySelect,
  onSubcategorySelect,
  onToggleExpansion
}) => {
  const mainCategories = categories.filter(cat => !cat.parentId);
  const subcategoriesMap = categories.reduce((acc, cat) => {
    if (cat.parentId) {
      if (!acc[cat.parentId]) {
        acc[cat.parentId] = [];
      }
      acc[cat.parentId].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Category</Label>
      <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
        {mainCategories.map((category) => (
          <div key={category.id}>
            {/* Main Category */}
            <button
              type="button"
              onClick={() => onCategorySelect(category)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border transition-colors w-full",
                (selectedCategory?.id === category.id)
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {subcategoriesMap[category.id] && subcategoriesMap[category.id].length > 0 && (
                expandedCategories.has(category.id) ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
              )}
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <span className="material-icons text-white text-xs">
                  {category.icon}
                </span>
              </div>
              <span className="text-sm font-medium truncate">
                {category.name}
              </span>
            </button>

            {/* Subcategories */}
            {expandedCategories.has(category.id) && subcategoriesMap[category.id] && (
              <div className="ml-6 mt-1 space-y-1">
                {subcategoriesMap[category.id].map((subcategory) => (
                  <button
                    key={subcategory.id}
                    type="button"
                    onClick={() => onSubcategorySelect(subcategory)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-colors w-full",
                      selectedSubcategory?.id === subcategory.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: subcategory.color }}
                    >
                      <span className="material-icons text-white text-xs">
                        {subcategory.icon}
                      </span>
                    </div>
                    <span className="text-sm font-medium truncate">
                      {subcategory.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
