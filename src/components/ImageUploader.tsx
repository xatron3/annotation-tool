// src/components/ImageUploader.tsx
"use client";

import { useState } from "react";

export default function ImageUploader() {
  const [image, setImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {image && (
        <div className="border rounded overflow-hidden w-fit max-w-full">
          <img src={image} alt="Uploaded" className="max-w-full h-auto" />
        </div>
      )}
    </div>
  );
}
