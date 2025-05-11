// pages/api/annotations/[imageId].ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { parseQueryParamAsInt } from "@/lib/query";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const imageId = parseQueryParamAsInt(req, res, "imageId");

  if (imageId === null) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  if (req.method === "POST") {
    const {
      annotations,
    }: {
      annotations: { label: string; points: { x: number; y: number }[] }[];
    } = req.body;

    try {
      // 2) Bulk create new ones
      await Promise.all(
        annotations.map((anno) =>
          prisma.annotation.create({
            data: {
              label: anno.label,
              points: anno.points,
              image: { connect: { id: imageId } },
            },
          })
        )
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "DB write failed" });
    }
  }
  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
