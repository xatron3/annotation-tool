// src/components/FabricCanvas/AnnotationDrawer.ts
import * as fabric from "fabric";
import { Annotation } from "@/types/Annotation";

export class AnnotationDrawer {
  private canvas: fabric.Canvas;
  private points: fabric.Point[] = [];
  private markers: fabric.Circle[] = [];
  private lines: fabric.Line[] = [];
  private previewLine?: fabric.Line;
  private label: string;
  private onComplete: (anno: Annotation) => void;
  private closeThreshold = 10; // pixels

  constructor(
    canvas: fabric.Canvas,
    label: string,
    onComplete: (anno: Annotation) => void
  ) {
    this.canvas = canvas;
    this.label = label;
    this.onComplete = onComplete;
    this.enable();
  }

  private enable() {
    this.canvas.defaultCursor = "crosshair";
    this.canvas.on("mouse:down", this.onMouseDown);
    this.canvas.on("mouse:move", this.onMouseMove);
  }

  private disable() {
    this.canvas.defaultCursor = "default";
    this.canvas.off("mouse:down", this.onMouseDown);
    this.canvas.off("mouse:move", this.onMouseMove);
    this.clearPreview();
  }

  private onMouseDown = (opt: fabric.IEvent<MouseEvent>) => {
    const pointer = this.canvas.getPointer(opt.e!);
    const point = new fabric.Point(pointer.x, pointer.y);

    // 1) If preview exists, clear it so next move will re-create from this new point
    if (this.previewLine) {
      this.canvas.remove(this.previewLine);
      this.previewLine = undefined;
    }

    // 2) If closing the polygon, finish
    if (this.points.length >= 3 && this.isNearFirst(point)) {
      this.finishDrawing();
      return;
    }

    // 3) Save the click
    this.points.push(point);

    // 4) Draw the small yellow handle
    const marker = new fabric.Circle({
      left: point.x - 4,
      top: point.y - 4,
      radius: 4,
      fill: "red",
      selectable: false,
      evented: false,
    });
    this.canvas.add(marker);
    this.markers.push(marker);

    // 5) If there’s a previous point, draw a solid line to this one
    if (this.points.length > 1) {
      const prev = this.points[this.points.length - 2];
      const line = new fabric.Line([prev.x, prev.y, point.x, point.y], {
        stroke: "red",
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });
      this.canvas.add(line);
      this.lines.push(line);
    }
  };

  private onMouseMove = (opt: fabric.IEvent<MouseEvent>) => {
    if (this.points.length === 0) return;
    const pointer = this.canvas.getPointer(opt.e!);
    // always grab the very last point you stored
    const last = this.points[this.points.length - 1];

    if (this.previewLine) {
      // just update the end‐point
      this.previewLine.set({ x2: pointer.x, y2: pointer.y });
    } else {
      // first time, create it from last → pointer
      this.previewLine = new fabric.Line(
        [last.x, last.y, pointer.x, pointer.y],
        {
          stroke: "red",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5],
        }
      );
      this.canvas.add(this.previewLine);
    }

    this.canvas.renderAll();
  };

  private isNearFirst(p: fabric.Point) {
    const first = this.points[0];
    const dx = p.x - first.x;
    const dy = p.y - first.y;
    return Math.hypot(dx, dy) < this.closeThreshold;
  }

  private clearPreview() {
    if (this.previewLine) {
      this.canvas.remove(this.previewLine);
      this.previewLine = undefined;
    }
  }

  private finishDrawing() {
    // Remove helper objects
    this.markers.forEach((m) => this.canvas.remove(m));
    this.lines.forEach((l) => this.canvas.remove(l));
    this.clearPreview();

    // Create polygon
    const poly = new fabric.Polygon(this.points, {
      stroke: "yellow",
      strokeWidth: 2,
      fill: "rgba(255,255,0,0.3)",
      selectable: false,
      evented: false,
    });
    this.canvas.add(poly);

    // Centroid for label
    const xs = this.points.map((p) => p.x);
    const ys = this.points.map((p) => p.y);
    const centroid = new fabric.Point(
      xs.reduce((a, b) => a + b, 0) / xs.length,
      ys.reduce((a, b) => a + b, 0) / ys.length
    );

    const text = new fabric.Text(this.label, {
      left: centroid.x,
      top: centroid.y,
      fill: "white",
      fontSize: 16,
      selectable: false,
      evented: false,
    });
    this.canvas.add(text);

    // Notify consumer
    const annotation: Annotation = {
      label: this.label,
      points: this.points.map((p) => ({ x: p.x, y: p.y })),
    };
    this.onComplete(annotation);

    // Reset and disable
    this.points = [];
    this.markers = [];
    this.lines = [];
    this.disable();
  }
}
