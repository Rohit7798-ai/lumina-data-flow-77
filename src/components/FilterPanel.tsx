
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface FilterOptions {
  column: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains';
  value: string | number;
}

interface FilterPanelProps {
  columns: string[];
  onAddFilter: (filter: FilterOptions) => void;
  onRemoveFilter: (column: string) => void;
  onClearFilters: () => void;
  activeFilters: FilterOptions[];
  className?: string;
}

const FilterPanel = ({
  columns,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  activeFilters,
  className
}: FilterPanelProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<FilterOptions['operator']>('equals');
  const [filterValue, setFilterValue] = useState<string>('');

  const handleAddFilter = () => {
    if (!selectedColumn || !filterValue.trim()) return;
    
    onAddFilter({
      column: selectedColumn,
      operator: selectedOperator,
      value: filterValue
    });
    
    // Reset form
    setFilterValue('');
  };

  const getOperatorLabel = (operator: FilterOptions['operator']) => {
    switch (operator) {
      case 'equals': return 'equals';
      case 'notEquals': return 'not equals';
      case 'greaterThan': return 'greater than';
      case 'lessThan': return 'less than';
      case 'contains': return 'contains';
    }
  };

  return (
    <div className={cn("glass p-4 rounded-xl", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-neon-purple" />
        <h3 className="text-lg font-medium">Data Filters</h3>
        
        {activeFilters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="ml-auto text-xs h-8"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 mb-4">
        {activeFilters.map((filter) => (
          <Badge 
            key={filter.column} 
            variant="outline"
            className="bg-secondary/50 flex items-center gap-1 py-1.5"
          >
            <span className="font-medium">{filter.column}</span>
            <span className="text-muted-foreground">{getOperatorLabel(filter.operator)}</span>
            <span>{String(filter.value)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 rounded-full p-0.5"
              onClick={() => onRemoveFilter(filter.column)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove filter</span>
            </Button>
          </Badge>
        ))}
        
        {activeFilters.length === 0 && (
          <div className="text-sm text-muted-foreground italic">No active filters</div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        <div>
          <Label htmlFor="filterColumn">Column</Label>
          <Select 
            value={selectedColumn} 
            onValueChange={setSelectedColumn}
          >
            <SelectTrigger id="filterColumn" className="w-full">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="filterOperator">Operator</Label>
          <Select 
            value={selectedOperator} 
            onValueChange={(value) => setSelectedOperator(value as FilterOptions['operator'])}
          >
            <SelectTrigger id="filterOperator" className="w-full">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="notEquals">Not equals</SelectItem>
              <SelectItem value="greaterThan">Greater than</SelectItem>
              <SelectItem value="lessThan">Less than</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="filterValue">Value</Label>
          <Input
            id="filterValue"
            placeholder="Filter value"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={handleAddFilter} 
            className="w-full"
            disabled={!selectedColumn || !filterValue.trim()}
          >
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
