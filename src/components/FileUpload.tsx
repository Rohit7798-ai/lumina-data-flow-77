
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileUp, FileType, X, AlertCircle, Check, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DataCleaner from './DataCleaner';

type FileUploadProps = {
  onDataProcessed: (data: any[], fileName: string) => void;
};

const FileUpload = ({ onDataProcessed }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [showDataCleaner, setShowDataCleaner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFileTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!supportedFileTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload a CSV or Excel file.");
      toast.error("Unsupported file type");
      return;
    }
    
    setFile(file);
    setIsProcessing(true);
    setUploadProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 200);
    
    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const headers = rows[0].split(',').map(header => header.trim());
      
      const data = rows.slice(1).map(row => {
        const values = row.split(',').map(value => value.trim());
        const rowData: Record<string, string | number> = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          rowData[header] = isNaN(Number(value)) ? value : Number(value);
        });
        
        return rowData;
      });
      
      // Complete the progress animation
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Store the parsed data
      setParsedData(data);
      
      // Show the data cleaning UI
      setShowDataCleaner(true);
      setIsProcessing(false);
      toast.success("Data loaded successfully. You can now clean your data!");
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error processing file:", error);
      setError("Error processing file. Please check the format.");
      toast.error("Error processing file");
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelCleaning = () => {
    setShowDataCleaner(false);
    // Process the uncleaned data directly if user cancels cleaning
    if (parsedData.length > 0 && file) {
      onDataProcessed(parsedData, file.name);
    }
  };
  
  const handleDataCleaned = (cleanedData: Record<string, any>[], fileName: string) => {
    setShowDataCleaner(false);
    onDataProcessed(cleanedData, fileName);
    toast.success("Cleaned data processed successfully!");
  };

  return (
    <div className={cn(
      "w-full max-w-3xl mx-auto transition-all duration-700 transform",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    )}>
      {showDataCleaner && parsedData.length > 0 && file ? (
        <DataCleaner 
          data={parsedData}
          fileName={file.name}
          onDataCleaned={handleDataCleaned}
          onCancel={handleCancelCleaning}
        />
      ) : (
        <div 
          className={cn(
            "relative p-8 rounded-xl glass transition-all duration-300 border-2 border-dashed",
            isDragging ? "border-neon-blue scale-[1.02] shadow-lg shadow-neon-blue/20" : "border-white/20", 
            file ? "border-solid border-neon-purple/50" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        
        {!file ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-2 
              hover:shadow-lg hover:shadow-neon-blue/20 transition-all duration-300
              group">
              <FileUp 
                className={cn(
                  "w-8 h-8 transition-all duration-300",
                  isDragging ? "text-neon-blue scale-110" : "text-white/80 group-hover:text-neon-cyan"
                )} 
              />
            </div>
            <h3 className="text-xl font-bold text-gradient tracking-wide">Upload Your Data</h3>
            <p className="text-muted-foreground text-center max-w-md font-light leading-relaxed">
              Drag and drop your CSV or Excel file here, or click to browse files
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="mt-4 px-8 py-3 rounded-lg bg-primary/20 hover:bg-primary/30 text-white transition-all duration-300 neon-border
                hover:shadow-lg hover:shadow-primary/20 hover:scale-105 group overflow-hidden relative"
            >
              <span className="flex items-center gap-3 text-lg font-medium">
                <Upload className="w-5 h-5 group-hover:animate-bounce" />
                Select File
              </span>
              <span className="absolute inset-0 w-full h-full bg-white/10 scale-0 rounded-lg 
                group-hover:scale-100 group-hover:opacity-0 transition-all duration-500 origin-center"></span>
            </button>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <FileType className="w-4 h-4" />
              <span>Supported formats: CSV, Excel</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-full glass p-4 rounded-lg flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FileType className="w-6 h-6 text-neon-blue" />
                  {uploadProgress === 100 && (
                    <div className="absolute -right-1 -bottom-1 bg-neon-green rounded-full p-0.5 animate-scale-in">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 text-white/70 hover:text-white" />
              </button>
            </div>
            
            {isProcessing && (
              <div className="w-full space-y-2 animate-fade-in">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Processing...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-neon-blue to-neon-purple h-1.5 rounded-full"
                    style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease-out' }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/20 border border-destructive/30 rounded-lg flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default FileUpload;
