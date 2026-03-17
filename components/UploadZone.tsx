'use client';

import React, { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6">
      <div 
        className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 
          ${isDragActive ? 'border-blue-500 bg-white/4' : 'border-white/20 hover:border-blue-500 hover:bg-white/4'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('csv-upload')?.click()}
      >
        <UploadCloud className="w-12 h-12 text-white/50 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Ingest Portfolio Data</h2>
        <p className="text-muted text-sm mb-6">Drag and drop your project CSV file here, or click to browse.</p>
        
        <div className="bg-[#0F1117] rounded-xl p-4 text-left inline-block w-full max-w-lg overflow-x-auto border border-white/5">
          <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">Required Column Schema (Flexible Match)</p>
          <pre className="text-[11px] font-mono text-white/60">
            Project Name, Owner, Start Date, End Date, % Complete,<br/>
            Budget, Actual Spend, Status, Notes
          </pre>
        </div>

        <input 
          id="csv-upload" 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
