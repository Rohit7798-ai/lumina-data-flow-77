import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, BarChart, PieChart, ScatterChart, AreaChart, ComposedChart,
  Line, Bar, Pie, Scatter, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell, ZAxis, Sector,
  ReferenceLine, ReferenceArea, Brush, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { cn } from '@/lib/utils';
import { ChartTooltip } from '@/components/ChartTooltip';
import { ChartLegend } from '@/components/ChartLegend';
import { ChartControls } from '@/components/ChartControls';
import {
  ChartContainer,
  ChartTooltip as ShadcnTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

type ChartsProps = {
  data: Array<Record<string, any>>;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'radar' | 'composed';
  className?: string;
  isLoading?: boolean;
};

const COLORS = [
  '#8B5CF6', // Purple
  '#00FFFF', // Cyan
  '#FF10F0', // Pink
  '#1EAEDB', // Blue
  '#64DFDF', // Teal
  '#FF9F1C', // Orange
  '#7400B8', // Deep purple
  '#80FFDB', // Mint
  '#FFD166', // Yellow
  '#FF5E5B', // Red
  '#FF36AB', // Magenta
  '#06D6A0', // Turquoise
  '#9D4EDD', // Violet
  '#7209B7', // Indigo
  '#FB8500', // Amber
  '#2DC653'  // Emerald
];

const Charts = ({ data, type, className, isLoading = false }: ChartsProps) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBrush, setShowBrush] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [chartType, setChartType] = useState<ChartsProps['type']>(type);
  
  useEffect(() => {
    setChartType(type);
  }, [type]);
  
  useEffect(() => {
    if (!data.length) return;
    
    const animationDuration = 1200;
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
  }, [data, chartType]);
  
  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    if (chartType === 'pie') {
      const firstRow = data[0];
      const keys = Object.keys(firstRow).filter(key => 
        typeof firstRow[key] === 'number' || !isNaN(Number(firstRow[key]))
      ).slice(0, 6);
      
      return keys.map(key => ({
        name: key.length > 10 ? `${key.substring(0, 10)}...` : key,
        value: data.reduce((sum, row) => sum + (Number(row[key]) || 0), 0),
        fullName: key
      }));
    }
    
    if (chartType === 'radar') {
      return data.slice(0, 8).map((row, index) => {
        const result: Record<string, any> = { name: `Item ${index + 1}` };
        
        const nameField = Object.keys(row).find(key => 
          typeof row[key] === 'string' && 
          !['id', 'uuid', 'guid'].includes(key.toLowerCase())
        ) || Object.keys(row)[0];
        
        const displayName = String(row[nameField]);
        result.name = displayName.length > 8 ? `${displayName.slice(0, 8)}...` : displayName;
        result.fullName = displayName;
        
        Object.entries(row).forEach(([key, value]) => {
          if ((typeof value === 'number' || !isNaN(Number(value))) && key !== nameField) {
            result[key] = Number(value);
          }
        });
        
        return result;
      });
    }
    
    return data.slice(0, 15).map((row, index) => {
      const result: Record<string, any> = { name: `Item ${index + 1}`, id: index };
      
      const nameField = Object.keys(row).find(key => 
        typeof row[key] === 'string' && 
        !['id', 'uuid', 'guid'].includes(key.toLowerCase())
      ) || Object.keys(row)[0];
      
      const displayName = String(row[nameField]);
      result.name = displayName.length > 8 ? `${displayName.slice(0, 8)}...` : displayName;
      result.fullName = displayName;
      
      Object.entries(row).forEach(([key, value]) => {
        if ((typeof value === 'number' || !isNaN(Number(value))) && key !== nameField) {
          result[key] = Number(value);
        }
      });
      
      return result;
    });
  }, [data, chartType]);
  
  const fields = useMemo(() => {
    if (!chartData.length) return [];
    const firstRow = chartData[0];
    return Object.keys(firstRow).filter(key => 
      key !== 'name' && 
      key !== 'id' && 
      key !== 'fullName'
    ).slice(0, 5);
  }, [chartData]);
  
  const calculatePieAverage = (pieData: Array<{ name: string; value: number; fullName: string }>) => {
    if (!pieData.length) return 0;
    
    const total = pieData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
    return total / pieData.length;
  };

  if (isLoading) {
    return (
      <div className={cn(
        "w-full h-[400px] rounded-xl overflow-hidden glass flex items-center justify-center", 
        className
      )}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-neon-cyan border-r-neon-pink animate-spin"></div>
          <div className="text-white/80">Loading visualization...</div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className={cn(
        "w-full h-[400px] rounded-xl overflow-hidden glass flex items-center justify-center",
        className
      )}>
        <div className="text-white/80">Upload data to visualize</div>
      </div>
    );
  }

  const animatedData = chartData.map((item) => {
    const result: Record<string, any> = { 
      name: item.name, 
      id: item.id,
      fullName: item.fullName
    };
    
    fields.forEach(field => {
      result[field] = item[field] * animationProgress;
    });
    
    return result;
  });

  const customLegendFormatter = (value: string) => {
    const maxLength = 10;
    const displayValue = value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
    return <span title={value} className="text-xs font-medium">{displayValue}</span>;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const fullName = payload[0]?.payload?.fullName || label;
      
      return (
        <div className="bg-black/90 p-3 rounded-md backdrop-blur-lg border border-white/20 shadow-xl min-w-[180px]">
          <p className="text-white text-sm font-medium mb-2">{fullName}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-item-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <p className="text-xs flex-1 flex justify-between">
                  <span className="text-white/80 font-medium">
                    {entry.name}:
                  </span> 
                  <span className="text-white font-mono ml-2">
                    {typeof entry.value === 'number' 
                      ? entry.value.toLocaleString(undefined, {
                          maximumFractionDigits: 2
                        }) 
                      : entry.value}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderDot = (props: any) => {
    const { cx, cy, index, dataKey } = props;
    const isHovered = hoveredDataPoint === index;
    
    return (
      <circle 
        key={`dot-${dataKey}-${index}`}
        cx={cx} 
        cy={cy} 
        r={isHovered ? 6 : 4}
        stroke="#fff"
        strokeWidth={isHovered ? 2 : 1}
        fill={COLORS[props.dataKey.length % COLORS.length]}
        style={isHovered ? {
          filter: `drop-shadow(0 0 6px ${COLORS[props.dataKey.length % COLORS.length]})`
        } : undefined}
        onMouseEnter={() => setHoveredDataPoint(index)}
        onMouseLeave={() => setHoveredDataPoint(null)}
        className="transition-all duration-300"
      />
    );
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={2}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" fontSize={12}>{`${payload.fullName || payload.name}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#fff" fontSize={12} fontWeight="bold">
          {`${value.toLocaleString()}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={36} textAnchor={textAnchor} fill="#fff" fontSize={10}>
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const chartConfig = {
    line: {
      title: "Line Chart",
      subtitle: "Showing trends over time or categories"
    },
    bar: {
      title: "Bar Chart",
      subtitle: "Comparing values across categories"
    },
    pie: {
      title: "Pie Chart",
      subtitle: "Showing proportions of a whole"
    },
    scatter: {
      title: "Scatter Plot",
      subtitle: "Plotting points to show correlation"
    },
    area: {
      title: "Area Chart",
      subtitle: "Visualizing volume across time"
    },
    radar: {
      title: "Radar Chart",
      subtitle: "Comparing multiple variables"
    },
    composed: {
      title: "Composed Chart",
      subtitle: "Combining multiple chart types"
    }
  };

  return (
    <div className={cn(
      "w-full h-[400px] rounded-xl overflow-hidden glass p-4 relative",
      "transition-all duration-500 ease-out hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
      className
    )}>
      <ChartControls 
        chartType={chartType}
        onTypeChange={(type) => setChartType(type as ChartsProps['type'])}
        onToggleBrush={() => setShowBrush(!showBrush)}
        onToggleControls={() => setShowAdvancedControls(!showAdvancedControls)}
        showBrush={showBrush}
        showControls={showAdvancedControls}
        hasData={chartData.length > 0}
      />
      
      {showAdvancedControls && (
        <div className="mb-4 text-left">
          <h3 className="text-sm font-medium text-white">
            {chartConfig[chartType]?.title || 'Data Visualization'}
          </h3>
          <p className="text-xs text-white/60">
            {chartConfig[chartType]?.subtitle || 'Interactive data visualization'}
          </p>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <LineChart 
            data={animatedData}
            className="animate-chart-fade-in"
            style={{ 
              transform: isAnimating ? `perspective(1200px) rotateX(${5 * (1 - animationProgress)}deg)` : 'none',
              transition: 'transform 0.5s ease'
            }}
            margin={{ top: 10, right: 20, left: 10, bottom: showBrush ? 40 : 10 }}
            onMouseMove={(e) => {
              if (e && e.activeTooltipIndex !== undefined) {
                setHoveredDataPoint(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoveredDataPoint(null)}
          >
            <defs>
              {fields.map((field, index) => (
                <linearGradient
                  key={`line-gradient-${field}`}
                  id={`lineGradient${index}`}
                  x1="0" y1="0" x2="1" y2="0"
                >
                  <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={COLORS[(index + 2) % COLORS.length]} stopOpacity={0.8} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.6} />
            <XAxis 
              dataKey="name" 
              stroke="#aaa" 
              tick={{ fontSize: 11, fill: '#fff' }}
              tickLine={{ stroke: '#555' }}
              axisLine={{ stroke: '#555' }}
              label={{ value: 'Category', position: 'insideBottomRight', offset: -5, fill: '#aaa' }}
            />
            <YAxis 
              stroke="#aaa" 
              tick={{ fontSize: 11, fill: '#fff' }}
              tickLine={{ stroke: '#555' }}
              axisLine={{ stroke: '#555' }}
              label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: '#aaa' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Legend 
              formatter={customLegendFormatter}
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
            <ReferenceLine y={animatedData.reduce((sum, item) => sum + (item[fields[0]] || 0), 0) / animatedData.length} 
                      stroke="#fff" strokeDasharray="3 3" 
                      label={{ value: 'Average', position: 'right', fill: '#fff' }} />
            
            {fields.map((field, index) => (
              <Line 
                key={field}
                type="monotone" 
                dataKey={field} 
                name={field}
                stroke={`url(#lineGradient${index})`}
                strokeWidth={2}
                dot={renderDot}
                activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={isAnimating}
                style={{
                  filter: isAnimating ? `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]})` : 'none',
                  transition: 'filter 0.3s ease'
                }}
              />
            ))}
            
            {showBrush && (
              <Brush 
                dataKey="name" 
                height={30} 
                stroke="#8884d8" 
                startIndex={0} 
                endIndex={Math.min(5, animatedData.length - 1)}
                y={320}
              />
            )}
          </LineChart>
        ) : chartType === 'bar' ? (
          <BarChart 
            data={animatedData}
            className="animate-chart-fade-in"
            style={{ 
              transform: isAnimating ? `perspective(1200px) rotateX(${10 * (1 - animationProgress)}deg)` : 'none',
              transition: 'transform 0.5s ease' 
            }}
            margin={{ top: 10, right: 20, left: 10, bottom: showBrush ? 40 : 10 }}
          >
            <defs>
              {fields.map((field, index) => (
                <linearGradient
                  key={`bar-gradient-${field}`}
                  id={`barGradient${index}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                  <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.6} />
            <XAxis 
              dataKey="name" 
              stroke="#aaa" 
              tick={{ fontSize: 11, fill: '#fff' }}
              tickLine={{ stroke: '#555' }}
              axisLine={{ stroke: '#555' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              label={{ value: 'Category', position: 'insideBottomRight', offset: 0, fill: '#aaa' }}
            />
            <YAxis 
              stroke="#aaa" 
              tick={{ fontSize: 11, fill: '#fff' }}
              tickLine={{ stroke: '#555' }}
              axisLine={{ stroke: '#555' }}
              label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: '#aaa' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Legend 
              formatter={customLegendFormatter}
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
            
            <ReferenceArea y1={0} y2={100} fill="#fff" fillOpacity={0.05} />
            
            {fields.map((field, index) => (
              <Bar 
                key={field}
                dataKey={field} 
                name={field}
                fill={`url(#barGradient${index})`}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={isAnimating}
                style={{
                  filter: `drop-shadow(0 0 2px ${COLORS[index % COLORS.length]})`
                }}
                onMouseEnter={(data, index) => {
                  setHoveredDataPoint(index);
                }}
                onMouseLeave={() => {
                  setHoveredDataPoint(null);
                }}
                label={{
                  position: 'top',
                  fill: '#fff',
                  fontSize: 10,
                  formatter: (value) => value > 300 ? value.toFixed(0) : '',
                }}
              >
                {animatedData.map((entry, i) => (
                  <Cell 
                    key={`cell-${i}`}
                    filter={hoveredDataPoint === i ? `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]})` : undefined}
                    style={{
                      transition: 'filter 0.3s ease',
                      opacity: hoveredDataPoint !== null && hoveredDataPoint !== i ? 0.7 : 1
                    }}
                  />
                ))}
              </Bar>
            ))}
            
            {showBrush && (
              <Brush 
                dataKey="name" 
                height={30} 
                stroke="#8884d8" 
                startIndex={0} 
                endIndex={Math.min(5, animatedData.length - 1)}
                y={320}
              />
            )}
          </BarChart>
        ) : chartType === 'area' ? (
          <AreaChart
            data={animatedData}
            className="animate-chart-fade-in"
            margin={{ top: 10, right: 20, left: 10, bottom: showBrush ? 40 : 10 }}
          >
            <defs>
              {fields.map((field, index) => (
                <linearGradient
                  key={`area-gradient-${field}`}
                  id={`areaGradient${index}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.6} />
            <XAxis
              dataKey="name"
              stroke="#aaa"
              tick={{ fontSize: 11, fill: '#fff' }}
            />
            <YAxis
              stroke="#aaa"
              tick={{ fontSize: 11, fill: '#fff' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={customLegendFormatter}
              layout="horizontal"
              verticalAlign="top"
            />
            {fields.map((field, index) => (
              <Area
                key={field}
                type="monotone"
                dataKey={field}
                name={field}
                stroke={COLORS[index % COLORS.length]}
                fillOpacity={1}
                fill={`url(#areaGradient${index})`}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={isAnimating}
              />
            ))}
            {showBrush && (
              <Brush 
                dataKey="name" 
                height={30} 
                stroke="#8884d8" 
                startIndex={0} 
                endIndex={Math.min(5, animatedData.length - 1)}
              />
            )}
          </AreaChart>
        ) : chartType === 'scatter' ? (
          <ScatterChart
            className="animate-chart-fade-in"
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.6} />
            <XAxis 
              dataKey={fields[0]} 
              name={fields[0]}
              stroke="#aaa"
              tick={{ fontSize: 11, fill: '#fff' }}
              tickLine={{ stroke: '#555' }}
              axisLine={{ stroke: '#555' }}
              type="number"
              label={{ value: fields[0], position: 'insideBottom', offset: -5, fill: '#aaa' }}
            />
            <YAxis 
              dataKey={fields[1]} 
              name={fields[1]}
              stroke="#aaa"
              tick={{ fontSize: 11, fill: '#fff' }}
              tickLine={{ stroke: '#555' }}
              axisLine={{ stroke: '#555' }}
              type="number"
              label={{ value: fields[1], angle: -90, position: 'insideLeft', fill: '#aaa' }}
            />
            {fields.length > 2 && (
              <ZAxis 
                dataKey={fields[2]} 
                range={[100, 500]} 
                name={fields[2]}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={customLegendFormatter}
              wrapperStyle={{
                paddingTop: 10,
                overflowX: 'auto',
                overflowY: 'hidden',
                whiteSpace: 'nowrap'
              }}
            />
            <Scatter 
              name={fields[0] || "Data Points"} 
              data={animatedData} 
              fill={COLORS[0]} 
              animationDuration={1500}
              animationEasing="ease-out"
              isAnimationActive={isAnimating}
            >
              {animatedData.map((entry, index) => (
                <Cell 
                  key={`scatter-cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    transition: 'filter 0.3s ease',
                    filter: hoveredDataPoint === index 
                      ? `drop-shadow(0 0 6px ${COLORS[index % COLORS.length]})` 
                      : 'none',
                  }}
                />
              ))}
            </Scatter>
          </ScatterChart>
        ) : chartType === 'radar' ? (
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius={150} 
            width={500} 
            height={400} 
            data={animatedData}
            className="animate-chart-fade-in"
          >
            <PolarGrid stroke="#555" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#fff' }} />
            <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#fff' }} />
            
            {fields.slice(0, 2).map((field, index) => (
              <Radar 
                key={field}
                name={field} 
                dataKey={field} 
                stroke={COLORS[index % COLORS.length]} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={0.5}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={isAnimating}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={customLegendFormatter} />
          </RadarChart>
        ) : chartType === 'composed' ? (
          <ComposedChart
            data={animatedData}
            className="animate-chart-fade-in"
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid stroke="#555" opacity={0.6} />
            <XAxis 
              dataKey="name" 
              stroke="#aaa"
              tick={{ fontSize: 11, fill: '#fff' }}
            />
            <YAxis 
              stroke="#aaa"
              tick={{ fontSize: 11, fill: '#fff' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={customLegendFormatter} />
            
            {fields.length > 0 && (
              <Area 
                type="monotone" 
                dataKey={fields[0]} 
                fill={`url(#areaGradient0)`} 
                stroke={COLORS[0]} 
                fillOpacity={0.3}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={isAnimating}
              />
            )}
            
            {fields.length > 1 && (
              <Bar 
                dataKey={fields[1]} 
                barSize={20} 
                fill={`url(#barGradient1)`}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={isAnimating}
              />
            )}
            
            {fields.length > 2 && (
              <Line 
                type="monotone" 
                dataKey={fields[2]} 
                stroke={COLORS[2]} 
                strokeWidth={2}
                dot={renderDot}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={isAnimating}
              />
            )}
          </ComposedChart>
        ) : (
          <PieChart 
            className="animate-chart-fade-in"
            style={{ 
              transform: isAnimating 
                ? `perspective(1200px) rotateY(${180 * (1 - animationProgress)}deg)` 
                : 'none',
              transition: 'transform 0.5s ease'
            }}
          >
            <defs>
              {COLORS.map((color, index) => (
                <radialGradient
                  key={`pie-gradient-${index}`}
                  id={`pieGradient${index}`}
                  cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                </radialGradient>
              ))}
            </defs>
            <Pie
              data={animatedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120 * animationProgress}
              innerRadius={60 * animationProgress}
              labelLine={false}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              animationDuration={1500}
              animationEasing="ease-out"
              isAnimationActive={isAnimating}
              onMouseEnter={(_, index) => {
                setActiveIndex(index);
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#pieGradient${index % COLORS.length})`}
                  style={{
                    filter: activeIndex === index 
                      ? `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]})` 
                      : `drop-shadow(0 0 3px ${COLORS[index % COLORS.length]})`,
                    transition: 'filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
                    opacity: activeIndex !== null && activeIndex !== index ? 0.6 : 1,
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value: any, name: any, entry: any) => {
                const fullName = entry.payload.fullName || name;
                return [
                  typeof value === 'number' ? value.toLocaleString() : value, 
                  fullName
                ];
              }}
            />
            <Legend 
              formatter={customLegendFormatter}
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{
                paddingTop: 20,
                overflowX: 'auto',
                overflowY: 'hidden',
                whiteSpace: 'nowrap',
                paddingLeft: 10, 
                paddingRight: 10
              }}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
      
      {showAdvancedControls && chartType !== 'pie' && chartType !== 'radar' && (
        <div className="absolute bottom-2 left-2 right-2 glass rounded-md p-2 text-xs text-white/70 grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <span className="text-white/50 mr-1">Dataset:</span>
            {chartData.length} records
          </div>
          <div>
            <span className="text-white/50 mr-1">Fields:</span>
            {fields.length}
          </div>
          <div>
            <span className="text-white/50 mr-1">
              Avg {fields[0]}:
            </span>
            {
              chartData.length > 0 && fields.length > 0
              ? (() => {
                  let sum = 0;
                  let count = 0;
                  
                  for (const item of chartData) {
                    if (typeof item === 'object' && item !== null && fields[0] in item) {
                      const numValue = typeof item[fields[0]] === 'number' 
                        ? item[fields[0]] 
                        : Number(item[fields[0]]);
                        
                      if (!isNaN(numValue)) {
                        sum += numValue;
                        count++;
                      }
                    }
                  }
                  
                  return count > 0 ? (sum / count).toFixed(1) : '0';
                })()
              : '0'
            }
          </div>
          <div>
            <span className="text-white/50 mr-1">
              {type === 'pie' ? 'Avg Value:' : `Max ${fields[0]}:`}
            </span>
            {
              chartData.length > 0 && fields.length > 0
              ? type === 'pie'
                ? (() => {
                    // Calculate the average for pie chart data
                    if (!chartData.length) return 0;
                    
                    const total = chartData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
                    return (total / chartData.length).toFixed(1);
                  })()
                : (() => {
                    let max = -Infinity;
                    
                    for (const item of chartData) {
                      if (typeof item === 'object' && item !== null && fields[0] in item) {
                        const numValue = typeof item[fields[0]] === 'number' 
                          ? item[fields[0]] 
                          : Number(item[fields[0]]);
                          
                        if (!isNaN(numValue) && numValue > max) {
                          max = numValue;
                        }
                      }
                    }
                    
                    return max !== -Infinity ? max.toFixed(1) : '0';
                  })()
              : '0'
            }
          </div>
        </div>
      )}
      
      {isAnimating && (
        <div className="absolute top-2 right-2 glass px-2 py-1 rounded-md text-xs text-white/80 animate-pulse">
          <span>Rendering visualization...</span>
        </div>
      )}
    </div>
  );
};

export default Charts;
