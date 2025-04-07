
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  ArrowUp, ArrowDown, ChevronDown, Sliders, 
  BarChart, LineChart, PieChart, ChartScatter, 
  BookOpen, Wand2, Download, Share2, PanelLeft,
  ChartArea, AreaChart, Radar, GitCompare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChartControlsProps {
  onTypeChange?: (type: string) => void;
  onToggleBrush?: () => void;
  onToggleControls?: () => void;
  showBrush?: boolean;
  showControls?: boolean;
  chartType?: string;
  className?: string;
  hasData?: boolean;
}

const CHART_TYPES = [
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'bar', label: 'Bar Chart', icon: BarChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'scatter', label: 'Scatter Plot', icon: ChartScatter },
  { value: 'area', label: 'Area Chart', icon: ChartArea },
  { value: 'radar', label: 'Radar Chart', icon: Radar },
  { value: 'composed', label: 'Composed Chart', icon: GitCompare },
];

const COLOR_SCHEMES = [
  { value: 'default', label: 'Default' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'monochrome', label: 'Monochrome' },
  { value: 'rainbow', label: 'Rainbow' },
];

export function ChartControls({
  onTypeChange,
  onToggleBrush,
  onToggleControls,
  showBrush = false,
  showControls = true,
  chartType = 'line',
  className,
  hasData = true
}: ChartControlsProps) {
  const currentChartType = CHART_TYPES.find(type => type.value === chartType) || CHART_TYPES[0];
  const ChartIcon = currentChartType.icon;

  // Find functions for common chart operations
  const handleExport = () => {
    if (!hasData) return;
    
    // Get the chart SVG element
    const chartElement = document.querySelector('.recharts-surface');
    if (!chartElement) return;
    
    try {
      // Create a blob from the SVG
      const svgData = new XMLSerializer().serializeToString(chartElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(svgBlob);
      downloadLink.download = `chart-export-${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  return (
    <div className={cn(
      "flex flex-wrap justify-between items-center gap-2 mb-4",
      className
    )}>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="glass p-1.5 rounded-md hover:bg-white/10 text-white text-sm flex items-center gap-1.5 transition-colors">
              <ChartIcon className="h-3.5 w-3.5" />
              <span>{currentChartType.label}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-xl border border-white/10 text-white">
            <DropdownMenuLabel>Chart Type</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {CHART_TYPES.map(type => (
              <DropdownMenuItem 
                key={type.value}
                onClick={() => onTypeChange && onTypeChange(type.value)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  chartType === type.value && "bg-white/10"
                )}
              >
                <type.icon className="h-4 w-4" />
                <span>{type.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="glass p-1.5 rounded-md hover:bg-white/10 text-white text-sm flex items-center gap-1.5 transition-colors">
              <Sliders className="h-3.5 w-3.5" />
              <span>Options</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-xl border border-white/10 text-white">
            <DropdownMenuLabel>Chart Options</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={() => onToggleBrush && onToggleBrush()}
              className="cursor-pointer"
            >
              {showBrush ? 'Hide Time Selector' : 'Show Time Selector'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onToggleControls && onToggleControls()}
              className="cursor-pointer"
            >
              {showControls ? 'Hide Advanced Controls' : 'Show Advanced Controls'}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
            {COLOR_SCHEMES.map(scheme => (
              <DropdownMenuItem key={scheme.value} className="cursor-pointer">
                {scheme.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className={cn(
                  "glass p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                  !hasData && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleExport}
                disabled={!hasData}
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
              <p>Export Chart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className={cn(
                  "glass p-1.5 rounded-md hover:bg-white/10 text-white transition-colors",
                  !hasData && "opacity-50 cursor-not-allowed"
                )}
                disabled={!hasData}
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
              <p>Share Chart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="glass p-1.5 rounded-md hover:bg-white/10 text-white transition-colors">
                <Wand2 className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
              <p>Auto-enhance Chart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="glass p-1.5 rounded-md hover:bg-white/10 text-white transition-colors">
                <BookOpen className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
              <p>View Chart Documentation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default ChartControls;
