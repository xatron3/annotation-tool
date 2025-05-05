"use client";

import { useState } from "react";
import { useAnnotationStore } from "@/stores/annotation";

export default function MultiImageUploader() {
  // Files picked but not yet uploaded
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Bump this to force the waiting list to re-fetch after upload
  const bump = useAnnotationStore((state) => state.bump);

  // New: tag input (comma-separated)
  const [tagsInput, setTagsInput] = useState<string>("");

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
    bump(); // Trigger a refresh in the waiting list
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
    </div>
  );
}
