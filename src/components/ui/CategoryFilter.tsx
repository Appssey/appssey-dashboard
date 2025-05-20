import React from 'react';
import { cn } from '../../lib/utils';
import { Category } from '../../types/app.types';
import { CATEGORIES } from '../../data/mockData';

interface CategoryFilterProps {
  categories: { id: string; name: string }[];
  selected: string;
  onChange: (categoryId: string) => void;
  className?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selected,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 hide-scrollbar', className)}>
      <button
        key="all"
        onClick={() => onChange('all')}
        className={cn(
          'px-4 py-2 rounded-full whitespace-nowrap transition-colors',
          selected === 'all'
            ? 'bg-primary text-background'
            : 'bg-background-light text-primary hover:bg-border'
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={cn(
            'px-4 py-2 rounded-full whitespace-nowrap transition-colors',
            selected === category.id
              ? 'bg-primary text-background'
              : 'bg-background-light text-primary hover:bg-border'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;