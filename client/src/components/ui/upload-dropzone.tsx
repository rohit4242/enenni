"use client";

import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { uploadImage } from "@/lib/api/external-bank-accounts";
import { Button } from "./button";

interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint?: string; // Made optional for backward compatibility
  bankAccountId?: string; // Added for our custom implementation
}

export function FileUpload({ 
  onChange, 
  endpoint, 
  bankAccountId = "temp" // Default value for new accounts
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Set up a progress tracking interval to simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until complete
        });
      }, 300);
      
      const result = await uploadImage(selectedFile, bankAccountId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Handle successful upload
      if (result.data?.url) {
        onChange(result.data.url);
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
      } else {
        console.error("Missing URL in response:", result);
        throw new Error("No URL returned from upload");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {uploadProgress > 0 && (
            <div className="w-full max-w-xs mt-4">
              <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center mt-1">{Math.round(uploadProgress)}%</p>
            </div>
          )}
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
      />
      
      <Button 
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
      >
        <Upload className="h-4 w-4" />
        Upload File
      </Button>
      
      {file && (
        <p className="text-sm text-muted-foreground mt-2">
          Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  );
} 