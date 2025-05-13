"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { UploadedImage } from "@/types/UploadImage";
import { useState, useEffect } from "react";
import AnnotationBoard from "@/components/AnnotationOverview/AnnotationBoard";
import { useAnnotationStore } from "@/stores/annotation";
import { useRouter } from "next/navigation";

const FabricCanvas = dynamic(() => import("@/components/Canvas/FabricCanvas"), {
  ssr: false,
});

export default function AnnotatePage() {
  const router = useRouter();
  // Bump this to force the waiting list to re-fetch after upload
  const refreshTrigger = useAnnotationStore((state) => state.refreshTrigger);
  const searchParams = useSearchParams();
  const imageId = searchParams.get("id");
  const [imageData, setImageData] = useState<UploadedImage>({
    id: "",
    name: "",
    url: "",
  });

  useEffect(() => {
    if (!imageId) return;

    fetch(`/api/images/${imageId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Image not found");
        return res.json();
      })
      .then((img: UploadedImage) => setImageData(img))
      .catch(console.error);
  }, [imageId]);

  if (!imageId) {
    return (
      <div className="text-center">
        {/* Waiting for Annotation */}
        <div className="border p-4 rounded">
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

  return (
    <div className="w-full h-screen flex flex-col">
      <h1 className="text-xl font-semibold p-4">Annotate Image</h1>
      <div className="flex-1">
        <FabricCanvas
          imageId={imageData.id}
          imageUrl={imageData.url}
          initialAnnotations={imageData.annotations}
        />
      </div>
    </div>
  );
}
