"use client";

import ImageUploader from "@/components/ImageUploader";
import WaitingForAnnotation from "@/components/WaitingForAnnotation";
import { UploadedImage } from "@/types/UploadImage";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useAnnotationStore } from "@/stores/annotation";

const FabricCanvas = dynamic(() => import("@/components/FabricCanvas"), {
  ssr: false,
});

export default function Home() {
  // Which image is currently open in the FabricCanvas
  const [annotating, setAnnotating] = useState<UploadedImage | null>(null);
  // Bump this to force the waiting list to re-fetch after upload
  const refreshTrigger = useAnnotationStore((state) => state.refreshTrigger);

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Image Annotation Tool</h1>
      <ImageUploader />
      {/* Waiting for Annotation */}
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold">Waiting for Annotation</h3>
        <WaitingForAnnotation
          onSelect={(img) => setAnnotating(img)}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Annotation canvas */}
      {annotating && (
        <div className="border p-4 rounded">
          <h3 className="text-lg font-semibold">
            Annotating: {annotating.name}
          </h3>
          <button
            onClick={() => setAnnotating(null)}
            className="mb-2 text-sm text-red-600 hover:underline"
          >
            Close
          </button>
          <FabricCanvas imageUrl={annotating.url} />
        </div>
      )}
    </main>
  );
}
