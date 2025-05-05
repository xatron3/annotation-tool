"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { UploadedImage } from "@/types/UploadImage";

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

  const [selectedTag, setSelectedTag] = useState<string>("");
  const [annotationFilter, setAnnotationFilter] = useState<
    "" | "with" | "without"
  >("");

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

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach((img) =>
      img.tags?.forEach((t) => (counts[t] = (counts[t] || 0) + 1))
    );
    return counts;
  }, [images]);

  // compute annotationCounts
  const annotationCounts = useMemo(() => {
    const withCount = images.filter((i) => i.annotations?.length! > 0).length;
    return {
      with: withCount,
      without: images.length - withCount,
    };
  }, [images]);

  // **single** filteredImages that applies both filters
  const filteredImages = useMemo(() => {
    return images
      .filter((img) => {
        // tag filter
        if (selectedTag && !img.tags?.includes(selectedTag)) return false;
        return true;
      })
      .filter((img) => {
        // annotation filter
        if (annotationFilter === "with") {
          return img.annotations?.length! > 0;
        }
        if (annotationFilter === "without") {
          return !img.annotations || img.annotations.length === 0;
        }
        return true;
      });
  }, [images, selectedTag, annotationFilter]);

  if (loading) return <p>Loading images…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (filteredImages.length === 0)
    return <p className="text-gray-500">No images pending.</p>;

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex space-x-4">
        <select
          className="border rounded px-3 py-2"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">All tags ({images.length})</option>
          {Object.entries(tagCounts).map(([tag, count]) => (
            <option key={tag} value={tag}>
              {tag} ({count})
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={annotationFilter}
          onChange={(e) =>
            setAnnotationFilter(e.target.value as "" | "with" | "without")
          }
        >
          <option value="">All images ({images.length})</option>
          <option value="with">
            With annotations ({annotationCounts.with})
          </option>
          <option value="without">
            Without annotations ({annotationCounts.without})
          </option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {filteredImages.map((img) => (
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
    </>
  );
}
