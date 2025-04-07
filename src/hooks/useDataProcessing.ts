
import { useState, useEffect, useMemo } from 'react';
import { calculateStatistics, prepare3DData } from '@/utils/dataParser';
import { toast } from 'sonner';

// Define interfaces for better type safety
interface Statistic {
  column: string;
  min: number;
  max: number;
  avg: number;
  stdDev: number;
  sum: number;
}

interface VisualizationData {
  points: Array<{x: number, y: number, z: number, value: number}>;
  axisLabels: string[];
}

interface FilterOptions {
  column: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains';
  value: string | number;
}

export const useDataProcessing = () => {
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [visualizationData, setVisualizationData] = useState<VisualizationData>({ 
    points: [], 
    axisLabels: [] 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<FilterOptions[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  const processData = (data: Record<string, any>[], fileName: string) => {
    setRawData(data);
    setFileName(fileName);
    setIsProcessing(true);
    
    // Extract column names for filtering
    if (data.length > 0) {
      // Get all available columns for analysis and filtering
      setAvailableColumns(Object.keys(data[0]));
      console.log("Available columns for analysis:", Object.keys(data[0]));
    }
  };

  // Apply filters to the raw data
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];

    return rawData.filter(row => {
      // If no filters, return all data
      if (!filters.length) return true;

      // Check if the row satisfies all filters (AND logic)
      return filters.every(filter => {
        const cellValue = row[filter.column];
        
        if (cellValue === undefined || cellValue === null) return false;

        switch (filter.operator) {
          case 'equals':
            return cellValue == filter.value; // Using == to allow type coercion
          case 'notEquals':
            return cellValue != filter.value;
          case 'greaterThan':
            return Number(cellValue) > Number(filter.value);
          case 'lessThan':
            return Number(cellValue) < Number(filter.value);
          case 'contains':
            return String(cellValue).toLowerCase().includes(String(filter.value).toLowerCase());
          default:
            return true;
        }
      });
    });
  }, [rawData, filters]);

  // Add or update a filter
  const addFilter = (filter: FilterOptions) => {
    // If filter for same column exists, replace it
    setFilters(prev => {
      const exists = prev.findIndex(f => f.column === filter.column);
      if (exists >= 0) {
        const newFilters = [...prev];
        newFilters[exists] = filter;
        return newFilters;
      }
      return [...prev, filter];
    });
    
    toast.success(`Filter on ${filter.column} applied`);
  };

  // Remove a filter
  const removeFilter = (column: string) => {
    setFilters(prev => prev.filter(f => f.column !== column));
    toast.info(`Filter on ${column} removed`);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters([]);
    toast.info('All filters cleared');
  };

  useEffect(() => {
    if (rawData.length > 0 && isProcessing) {
      try {
        // Compute statistics for column analysis
        const stats = calculateStatistics(rawData);
        // Ensure stats is always an array before setting it
        if (Array.isArray(stats)) {
          setStatistics(stats);
          console.log("Column statistics calculated:", stats);
        } else {
          console.error('Statistics is not an array:', stats);
          setStatistics([]);
          toast.error('Error calculating column statistics');
        }
        
        // Prepare data for 3D visualization
        const visData = prepare3DData(rawData);
        setVisualizationData(visData);
        
        console.log('Processed data:', {
          rowCount: rawData.length,
          stats,
          visData
        });
      } catch (error) {
        console.error('Error processing data:', error);
        toast.error('Error processing data for visualization');
        // Reset states to prevent UI inconsistencies
        setStatistics([]);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [rawData, isProcessing]);

  return {
    rawData,
    filteredData,
    fileName,
    statistics,
    visualizationData,
    isProcessing,
    processData,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    availableColumns
  };
};

export default useDataProcessing;
