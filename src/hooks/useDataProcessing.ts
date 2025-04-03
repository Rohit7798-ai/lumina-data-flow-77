
import { useState, useEffect } from 'react';
import { calculateStatistics, prepare3DData } from '@/utils/dataParser';
import { toast } from 'sonner';

export const useDataProcessing = () => {
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [statistics, setStatistics] = useState<any[]>([]); // Initialize as empty array
  const [visualizationData, setVisualizationData] = useState<{
    points: Array<{x: number, y: number, z: number, value: number}>,
    axisLabels: string[]
  }>({ points: [], axisLabels: [] });
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
        setStatistics(stats); // Now this is safe because stats is an array
        
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
