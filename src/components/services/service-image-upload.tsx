"use client";

import { useState } from "react";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";

export function ServiceImageUpload() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <div className="space-y-1 sm:col-span-2">
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      <MultiImageUpload
        values={images}
        onChange={setImages}
        label="Service Cover & Gallery Images"
      />
    </div>
  );
}
