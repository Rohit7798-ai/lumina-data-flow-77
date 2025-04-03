
import { useState, useEffect } from 'react';
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

export const useDataProcessing = () => {
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [visualizationData, setVisualizationData] = useState<VisualizationData>({ 
    points: [], 
    axisLabels: [] 
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const processData = (data: Record<string, any>[], fileName: string) => {
    setRawData(data);
    setFileName(fileName);
    setIsProcessing(true);
  };

  useEffect(() => {
    if (rawData.length > 0 && isProcessing) {
      try {
        // Compute statistics
        const stats = calculateStatistics(rawData);
        // Ensure stats is always an array before setting it
        if (Array.isArray(stats)) {
          setStatistics(stats);
        } else {
          console.error('Statistics is not an array:', stats);
          setStatistics([]);
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
    fileName,
    statistics,
    visualizationData,
    isProcessing,
    processData
  };
};

export default useDataProcessing;
