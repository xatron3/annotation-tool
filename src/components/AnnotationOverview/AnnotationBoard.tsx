// src/components/AnnotationBoard.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { UploadedImage } from "@/types/UploadImage";
import Filters from "./Filters";
import ImageGrid from "./ImageGrid";

type AnnotationFilter = "" | "with" | "without";

export interface WaitingProps {
  onSelect: (img: UploadedImage) => void;
  refreshTrigger?: number;
}

export default function AnnotationBoard({
  onSelect,
  refreshTrigger = 0,
}: WaitingProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [annotationFilter, setAnnotationFilter] =
    useState<AnnotationFilter>("");

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/images");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch images");
      }
      const data: UploadedImage[] = await res.json();
      setImages(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages, refreshTrigger]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete image");
      }
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error(err);
      window.alert("Could not delete image");
    }
  }, []);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach((img) =>
      img.tags?.forEach((t) => (counts[t] = (counts[t] || 0) + 1))
    );
    return counts;
  }, [images]);

  const annotationCounts = useMemo(() => {
    const withCount = images.reduce(
      (cnt, img) => cnt + ((img.annotations?.length || 0) > 0 ? 1 : 0),
      0
    );
    return { with: withCount, without: images.length - withCount };
  }, [images]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (selectedTag && !img.tags?.includes(selectedTag)) return false;
      if (annotationFilter === "with" && !(img.annotations?.length || 0))
        return false;
      if (annotationFilter === "without" && (img.annotations?.length || 0) > 0)
        return false;
      return true;
    });
  }, [images, selectedTag, annotationFilter]);

  if (loading) return <p>Loading images…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <>
      <Filters
        selectedTag={selectedTag}
        annotationFilter={annotationFilter}
        tagCounts={tagCounts}
        annotationCounts={annotationCounts}
        totalCount={images.length}
        onTagChange={setSelectedTag}
        onAnnotationFilterChange={setAnnotationFilter}
      />
      <ImageGrid
        images={filteredImages}
        onSelect={onSelect}
        onDelete={handleDelete}
      />
    </>
  );
}
