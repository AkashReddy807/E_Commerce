import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  totalProductsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
}) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 border-b border-[#f0f0f0] pb-2.5">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#111111]">
          Index / Categories
        </h2>
        <span className="text-[11px] text-[#999999] tracking-wider font-mono">
          ({totalProductsCount} objects)
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
        <button
          id="category-pill-all"
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 text-xs uppercase tracking-widest transition rounded-none font-medium whitespace-nowrap border ${
            selectedCategory === 'all'
              ? 'bg-[#111111] text-white border-[#111111]'
              : 'bg-[#ffffff] text-[#666666] border-[#f0f0f0] hover:border-[#cccccc] hover:text-[#111111]'
          }`}
        >
          All Objects
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              id={`category-pill-${cat.id}`}
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition rounded-none font-medium whitespace-nowrap border ${
                isSelected
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-[#ffffff] text-[#666666] border-[#f0f0f0] hover:border-[#cccccc] hover:text-[#111111]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

