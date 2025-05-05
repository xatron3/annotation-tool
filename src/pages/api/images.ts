import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1) Fetch images + join‐table + tag
    const imagesWithTags = await prisma.image.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        imageTags: {
          include: { tag: true },
        },
        annotations: true, // Include annotations if needed
      },
    });

    // 2) (Optional) Flatten to a simple tags array per image
    const result = imagesWithTags.map((img) => ({
      id: img.id,
      name: img.name,
      url: img.url,
      createdAt: img.createdAt,
      tags: img.imageTags.map((it) => it.tag.name),
      annotations: img.annotations,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}
