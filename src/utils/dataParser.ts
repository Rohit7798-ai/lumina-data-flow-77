
/**
 * Extract numerical data from parsed CSV data
 */
export const extractNumericalData = (data: Record<string, any>[]) => {
  if (!data.length) return { columns: [], values: [] };
  
  // Find keys with numerical values
  const firstRow = data[0];
  const numericalColumns = Object.keys(firstRow).filter(key => 
    typeof firstRow[key] === 'number' || !isNaN(Number(firstRow[key]))
  );
  
  // Extract values for those columns
  const values = numericalColumns.map(column => 
    data.map(row => typeof row[column] === 'number' ? row[column] : Number(row[column]) || 0)
  );
  
  return { columns: numericalColumns, values };
};

/**
 * Calculate basic statistics for data
 */
export const calculateStatistics = (data: Record<string, any>[]) => {
  if (!data.length) return {};
  
  const { columns, values } = extractNumericalData(data);
  
  const stats = columns.map((column, index) => {
    const columnValues = values[index];
    const sum = columnValues.reduce((a, b) => a + b, 0);
    const avg = sum / columnValues.length;
    const min = Math.min(...columnValues);
    const max = Math.max(...columnValues);
    
    // Calculate standard deviation
    const squareDiffs = columnValues.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    return {
      column,
      min,
      max,
      avg,
      stdDev,
      sum
    };
  });
  
  return stats;
};

/**
 * Prepare data for 3D visualization
 */
export const prepare3DData = (data: Record<string, any>[]) => {
  if (!data.length) return { points: [], axisLabels: [] };
  
  // Try to find 3 numerical columns for X, Y, Z axes
  const { columns, values } = extractNumericalData(data);
  
  // Use min 3 columns for 3D, or use fewer if not available
  const usableColumns = columns.slice(0, 3);
  const usableValues = values.slice(0, 3);
  
  // If we have fewer than 3 columns, create computed ones
  while (usableColumns.length < 3) {
    if (usableColumns.length === 0) {
      // If no numerical columns, create index-based data
      usableColumns.push('Index');
      usableValues.push(data.map((_, i) => i));
    } else if (usableColumns.length === 1) {
      // Create a second dimension as random variation of the first
      usableColumns.push('Computed Y');
      usableValues.push(usableValues[0].map(v => v * 0.7 + Math.random() * 0.5));
    } else {
      // Create a third dimension as combination of the first two
      usableColumns.push('Computed Z');
      usableValues.push(data.map((_, i) => 
        (usableValues[0][i] + usableValues[1][i]) / 2 * (0.8 + Math.random() * 0.4)
      ));
    }
  }
  
  // Normalize the values for better visualization
  const normalizedValues = usableValues.map(columnValues => {
    const min = Math.min(...columnValues);
    const max = Math.max(...columnValues);
    const range = max - min;
    
    return columnValues.map(v => range ? (v - min) / range * 2 - 1 : 0);
  });
  
  // Create points for 3D visualization
  const points = data.map((_, i) => ({
    x: normalizedValues[0][i],
    y: normalizedValues[1][i],
    z: normalizedValues[2][i],
    // Use the 4th column for color if available, otherwise use the first column
    value: values.length > 3 ? values[3][i] : values[0][i]
  }));
  
  return {
    points,
    axisLabels: usableColumns.slice(0, 3)
  };
};
