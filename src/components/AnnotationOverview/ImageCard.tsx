// src/components/ImageCard.tsx
import React, { KeyboardEvent } from "react";
import { Trash2 } from "lucide-react";
import type { UploadedImage } from "@/types/UploadImage";

interface ImageCardProps {
  img: UploadedImage;
  onSelect: (img: UploadedImage) => void;
  onDelete: (id: string) => void;
}

export default function ImageCard({ img, onSelect, onDelete }: ImageCardProps) {
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") onSelect(img);
  };

  return (
    <div className="relative bg-white rounded shadow-sm p-2">
      <button
        type="button"
        onClick={() => onDelete(img.id)}
        className="absolute top-1 right-1 bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100"
        aria-label="Delete image"
      >
        <Trash2 size={16} />
      </button>

      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer"
        onClick={() => onSelect(img)}
        onKeyDown={handleKey}
      >
        <img
          src={img.url}
          alt={img.name}
          className="w-full h-32 object-cover rounded border"
        />
        <p className="truncate mt-2 text-sm font-medium">{img.name}</p>
        {img.tags && img.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {img.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
