"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/lib/uploadthing";
import { OurFileRouter } from "@/app/api/uploadthing/core";
interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: keyof OurFileRouter;
}

export function FileUpload({ onChange, endpoint }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  return (
    <div className="relative">
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    <UploadButton
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
            setIsUploading(false);
          // Do something with the response
          if (res && res[0]) {
            const fileUrl = res[0].url;
            onChange(fileUrl);
            toast({
              title: "Success",
              description: "File uploaded successfully",
            });
          }
        }}

        onUploadError={(error: Error) => {
          setIsUploading(false);
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
          toast({
            title: "Error",
            description: error.message || "Failed to upload file",
            variant: "destructive",
          });
        }}
      />
    </div>

  );
} 