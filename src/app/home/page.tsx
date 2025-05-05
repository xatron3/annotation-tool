"use client";

import ImageUploader from "@/components/ImageUploader";
import AnnotationBoard from "@/components/AnnotationOverview/AnnotationBoard";
import { UploadedImage } from "@/types/UploadImage";
import { useAnnotationStore } from "@/stores/annotation";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  // Bump this to force the waiting list to re-fetch after upload
  const refreshTrigger = useAnnotationStore((state) => state.refreshTrigger);

  return (
    <div>
      {/* Image uploader stays here */}
      <ImageUploader />

      {/* Waiting for Annotation */}
      <div className="border p-4 rounded mt-6">
        <h3 className="text-lg font-semibold mb-2">Waiting for Annotation</h3>
        <AnnotationBoard
          onSelect={(img: UploadedImage) => {
            // push just the id
            router.push(`/annotate?id=${img.id}`);
          }}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
}
