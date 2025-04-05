
import React, { useState } from 'react';
import { Filter, X, ArrowDown, ArrowUp, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  // Track expanded state for filter sections
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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

  const getOperatorIcon = (operator: FilterOptions['operator']) => {
    switch (operator) {
      case 'greaterThan': return <ArrowUp className="h-3 w-3" />;
      case 'lessThan': return <ArrowDown className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className={cn("glass p-4 rounded-xl", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-neon-purple" />
        <h3 className="text-lg font-medium">Data Filters</h3>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="ml-auto text-xs h-8"
              >
                {isAdvancedOpen ? "Simple View" : "Advanced Options"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isAdvancedOpen ? "Show basic filter options" : "Show more filter options"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {activeFilters.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearFilters}
                  className="text-xs h-8"
                >
                  Clear All
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove all active filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            <span className="text-muted-foreground flex items-center gap-0.5">
              {getOperatorIcon(filter.operator)}
              {getOperatorLabel(filter.operator)}
            </span>
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
          <Label htmlFor="filterColumn" className="flex items-center gap-1">
            Column
            <span className="text-neon-purple">*</span>
          </Label>
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
          <Label htmlFor="filterOperator" className="flex items-center gap-1">
            Condition
            <span className="text-neon-purple">*</span>
          </Label>
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
          <Label htmlFor="filterValue" className="flex items-center gap-1">
            Value
            <span className="text-neon-purple">*</span>
          </Label>
          <Input
            id="filterValue"
            placeholder="Filter value"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
        
        <div className="flex items-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleAddFilter} 
                  className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-blue transition-all duration-300"
                  disabled={!selectedColumn || !filterValue.trim()}
                >
                  Apply Filter
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add this filter to your data view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {isAdvancedOpen && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
          <h4 className="text-sm font-medium mb-2 text-neon-cyan">Advanced Filter Options</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Create complex filters by combining multiple conditions. All filters are applied using AND logic.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Future implementation: Date range filters */}
            <div className="col-span-full">
              <div className="flex items-center justify-center p-4 glass rounded-lg">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5 text-neon-purple" />
                  <span className="text-sm">Date range filters coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
