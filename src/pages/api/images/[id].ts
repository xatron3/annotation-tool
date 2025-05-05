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

  if (req.method === "DELETE") {
    try {
      // 1) Find record so we know the file URL
      const record = await prisma.image.findUnique({ where: { id } });
      if (!record) {
        return res.status(404).json({ error: "Not found" });
      }

      // 2) Delete any ImageToTag join rows
      await prisma.imageToTag.deleteMany({
        where: { imageId: id },
      });

      // 3) Delete the image row
      await prisma.image.delete({ where: { id } });

      // 4) Delete the file from disk
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

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
