
import React from 'react';
import { cn } from '@/lib/utils';

interface ChartLegendProps {
  items: Array<{
    name: string;
    color: string;
    value?: number | string;
    active?: boolean;
  }>;
  layout?: 'horizontal' | 'vertical';
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  onItemClick?: (name: string) => void;
}

export function ChartLegend({
  items,
  layout = 'horizontal',
  position = 'bottom',
  className,
  onItemClick
}: ChartLegendProps) {
  if (!items.length) return null;
  
  return (
    <div 
      className={cn(
        "flex flex-wrap gap-3 text-xs font-medium transition-all",
        layout === 'horizontal' ? 'flex-row items-center' : 'flex-col items-start',
        position === 'top' && 'mb-4',
        position === 'bottom' && 'mt-4',
        position === 'left' && 'mr-4',
        position === 'right' && 'ml-4',
        className
      )}
    >
      {items.map((item, index) => (
        <div 
          key={`${item.name}-${index}`}
          className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-all",
            "hover:bg-white/5",
            item.active === false && "opacity-40"
          )}
          onClick={() => onItemClick && onItemClick(item.name)}
        >
          <div 
            className="w-3 h-3 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span className="whitespace-nowrap">{item.name}</span>
          {item.value !== undefined && (
            <span className="font-mono text-white/70">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default ChartLegend;
