import * as fabric from "fabric";
import { Annotation } from "@/types/Annotation";

export class AnnotationDrawer {
  private canvas: fabric.Canvas;
  private points: fabric.Point[] = [];
  private markers: fabric.Circle[] = [];
  private lines: fabric.Line[] = [];
  private previewLine?: fabric.Line;
  private label: string;
  private closeThreshold = 10; // pixels

  constructor(canvas: fabric.Canvas, label: string) {
    this.canvas = canvas;
    this.label = label;
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

  private onMouseDown = (opt: fabric.TEvent) => {
    const pointer = this.canvas.getPointer(opt.e!);
    const point = new fabric.Point(pointer.x, pointer.y);

    // If close to the first point and at least 3 points exist, finish drawing
    if (this.points.length >= 3 && this.isNearFirst(point)) {
      this.finishDrawing();
      return;
    }

    // Add marker
    const marker = new fabric.Circle({
      left: point.x,
      top: point.y,
      radius: 4,
      fill: "yellow",
      selectable: false,
      evented: false,
    });
    this.canvas.add(marker);
    this.markers.push(marker);

    // Add line from last point to this point
    if (this.points.length > 0) {
      const prev = this.points[this.points.length - 1];
      const line = new fabric.Line([prev.x, prev.y, point.x, point.y], {
        stroke: "yellow",
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });
      this.canvas.add(line);
      this.lines.push(line);
    }

    this.points.push(point);
  };

  private onMouseMove = (opt: fabric.TEvent) => {
    if (this.points.length === 0) return;
    const pointer = this.canvas.getPointer(opt.e!);
    const last = this.points[this.points.length - 1];

    // Draw or update preview line
    if (this.previewLine) {
      this.previewLine.set({ x2: pointer.x, y2: pointer.y });
    } else {
      this.previewLine = new fabric.Line(
        [last.x, last.y, pointer.x, pointer.y],
        {
          stroke: "yellow",
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
    return Math.sqrt(dx * dx + dy * dy) < this.closeThreshold;
  }

  private clearPreview() {
    if (this.previewLine) {
      this.canvas.remove(this.previewLine);
      this.previewLine = undefined;
    }
  }

  private finishDrawing() {
    // Remove markers and lines
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

    // Calculate centroid
    const xs = this.points.map((p) => p.x);
    const ys = this.points.map((p) => p.y);
    const centroid = new fabric.Point(
      xs.reduce((a, b) => a + b, 0) / xs.length,
      ys.reduce((a, b) => a + b, 0) / ys.length
    );

    // Add label
    const text = new fabric.Text(this.label, {
      left: centroid.x,
      top: centroid.y,
      fill: "white",
      fontSize: 16,
      selectable: false,
      evented: false,
    });
    this.canvas.add(text);

    // Reset and disable
    this.points = [];
    this.markers = [];
    this.lines = [];
    this.disable();
  }
}

// Usage example:
// const drawer = new AnnotationDrawer(canvas, 'my-label');
// Clicking on canvas adds points, move shows preview, clicking near start closes polygon.
