
import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';

type ChartsProps = {
  data: Array<Record<string, any>>;
  type: 'line' | 'bar' | 'pie';
  className?: string;
  isLoading?: boolean;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Charts = ({ data, type, className, isLoading = false }: ChartsProps) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Animation effect
  useEffect(() => {
    const animationDuration = 1500; // animation duration in ms
    const startTime = Date.now();
    
    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      setAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animationFrame);
      } else {
        setIsAnimating(false);
      }
    };
    
    setIsAnimating(true);
    requestAnimationFrame(animationFrame);
    
    return () => {
      setIsAnimating(false);
    };
  }, [data, type]);
  
  // Extract numerical data for charts
  const chartData = React.useMemo(() => {
    if (!data.length) return [];
    
    // For pie chart, we need to transform the data
    if (type === 'pie') {
      const firstRow = data[0];
      const keys = Object.keys(firstRow).filter(key => 
        typeof firstRow[key] === 'number' || !isNaN(Number(firstRow[key]))
      ).slice(0, 5); // Limit to 5 keys for pie chart
      
      return keys.map(key => ({
        name: key,
        value: data.reduce((sum, row) => sum + (Number(row[key]) || 0), 0)
      }));
    }
    
    // For line and bar charts, keep the original structure but limit to 20 rows
    return data.slice(0, 20).map(row => {
      const result: Record<string, any> = { name: '' };
      
      // Try to find a suitable name property
      const nameField = Object.keys(row).find(key => 
        typeof row[key] === 'string' && 
        !['id', 'uuid', 'guid'].includes(key.toLowerCase())
      ) || Object.keys(row)[0];
      
      result.name = String(row[nameField]).slice(0, 10);
      
      // Add numerical values
      Object.entries(row).forEach(([key, value]) => {
        if ((typeof value === 'number' || !isNaN(Number(value))) && key !== nameField) {
          result[key] = Number(value);
        }
      });
      
      return result;
    });
  }, [data, type]);
  
  // Get fields to display
  const fields = React.useMemo(() => {
    if (!chartData.length) return [];
    const firstRow = chartData[0];
    return Object.keys(firstRow).filter(key => key !== 'name').slice(0, 3);
  }, [chartData]);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("w-full h-[400px] rounded-xl overflow-hidden glass flex items-center justify-center", className)}>
        <div className="text-white/50">Loading chart...</div>
      </div>
    );
  }

  // Render empty state
  if (!chartData.length) {
    return (
      <div className={cn("w-full h-[400px] rounded-xl overflow-hidden glass flex items-center justify-center", className)}>
        <div className="text-white/50">Upload data to visualize</div>
      </div>
    );
  }

  // Calculate animation values for 3D effects
  const animatedData = chartData.map((item, index) => {
    const result: Record<string, any> = { name: item.name };
    
    fields.forEach(field => {
      result[field] = item[field] * animationProgress;
    });
    
    return result;
  });

  return (
    <div className={cn("w-full h-[400px] rounded-xl overflow-hidden glass p-4 relative", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart 
            data={animatedData}
            style={{ transform: isAnimating ? `perspective(1200px) rotateX(${5 * (1 - animationProgress)}deg)` : 'none' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                borderColor: '#555',
                borderRadius: '4px',
                color: '#fff' 
              }} 
            />
            <Legend 
              layout="horizontal"
              verticalAlign="top"
              wrapperStyle={{
                paddingBottom: 10,
                overflowX: 'auto',
                overflowY: 'hidden',
                whiteSpace: 'nowrap'
              }}
              formatter={(value) => <span title={value}>{value.length > 12 ? `${value.substring(0, 10)}...` : value}</span>}
            />
            {fields.map((field, index) => (
              <Line 
                key={field}
                type="monotone" 
                dataKey={field} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={2}
                dot={{ stroke: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
                style={{
                  filter: isAnimating ? `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]})` : 'none'
                }}
              />
            ))}
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart 
            data={animatedData}
            style={{ transform: isAnimating ? `perspective(1200px) rotateX(${10 * (1 - animationProgress)}deg)` : 'none' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                borderColor: '#555',
                borderRadius: '4px',
                color: '#fff' 
              }} 
            />
            <Legend 
              layout="horizontal"
              verticalAlign="top"
              wrapperStyle={{
                paddingBottom: 10, 
                overflowX: 'auto',
                overflowY: 'hidden',
                whiteSpace: 'nowrap'
              }}
              formatter={(value) => <span title={value}>{value.length > 12 ? `${value.substring(0, 10)}...` : value}</span>}
            />
            {fields.map((field, index) => (
              <Bar 
                key={field}
                dataKey={field} 
                fill={COLORS[index % COLORS.length]} 
                radius={[4, 4, 0, 0]}
                style={{
                  filter: isAnimating ? `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]})` : 'none'
                }}
              />
            ))}
          </BarChart>
        ) : (
          <PieChart style={{ transform: isAnimating ? `perspective(1200px) rotateY(${180 * (1 - animationProgress)}deg)` : 'none' }}>
            <Pie
              data={animatedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120 * animationProgress}
              innerRadius={60 * animationProgress}
              label={(entry) => entry.name.length > 10 ? `${entry.name.substring(0, 8)}...` : entry.name}
              labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{
                    filter: isAnimating ? `drop-shadow(0 0 6px ${COLORS[index % COLORS.length]})` : 'none'
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                borderColor: '#555',
                borderRadius: '4px',
                color: '#fff' 
              }} 
            />
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{
                overflowX: 'auto',
                overflowY: 'hidden',
                whiteSpace: 'nowrap'
              }}
              formatter={(value) => <span title={value}>{value.length > 12 ? `${value.substring(0, 10)}...` : value}</span>}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
      
      {isAnimating && (
        <div className="absolute top-2 right-2 glass px-2 py-1 rounded-md text-xs text-white/70 animate-fade-in">
          <span>Rendering 3D view...</span>
        </div>
      )}
    </div>
  );
};

export default Charts;
