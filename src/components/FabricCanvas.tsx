"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import CanvasControls from "./CanvasControls";

export type Annotation = {
  id?: string;
  label: string;
  points: { x: number; y: number }[];
};

type Props = {
  imageUrl: string;
  imageId?: string;
  initialAnnotations?: Annotation[];
};

export default function FabricCanvas({
  imageUrl,
  imageId,
  initialAnnotations = [],
}: Props) {
  const canvasRef = useRef<fabric.Canvas>();
  const canvasElRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<fabric.Point[]>([]);
  const [newAnnotations, setNewAnnotations] = useState<Annotation[]>([]);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Helper to draw one annotation on the canvas
  const drawAnnotation = (canvas: fabric.Canvas, anno: Annotation) => {
    const pts = anno.points.map((p) => new fabric.Point(p.x, p.y));
    const poly = new fabric.Polygon(pts, {
      stroke: "yellow",
      strokeWidth: 2,
      fill: "rgba(255,255,0,0.3)",
      selectable: false,
      evented: false,
    });
    canvas.add(poly);

    const xs = anno.points.map((p) => p.x);
    const ys = anno.points.map((p) => p.y);
    const centroid = new fabric.Point(
      xs.reduce((a, b) => a + b) / xs.length,
      ys.reduce((a, b) => a + b) / ys.length
    );
    const text = new fabric.Text(anno.label, {
      left: centroid.x,
      top: centroid.y,
      fill: "white",
      fontSize: 16,
      selectable: false,
      evented: false,
    });
    canvas.add(text);
  };

  // Initialize Fabric canvas and draw existing annotations
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      selection: false,
      backgroundColor: "rgba(0,0,0,0.03)",
    });
    canvas.setWidth(CANVAS_WIDTH);
    canvas.setHeight(CANVAS_HEIGHT);
    canvasRef.current = canvas;

    // Load background image and draw initialAnnotations
    const imgEl = new Image();
    imgEl.src = imageUrl;
    imgEl.onload = () => {
      const bg = new fabric.Image(imgEl, {
        selectable: false,
        evented: false,
        originX: "left",
        originY: "top",
      });
      const scale = Math.min(
        CANVAS_WIDTH / bg.width!,
        CANVAS_HEIGHT / bg.height!
      );
      bg.scale(scale);

      // assign directly to the property
      canvas.backgroundImage = bg;
      canvas.renderAll();

      initialAnnotations.forEach((anno) => drawAnnotation(canvas, anno));
    };
    imgEl.onerror = () => console.error("Failed to load image", imageUrl);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl, initialAnnotations]);

  // Handle clicks when drawing
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

  // Live-preview of the polygon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // remove old preview items
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

  // Close polygon, get label, commit it
  const handleClose = () => {
    if (polygonPoints.length < 3) {
      return alert("You need at least 3 points to close a polygon.");
    }
    const label = prompt("Enter label for this shape:");
    if (!label) {
      setIsDrawing(false);
      setPolygonPoints([]);
      return;
    }

    const newAnno: Annotation = {
      label,
      points: polygonPoints.map((p) => ({ x: p.x, y: p.y })),
    };

    const canvas = canvasRef.current!;
    // clear preview bits
    canvas.getObjects().forEach((obj) => {
      if ((obj as any).preview) canvas.remove(obj);
    });

    drawAnnotation(canvas, newAnno);
    setNewAnnotations((arr) => [...arr, newAnno]);
    setIsDrawing(false);
    setPolygonPoints([]);
  };

  // Save only new annotations
  const handleSave = async () => {
    if (!imageId) return alert("No imageId provided");
    try {
      const res = await fetch(`/api/annotations/${imageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotations: newAnnotations }),
      });
      if (res.ok) alert("Annotations saved successfully!");
      else alert("Failed to save annotations");
    } catch (err) {
      console.error(err);
      alert("Error saving annotations");
    }
  };

  // Reset canvas back to initial state
  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.clear();
    setPolygonPoints([]);
    setIsDrawing(false);
    setNewAnnotations([]);

    fabric.Image.fromURL(imageUrl, (img) => {
      img.set({
        selectable: false,
        evented: false,
        originX: "left",
        originY: "top",
      });
      const scale = Math.min(
        CANVAS_WIDTH / img.width!,
        CANVAS_HEIGHT / img.height!
      );
      img.scale(scale);

      canvas.backgroundImage = img;
      canvas.renderAll();

      initialAnnotations.forEach((anno) => drawAnnotation(canvas, anno));
    });
  };

  return (
    <div className="space-y-2">
      <CanvasControls
        onStart={() => {
          setIsDrawing(true);
          setPolygonPoints([]);
        }}
        onClose={handleClose}
        onSave={handleSave}
        onReset={handleReset}
        isDrawing={isDrawing}
        hasNewAnnotations={newAnnotations.length > 0}
        imageId={imageId}
      />

      <canvas
        ref={canvasElRef}
        className="border"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
    </div>
  );
}
