"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react"; // you can use any icon library

export type UploadedImage = {
  id: string;
  name: string;
  url: string;
};

interface WaitingProps {
  onSelect: (img: UploadedImage) => void;
  refreshTrigger?: number;
}

export default function WaitingForAnnotation({
  onSelect,
  refreshTrigger = 0,
}: WaitingProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/images");
      if (!res.ok) throw new Error(await res.text());
      setImages(await res.json());
    } catch (err: any) {
      setError(err.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error(await res.text());
      }
      // Optimistically remove from UI
      setImages((imgs) => imgs.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete image");
    }
  };

  if (loading) return <p>Loading images…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (images.length === 0)
    return <p className="text-gray-500">No images pending.</p>;

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {images.map((img) => (
        <div key={img.id} className="relative">
          <button
            onClick={() => handleDelete(img.id)}
            className="absolute top-1 right-1 bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <div className="cursor-pointer" onClick={() => onSelect(img)}>
            <img
              src={img.url}
              alt={img.name}
              className="w-full h-32 object-cover rounded border"
            />
            <p className="truncate mt-1 text-sm">{img.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
