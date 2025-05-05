// pages/api/annotations/[imageId].ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { imageId } = req.query;
  if (req.method === "POST") {
    const {
      annotations,
    }: {
      annotations: { label: string; points: { x: number; y: number }[] }[];
    } = req.body;

    try {
      // 1) Optionally clear old ones:
      await prisma.annotation.deleteMany({
        where: { imageId: String(imageId) },
      });

      // 2) Bulk create new ones
      await Promise.all(
        annotations.map((anno) =>
          prisma.annotation.create({
            data: {
              label: anno.label,
              points: anno.points,
              image: { connect: { id: String(imageId) } },
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
