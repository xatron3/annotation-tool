// src/components/FabricCanvas/useFabricCanvas.ts
import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Annotation } from "@/types/Annotation";
import { FabricCanvasProps } from "@/types/FabricCanvas";
import { drawAnnotation, loadBackground } from "./canvasUtils";

/**
 * Custom hook to encapsulate Fabric.js setup and annotation logic.
 */
export function useFabricCanvas({
  imageUrl,
  imageId,
  initialAnnotations = [],
}: FabricCanvasProps) {
  const canvasRef = useRef<fabric.Canvas>();
  const canvasElRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<fabric.Point[]>([]);
  const [newAnnotations, setNewAnnotations] = useState<Annotation[]>([]);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Initialize Fabric canvas and load image & existing annotations
  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      selection: false,
      backgroundColor: "rgba(0,0,0,0.03)",
    });
    canvas.setWidth(CANVAS_WIDTH);
    canvas.setHeight(CANVAS_HEIGHT);
    canvasRef.current = canvas;

    loadBackground(canvas, imageUrl, CANVAS_WIDTH, CANVAS_HEIGHT, () => {
      initialAnnotations.forEach((anno) => drawAnnotation(canvas, anno));
    });

    return () => canvas.dispose();
  }, [imageUrl, initialAnnotations]);

  // Register mouse-down for drawing points
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (evt: fabric.IEvent<MouseEvent>) => {
      if (!isDrawing) return;
      const { x, y } = canvas.getPointer(evt.e);
      const pt = new fabric.Point(x, y);
      setPolygonPoints((pts) => [...pts, pt]);

      const circle = new fabric.Circle({
        left: x - 3,
        top: y - 3,
        radius: 3,
        fill: "red",
        selectable: false,
        evented: false,
        preview: true,
      });
      canvas.add(circle);
    };

    canvas.on("mouse:down", handleMouseDown);
    return () => void canvas.off("mouse:down", handleMouseDown);
  }, [isDrawing]);

  // Live preview of the in-progress polygon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getObjects().forEach((obj) => {
      if ((obj as any).preview) canvas.remove(obj);
    });
    if (polygonPoints.length < 2) return;
    const previewPoly = new fabric.Polygon(polygonPoints, {
      stroke: "red",
      strokeWidth: 2,
      fill: "rgba(255,0,0,0.2)",
      selectable: false,
      evented: false,
    });
    (previewPoly as any).preview = true;
    canvas.add(previewPoly);
  }, [polygonPoints]);

  // Handlers
  const handleStart = () => {
    setIsDrawing(true);
    setPolygonPoints([]);
  };
  const handleClose = () => {
    if (polygonPoints.length < 3)
      return alert("You need at least 3 points to close a polygon.");
    const label = prompt("Enter label for this shape:");
    if (!label) {
      resetDrawing();
      return;
    }
    const newAnno: Annotation = {
      label,
      points: polygonPoints.map((p) => ({ x: p.x, y: p.y })),
    };

    const canvas = canvasRef.current!;
    canvas.getObjects().forEach((obj) => {
      if ((obj as any).preview) canvas.remove(obj);
    });
    drawAnnotation(canvas, newAnno);
    setNewAnnotations((arr) => [...arr, newAnno]);
    resetDrawing();
  };
  const handleSave = async () => {
    if (!imageId) return alert("No imageId provided");
    try {
      const res = await fetch(`/api/annotations/${imageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotations: newAnnotations }),
      });
      alert(
        res.ok
          ? "Annotations saved successfully!"
          : "Failed to save annotations"
      );
    } catch (err) {
      console.error(err);
      alert("Error saving annotations");
    }
  };
  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.clear();
    setNewAnnotations([]);
    resetDrawing();
    loadBackground(canvas, imageUrl, CANVAS_WIDTH, CANVAS_HEIGHT, () => {
      initialAnnotations.forEach((anno) => drawAnnotation(canvas, anno));
    });
  };
  const resetDrawing = () => {
    setIsDrawing(false);
    setPolygonPoints([]);
  };

  return {
    canvasElRef,
    handleStart,
    handleClose,
    handleSave,
    handleReset,
    isDrawing,
    hasNew: newAnnotations.length > 0,
  };
}
