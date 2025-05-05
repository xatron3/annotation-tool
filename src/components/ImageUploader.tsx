"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const FabricCanvas = dynamic(() => import("./FabricCanvas"), {
  ssr: false,
});

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
      {image && <FabricCanvas imageUrl={image} />}
    </div>
  );
}
