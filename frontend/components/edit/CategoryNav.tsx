/**
 * Category Navigation Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Tab navigation for edit mode categories
 */

'use client';

import type { EditCategory } from '@/types/editMode';

interface CategoryNavProps {
  activeCategory: EditCategory;
  onCategoryChange: (category: EditCategory) => void;
}

const categories: { id: EditCategory; label: string }[] = [
  { id: 'info', label: 'Trip Info' },
  { id: 'flights', label: 'Flights' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'attractions', label: 'Attractions' },
  { id: 'notes', label: 'Notes' },
];

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <div className="tabs tabs-boxed bg-base-300 mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`tab transition-all duration-200 ${activeCategory === category.id ? 'tab-active border-b-4 border-primary' : ''}`}
          onClick={() => onCategoryChange(category.id)}
          type="button"
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
