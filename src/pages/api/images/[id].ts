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
      // Find record so we know the file URL
      const record = await prisma.image.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ error: "Not found" });

      // Delete from DB
      await prisma.image.delete({ where: { id } });

      // Delete file from disk
      const filename = path.basename(record.url);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return res.status(204).end();
    } catch (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Could not delete image" });
    }
  }

  // Optionally support GET /api/images/[id] here
  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
