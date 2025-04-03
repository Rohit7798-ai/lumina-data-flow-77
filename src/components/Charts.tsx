import React from 'react';
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

  return (
    <div className={cn("w-full h-[400px] rounded-xl overflow-hidden glass p-4", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={chartData}>
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
            <Legend />
            {fields.map((field, index) => (
              <Line 
                key={field}
                type="monotone" 
                dataKey={field} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={2}
                dot={{ stroke: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
              />
            ))}
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart data={chartData}>
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
            <Legend />
            {fields.map((field, index) => (
              <Bar 
                key={field}
                dataKey={field} 
                fill={COLORS[index % COLORS.length]} 
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              label={(entry) => entry.name}
              labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
