
import React from 'react';
import { cn } from '@/lib/utils';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color: string;
    dataKey?: string;
    payload?: any;
  }>;
  label?: string;
  coordinate?: { x: number; y: number };
  className?: string;
  showLabel?: boolean;
  showValues?: boolean;
  formatter?: (value: number | string, name: string) => [string | number, string];
  labelFormatter?: (label: string) => string;
  hideArrow?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  coordinate,
  className,
  showLabel = true,
  showValues = true,
  formatter,
  labelFormatter,
  hideArrow = false
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  
  const formattedLabel = labelFormatter ? labelFormatter(label || '') : label;
  
  return (
    <div 
      className={cn(
        "bg-black/90 p-3 rounded-md backdrop-blur-lg border border-white/20 shadow-xl min-w-[180px] z-50",
        !hideArrow && "after:content-[''] after:absolute after:w-2 after:h-2 after:bg-black/90 after:border-r after:border-b after:border-white/20 after:rotate-45 after:bottom-[-5px] after:left-[calc(50%-4px)]",
        className
      )}
    >
      {showLabel && formattedLabel && (
        <p className="text-white text-sm font-medium mb-2">
          {formattedLabel}
        </p>
      )}
      
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const [displayValue, displayName] = formatter 
            ? formatter(entry.value, entry.name)
            : [
                typeof entry.value === 'number' 
                  ? entry.value.toLocaleString(undefined, {maximumFractionDigits: 2}) 
                  : entry.value,
                entry.name
              ];
              
          return (
            <div key={`tooltip-item-${index}`} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-xs flex-1 flex justify-between">
                <span className="text-white/80 font-medium">
                  {displayName}:
                </span> 
                {showValues && (
                  <span className="text-white font-mono ml-2">
                    {displayValue}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartTooltip;
