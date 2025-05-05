// src/pages/api/images/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id" });
  }

  // GET /api/images/[id]
  if (req.method === "GET") {
    try {
      const record = await prisma.image.findUnique({
        where: { id },
        include: {
          // if you have tags or other relations you want back:
          imageTags: {
            select: { tag: true },
          },
          annotations: true, // Include annotations if needed
        },
      });
      if (!record) {
        return res.status(404).json({ error: "Image not found" });
      }
      return res.status(200).json(record);
    } catch (err) {
      console.error("GET error:", err);
      return res.status(500).json({ error: "Could not fetch image" });
    }
  }

  // DELETE /api/images/[id]
  if (req.method === "DELETE") {
    try {
      const record = await prisma.image.findUnique({ where: { id } });
      if (!record) {
        return res.status(404).json({ error: "Not found" });
      }

      await prisma.imageToTag.deleteMany({
        where: { imageId: id },
      });

      await prisma.annotation.deleteMany({
        where: { imageId: id },
      });

      await prisma.image.delete({ where: { id } });

      const filename = path.basename(record.url);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(204).end();
    } catch (err) {
      console.error("Delete error:", err);
      return res
        .status(500)
        .json({ error: "Could not delete image (check foreign keys)" });
    }
  }

  // Method not allowed
  res.setHeader("Allow", ["GET", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
