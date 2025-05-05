"use client";

import React from "react";

type CanvasControlsProps = {
  onStart: () => void;
  onSave: () => void;
  onReset: () => void;
  hasNewAnnotations: boolean;
  imageId?: string;
};

export default function CanvasControls({
  onStart,
  onSave,
  onReset,
  hasNewAnnotations,
  imageId,
}: CanvasControlsProps) {
  return (
    <div className="space-x-2">
      <button
        className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onStart}
      >
        Start Polygon
      </button>

      <button
        className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onSave}
        disabled={!imageId || !hasNewAnnotations}
      >
        Save Annotations
      </button>
      <button
        className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
