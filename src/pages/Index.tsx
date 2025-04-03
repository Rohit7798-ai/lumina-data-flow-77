
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import DataVisualization from '@/components/DataVisualization';
import DataSummary from '@/components/DataSummary';
import Charts from '@/components/Charts';
import useDataProcessing from '@/hooks/useDataProcessing';
import { BarChart3, PieChart, ScatterChart, Database, Github, SunMoon, LineChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Index = () => {
  const { 
    rawData,
    fileName,
    statistics,
    visualizationData,
    isProcessing,
    processData
  } = useDataProcessing();
  
  const [visType, setVisType] = useState<'scatter' | 'bar'>('scatter');
  const [chartType, setChartType] = useState<'3d' | 'line' | 'bar' | 'pie'>('3d');
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/10 py-4 px-6 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-neon-blue animate-pulse-glow" />
            <h1 className="text-xl font-bold text-gradient">
              Lumina<span className="text-neon-cyan">Viz</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <a 
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <SunMoon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          {rawData.length === 0 && (
            <div className="text-center py-12">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                <span className="text-gradient">Transform Your Data</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-8">
                Upload your data and explore powerful visualizations with detailed insights
              </p>
            </div>
          )}
          
          {/* File Upload Section */}
          <section className={cn(
            "transition-all duration-300",
            rawData.length > 0 ? "opacity-50 hover:opacity-100" : ""
          )}>
            <FileUpload onDataProcessed={processData} />
          </section>
          
          {/* Visualization Section */}
          {(rawData.length > 0 || isProcessing) && (
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <h2 className="text-2xl font-bold text-gradient">Data Visualization</h2>
                
                {/* Chart Type Selector */}
                <div className="glass px-4 py-3 rounded-lg">
                  <RadioGroup 
                    value={chartType} 
                    onValueChange={(value) => setChartType(value as any)}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="3d" value="3d" />
                      <label htmlFor="3d" className="text-sm cursor-pointer flex items-center gap-1">
                        <ScatterChart className="h-4 w-4" />
                        <span>3D</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="line" value="line" />
                      <label htmlFor="line" className="text-sm cursor-pointer flex items-center gap-1">
                        <LineChart className="h-4 w-4" />
                        <span>Line</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="bar" value="bar" />
                      <label htmlFor="bar" className="text-sm cursor-pointer flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>Bar</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="pie" value="pie" />
                      <label htmlFor="pie" className="text-sm cursor-pointer flex items-center gap-1">
                        <PieChart className="h-4 w-4" />
                        <span>Pie</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* 3D Visualization Type Selector (only show if 3D is selected) */}
                {chartType === '3d' && (
                  <div className="glass px-2 py-1 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setVisType('scatter')}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          visType === 'scatter' 
                            ? "bg-neon-purple/20 text-neon-purple" 
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <ScatterChart className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setVisType('bar')}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          visType === 'bar' 
                            ? "bg-neon-cyan/20 text-neon-cyan" 
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 relative">
                  {chartType === '3d' ? (
                    <DataVisualization 
                      data={visualizationData}
                      type={visType}
                      isLoading={isProcessing}
                      className="h-[500px]"
                    />
                  ) : (
                    <Charts 
                      data={rawData}
                      type={chartType as 'line' | 'bar' | 'pie'}
                      isLoading={isProcessing}
                      className="h-[500px]"
                    />
                  )}
                  
                  {chartType === '3d' && (
                    <div className="absolute bottom-4 left-4 glass px-3 py-1 rounded-md text-xs text-white/70">
                      <span>Tip: Click and drag to rotate. Scroll to zoom.</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <DataSummary 
                    fileName={fileName}
                    rowCount={rawData.length}
                    statistics={statistics}
                    isLoading={isProcessing}
                  />
                </div>
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
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
