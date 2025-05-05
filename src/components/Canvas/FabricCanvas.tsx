"use client";

import React, { useState } from "react";
import CanvasControls from "./Controls";
import { useFabricCanvas } from "./useFabricCanvas";
import { FabricCanvasProps } from "@/types/FabricCanvas";

export default function FabricCanvas(props: FabricCanvasProps) {
  const { canvasElRef, handleStart, handleSave, handleReset, hasNew } =
    useFabricCanvas(props);
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      {/* Modal Container */}
      <div className="relative bg-white p-6 rounded-2xl shadow-xl max-w-[90vw] max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Canvas Wrapper with Padding */}
        <div className="w-full h-full p-2 bg-gray-50 rounded-lg">
          <canvas
            ref={canvasElRef}
            className="w-full h-[60vh] md:h-[70vh] border border-gray-200 rounded-lg"
          />
        </div>

        {/* Overlay Controls */}
        <div className="absolute top-6 left-6 bg-white bg-opacity-90 p-2 rounded-md flex space-x-2 shadow-md">
          <CanvasControls
            onStart={handleStart}
            onSave={handleSave}
            onReset={handleReset}
            hasNewAnnotations={hasNew}
            imageId={props.imageId}
          />
        </div>
      </div>
    </div>
  );
}
