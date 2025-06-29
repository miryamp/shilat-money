import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Category } from './Categories';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: Omit<Category, 'id'>) => void;
  editingCategory?: Category | null;
}

const colors = [
  '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#3B82F6'
];

const commonIcons = [
  'home', 'restaurant', 'directions_car', 'local_hospital', 'sports_esports',
  'shopping_cart', 'phone_android', 'flight', 'menu_book', 'music_note',
  'fitness_center', 'store', 'attach_money', 'star', 'build',
  'work', 'school', 'pets', 'local_gas_station', 'coffee'
];

const AddCategoryModal = ({ isOpen, onClose, onSubmit, editingCategory }: AddCategoryModalProps) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [customColor, setCustomColor] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(commonIcons[0]);
  const [customIcon, setCustomIcon] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      
      // Check if the color is one of the preset colors
      if (colors.includes(editingCategory.color)) {
        setSelectedColor(editingCategory.color);
        setCustomColor('');
      } else {
        setSelectedColor(colors[0]);
        setCustomColor(editingCategory.color);
      }
      
      // Check if the icon is one of the common icons
      if (commonIcons.includes(editingCategory.icon)) {
        setSelectedIcon(editingCategory.icon);
        setCustomIcon('');
      } else {
        setSelectedIcon(commonIcons[0]);
        setCustomIcon(editingCategory.icon);
      }
    }
  }, [editingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalColor = customColor || selectedColor;
    const finalIcon = customIcon || selectedIcon;

    onSubmit({
      name: name.trim(),
      color: finalColor,
      icon: finalIcon,
    });

    // Reset form
    setName('');
    setSelectedColor(colors[0]);
    setCustomColor('');
    setSelectedIcon(commonIcons[0]);
    setCustomIcon('');
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setSelectedColor(colors[0]);
    setCustomColor('');
    setSelectedIcon(commonIcons[0]);
    setCustomIcon('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Category Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Color</Label>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    setCustomColor('');
                  }}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 ${
                    selectedColor === color && !customColor
                      ? 'ring-2 ring-gray-400 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customColor" className="text-sm font-medium">
                Or choose custom color
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="customColor"
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
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
              {editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryModal;
