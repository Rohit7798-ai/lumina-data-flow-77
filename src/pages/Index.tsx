
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import DataVisualization from '@/components/DataVisualization';
import DataSummary from '@/components/DataSummary';
import Charts from '@/components/Charts';
import Dashboard from '@/components/Dashboard';
import FilterPanel from '@/components/FilterPanel';
import useDataProcessing from '@/hooks/useDataProcessing';
import { BarChart3, PieChart, Database, Github, SunMoon, LineChart, Info, Filter as FilterIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const Index = () => {
  const { 
    rawData,
    filteredData,
    fileName,
    statistics,
    visualizationData,
    isProcessing,
    processData,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    availableColumns
  } = useDataProcessing();
  
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleChartTypeChange = (value: string) => {
    setChartType(value as 'line' | 'bar' | 'pie');
    toast(`Chart type changed to ${value}`);
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/10 py-4 px-6 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-neon-cyan animate-pulse-glow" />
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-br from-neon-cyan via-neon-blue to-neon-purple bg-clip-text text-transparent">
                LuminaViz
              </span>
            </h1>
          </div>
          
          <TooltipProvider>
            <nav className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View on GitHub</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <SunMoon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme</p>
                </TooltipContent>
              </Tooltip>
            </nav>
          </TooltipProvider>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          {rawData.length === 0 && (
            <div className="text-center py-12">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                <span className="bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink bg-clip-text text-transparent">
                  Transform Your Data
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-8">
                Upload your data and explore powerful visualizations with detailed insights
              </p>
            </div>
          )}
          
          {/* File Upload Section */}
          <section className={cn(
            "transition-all duration-300",
            rawData.length > 0 ? "opacity-75 hover:opacity-100" : ""
          )}>
            <FileUpload onDataProcessed={processData} />
          </section>
          
          {/* Visualization Section */}
          {(rawData.length > 0 || isProcessing) && (
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                    Data Visualization
                  </h2>
                  
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-white/10">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="glass border-white/20 text-white w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium text-neon-cyan">Data Exploration Tools</h4>
                        <p className="text-xs text-white/80">Switch between chart types, apply filters, and hover over data points for detailed information.</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                {/* Chart Controls */}
                <div className="flex flex-wrap gap-4">
                  {/* Filter Toggle Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            setShowFilters(!showFilters);
                            if (!showFilters) {
                              toast.info('Filter panel opened');
                            }
                          }}
                          variant="outline" 
                          className={cn(
                            "glass px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
                            showFilters ? "bg-white/20 border-neon-purple/50" : "hover:bg-white/10"
                          )}
                        >
                          <FilterIcon className="h-4 w-4 text-neon-purple" />
                          {showFilters ? "Hide Filters" : "Show Filters"} 
                          {filters.length > 0 && (
                            <span className="glass px-2 py-0.5 rounded-full text-xs bg-neon-purple/20">{filters.length}</span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{showFilters ? "Hide filter options" : "Show filter options"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Chart Type Selector */}
                  <TooltipProvider>
                    <div className="glass px-4 py-2 rounded-lg">
                      <RadioGroup 
                        value={chartType} 
                        onValueChange={handleChartTypeChange}
                        className="flex items-center gap-4"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem id="line" value="line" />
                              <label htmlFor="line" className="text-sm cursor-pointer flex items-center gap-1">
                                <LineChart className="h-4 w-4 text-neon-blue" />
                                <span>Line</span>
                              </label>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Best for trends over time</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem id="bar" value="bar" />
                              <label htmlFor="bar" className="text-sm cursor-pointer flex items-center gap-1">
                                <BarChart3 className="h-4 w-4 text-neon-cyan" />
                                <span>Bar</span>
                              </label>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Best for comparing values</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem id="pie" value="pie" />
                              <label htmlFor="pie" className="text-sm cursor-pointer flex items-center gap-1">
                                <PieChart className="h-4 w-4 text-neon-pink" />
                                <span>Pie</span>
                              </label>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Best for showing proportions</p>
                          </TooltipContent>
                        </Tooltip>
                      </RadioGroup>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Filters Panel */}
              {showFilters && (
                <div className="animate-chart-fade-in">
                  <FilterPanel
                    columns={availableColumns}
                    onAddFilter={addFilter}
                    onRemoveFilter={removeFilter}
                    onClearFilters={clearFilters}
                    activeFilters={filters}
                    className="mb-4 glass"
                  />
                </div>
              )}
              
              {/* Data Dashboard */}
              <Dashboard
                data={filteredData}
                statistics={statistics}
                isLoading={isProcessing}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 relative">
                  <Charts 
                    data={filteredData}
                    type={chartType}
                    isLoading={isProcessing}
                    className="h-[500px]"
                  />
                </div>
                
                <div className="space-y-6">
                  <DataSummary 
                    fileName={fileName}
                    rowCount={filteredData.length}
                    statistics={statistics}
                    isLoading={isProcessing}
                  />
                </div>
              </div>
              
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent">
                    3D Data Visualization
                  </h3>
                  
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-white/10">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="glass border-white/20 text-white w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium text-neon-cyan">Interactive 3D View</h4>
                        <p className="text-xs text-white/80">Click and drag to rotate the visualization. Zoom with the mouse wheel for a closer look at data points.</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <DataVisualization 
                  data={visualizationData}
                  isLoading={isProcessing}
                  className="h-[400px] w-full"
                />
              </div>
            </section>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 LuminaViz. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-neon-cyan transition-colors">Privacy</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Terms</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
