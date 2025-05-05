// src/app/page.tsx
import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Image Annotation Tool</h1>
      <ImageUploader />
    </main>
  );
}
