"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { UploadedImage } from "@/types/UploadImage";
import { useState, useEffect } from "react";

const FabricCanvas = dynamic(() => import("@/components/Canvas/FabricCanvas"), {
  ssr: false,
});

export default function AnnotatePage() {
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
      <div className="p-4 text-center">No image specified for annotation.</div>
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
