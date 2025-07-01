
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ICategory } from 'shared/entities/category.interface';

interface AddSubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subcategory: { name: string; icon: string }) => void;
  parentCategory: ICategory | null;
}

const commonIcons = [
  'restaurant', 'fastfood', 'local_cafe', 'icecream', 'cake',
  'directions_car', 'local_gas_station', 'train', 'flight', 'directions_bus',
  'shopping_cart', 'store', 'local_mall', 'checkroom', 'diamond',
  'sports_esports', 'movie', 'music_note', 'theater_comedy', 'celebration',
  'local_hospital', 'medication', 'fitness_center', 'spa', 'psychology',
  'home', 'electrical_services', 'plumbing', 'build', 'cleaning_services'
];

const AddSubcategoryModal = ({ isOpen, onClose, onSubmit, parentCategory }: AddSubcategoryModalProps) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(commonIcons[0]);
  const [customIcon, setCustomIcon] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalIcon = customIcon || selectedIcon;

    onSubmit({
      name: name.trim(),
      icon: finalIcon,
    });

    // Reset form
    setName('');
    setSelectedIcon(commonIcons[0]);
    setCustomIcon('');
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setSelectedIcon(commonIcons[0]);
    setCustomIcon('');
    onClose();
  };

  if (!parentCategory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Add Subcategory to {parentCategory.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Subcategory Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subcategory name"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Icon</Label>
            <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
              {commonIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => {
                    setSelectedIcon(icon);
                    setCustomIcon('');
                  }}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 flex items-center justify-center ${
                    selectedIcon === icon && !customIcon
                      ? 'bg-purple-100 ring-2 ring-purple-400' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="material-icons text-lg">{icon}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customIcon" className="text-sm font-medium">
                Or enter custom icon name
              </Label>
              <Input
                id="customIcon"
                type="text"
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="e.g., favorite, location_on, credit_card"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Browse icons at{' '}
                <a 
                  href="https://fonts.google.com/icons" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Google Icons
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Add Subcategory
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubcategoryModal;
