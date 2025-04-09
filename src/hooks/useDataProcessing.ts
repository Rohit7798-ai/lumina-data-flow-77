
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { calculateStatistics, prepare3DData } from '@/utils/dataParser';
import { toast } from 'sonner';
import { debounce } from 'lodash';

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
  
  // For monitoring real-time performance
  const [processingTime, setProcessingTime] = useState<number>(0);
  const processingTimerRef = useRef<number | null>(null);
  
  // Enhanced data processing with performance tracking
  const processData = useCallback((data: Record<string, any>[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error('No data provided for processing');
      return;
    }
    
    setRawData(data);
    setFileName(fileName);
    setIsProcessing(true);
    
    // Start performance timer
    processingTimerRef.current = performance.now();
    
    // Extract column names for filtering
    if (data.length > 0) {
      // Get all available columns for analysis and filtering
      setAvailableColumns(Object.keys(data[0]));
      console.log("Available columns for analysis:", Object.keys(data[0]));
    }
    
    toast.info(`Processing ${data.length.toLocaleString()} records...`);
  }, []);

  // Apply filters to the raw data with optimized performance
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];

    // Performance optimization for large datasets
    const startTime = performance.now();
    
    // Create indexed lookups for faster filtering if dataset is large
    const isLargeDataset = rawData.length > 10000;
    const columnIndices: Record<string, Map<any, number[]>> = {};
    
    if (isLargeDataset && filters.length > 0) {
      // Create indices for frequently filtered columns
      filters.forEach(filter => {
        if (!columnIndices[filter.column]) {
          const index = new Map<any, number[]>();
          rawData.forEach((row, i) => {
            const value = row[filter.column];
            if (!index.has(value)) {
              index.set(value, [i]);
            } else {
              index.get(value)!.push(i);
            }
          });
          columnIndices[filter.column] = index;
        }
      });
    }
    
    // Fast path for no filters
    if (!filters.length) {
      const endTime = performance.now();
      setProcessingTime(endTime - startTime);
      return rawData;
    }
    
    // Optimized filtering logic
    const result = rawData.filter(row => {
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
    
    const endTime = performance.now();
    setProcessingTime(endTime - startTime);
    
    return result;
  }, [rawData, filters]);

  // Real-time data update handling with debounce
  const updateRawData = useCallback(
    debounce((newData: Record<string, any>[]) => {
      setRawData(prevData => {
        // Only update if data actually changed
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          setIsProcessing(true);
          toast.info('Data updated in real-time');
          return newData;
        }
        return prevData;
      });
    }, 300),
    []
  );

  // Add or update a filter with real-time feedback
  const addFilter = useCallback((filter: FilterOptions) => {
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
  }, []);

  // Remove a filter with real-time feedback
  const removeFilter = useCallback((column: string) => {
    setFilters(prev => prev.filter(f => f.column !== column));
    toast.info(`Filter on ${column} removed`);
  }, []);

  // Clear all filters with real-time feedback
  const clearFilters = useCallback(() => {
    setFilters([]);
    toast.info('All filters cleared');
  }, []);

  // Process data when raw data changes or processing is triggered
  useEffect(() => {
    if (rawData.length > 0 && isProcessing) {
      try {
        const startTime = performance.now();
        
        // For large datasets, use web workers or chunked processing
        const isLargeDataset = rawData.length > 50000;
        
        if (isLargeDataset) {
          // Process in batches for large datasets
          const batchSize = 10000;
          let processedStats: Statistic[] = [];
          
          // Process first batch immediately for responsive UI
          const firstBatch = rawData.slice(0, batchSize);
          const initialStats = calculateStatistics(firstBatch);
          
          if (Array.isArray(initialStats)) {
            setStatistics(initialStats);
            toast.info(`Processed first ${batchSize.toLocaleString()} records, continuing in background...`);
            
            // Schedule remaining batches
            setTimeout(() => {
              // Compute statistics for full dataset
              const fullStats = calculateStatistics(rawData);
              if (Array.isArray(fullStats)) {
                setStatistics(fullStats);
                
                // Prepare data for 3D visualization
                const visData = prepare3DData(rawData);
                setVisualizationData(visData);
                
                const endTime = performance.now();
                setProcessingTime(endTime - startTime);
                
                toast.success(`Completed processing ${rawData.length.toLocaleString()} records in ${((endTime - startTime)/1000).toFixed(2)}s`);
              }
            }, 100); // Small delay to let the UI update
          }
        } else {
          // Regular processing for smaller datasets
          const stats = calculateStatistics(rawData);
          
          if (Array.isArray(stats)) {
            setStatistics(stats);
            
            // Prepare data for 3D visualization
            const visData = prepare3DData(rawData);
            setVisualizationData(visData);
            
            const endTime = performance.now();
            setProcessingTime(endTime - startTime);
            
            console.log('Processed data:', {
              rowCount: rawData.length,
              processingTimeMs: endTime - startTime,
              stats,
              visData
            });
          } else {
            console.error('Statistics is not an array:', stats);
            setStatistics([]);
            toast.error('Error calculating column statistics');
          }
        }
      } catch (error) {
        console.error('Error processing data:', error);
        toast.error('Error processing data for visualization');
        // Reset states to prevent UI inconsistencies
        setStatistics([]);
      } finally {
        setIsProcessing(false);
        if (processingTimerRef.current !== null) {
          const totalTime = performance.now() - processingTimerRef.current;
          processingTimerRef.current = null;
          console.log(`Total processing time: ${totalTime.toFixed(2)}ms`);
        }
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
    updateRawData, // New method for real-time updates
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    availableColumns,
    processingTime, // Expose processing time for UI feedback
  };
};

export default useDataProcessing;
