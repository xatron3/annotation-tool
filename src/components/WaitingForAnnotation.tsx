"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

export type UploadedImage = {
  id: string;
  name: string;
  url: string;
  tags?: string[]; // new optional tags field
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
        <div key={img.id} className="relative bg-white rounded shadow-sm p-2">
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
            <p className="truncate mt-2 text-sm font-medium">{img.name}</p>
            {img.tags && img.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {img.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
