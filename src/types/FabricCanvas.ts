import { Annotation } from "./Annotation";

export interface FabricCanvasProps {
  imageUrl: string;
  imageId?: string;
  initialAnnotations?: Annotation[];
}
