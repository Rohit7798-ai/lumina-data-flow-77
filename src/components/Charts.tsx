import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

type ChartsProps = {
  data: Array<Record<string, any>>;
  type: 'line' | 'bar' | 'pie';
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
  }, [data, type]);
  
  const chartData = React.useMemo(() => {
    if (!data.length) return [];
    
    if (type === 'pie') {
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
  }, [data, type]);
  
  const fields = React.useMemo(() => {
    if (!chartData.length) return [];
    const firstRow = chartData[0];
    return Object.keys(firstRow).filter(key => 
      key !== 'name' && 
      key !== 'id' && 
      key !== 'fullName'
    ).slice(0, 5);
  }, [chartData]);
  
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
        <div className="bg-black/90 p-3 rounded-md backdrop-blur-lg border border-white/20 shadow-xl">
          <p className="text-white text-sm font-medium mb-2">{fullName}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-item-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <p className="text-xs">
                  <span className="text-white/80 font-medium mr-1">
                    {entry.name}:
                  </span> 
                  <span className="text-white font-mono">
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
    const { cx, cy, index } = props;
    const isHovered = hoveredDataPoint === index;
    
    return (
      <circle 
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

  return (
    <div className={cn(
      "w-full h-[400px] rounded-xl overflow-hidden glass p-4 relative",
      "transition-all duration-500 ease-out hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
      className
    )}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart 
            data={animatedData}
            className="animate-chart-fade-in"
            style={{ 
              transform: isAnimating ? `perspective(1200px) rotateX(${5 * (1 - animationProgress)}deg)` : 'none',
              transition: 'transform 0.5s ease'
            }}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
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
            />
            <YAxis 
              stroke="#aaa" 
              tick={{ fontSize: 11, fill: '#fff' }}
              tickLine={{ stroke: '#555' }}
              axisLine={{ stroke: '#555' }}
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
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart 
            data={animatedData}
            className="animate-chart-fade-in"
            style={{ 
              transform: isAnimating ? `perspective(1200px) rotateX(${10 * (1 - animationProgress)}deg)` : 'none',
              transition: 'transform 0.5s ease' 
            }}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
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
            />
            <YAxis 
              stroke="#aaa" 
              tick={{ fontSize: 11, fill: '#fff' }}
              tickLine={{ stroke: '#555' }}
              axisLine={{ stroke: '#555' }}
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
              >
                {animatedData.map((entry, i) => (
                  <Cell 
                    key={`cell-${i}`}
                    filter={hoveredDataPoint === i ? `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]})` : undefined}
                    style={{
                      transition: 'filter 0.3s ease, opacity 0.3s ease',
                      opacity: hoveredDataPoint !== null && hoveredDataPoint !== i ? 0.7 : 1
                    }}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
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
              label={({ name, percent }) => 
                percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
              }
              animationDuration={1500}
              animationEasing="ease-out"
              isAnimationActive={isAnimating}
              onMouseEnter={(data, index) => {
                setHoveredDataPoint(index);
              }}
              onMouseLeave={() => {
                setHoveredDataPoint(null);
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#pieGradient${index % COLORS.length})`}
                  style={{
                    filter: hoveredDataPoint === index 
                      ? `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]})` 
                      : `drop-shadow(0 0 3px ${COLORS[index % COLORS.length]})`,
                    transition: 'filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
                    opacity: hoveredDataPoint !== null && hoveredDataPoint !== index ? 0.6 : 1,
                    transform: hoveredDataPoint === index ? 'scale(1.05)' : 'scale(1)'
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
      
      {isAnimating && (
        <div className="absolute top-2 right-2 glass px-2 py-1 rounded-md text-xs text-white/80 animate-pulse">
          <span>Rendering visualization...</span>
        </div>
      )}
    </div>
  );
};

export default Charts;
