// src/components/ImageGrid.tsx
import React from "react";
import type { UploadedImage } from "@/types/UploadImage";
import ImageCard from "./ImageCard";

interface ImageGridProps {
  images: UploadedImage[];
  onSelect: (img: UploadedImage) => void;
  onDelete: (id: string) => void;
}

export default function ImageGrid({
  images,
  onSelect,
  onDelete,
}: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((img) => (
        <ImageCard
          key={img.id}
          img={img}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
