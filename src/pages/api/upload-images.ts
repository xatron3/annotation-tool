import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File as FormidableFile } from "formidable";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

// Disable Next.js's body parser so Formidable can handle multipart data
export const config = {
  api: {
    bodyParser: false,
  },
};

type Uploaded = {
  id: string;
  name: string;
  url: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Uploaded[] | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Upload error" });
    }

    // Validate that files.images exists
    const imagesField = (files as any).images;
    if (!imagesField) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    // Normalize to array
    const fileList: FormidableFile[] = Array.isArray(imagesField)
      ? imagesField
      : [imagesField];

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process each file
    const results: Uploaded[] = await Promise.all(
      fileList.map(async (file) => {
        // Generate a unique filename for disk
        const filename = `${Date.now()}-${file.originalFilename}`;
        const destPath = path.join(uploadDir, filename);

        // Read and write file to public/uploads
        const data = fs.readFileSync(file.filepath);
        fs.writeFileSync(destPath, data);
        fs.unlinkSync(file.filepath);

        // Save metadata to SQLite via Prisma
        const record = await prisma.image.create({
          data: {
            name: file.originalFilename || filename,
            url: `/uploads/${filename}`,
          },
        });

        return {
          id: record.id,
          name: record.name,
          url: record.url,
        };
      })
    );

    res.status(200).json(results);
  });
}
