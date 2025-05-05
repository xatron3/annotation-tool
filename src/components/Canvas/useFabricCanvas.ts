import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Annotation } from "@/types/Annotation";
import { FabricCanvasProps } from "@/types/FabricCanvas";
import { drawAnnotation, loadBackground } from "./utils";
import { AnnotationDrawer } from "./AnnotationDrawer";

/**
 * Custom hook to encapsulate Fabric.js setup and annotation logic, with full-screen canvas
 */
export function useFabricCanvas({
  imageUrl,
  imageId,
  initialAnnotations = [],
}: FabricCanvasProps) {
  const canvasRef = useRef<fabric.Canvas>();
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const drawerRef = useRef<AnnotationDrawer | null>(null);

  const [newAnnotations, setNewAnnotations] = useState<Annotation[]>([]);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      setDimensions({ width: innerWidth, height: innerHeight });
      if (canvasRef.current) {
        canvasRef.current.setWidth(innerWidth);
        canvasRef.current.setHeight(innerHeight);
        canvasRef.current.renderAll();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize Fabric canvas and load image & existing annotations
  useEffect(() => {
    if (!canvasElRef.current) return;
    // apply full-screen CSS to canvas element
    canvasElRef.current.style.position = "absolute";
    canvasElRef.current.style.top = "0";
    canvasElRef.current.style.left = "0";
    canvasElRef.current.style.width = "100vw";
    canvasElRef.current.style.height = "100vh";

    const canvas = new fabric.Canvas(canvasElRef.current, {
      selection: false,
      backgroundColor: "rgba(0,0,0,0.03)",
    });
    canvas.setWidth(dimensions.width);
    canvas.setHeight(dimensions.height);
    canvasRef.current = canvas;

    // load image and draw annotations
    loadBackground(
      canvas,
      imageUrl,
      dimensions.width,
      dimensions.height,
      () => {
        initialAnnotations.forEach((anno) => drawAnnotation(canvas, anno));
      }
    );

    return () => canvas.dispose();
  }, [imageUrl, initialAnnotations, dimensions]);

  const handleStart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return alert("Canvas is not ready");
    const label = prompt("Enter label for this shape:");
    if (!label) return;
    drawerRef.current = new AnnotationDrawer(
      canvas,
      label,
      (anno: Annotation) => {
        drawAnnotation(canvas, anno);
        setNewAnnotations((arr) => [...arr, anno]);
      }
    );
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
    drawerRef.current = null;
    loadBackground(
      canvas,
      imageUrl,
      dimensions.width,
      dimensions.height,
      () => {
        initialAnnotations.forEach((anno) => drawAnnotation(canvas, anno));
      }
    );
  };

  return {
    canvasElRef,
    handleStart,
    handleSave,
    handleReset,
    isDrawing: !!drawerRef.current,
    hasNew: newAnnotations.length > 0,
  };
}
