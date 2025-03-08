import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Loader2 } from "lucide-react";
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
          description: "File uploaded successfully",
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
        className={`p-2 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden border-2 ${isDragActive ? 'border-blue-500' : 'border-gray-300'} transition duration-300 ease-in-out`}
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

        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload file
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Drag or drop your files here or click to upload
          </p>
          {uploadedUrl && (
            <div className="relative w-full mt-4 mx-auto flex flex-col items-center justify-center">
              <p className="text-sm text-green-600">File uploaded successfully!</p>
              {previewUrl && <Image src={previewUrl} alt="Preview" width={100} height={100} className="mt-2 rounded-md shadow-md " />}
            </div>
          )}
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md shadow-md border border-gray-200",
                    "shadow-sm"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Remove file"
                    >
                      <IconX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
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
