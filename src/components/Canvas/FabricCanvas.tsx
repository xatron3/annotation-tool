"use client";

import React from "react";
import CanvasControls from "./CanvasControls";
import { useFabricCanvas } from "./useFabricCanvas";
import { FabricCanvasProps } from "@/types/FabricCanvas";

export default function FabricCanvas(props: FabricCanvasProps) {
  const {
    canvasElRef,
    handleStart,
    handleClose,
    handleSave,
    handleReset,
    isDrawing,
    hasNew,
  } = useFabricCanvas(props);

  return (
    <div className="space-y-2">
      <CanvasControls
        onStart={handleStart}
        onClose={handleClose}
        onSave={handleSave}
        onReset={handleReset}
        isDrawing={isDrawing}
        hasNewAnnotations={hasNew}
        imageId={props.imageId}
      />
      <canvas ref={canvasElRef} className="border" width={800} height={600} />
    </div>
  );
}
