"use client";

import { type ChangeEvent, useState } from "react";
import Image from "next/image";
import { LoaderCircle, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface MultiImageUploadProps {
  values?: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  values = [],
  onChange,
  label = "Service Images",
  maxImages = 8,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (values.length + files.length > maxImages) {
      toast.error(`You can upload at most ${maxImages} images`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to upload image");
        if (data.url) newUrls.push(data.url);
      }

      onChange([...values, ...newUrls]);
      toast.success(`${newUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function handleRemove(indexToRemove: number) {
    const updated = values.filter((_, index) => index !== indexToRemove);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label}{" "}
          <span className="text-xs text-muted-foreground font-normal">
            ({values.length}/{maxImages})
          </span>
        </label>
      </div>

      {/* Grid of uploaded images + upload button */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {values.map((url, index) => (
          <div
            key={url + index}
            className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-secondary shadow-xs"
          >
            <Image
              src={url}
              alt={`Service image ${index + 1}`}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
            {index === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-xs">
                Cover
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(index)}
                className="size-8 p-0 rounded-full"
                title="Remove image"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {values.length < maxImages && (
          <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-input bg-background/50 hover:bg-secondary/50 transition-colors p-3 text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                <LoaderCircle className="size-5 animate-spin text-primary" />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                <div className="rounded-full bg-secondary p-2">
                  <Plus className="size-4 text-foreground" />
                </div>
                <span className="font-medium text-foreground">Add Image</span>
                <span className="text-[11px]">Multiple supported</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              disabled={uploading}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {values.length === 0 && !uploading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ImageIcon className="size-3.5" />
          No images added yet. Click &quot;Add Image&quot; to upload your service photos.
        </p>
      )}
    </div>
  );
}
