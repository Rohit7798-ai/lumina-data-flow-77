
import React, { useState, useEffect } from 'react';
import { dataCleaner, type CleaningOptions } from '@/utils/dataCleaner';
import { Check, AlertTriangle, X, Code, Database, Sigma, RefreshCw, Wand2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DataCleanerProps {
  data: Record<string, any>[];
  fileName: string;
  onDataCleaned: (cleanedData: Record<string, any>[], fileName: string) => void;
  onCancel: () => void;
}

interface CleaningResult {
  originalRowCount: number;
  cleanedRowCount: number;
  duplicatesRemoved: number;
  nullsFixed: number;
  typosFixed: number;
  outliersDealtwith: number;
  columnResults: Array<{
    column: string;
    cleanedValues: number;
    fixedIssues: Array<{
      type: string;
      row: number;
      originalValue: any;
      newValue: any;
    }>;
  }>;
}

const DataCleaner: React.FC<DataCleanerProps> = ({
  data,
  fileName,
  onDataCleaned,
  onCancel
}) => {
  const [cleaningOptions, setCleaningOptions] = useState<CleaningOptions>({
    removeNulls: true,
    removeDuplicates: true,
    normalizeText: true,
    fixTypos: true,
    handleOutliers: false,
    standardizeFormats: true,
    inferMissingValues: false
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cleanedData, setCleanedData] = useState<Record<string, any>[]>([]);
  const [cleaningResult, setCleaningResult] = useState<CleaningResult | null>(null);
  const [showIssueDetails, setShowIssueDetails] = useState(false);
  const [issuePreviewLimit, setIssuePreviewLimit] = useState(5);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Start progress monitoring when cleaning begins
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        const currentProgress = dataCleaner.getProgress();
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isProcessing]);
  
  const handleOptionChange = (option: keyof CleaningOptions) => {
    setCleaningOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const validateApiKey = (key: string) => {
    // Simple validation to ensure key isn't empty and has a valid format
    // In a real app, you would validate this with Google's API
    if (!key.trim()) {
      setApiKeyError('API key is required');
      return false;
    }
    
    if (key.length < 20) {
      setApiKeyError('API key seems too short');
      return false;
    }
    
    setApiKeyError(null);
    return true;
  };
  
  const handleCleanData = async () => {
    if (!validateApiKey(apiKey)) {
      return;
    }
    
    if (!data || data.length === 0) {
      toast.error('No data to clean');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(0);
      
      // Save the API key to the cleaner service
      dataCleaner.setApiKey(apiKey);
      
      // Process data through the cleaner
      const result = await dataCleaner.cleanData(data, cleaningOptions);
      
      setCleanedData(result.cleanedData);
      setCleaningResult({
        originalRowCount: result.originalRowCount,
        cleanedRowCount: result.cleanedRowCount,
        duplicatesRemoved: result.duplicatesRemoved,
        nullsFixed: result.nullsFixed,
        typosFixed: result.typosFixed,
        outliersDealtwith: result.outliersDealtwith,
        columnResults: result.columnResults
      });
      
      setProgress(100);
      toast.success('Data cleaning complete');
    } catch (error) {
      console.error('Error cleaning data:', error);
      toast.error('Error cleaning data');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleApplyChanges = () => {
    if (cleanedData.length === 0) {
      toast.error('No cleaned data to apply');
      return;
    }
    
    // Create a new filename to indicate the data has been cleaned
    const newFileName = fileName.includes('_cleaned') 
      ? fileName
      : `${fileName.split('.')[0]}_cleaned.${fileName.split('.')[1] || 'csv'}`;
    
    onDataCleaned(cleanedData, newFileName);
    toast.success('Cleaned data applied successfully');
  };
  
  const getTotalIssuesFixed = () => {
    if (!cleaningResult) return 0;
    return (
      cleaningResult.duplicatesRemoved +
      cleaningResult.nullsFixed +
      cleaningResult.typosFixed +
      cleaningResult.outliersDealtwith
    );
  };
  
  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'null_value': return 'border-orange-600 bg-orange-500/20';
      case 'typo': return 'border-purple-600 bg-purple-500/20';
      case 'outlier': return 'border-red-600 bg-red-500/20';
      case 'normalization': return 'border-blue-600 bg-blue-500/20';
      case 'format_standardization': return 'border-green-600 bg-green-500/20';
      default: return 'border-gray-600 bg-gray-500/20';
    }
  };
  
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return <span className="text-gray-400">null</span>;
    if (value === '') return <span className="text-gray-400">[empty string]</span>;
    return String(value);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto glass rounded-xl overflow-hidden border border-white/10">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              <Wand2 className="w-6 h-6 inline-block mr-2 text-neon-blue" />
              Clean Data with Gemini AI
            </h2>
            <p className="text-white/60 text-sm">
              Automatically clean and normalize your data using Google's Gemini AI
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onCancel}
            className="hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {!cleaningResult ? (
          <>
            {/* API Key Input */}
            <div className="mb-6 glass p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-neon-cyan" />
                Gemini API Key
              </h3>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-neon-blue disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your Gemini API key"
                  disabled={isProcessing}
                />
              </div>
              {apiKeyError && (
                <p className="text-red-400 text-xs mt-1">{apiKeyError}</p>
              )}
              <p className="text-xs text-white/40 mt-1.5">
                Your API key is required to use the Gemini AI cleaning features. It will not be stored.
              </p>
            </div>
            
            {/* Cleaning Options */}
            <div className="mb-6 glass p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sigma className="h-4 w-4 text-neon-pink" />
                Cleaning Options
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Remove Duplicates</p>
                    <p className="text-xs text-white/60">Remove duplicate rows from data</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.removeDuplicates}
                    onCheckedChange={() => handleOptionChange('removeDuplicates')}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Fix Missing Values</p>
                    <p className="text-xs text-white/60">Replace null/empty values</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.removeNulls}
                    onCheckedChange={() => handleOptionChange('removeNulls')}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Fix Typos</p>
                    <p className="text-xs text-white/60">Correct common spelling errors</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.fixTypos}
                    onCheckedChange={() => handleOptionChange('fixTypos')}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Normalize Text</p>
                    <p className="text-xs text-white/60">Standardize capitalization and spacing</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.normalizeText}
                    onCheckedChange={() => handleOptionChange('normalizeText')}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Handle Outliers</p>
                    <p className="text-xs text-white/60">Address statistical outliers in data</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.handleOutliers}
                    onCheckedChange={() => handleOptionChange('handleOutliers')}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Standardize Formats</p>
                    <p className="text-xs text-white/60">Convert dates and numbers to standard format</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.standardizeFormats}
                    onCheckedChange={() => handleOptionChange('standardizeFormats')}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Infer Missing Values</p>
                    <p className="text-xs text-white/60">Use AI to guess appropriate values</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.inferMissingValues}
                    onCheckedChange={() => handleOptionChange('inferMissingValues')}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
            
            {/* Data Preview */}
            <div className="mb-6 glass p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-neon-blue" />
                Data Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60">File Name:</p>
                  <p className="font-mono">{fileName}</p>
                </div>
                <div>
                  <p className="text-white/60">Row Count:</p>
                  <p className="font-mono">{data.length.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/60">Column Count:</p>
                  <p className="font-mono">{data.length > 0 ? Object.keys(data[0]).length : 0}</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={onCancel} 
                disabled={isProcessing}
                className="hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCleanData} 
                disabled={isProcessing || !apiKey}
                className="bg-gradient-to-r from-neon-blue to-neon-purple"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Clean Data
                  </>
                )}
              </Button>
            </div>
            
            {/* Progress Bar (shown during processing) */}
            {isProcessing && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Cleaning in progress...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Results Display */}
            <div className="mb-6 glass p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Cleaning Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="neo-blur p-3 rounded-lg text-center">
                  <p className="text-xs text-white/60 mb-1">Original Rows</p>
                  <p className="text-2xl font-mono font-bold text-neon-blue">
                    {cleaningResult.originalRowCount.toLocaleString()}
                  </p>
                </div>
                <div className="neo-blur p-3 rounded-lg text-center">
                  <p className="text-xs text-white/60 mb-1">Cleaned Rows</p>
                  <p className="text-2xl font-mono font-bold text-neon-cyan">
                    {cleaningResult.cleanedRowCount.toLocaleString()}
                  </p>
                </div>
                <div className="neo-blur p-3 rounded-lg text-center">
                  <p className="text-xs text-white/60 mb-1">Issues Fixed</p>
                  <p className="text-2xl font-mono font-bold text-neon-pink">
                    {getTotalIssuesFixed().toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Detailed Results */}
              <div className="glass p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Cleaning Details</h4>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIssueDetails(!showIssueDetails)}
                    className="text-xs"
                  >
                    {showIssueDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div className="glass p-2 rounded-lg">
                    <p className="text-xs text-white/60">Duplicates Removed</p>
                    <p className="font-mono font-bold text-neon-blue">
                      {cleaningResult.duplicatesRemoved.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass p-2 rounded-lg">
                    <p className="text-xs text-white/60">Nulls Fixed</p>
                    <p className="font-mono font-bold text-neon-cyan">
                      {cleaningResult.nullsFixed.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass p-2 rounded-lg">
                    <p className="text-xs text-white/60">Typos Fixed</p>
                    <p className="font-mono font-bold text-neon-pink">
                      {cleaningResult.typosFixed.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass p-2 rounded-lg">
                    <p className="text-xs text-white/60">Outliers Handled</p>
                    <p className="font-mono font-bold text-neon-purple">
                      {cleaningResult.outliersDealtwith.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {showIssueDetails && (
                  <div className="mt-4 mb-2 space-y-4">
                    <h5 className="text-sm font-medium">Issues Fixed by Column</h5>
                    <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                      {cleaningResult.columnResults
                        .filter(col => col.fixedIssues.length > 0)
                        .map((column, idx) => (
                          <div key={idx} className="glass p-3 rounded-lg">
                            <h6 className="font-medium text-sm mb-2 flex justify-between">
                              <span className="text-neon-cyan">{column.column}</span>
                              <span className="text-white/70 text-xs">{column.cleanedValues} issues fixed</span>
                            </h6>
                            
                            <div className="space-y-2 text-xs">
                              {column.fixedIssues.slice(0, issuePreviewLimit).map((issue, idx) => (
                                <div 
                                  key={idx}
                                  className={cn(
                                    "p-2 rounded border-l-2 glass",
                                    getIssueTypeColor(issue.type)
                                  )}
                                >
                                  <div className="flex justify-between mb-1">
                                    <span className="capitalize text-white/80">
                                      {issue.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-white/60">
                                      Row {issue.row + 1}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-white/40 text-xs">Before:</p>
                                      <p className="font-mono">{formatValue(issue.originalValue)}</p>
                                    </div>
                                    <div>
                                      <p className="text-white/40 text-xs">After:</p>
                                      <p className="font-mono text-neon-green">{formatValue(issue.newValue)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {column.fixedIssues.length > issuePreviewLimit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-xs text-white/60 hover:text-white"
                                  onClick={() => setIssuePreviewLimit(prev => prev + 5)}
                                >
                                  Show more issues...
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={onCancel}
                className="hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyChanges}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Cleaned Data
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataCleaner;
