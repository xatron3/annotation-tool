"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const FabricCanvas = dynamic(() => import("./FabricCanvas"), {
  ssr: false,
});

type UploadedImage = {
  id: string;
  name: string;
  url: string;
};

export default function MultiImageUploader() {
  // Files picked but not yet uploaded
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Images that have been uploaded and are waiting for annotation
  const [waitingList, setWaitingList] = useState<UploadedImage[]>([]);

  // Which image is currently open in the FabricCanvas
  const [annotating, setAnnotating] = useState<UploadedImage | null>(null);

  // Handle picking files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileArray = Array.from(e.target.files);
    setFiles(fileArray);

    // Generate data-URL previews
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

  // Upload to your Next API (/api/upload-images) which should return
  // an array of { id, name, url }
  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    const res = await fetch("/api/upload-images", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Upload failed");
      return;
    }

    const uploaded: UploadedImage[] = await res.json();
    setWaitingList((wl) => [...wl, ...uploaded]);
    setFiles([]);
    setPreviews([]);
  };

  return (
    <div className="space-y-6">
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
            <button
              onClick={handleUpload}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload {files.length} Image{files.length > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>

      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold">Waiting for Annotation</h3>
        {waitingList.length === 0 ? (
          <p className="text-gray-500 mt-2">No images pending.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {waitingList.map((img) => (
              <div
                key={img.id}
                className="cursor-pointer"
                onClick={() => setAnnotating(img)}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-32 object-cover rounded border"
                />
                <p className="truncate mt-1 text-sm">{img.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

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
