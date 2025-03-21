import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { uploadImage } from "@/lib/api/external-bank-accounts";

// Define permitted file types
const PERMITTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint?: string; // Made optional for backward compatibility
  bankAccountId?: string; // Added for our custom implementation
}

export const FileUpload = ({
  onChange,
  endpoint,
  bankAccountId = "temp", // Default value for new accounts
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    // Validate file type and size
    if (newFiles.length > 0) {
      const file = newFiles[0];

      // Check file type
      if (!PERMITTED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, WebP image, or PDF document",
          variant: "destructive",
        });
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "File size exceeds 5MB limit",
          variant: "destructive",
        });
        return;
      }

      setFiles(newFiles);

      // Create preview for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, idx) => idx !== index);
    setFiles(updatedFiles);
    if (updatedFiles.length === 0) {
      setUploadedUrl("");
      setPreviewUrl(null);
      onChange(undefined);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Set up a progress tracking interval to simulate progress
      // (since our uploadImage doesn't have real-time progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until complete
        });
      }, 300);

      const result = await uploadImage(selectedFiles[0], bankAccountId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Handle successful upload
      if (result.data?.url) {
        setUploadedUrl(result.data.url);
        onChange(result.data.url);
        toast({
          title: "Success",
          description: "File uploaded successfully!",
          variant: "success",
        });
        
        // Set preview URL for image files
        if (selectedFiles[0].type.startsWith("image/")) {
          setPreviewUrl(result.data.url);
        }
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

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles) => {
      handleFileChange(acceptedFiles);
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles);
      }
    },
    onDropRejected: (fileRejections) => {
      const errorMessage = fileRejections[0]?.errors[0]?.message || "File upload rejected";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'application/pdf': []
    },
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className={`p-4 rounded-lg cursor-pointer w-full relative overflow-hidden border ${isDragActive ? 'border-blue-500' : 'border-gray-300'} transition duration-300 ease-in-out`}
      >
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
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files || []);
            handleFileChange(newFiles);
            if (newFiles.length > 0) {
              handleUpload(newFiles);
            }
          }}
          className="hidden"
          accept={PERMITTED_FILE_TYPES.join(",")}
        />

        <div className="flex flex-col items-center justify-center">
          <p className="relative font-medium text-neutral-700 dark:text-neutral-300 text-base">
            Upload file
          </p>

          {!uploadedUrl && !files.length && (
            <p className="relative font-normal text-neutral-500 dark:text-neutral-400 text-sm mt-2">
              Drag or drop your files here or click to upload
            </p>
          )}

          {uploadedUrl && (
            <div className="w-full mt-2 text-center">
              <p className="text-sm text-green-600">File uploaded successfully!</p>
              {previewUrl && (
                <div className="relative mt-3 flex justify-center">
                  <div className="border rounded-md overflow-hidden">
                    <Image src={previewUrl} alt="Preview" width={240} height={160} className="object-contain" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles([]);
                      setUploadedUrl("");
                      setPreviewUrl(null);
                      onChange(undefined);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {files.length > 0 && (
            <div className="w-full mt-4 border-t pt-3 space-y-1">
              {files.map((file, idx) => (
                <div
                  key={`file-${idx}`}
                  className="flex flex-col w-full"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(idx);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex text-xs text-neutral-500 mt-1 space-x-2">
                    <span>{file.type}</span>
                    <span>modified {new Date(file.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${index % 2 === 0
                ? "bg-gray-50 dark:bg-neutral-950"
                : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
                }`}
            />
          );
        })
      )}
    </div>
  );
}
