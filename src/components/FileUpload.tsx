
import React, { useState, useRef } from 'react';
import { Upload, FileUp, FileType, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  onDataProcessed: (data: any[], fileName: string) => void;
};

const FileUpload = ({ onDataProcessed }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFileTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
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
      
      onDataProcessed(data, file.name);
      toast.success("Data processed successfully!");
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Error processing file. Please check the format.");
      toast.error("Error processing file");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={cn(
          "relative p-8 rounded-xl glass transition-all duration-300 border-2 border-dashed",
          isDragging ? "border-neon-blue" : "border-white/20",
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
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-2">
              <FileUp 
                className={cn(
                  "w-8 h-8 transition-transform duration-300",
                  isDragging ? "text-neon-blue scale-110" : "text-white/80"
                )} 
              />
            </div>
            <h3 className="text-xl font-semibold text-gradient">Upload Your Data</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Drag and drop your CSV or Excel file here, or click to browse files
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="mt-4 px-6 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-white transition-all duration-200 neon-border"
            >
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Select File
              </span>
            </button>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <FileType className="w-4 h-4" />
              <span>Supported formats: CSV, Excel</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-full glass p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileType className="w-6 h-6 text-neon-blue" />
                <div className="flex flex-col">
                  <span className="font-medium text-white">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 text-white/70 hover:text-white" />
              </button>
            </div>
            {isProcessing && (
              <div className="w-full bg-secondary/30 rounded-full h-1.5 mt-2">
                <div className="bg-neon-blue h-1.5 rounded-full animate-pulse w-full"></div>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/20 border border-destructive/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
