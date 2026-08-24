import React from 'react';
import { Headphones, Laptop, Home, Watch, Camera, Smartphone, LayoutGrid } from 'lucide-react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  totalProductsCount: number;
}

const getCategoryIcon = (slugOrIcon?: string) => {
  switch (slugOrIcon?.toLowerCase()) {
    case 'electronics':
    case 'headphones':
      return <Headphones className="w-4 h-4" />;
    case 'laptops':
    case 'laptop':
      return <Laptop className="w-4 h-4" />;
    case 'smart-home':
    case 'home':
      return <Home className="w-4 h-4" />;
    case 'wearables':
    case 'watch':
      return <Watch className="w-4 h-4" />;
    case 'cameras':
    case 'camera':
      return <Camera className="w-4 h-4" />;
    case 'accessories':
    case 'smartphone':
      return <Smartphone className="w-4 h-4" />;
    default:
      return <LayoutGrid className="w-4 h-4" />;
  }
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Browse Categories
        </h2>
        <span className="text-xs text-zinc-500 font-medium">
          {totalProductsCount} products available
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          id="category-pill-all"
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
            selectedCategory === 'all'
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>All Products</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              id={`category-pill-${cat.id}`}
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {getCategoryIcon(cat.icon || cat.slug)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
