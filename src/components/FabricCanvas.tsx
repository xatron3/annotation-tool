// src/components/FabricCanvas.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

type Props = {
  imageUrl: string;
};

export default function FabricCanvas({ imageUrl }: Props) {
  const canvasRef = useRef<fabric.Canvas>();
  const containerRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<fabric.Point[]>([]);

  // Desired canvas size
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Initialize Fabric canvas
  useEffect(() => {
    const canvasEl = containerRef.current;
    if (!canvasEl) return;

    // 1) Set DOM <canvas> size first:
    canvasEl.width = CANVAS_WIDTH;
    canvasEl.height = CANVAS_HEIGHT;

    // 2) Create the Fabric canvas:
    const canvas = new fabric.Canvas(canvasEl, {
      selection: false,
      backgroundColor: "rgba(0,0,0,0.03)",
    });
    canvas.setWidth(CANVAS_WIDTH);
    canvas.setHeight(CANVAS_HEIGHT);
    canvasRef.current = canvas;

    // 3) Load the uploaded image via a plain Image() so we can
    //    be sure it’s available before fabric wraps it.
    const imgEl = new Image();
    imgEl.src = imageUrl;

    imgEl.onload = () => {
      // Wrap it in a Fabric image
      const bg = new fabric.Image(imgEl, {
        selectable: false,
        evented: false,
        originX: "left",
        originY: "top",
      });

      // Scale it to fit
      const scale = Math.min(
        CANVAS_WIDTH / bg.width!,
        CANVAS_HEIGHT / bg.height!
      );
      bg.scale(scale);

      // Assign as background and render
      canvas.backgroundImage = bg;
      canvas.renderAll();
    };

    imgEl.onerror = () => {
      console.error("Failed to load image", imageUrl);
    };

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  // Handle clicks to add points
  useEffect(() => {
    const canvas = canvasRef.current!;
    const handleClick = (evt: fabric.IEvent<Event>) => {
      if (!isDrawing) return;
      const pointer = canvas.getPointer(evt.e);
      const pt = new fabric.Point(pointer.x, pointer.y);
      setPolygonPoints((pts) => [...pts, pt]);

      const circle = new fabric.Circle({
        left: pt.x - 3,
        top: pt.y - 3,
        radius: 3,
        fill: "red",
        selectable: false,
        evented: false,
      });
      canvas.add(circle);
    };
    canvas.on("mouse:down", handleClick);
    return () => void canvas.off("mouse:down", handleClick);
  }, [isDrawing]);

  // Draw/update polygon
  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.getObjects("polygon").forEach((o) => canvas.remove(o));
    if (polygonPoints.length < 2) return;

    const poly = new fabric.Polygon(polygonPoints, {
      stroke: "red",
      strokeWidth: 2,
      fill: "rgba(255,0,0,0.2)",
      selectable: false,
      objectCaching: false,
    });
    canvas.add(poly);
  }, [polygonPoints]);

  const closePolygon = () => {
    if (polygonPoints.length < 3) return alert("Need at least 3 points");
    const canvas = canvasRef.current!;
    const label = prompt("Enter label for this shape:");
    if (label) {
      const xs = polygonPoints.map((p) => p.x);
      const ys = polygonPoints.map((p) => p.y);
      const centroid = new fabric.Point(
        xs.reduce((a, b) => a + b) / xs.length,
        ys.reduce((a, b) => a + b) / ys.length
      );
      const text = new fabric.Text(label, {
        left: centroid.x,
        top: centroid.y,
        fill: "white",
        fontSize: 16,
        selectable: false,
        evented: false,
      });
      canvas.add(text);
    }
    setIsDrawing(false);
  };

  const resetDrawing = () => {
    const canvas = canvasRef.current!;
    canvas.clear();
    setPolygonPoints([]);
    setIsDrawing(false);

    fabric.Image.fromURL(imageUrl, (img) => {
      img.set({ selectable: false });

      // Compute scale to fit the canvas
      const scale = Math.min(
        CANVAS_WIDTH / img.width!,
        CANVAS_HEIGHT / img.height!
      );
      img.scale(scale);

      // Position the image at the top-left corner
      img.set({ originX: "left", originY: "top", left: 0, top: 0 });

      // Set the background image and render the canvas
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  };

  return (
    <div className="space-y-2">
      <div className="space-x-2">
        <button
          className="px-3 py-1 bg-green-600 text-white rounded"
          onClick={() => {
            setPolygonPoints([]);
            setIsDrawing(true);
          }}
        >
          Start Polygon
        </button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={closePolygon}
          disabled={!isDrawing}
        >
          Close & Label
        </button>
        <button
          className="px-3 py-1 bg-gray-600 text-white rounded"
          onClick={resetDrawing}
        >
          Reset
        </button>
      </div>
      <canvas
        ref={containerRef}
        className="border"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
    </div>
  );
}
