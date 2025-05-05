// src/components/FabricCanvas/utils.ts
import * as fabric from "fabric";
import { Annotation } from "@/types/Annotation";

/**
 * Draws a finalized annotation (polygon and label) on the given canvas.
 */
export function drawAnnotation(canvas: fabric.Canvas, anno: Annotation) {
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
}

/**
 * Loads and scales the background image into the canvas, then invokes callback.
 * Uses a standard HTMLImageElement to ensure proper loading and CORS handling.
 */
export function loadBackground(
  canvas: fabric.Canvas,
  imageUrl: string,
  width: number,
  height: number,
  onLoaded: () => void
) {
  const imgEl = new Image();
  imgEl.crossOrigin = "anonymous";
  imgEl.src = imageUrl;
  imgEl.onload = () => {
    const bg = new fabric.Image(imgEl, {
      selectable: false,
      evented: false,
      originX: "left",
      originY: "top",
    });
    const scale = Math.min(width / bg.width!, height / bg.height!);
    bg.scale(scale);
    canvas.backgroundImage = bg;
    canvas.renderAll();
    onLoaded();
  };
  imgEl.onerror = () => {
    console.error("Failed to load image", imageUrl);
  };
}
