import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) Verify session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = session.user.id;

  try {
    // 2) Fetch only this user's images
    const imagesWithTags = await prisma.image.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        imageTags: {
          include: { tag: true },
        },
        annotations: true, // Include annotations if needed
      },
    });

    // 3) Flatten tags for client
    const result = imagesWithTags.map((img) => ({
      id: img.id,
      name: img.name,
      url: img.url,
      createdAt: img.createdAt,
      tags: img.imageTags.map((it) => it.tag.name),
      annotations: img.annotations,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ error: "Failed to fetch images" });
  }
}
