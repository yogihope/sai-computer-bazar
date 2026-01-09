"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "marketing",
  label = "Image",
  placeholder = "Choose image from your PC",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPG, PNG, SVG, and WebP are allowed.");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onChange(data.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {value ? (
        <div className="relative">
          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-muted">
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{value}</p>
        </div>
      ) : (
        <div
          className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{placeholder}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, SVG, WebP (max 2MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
