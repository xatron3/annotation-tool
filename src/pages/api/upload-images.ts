// pages/api/uploads.ts
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const config = {
  api: { bodyParser: false },
};

type Uploaded = {
  id: string;
  name: string;
  url: string;
  tags: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Uploaded[] | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) parse the incoming multipart form
  const form = formidable({ multiples: true });
  let fields: formidable.Fields, files: formidable.Files;
  try {
    ({ fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => {
        if (err) return reject(err);
        resolve({ fields: flds, files: fls });
      });
    }));
  } catch (err) {
    console.error("Form parsing error:", err);
    return res.status(500).json({ error: "Upload error" });
  }

  // 2) extract tags array if provided
  let tags: string[] = [];
  if (fields.tags) {
    const raw = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags;
    try {
      tags = JSON.parse(raw as string);
    } catch {
      return res.status(400).json({ error: "Invalid tags format" });
    }
  }

  // 3) extract files
  const imagesField = (files as any).images;
  if (!imagesField) {
    return res.status(400).json({ error: "No files were uploaded" });
  }
  const fileList: formidable.File[] = Array.isArray(imagesField)
    ? imagesField
    : [imagesField];

  // 4) ensure upload dir
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 5) process each file: save to disk, then handle Prisma writes
  const results: Uploaded[] = await Promise.all(
    fileList.map(async (file) => {
      const filename = `${Date.now()}-${file.originalFilename}`;
      const dest = path.join(uploadDir, filename);

      // write the uploaded file
      fs.writeFileSync(dest, fs.readFileSync(file.filepath));
      fs.unlinkSync(file.filepath);

      // a) create the image record
      const image = await prisma.image.create({
        data: {
          name: file.originalFilename || filename,
          url: `/uploads/${filename}`,
        },
      });

      // b) upsert all tags
      const upsertedTags = await Promise.all(
        tags.map((tagName) =>
          prisma.tag.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {},
          })
        )
      );

      // c) link image ↔ tag in the join table
      await Promise.all(
        upsertedTags.map((tag) =>
          prisma.imageToTag.create({
            data: {
              imageId: image.id,
              tagId: tag.id,
            },
          })
        )
      );

      return {
        id: image.id,
        name: image.name,
        url: image.url,
        tags: upsertedTags.map((t) => t.name),
      };
    })
  );

  return res.status(200).json(results);
}
