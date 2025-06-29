
import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { ICategory } from 'shared/entities/category.interface';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DeleteCategoryModal from './DeleteCategoryModal';

interface CategoryCardProps {
  category: ICategory;
  onEdit: (category: ICategory) => void;
  onDelete: (categoryId: string, keepTransactions: boolean) => void;
}

const CategoryCard = ({ category, onEdit, onDelete }: CategoryCardProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEdit = () => {
    onEdit(category);
    setIsPopoverOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    setIsPopoverOpen(false);
  };

  const handleDeleteKeepTransactions = () => {
    onDelete(category.id, true);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteWithTransactions = () => {
    onDelete(category.id, false);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div 
        className="group relative overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        style={{ backgroundColor: category.color }}
      >
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white">
              <span className="material-icons text-2xl">{category.icon}</span>
            </div>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2" align="end">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-8"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-opacity-90 transition-all duration-200">
            {category.name}
          </h3>
          
          <div className="text-white text-opacity-80 text-sm">
            Tap to view expenses
          </div>
        </div>
        
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white bg-opacity-20 rounded-full"></div>
      </div>

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleteKeepTransactions={handleDeleteKeepTransactions}
        onDeleteWithTransactions={handleDeleteWithTransactions}
        categoryName={category.name}
      />
    </>
  );
};

export default CategoryCard;
