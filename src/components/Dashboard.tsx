
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Charts from './Charts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart3, LineChart, PieChart, Layers, Activity, BarChart2, ScatterChart } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Scatter,
  ScatterChart as RechartScatterChart,
  ZAxis,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  BarChart as RechartBarChart,
  Bar
} from 'recharts';
import { Tabs as ShadTabs } from "@radix-ui/react-tabs"
import { Button } from './ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { ChartContainer, ChartTooltipContent, ChartTooltip, ChartLegendContent } from './ui/chart';

interface DashboardProps {
  data: Array<Record<string, any>>;
  statistics: Array<{
    column: string;
    min: number;
    max: number;
    avg: number;
    stdDev: number;
    sum: number;
  }>;
  isLoading?: boolean;
}

// For charts with predefined color palette
const COLORS = [
  '#8B5CF6', // Purple (primary)
  '#00FFFF', // Cyan
  '#FF10F0', // Pink
  '#1EAEDB', // Blue
  '#64DFDF', // Teal
  '#FF9F1C', // Orange
  '#7400B8', // Deep purple
  '#80FFDB', // Mint
];

const Dashboard = ({ data, statistics, isLoading = false }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Extract numerical columns from data
  const numericalColumns = statistics.map(stat => stat.column);
  
  // Prepare data for different chart types
  const prepareChartData = () => {
    if (!data.length || !numericalColumns.length) return [];

    // Limit to first 30 records for better visualization
    return data.slice(0, 30).map((item, index) => {
      const chartItem: Record<string, any> = { name: `Item ${index + 1}` };
      
      // Add a readable name if available
      const nameColumn = Object.keys(item).find(key => 
        typeof item[key] === 'string' && 
        !numericalColumns.includes(key)
      );
      
      if (nameColumn) {
        chartItem.name = String(item[nameColumn]).slice(0, 15);
      }
      
      // Add numerical values
      numericalColumns.forEach(column => {
        if (item[column] !== undefined) {
          chartItem[column] = Number(item[column]);
        }
      });
      
      return chartItem;
    });
  };
  
  const chartData = prepareChartData();
  
  // Distribution data for histograms
  const prepareDistributionData = () => {
    if (!data.length || !numericalColumns.length) return {};
    
    const distributions: Record<string, { range: string, count: number }[]> = {};
    
    numericalColumns.slice(0, 4).forEach(column => {
      // Find min and max for this column
      const values = data.map(item => Number(item[column])).filter(val => !isNaN(val));
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Create 8 buckets
      const bucketSize = (max - min) / 8;
      const buckets: Record<number, number> = {};
      
      // Initialize buckets
      for (let i = 0; i < 8; i++) {
        buckets[i] = 0;
      }
      
      // Count values in each bucket
      values.forEach(value => {
        if (value === max) {
          // Edge case: put max value in the last bucket
          buckets[7]++;
        } else {
          const bucketIndex = Math.floor((value - min) / bucketSize);
          buckets[bucketIndex]++;
        }
      });
      
      // Format for chart display
      distributions[column] = Object.entries(buckets).map(([bucketIndex, count]) => {
        const bucketStart = min + (Number(bucketIndex) * bucketSize);
        const bucketEnd = bucketStart + bucketSize;
        return {
          range: `${bucketStart.toFixed(1)}-${bucketEnd.toFixed(1)}`,
          count
        };
      });
    });
    
    return distributions;
  };
  
  const distributionData = prepareDistributionData();
  
  // Scatter plot data
  const prepareScatterData = () => {
    if (numericalColumns.length < 2) return [];
    
    // Use the first two numerical columns for x and y
    const xColumn = numericalColumns[0];
    const yColumn = numericalColumns[1];
    const zColumn = numericalColumns[2] || xColumn; // Use third column if available, otherwise reuse first
    
    return data.slice(0, 100).map((item, index) => ({
      x: Number(item[xColumn]),
      y: Number(item[yColumn]),
      z: Number(item[zColumn]),
      name: `Point ${index + 1}`
    }));
  };
  
  const scatterData = prepareScatterData();
  
  // Correlation heatmap data
  const prepareCorrelationData = () => {
    if (numericalColumns.length < 2) return [];
    
    // Calculate Pearson correlation for each pair of columns
    const correlations: Array<{ id: string, field1: string, field2: string, correlation: number }> = [];
    
    for (let i = 0; i < numericalColumns.length; i++) {
      for (let j = i + 1; j < numericalColumns.length; j++) {
        const col1 = numericalColumns[i];
        const col2 = numericalColumns[j];
        
        // Get values
        const values1 = data.map(item => Number(item[col1])).filter(val => !isNaN(val));
        const values2 = data.map(item => Number(item[col2])).filter(val => !isNaN(val));
        
        // Calculate means
        const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
        const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;
        
        // Calculate correlation
        let numerator = 0;
        let denominator1 = 0;
        let denominator2 = 0;
        
        for (let k = 0; k < Math.min(values1.length, values2.length); k++) {
          const diff1 = values1[k] - mean1;
          const diff2 = values2[k] - mean2;
          
          numerator += diff1 * diff2;
          denominator1 += diff1 * diff1;
          denominator2 += diff2 * diff2;
        }
        
        const correlation = numerator / Math.sqrt(denominator1 * denominator2);
        
        correlations.push({
          id: `${col1}-${col2}`,
          field1: col1,
          field2: col2,
          correlation: isNaN(correlation) ? 0 : correlation
        });
      }
    }
    
    return correlations;
  };
  
  const correlationData = prepareCorrelationData();
  
  // Returns a color based on correlation value
  const getCorrelationColor = (correlation: number) => {
    // From red (negative) through white (0) to blue (positive)
    if (correlation > 0.7) return '#0066ff'; // Strong positive: Blue
    if (correlation > 0.3) return '#66a3ff'; // Moderate positive: Light blue
    if (correlation > -0.3) return '#f2f2f2'; // Weak: Near white
    if (correlation > -0.7) return '#ff9999'; // Moderate negative: Light red
    return '#ff0000'; // Strong negative: Red
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="w-full glass p-6 rounded-xl animate-pulse flex items-center justify-center h-[500px]">
        <div className="text-white/50">Loading dashboard...</div>
      </div>
    );
  }
  
  if (!data.length) {
    return (
      <div className="w-full glass p-6 rounded-xl flex items-center justify-center h-[500px]">
        <div className="text-white/50">Upload data to visualize</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ShadTabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="glass">
            <TabsTrigger value="overview" className="flex gap-2 items-center">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex gap-2 items-center">
              <Layers className="w-4 h-4" />
              <span>Distribution</span>
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex gap-2 items-center">
              <Activity className="w-4 h-4" />
              <span>Correlation</span>
            </TabsTrigger>
            <TabsTrigger value="scatter" className="flex gap-2 items-center">
              <ScatterChart className="w-4 h-4" />
              <span>Scatter</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-md">
                  <BarChart3 className="h-5 w-5 text-neon-cyan" />
                  Column Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#aaa" 
                        angle={-45}
                        textAnchor="end"
                        tick={{ fontSize: 11 }}
                        height={60}
                      />
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
                          whiteSpace: 'nowrap',
                          paddingLeft: 10, 
                          paddingRight: 10
                        }}
                      />
                      {numericalColumns.slice(0, 4).map((column, index) => (
                        <Area
                          key={column}
                          type="monotone"
                          dataKey={column}
                          stroke={COLORS[index % COLORS.length]}
                          fill={`${COLORS[index % COLORS.length]}40`}
                          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
                        />
                      ))}
                    </RechartBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-md">
                  <PieChart className="h-5 w-5 text-neon-pink" />
                  Value Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Legend 
                        layout="horizontal"
                        verticalAlign="top"
                        wrapperStyle={{
                          paddingBottom: 10,
                          overflowX: 'auto',
                          overflowY: 'hidden',
                          whiteSpace: 'nowrap',
                          paddingLeft: 10, 
                          paddingRight: 10
                        }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                          borderColor: '#555',
                          borderRadius: '4px',
                          color: '#fff' 
                        }} 
                      />
                      <Pie
                        data={statistics.slice(0, 6)}
                        dataKey="sum"
                        nameKey="column"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        label={({ column }) => column.length > 10 ? `${column.slice(0, 10)}...` : column}
                        labelLine={false}
                      >
                        {statistics.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-md">
                  <LineChart className="h-5 w-5 text-neon-blue" />
                  Trends Across Data Points
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <defs>
                        {numericalColumns.slice(0, 3).map((column, index) => (
                          <linearGradient 
                            key={`gradient-${column}`}
                            id={`colorGrad${index}`} 
                            x1="0" y1="0" x2="0" y2="1"
                          >
                            <stop 
                              offset="5%" 
                              stopColor={COLORS[index % COLORS.length]} 
                              stopOpacity={0.8}
                            />
                            <stop 
                              offset="95%" 
                              stopColor={COLORS[index % COLORS.length]} 
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#aaa" 
                        angle={-45}
                        textAnchor="end"
                        tick={{ fontSize: 11 }}
                        height={60}
                      />
                      <YAxis stroke="#aaa" />
                      <RechartsTooltip 
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
                          whiteSpace: 'nowrap',
                          paddingLeft: 10, 
                          paddingRight: 10
                        }}
                      />
                      {numericalColumns.slice(0, 3).map((column, index) => (
                        <Area
                          key={column}
                          type="monotone"
                          dataKey={column}
                          stroke={COLORS[index % COLORS.length]}
                          fillOpacity={1}
                          fill={`url(#colorGrad${index})`}
                          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(distributionData).slice(0, 4).map(([column, data]) => (
              <Card key={column} className="glass overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">
                    Distribution of {column}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartBarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="range" 
                          stroke="#aaa" 
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 11 }}
                          height={60}
                        />
                        <YAxis 
                          stroke="#aaa" 
                          label={{ 
                            value: 'Count', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fill: '#aaa' }
                          }} 
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            borderColor: '#555',
                            borderRadius: '4px',
                            color: '#fff' 
                          }} 
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Frequency"
                          stroke={COLORS[Object.keys(distributionData).indexOf(column) % COLORS.length]}
                          fill={`${COLORS[Object.keys(distributionData).indexOf(column) % COLORS.length]}40`}
                        />
                      </RechartBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="correlation" className="space-y-4">
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-md">
                <Activity className="h-5 w-5 text-neon-pink" />
                Correlation Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[600px] p-4">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="text-sm text-center text-muted-foreground mb-2">
                      <span className="inline-block w-4 h-4 bg-[#ff0000] mr-1 rounded-sm"></span> Strong Negative (-1.0)
                      <span className="mx-2">|</span>
                      <span className="inline-block w-4 h-4 bg-[#f2f2f2] mr-1 rounded-sm"></span> No Correlation (0)
                      <span className="mx-2">|</span>
                      <span className="inline-block w-4 h-4 bg-[#0066ff] mr-1 rounded-sm"></span> Strong Positive (1.0)
                    </div>
                    
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                      {correlationData.map(item => (
                        <HoverCard key={item.id}>
                          <HoverCardTrigger asChild>
                            <div 
                              className="p-3 rounded-md flex flex-col items-center justify-center cursor-help transition-transform hover:scale-105"
                              style={{
                                backgroundColor: getCorrelationColor(item.correlation),
                                color: Math.abs(item.correlation) > 0.5 ? '#fff' : '#000'
                              }}
                            >
                              <div className="text-xs truncate max-w-full">
                                {item.field1.length > 10 ? `${item.field1.slice(0, 10)}...` : item.field1}
                              </div>
                              <div className="font-bold text-lg">
                                {item.correlation.toFixed(2)}
                              </div>
                              <div className="text-xs truncate max-w-full">
                                {item.field2.length > 10 ? `${item.field2.slice(0, 10)}...` : item.field2}
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="glass border-none w-80 text-white">
                            <div className="space-y-2">
                              <h4 className="font-medium">Correlation Details</h4>
                              <div className="text-sm text-muted-foreground">
                                <p><span className="font-medium">Fields:</span> {item.field1} & {item.field2}</p>
                                <p><span className="font-medium">Correlation value:</span> {item.correlation.toFixed(4)}</p>
                                <p><span className="font-medium">Interpretation:</span> 
                                  {item.correlation > 0.7 ? (
                                    ' Strong positive correlation'
                                  ) : item.correlation > 0.3 ? (
                                    ' Moderate positive correlation'
                                  ) : item.correlation > -0.3 ? (
                                    ' Weak or no correlation'
                                  ) : item.correlation > -0.7 ? (
                                    ' Moderate negative correlation'
                                  ) : (
                                    ' Strong negative correlation'
                                  )}
                                </p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scatter" className="space-y-4">
          <Card className="glass overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-md">
                <ScatterChart className="h-5 w-5 text-neon-cyan" />
                Scatter Plot Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartScatterChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={numericalColumns[0]} 
                      stroke="#aaa"
                      label={{ 
                        value: numericalColumns[0], 
                        position: 'insideBottom', 
                        offset: -10,
                        style: { fill: '#aaa' }
                      }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={numericalColumns[1]} 
                      stroke="#aaa"
                      label={{ 
                        value: numericalColumns[1], 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: '#aaa' }
                      }}
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="z" 
                      range={[50, 500]} 
                      name={numericalColumns[2] || numericalColumns[0]} 
                    />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        borderColor: '#555',
                        borderRadius: '4px',
                        color: '#fff' 
                      }}
                      formatter={(value, name) => [`${value}`, name]}
                    />
                    <Scatter 
                      name="Data Points" 
                      data={scatterData} 
                      fill="#8B5CF6"
                      opacity={0.7}
                    >
                      {scatterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Scatter>
                  </RechartScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </ShadTabs>
    </div>
  );
};

export default Dashboard;
