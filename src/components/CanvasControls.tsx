"use client";

import React from "react";

type CanvasControlsProps = {
  onStart: () => void;
  onClose: () => void;
  onSave: () => void;
  onReset: () => void;
  isDrawing: boolean;
  hasNewAnnotations: boolean;
  imageId?: string;
};

export default function CanvasControls({
  onStart,
  onClose,
  onSave,
  onReset,
  isDrawing,
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
        className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onClose}
        disabled={!isDrawing}
      >
        Close & Label
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
