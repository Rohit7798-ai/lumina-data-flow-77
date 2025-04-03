
import React from 'react';
import { BarChart, FileText, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type DataSummaryProps = {
  fileName: string;
  rowCount: number;
  statistics: any[];
  isLoading?: boolean;
};

const DataSummary = ({ fileName, rowCount, statistics, isLoading = false }: DataSummaryProps) => {
  if (isLoading) {
    return (
      <div className="w-full glass p-6 rounded-lg animate-pulse">
        <div className="h-6 w-3/4 bg-white/10 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 w-1/2 bg-white/10 rounded"></div>
          <div className="h-4 w-2/3 bg-white/10 rounded"></div>
          <div className="h-4 w-1/3 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!fileName || statistics.length === 0) {
    return null;
  }

  return (
    <div className="w-full glass p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="text-neon-blue" />
          <h3 className="text-xl font-semibold text-gradient">Data Summary</h3>
        </div>
        <span className="text-xs text-muted-foreground px-2 py-1 glass rounded-md">
          {rowCount} Rows
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground mb-6">
        File: <span className="text-white">{fileName}</span>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart className="w-4 h-4 text-neon-cyan" />
            <h4 className="font-medium">Data Metrics</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statistics.map((stat, index) => (
              <div 
                key={index}
                className="neo-blur p-4 rounded-lg"
              >
                <h5 className="text-sm font-medium mb-2 text-white/90">{stat.column}</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Min</div>
                    <div className="text-neon-cyan font-mono">{stat.min.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Max</div>
                    <div className="text-neon-pink font-mono">{stat.max.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Average</div>
                    <div className="text-white font-mono">{stat.avg.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">StdDev</div>
                    <div className="text-neon-purple font-mono">{stat.stdDev.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-neon-pink" />
            <h4 className="font-medium">Quick Insights</h4>
          </div>
          
          <div className="neo-blur p-4 rounded-lg text-sm text-muted-foreground">
            {statistics.length > 0 ? (
              <ul className="space-y-1.5 list-disc pl-4">
                {statistics.filter(stat => stat.max > stat.min * 2).map((stat, i) => (
                  <li key={i}>
                    <span className="text-neon-cyan">{stat.column}</span> has a wide range of values 
                    (variance: {(stat.stdDev / stat.avg * 100).toFixed(1)}%)
                  </li>
                ))}
                {statistics.filter(stat => stat.max < stat.min * 1.5).map((stat, i) => (
                  <li key={i}>
                    <span className="text-neon-pink">{stat.column}</span> has low variance 
                    (variance: {(stat.stdDev / stat.avg * 100).toFixed(1)}%)
                  </li>
                ))}
                {statistics.length === 0 && (
                  <li>No numerical data available for analysis</li>
                )}
              </ul>
            ) : (
              <p>No insights available. Upload data to analyze.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSummary;
