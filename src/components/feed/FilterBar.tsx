import { cn } from '@/lib/utils';
import { categories } from '@/lib/mock-data';

interface FilterBarProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function FilterBar({ selected, onSelect }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-3">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0',
            selected === cat.id
              ? 'gradient-primary text-white shadow-lg shadow-primary/25'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
