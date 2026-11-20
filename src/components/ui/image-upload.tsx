"use client";

import { type ChangeEvent, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
};

export function ImageUpload({
  value,
  onChange,
  label = "Profile image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      onChange(data.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          {value && <AvatarImage src={value} alt="Profile preview" />}
          <AvatarFallback>
            <Upload className="size-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <label
          className={cn(
            "inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-secondary",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Uploading…" : "Choose image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={uploading}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}
