import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { withBasePath } from "@/lib/base-path";
import { db } from "@/lib/db";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "Filtypen stöds inte." }, { status: 400 });
  }

  const uploadRoot = process.env.UPLOAD_DIR || "./public/uploads";
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const projectDir = path.join(process.cwd(), uploadRoot, id);
  await mkdir(projectDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  const diskPath = path.join(projectDir, safeName);
  await writeFile(diskPath, bytes);

  await db.projectFile.create({
    data: {
      projectId: id,
      fileName: safeName,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      storageKey: withBasePath(`/uploads/${id}/${safeName}`),
      uploadedById: user.id,
    },
  });

  return NextResponse.redirect(new URL(`/projects/${id}`, request.url));
}
