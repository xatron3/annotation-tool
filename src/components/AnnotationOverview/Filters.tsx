// src/components/Filters.tsx
import React from "react";

type AnnotationFilter = "" | "with" | "without";

interface FiltersProps {
  selectedTag: string;
  annotationFilter: AnnotationFilter;
  tagCounts: Record<string, number>;
  annotationCounts: { with: number; without: number };
  totalCount: number;
  onTagChange: (tag: string) => void;
  onAnnotationFilterChange: (filter: AnnotationFilter) => void;
}

export default function Filters({
  selectedTag,
  annotationFilter,
  tagCounts,
  annotationCounts,
  totalCount,
  onTagChange,
  onAnnotationFilterChange,
}: FiltersProps) {
  return (
    <div className="mb-4 flex space-x-4">
      <select
        className="border rounded px-3 py-2"
        value={selectedTag}
        onChange={(e) => onTagChange(e.target.value)}
      >
        <option value="">All tags ({totalCount})</option>
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
          onAnnotationFilterChange(e.target.value as AnnotationFilter)
        }
      >
        <option value="">All images ({totalCount})</option>
        <option value="with">With annotations ({annotationCounts.with})</option>
        <option value="without">
          Without annotations ({annotationCounts.without})
        </option>
      </select>
    </div>
  );
}
