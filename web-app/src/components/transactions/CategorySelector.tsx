import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ICategory } from 'shared/entities/category.interface';

interface CategorySelectorProps {
  categories: ICategory[];
  subcategoriesMap: Record<string, ICategory[]>;
  selectedCategory: ICategory | null;
  selectedSubcategory: ICategory | null;
  expandedCategories: Set<string>;
  loading: boolean;
  onCategorySelect: (category: ICategory) => void;
  onSubcategorySelect: (subcategory: ICategory) => void;
  onToggleExpansion: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  subcategoriesMap,
  selectedCategory,
  selectedSubcategory,
  expandedCategories,
  loading,
  onCategorySelect,
  onSubcategorySelect,
  onToggleExpansion
}) => {
  const mainCategories = categories.filter(cat => !cat.fatherId);


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
              onClick={() =>
                selectedCategory?.id === category.id
                  ? onCategorySelect(null)
                  : onCategorySelect(category)
              }
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border transition-colors w-full",
                (selectedCategory?.id === category.id)
                  ? "border-2 bg-opacity-90" // always show border when selected
                  : "border border-gray-200 hover:border-gray-300"
              )}
              style={selectedCategory?.id === category.id ? { backgroundColor: category.color, borderColor: category.color } : {}}
            >
              {subcategoriesMap[category.id] && subcategoriesMap[category.id].length > 0 && (
                <span onClick={e => { e.stopPropagation(); onToggleExpansion(category.id); }}>
                  {expandedCategories.has(category.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
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
                    onClick={() =>
                      selectedSubcategory?.id === subcategory.id
                        ? onSubcategorySelect(null)
                        : onSubcategorySelect(subcategory)
                    }
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-colors w-full bg-white",
                      selectedSubcategory?.id === subcategory.id
                        ? "border-2"
                        : "border"
                    )}
                    style={{
                      borderColor: category.color,
                      color: category.color,
                      ...(selectedSubcategory?.id === subcategory.id ? { backgroundColor: subcategory.color + '22' } : {})
                    }}
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center bg-white"
                      style={{ border: `2px solid ${category.color}` }}
                    >
                      <span className="material-icons text-xs" style={{ color: category.color }}>
                        {subcategory.icon}
                      </span>
                    </div>
                    <span className="text-sm font-medium truncate" style={{ color: category.color }}>
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
