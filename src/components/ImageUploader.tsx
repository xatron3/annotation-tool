"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import WaitingForAnnotation, {
  UploadedImage,
} from "@/components/WaitingForAnnotation";

const FabricCanvas = dynamic(() => import("./FabricCanvas"), {
  ssr: false,
});

export default function MultiImageUploader() {
  // Files picked but not yet uploaded
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // New: tag input (comma-separated)
  const [tagsInput, setTagsInput] = useState<string>("");

  // Which image is currently open in the FabricCanvas
  const [annotating, setAnnotating] = useState<UploadedImage | null>(null);

  // bump this to force the waiting list to re-fetch after upload
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileArray = Array.from(e.target.files);
    setFiles(fileArray);
    Promise.all(
      fileArray.map(
        (file) =>
          new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.onerror = () => rej();
            reader.readAsDataURL(file);
          })
      )
    ).then(setPreviews);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    // Attach tags as JSON array
    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    formData.append("tags", JSON.stringify(tagsArray));

    const res = await fetch("/api/upload-images", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      console.error("Upload failed");
      return;
    }
    // Clear local previews, tags & bump the refresh
    setFiles([]);
    setPreviews([]);
    setTagsInput("");
    setRefreshTrigger((x) => x + 1);
  };

  return (
    <div className="space-y-6">
      {/* Upload section */}
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold">Select Images to Upload</h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="mt-2"
        />

        {previews.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Preview ({previews.length})</h4>
            <div className="flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`preview-${i}`}
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>

            {/* Tags input for batch upload */}
            <div className="mt-2">
              <label className="block font-medium">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="nature, vacation"
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </div>

            <button
              onClick={handleUpload}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload {files.length} Image{files.length > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>

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
    </div>
  );
}
