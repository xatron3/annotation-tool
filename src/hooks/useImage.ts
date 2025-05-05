import { useEffect, useState } from "react";

export default function useImage(url: string): [HTMLImageElement | null] {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url) return;
    const img = new Image();
    img.src = url;
    img.onload = () => setImage(img);
    // you could add img.onerror handler here if you like
  }, [url]);

  return [image];
}
